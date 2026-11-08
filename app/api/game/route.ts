import { env } from "cloudflare:workers";
import {
  newTeam,
  applyAction,
  publicView,
  normalizeTeam,
} from "../../../lib/game-server";
import { COLORS, readinessContext, type Team } from "../../../shared/game";
export const dynamic = "force-dynamic";
const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
const hash = async (s: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
async function identity(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return null;
  return env
    .DB!.prepare("SELECT id, team_id FROM members WHERE token_hash = ?")
    .bind(await hash(token))
    .first<{ id: string; team_id: string }>();
}
async function getTeam(id: string) {
  const row = await env
    .DB!.prepare("SELECT state FROM teams WHERE id = ?")
    .bind(id)
    .first<{ state: string }>();
  return row ? normalizeTeam(JSON.parse(row.state) as Team) : null;
}
export async function GET(req: Request) {
  try {
    const member = await identity(req);
    if (!member) return reply({ error: "Please create or join a team." }, 401);
    const team = await getTeam(member.team_id);
    if (!team) return reply({ error: "Team not found." }, 404);
    return reply(publicView(team, member.id));
  } catch {
    return reply(
      { error: "The team store is unavailable. Try again shortly." },
      503,
    );
  }
}
export async function POST(req: Request) {
  try {
    if (
      req.headers.get("origin") &&
      req.headers.get("origin") !== new URL(req.url).origin
    )
      return reply({ error: "Invalid request origin." }, 403);
    if (Number(req.headers.get("content-length") || 0) > 16000)
      return reply({ error: "Request too large." }, 413);
    const raw = await req.text();
    if (raw.length > 16000) return reply({ error: "Request too large." }, 413);
    const body = JSON.parse(raw);
    if (body.type === "create" || body.type === "join") {
      const alias = text(body.alias, 24);
      if (!alias) return reply({ error: "Choose a robot name." }, 400);
      const member = crypto.randomUUID(),
        token = crypto.randomUUID() + crypto.randomUUID(),
        tokenHash = await hash(token);
      if (body.type === "create") {
        const name = text(body.name, 40);
        if (!name) return reply({ error: "Give your team a name." }, 400);
        const id = crypto.randomUUID(),
          code = crypto
            .randomUUID()
            .replaceAll("-", "")
            .slice(0, 12)
            .toUpperCase();
        const team = newTeam(id, code, name, member, alias);
        await env.DB!.batch([
          env
            .DB!.prepare(
              "INSERT INTO teams (id,code,state,version) VALUES (?,?,?,0)",
            )
            .bind(id, code, JSON.stringify(team)),
          env
            .DB!.prepare(
              "INSERT INTO members (id,team_id,token_hash) VALUES (?,?,?)",
            )
            .bind(member, id, tokenHash),
        ]);
        return reply({ token, team: publicView(team, member) });
      }
      const code = text(body.code, 30).replaceAll(" ", "").toUpperCase();
      const row = await env
        .DB!.prepare("SELECT state FROM teams WHERE code = ?")
        .bind(code)
        .first<{ state: string }>();
      if (!row)
        return reply(
          { error: "No team has that code. Check it with your teammate." },
          404,
        );
      const team = JSON.parse(row.state) as Team;
      if (team.members.length >= 12)
        return reply(
          { error: "This prototype team already has twelve members." },
          400,
        );
      const version = team.version;
      team.version++;
      team.members.push({
        id: member,
        name: alias,
        color: COLORS[team.members.length % 4],
      });
      const results = await env.DB!.batch([
        env
          .DB!.prepare(
            "UPDATE teams SET state=?,version=? WHERE id=? AND version=?",
          )
          .bind(JSON.stringify(team), team.version, team.id, version),
        env
          .DB!.prepare(
            "INSERT INTO members (id,team_id,token_hash) SELECT ?,?,? WHERE changes() = 1",
          )
          .bind(member, team.id, tokenHash),
      ]);
      if (!results[0].meta.changes)
        return reply(
          { error: "The team changed while you joined. Please try again." },
          409,
        );
      return reply({ token, team: publicView(team, member) });
    }
    const member = await identity(req);
    if (!member) return reply({ error: "Please rejoin your team." }, 401);
    if (
      typeof body.requestId !== "string" ||
      !body.requestId ||
      body.requestId.length > 80
    )
      return reply({ error: "Missing request identifier." }, 400);
    // Revalidate independent messages and phase-local actions after competing writes.
    // Readiness still requires the same assignments, energy and relay commitment.
    const phaseLocal = [
      "brief-ready",
      "coord-ready",
      "moves",
      "next",
      "resume",
      "pause",
      "message",
      "ping",
      "energy-request",
      "request-response",
    ].includes(body.type);
    const attempts = phaseLocal ? 5 : 1;
    for (let retry = 0; retry < attempts; retry++) {
      const team = await getTeam(member.team_id);
      if (!team) return reply({ error: "Team not found." }, 404);
      if (team.processed.includes(body.requestId))
        return reply(publicView(team, member.id));
      const a = team.attempt;
      const samePhase = a && body.round === a.round && body.phase === a.phase;
      const readyIsCurrent =
        !["brief-ready", "coord-ready"].includes(body.type) ||
        (a && body.readyContext === readinessContext(a));
      const mayRebase =
        body.type === "message" || (phaseLocal && samePhase && readyIsCurrent);
      if (body.version !== team.version && !mayRebase)
        return reply(
          {
            error:
              "A teammate just updated the mission. Your view is refreshing; try that action again.",
          },
          409,
        );
      const version = team.version;
      applyAction(team, member.id, body);
      team.processed = [...team.processed.slice(-199), body.requestId];
      team.version++;
      const updated = await env
        .DB!.prepare(
          "UPDATE teams SET state=?,version=? WHERE id=? AND version=?",
        )
        .bind(JSON.stringify(team), team.version, team.id, version)
        .run();
      if (updated.meta.changes) return reply(publicView(team, member.id));
    }
    return reply(
      {
        error:
          "Another action arrived first. Your view is refreshing; try again.",
      },
      409,
    );
  } catch (error) {
    return reply(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete that action.",
      },
      400,
    );
  }
}
