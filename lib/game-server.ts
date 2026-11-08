import bank from "../content/adult-scenarios.json";
import {
  makeAttempt,
  execute,
  COLORS,
  FLOOR,
  same,
  STRATEGY_SIGNALS,
  PLATE_SIGNALS,
  REQUEST_SIGNALS,
  type SignalKind,
  type Team,
  type Direction,
} from "../shared/game";
type Choice = {
  id: string;
  text: string;
  credit: number;
  explanation?: string;
  next: string;
};
type Node = {
  type: string;
  text?: string;
  speaker?: string;
  next?: string;
  prompt?: string;
  phrase?: string;
  choices?: Choice[];
};
export type Scenario = {
  id: string;
  title: string;
  skill: string;
  context: string;
  goal: string;
  openingLine: string;
  startNode: string;
  nodes: Record<string, Node>;
};
export const scenarios = bank.scenarios as unknown as Scenario[];
export function demand(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
export function newTeam(
  id: string,
  code: string,
  name: string,
  member: string,
  alias: string,
): Team {
  return {
    id,
    code,
    name,
    owner: member,
    members: [{ id: member, name: alias, color: COLORS[0] }],
    restored: [],
    restoredAt: null,
    contributions: {},
    attempt: null,
    version: 0,
    processed: [],
    messages: [],
  };
}
// Credit the whole successful roster, including plate holders and support players.
// Snapshot names and colours so later roster changes cannot rewrite attribution.
function recordContributors(team: Team, area: string, roster: string[]) {
  team.contributions ??= {};
  const credits = (team.contributions[area] ??= []);
  for (const id of roster) {
    const member = team.members.find((m) => m.id === id);
    if (member && !credits.some((m) => m.id === id))
      credits.push({ ...member });
  }
}
// Older active attempts cannot safely resume under the new resource/gate rules.
// Normalize on read and next write, preserving team identity and restored regions.
export function normalizeTeam(team: Team): Team {
  // Clear the obsolete banner on read and on the next persisted action.
  delete team.upgradeNotice;
  team.energyRequests ??= [];
  team.pings ??= [];
  team.signals ??= [];
  team.signalSentAt ??= {};
  team.contributions ??= {};
  const a = team.attempt;
  // Retire pending task offers without changing ownership or blocking readiness.
  if (a) a.swap = null;
  // Only backfill from a retained success, never the current membership or a failed retry.
  if (a?.phase === "success" && team.restored.includes("greenhouse"))
    recordContributors(team, "greenhouse", a.roster);
  if (a && a.rulesVersion !== 3) {
    if (!["success", "ended"].includes(a.phase)) a.phase = "ended";
    a.rulesVersion = 3;
    for (const key of ["powerCharges", "powerBy", "keys"])
      delete (a as unknown as Record<string, unknown>)[key];
  }
  return team;
}
export function applyAction(
  team: Team,
  member: string,
  action: Record<string, unknown>,
) {
  normalizeTeam(team);
  const type = action.type as string;
  const a = team.attempt;
  const actor = team.members.find((m) => m.id === member);
  demand(actor, "You are not a member of this team.");
  if (type === "new-mission") {
    demand(
      !a || ["success", "ended"].includes(a.phase),
      "Finish or retreat from the current mission first.",
    );
    const roster = action.roster as string[];
    demand(
      Array.isArray(roster) &&
        roster.length === 2 &&
        new Set(roster).size === roster.length &&
        roster.includes(member) &&
        roster.every((id) => team.members.some((m) => m.id === id)),
      "Choose yourself and one teammate.",
    );
    team.attempt = makeAttempt(crypto.randomUUID(), roster);
    team.energyRequests = [];
    team.pings = [];
    team.signals = [];
    team.signalSentAt = {};
    delete team.upgradeNotice;
    return;
  }
  if (type === "message") {
    const text = typeof action.text === "string" ? action.text.trim() : "";
    demand(text.length > 0 && text.length <= 280, "Write 1–280 characters.");
    const previous = [...team.messages]
      .reverse()
      .find((m) => m.member === member);
    demand(
      Date.now() - Date.parse(previous?.at || "1970-01-01") >= 2000,
      "Wait a moment before sending again.",
    );
    team.messages = [
      ...team.messages.slice(-59),
      {
        id: crypto.randomUUID(),
        member,
        text,
        at: new Date().toISOString(),
        round: a?.round,
      },
    ];
    return;
  }
  demand(a, "There is no active mission.");
  demand(
    action.attemptId === a.id,
    "This mission has changed. Refresh and try again.",
  );
  const r = a.robots.find((r) => r.id === member);
  demand(r, "You are not on this expedition. Join the next mission.");
  if (
    ["signal", "signal-ack", "signal-reply", "signal-clear", "ping"].includes(
      type,
    )
  ) {
    demand(!["success", "ended"].includes(a.phase), "This mission has ended.");
    demand(action.round === a.round, "The round has changed. Try again.");
  }
  if (type === "signal") {
    demand(
      typeof action.kind === "string" &&
        Object.hasOwn(STRATEGY_SIGNALS, action.kind),
      "Choose a strategy signal.",
    );
    const previous = team.signals!.find(
      (s) => s.member === member && s.attemptId === a.id && s.round === a.round,
    );
    const plate = PLATE_SIGNALS.includes(action.kind as string)
      ? (action.plate ?? "A")
      : undefined;
    demand(
      plate === undefined ||
        (typeof plate === "string" && /^[A-Z]$/.test(plate)),
      "Choose one plate letter.",
    );
    if (
      previous?.kind === action.kind &&
      (previous.plate || "A") === (plate || "A")
    )
      return;
    const now = Date.now();
    demand(
      now - (team.signalSentAt![member] || 0) >= 2000,
      "Wait a moment before changing your signal.",
    );
    team.signalSentAt![member] = now;
    team.signals = [
      ...team.signals!.filter(
        (s) =>
          s.member !== member && s.attemptId === a.id && s.round === a.round,
      ),
      {
        id: crypto.randomUUID(),
        attemptId: a.id,
        member,
        kind: action.kind as SignalKind,
        round: a.round,
        sentAt: now,
        acknowledgedBy: [],
        plate: plate as string | undefined,
        responses: {},
      },
    ];
    return;
  }
  if (type === "signal-clear") {
    team.signals = team.signals!.filter((s) => s.member !== member);
    return;
  }
  if (type === "signal-ack") {
    const signal = team.signals!.find(
      (s) =>
        s.id === action.signal && s.attemptId === a.id && s.round === a.round,
    );
    demand(
      signal && signal.member !== member,
      "That teammate signal is no longer available.",
    );
    demand(
      !REQUEST_SIGNALS.includes(signal.kind),
      "Reply Yes or No to this request.",
    );
    signal.acknowledgedBy = [...new Set([...signal.acknowledgedBy, member])];
    return;
  }
  if (type === "signal-reply") {
    const signal = team.signals!.find(
      (s) =>
        s.id === action.signal && s.attemptId === a.id && s.round === a.round,
    );
    demand(
      signal &&
        signal.member !== member &&
        REQUEST_SIGNALS.includes(signal.kind),
      "That request is no longer available.",
    );
    demand(
      action.response === "yes" || action.response === "no",
      "Choose Yes or No.",
    );
    signal.responses = { ...signal.responses, [member]: action.response };
    return;
  }
  if (type === "retreat") {
    demand(
      !["success", "ended"].includes(a.phase),
      "This attempt has already ended.",
    );
    a.phase = "ended";
    a.log = ["The team returned to the world. Earlier world progress is safe."];
    return;
  }
  if (type === "ping") {
    demand(
      !["success", "ended"].includes(a.phase),
      "This expedition has ended.",
    );
    const at = action.at as { x: number; y: number };
    demand(
      at &&
        Number.isInteger(at.x) &&
        Number.isInteger(at.y) &&
        FLOOR.some((p) => same(p, at)),
      "Choose a walkable map tile.",
    );
    demand(
      ["meet", "help", "route"].includes(action.kind as string),
      "Choose a ping type.",
    );
    const previous = team.pings!.find(
      (p) => p.member === member && p.attemptId === a.id && p.round === a.round,
    );
    if (previous && same(previous.at, at) && previous.kind === action.kind)
      return;
    const now = Date.now();
    demand(
      now - (previous?.sentAt || 0) >= 2000,
      "Wait a moment before moving your pin.",
    );
    team.pings = [
      ...(team.pings || []).filter(
        (p) =>
          p.attemptId === a.id && p.round === a.round && p.member !== member,
      ),
      {
        id: crypto.randomUUID(),
        attemptId: a.id,
        member,
        at: { x: at.x, y: at.y },
        kind: action.kind as "meet" | "help" | "route",
        round: a.round,
        sentAt: now,
      },
    ];
    return;
  }
  if (type === "energy-request") {
    demand(
      !["success", "ended"].includes(a.phase),
      "This expedition has ended.",
    );
    demand(r.energy < 6, "Your energy is already full.");
    const requests = team.energyRequests!;
    if (
      requests.some(
        (q) =>
          q.from === member && q.attemptId === a.id && q.status === "pending",
      )
    )
      return;
    team.energyRequests = [
      ...requests.slice(-19),
      {
        id: crypto.randomUUID(),
        attemptId: a.id,
        from: member,
        status: "pending",
        passedBy: [],
      },
    ];
    return;
  }
  if (type === "request-response") {
    const q = team.energyRequests?.find(
      (q) => q.id === action.request && q.attemptId === a.id,
    );
    demand(
      q && q.status === "pending",
      "That request has already been resolved.",
    );
    if (action.response === "cancel") {
      demand(q.from === member, "Only the sender can cancel.");
      q.status = "cancelled";
    } else {
      demand(
        action.response === "not-now" && q.from !== member,
        "Choose a response to your teammate.",
      );
      q.passedBy = [...new Set([...q.passedBy, member])];
      if (
        a.roster
          .filter((id) => id !== q.from)
          .every((id) => q.passedBy.includes(id))
      )
        q.status = "unavailable";
    }
    return;
  }
  if (type === "pause") {
    demand(!["success", "ended"].includes(a.phase), "The mission has ended.");
    a.pauseRequested = true;
    if (a.phase === "round-end") {
      a.paused = true;
      a.resumes = [];
    }
    return;
  }
  if (type === "resume") {
    demand(
      a.phase === "round-end" && a.paused,
      "There is no between-round pause.",
    );
    a.resumes = [...new Set([...a.resumes, member])];
    if (a.resumes.length === a.roster.length) {
      a.paused = false;
      a.pauseRequested = false;
    }
    return;
  }
  if (type === "claim") {
    demand(a.phase === "briefing", "Jobs are assigned before departure.");
    const obj = a.objectives.find((o) => o.id === action.objective);
    demand(obj && !obj.owner, "That component already has an owner.");
    demand(
      !a.objectives.some((o) => o.owner === member),
      "Each player takes one initial responsibility.",
    );
    obj.owner = member;
    a.rosterReady = [];
    return;
  }
  if (type === "release") {
    demand(a.phase === "briefing", "Tasks can only change before departure.");
    a.objectives
      .filter((o) => o.owner === member)
      .forEach((o) => (o.owner = null));
    a.rosterReady = [];
    return;
  }
  if (type === "brief-ready") {
    demand(
      a.phase === "briefing" && a.objectives.every((o) => o.owner),
      "Everyone needs to choose a job first.",
    );
    a.rosterReady = [...new Set([...a.rosterReady, member])];
    if (a.rosterReady.length === a.roster.length) {
      a.phase = "coordination";
      a.rosterReady = [];
    }
    return;
  }
  if (type === "give") {
    demand(
      a.phase === "coordination",
      "Energy is shared before route planning.",
    );
    const to = a.robots.find((r) => r.id === action.to);
    if (action.request) {
      const q = team.energyRequests?.find(
        (q) => q.id === action.request && q.attemptId === a.id,
      );
      demand(
        q && q.status === "pending" && q.from === action.to,
        "That request has already been resolved.",
      );
    }

    demand(
      to && to.id !== member && !r.donated && r.energy >= 1 && to.energy < 6,
      "You can give one energy per round to a teammate with space.",
    );
    r.energy--;
    to.energy++;
    r.donated = true;
    for (const q of team.energyRequests || [])
      if (q.attemptId === a.id && q.from === to.id && q.status === "pending") {
        q.status = "fulfilled";
        q.fulfilledBy = member;
      }
    a.rosterReady = [];
    return;
  }
  if (type === "coord-ready") {
    demand(
      a.phase === "coordination",
      "Ready is available during planning together.",
    );
    a.rosterReady = [...new Set([...a.rosterReady, member])];
    if (a.rosterReady.length === a.roster.length) {
      a.phase = "planning";
      a.rosterReady = [];
    }
    return;
  }
  if (type === "moves") {
    demand(a.phase === "planning" && !r.ready, "Your route is already locked.");
    const moves = action.moves as Direction[];
    demand(
      Array.isArray(moves) &&
        moves.length <= r.energy &&
        moves.every((d) => ["up", "down", "left", "right"].includes(d)),
      "Your route must fit your available energy.",
    );
    r.queue = moves;
    r.ready = true;
    if (a.robots.every((r) => r.ready)) {
      execute(a);
      if (String(a.phase) === "success") {
        if (!team.restored.includes("greenhouse")) {
          team.restored.push("greenhouse");
          team.restoredAt = new Date().toISOString();
        }
        recordContributors(team, "greenhouse", a.roster);
      }
    }
    return;
  }
  if (type === "next") {
    demand(
      a.phase === "round-end" && !a.paused,
      "Wait for everyone to resume before continuing.",
    );
    a.rosterReady = [...new Set([...a.rosterReady, member])];
    if (a.rosterReady.length === a.roster.length) {
      a.round++;
      a.collisions = [];
      team.signals = [];
      team.signalSentAt = {};
      team.pings = [];
      a.phase = "coordination";
      a.rosterReady = [];
      a.robots.forEach((r) => {
        r.energy = Math.min(6, r.energy + 3);
        r.donated = false;
      });
    }
    return;
  }
  throw new Error("Unknown action.");
}
export function publicView(team: Team, member: string) {
  const copy = normalizeTeam(structuredClone(team)) as Team & { me: string };
  copy.processed = [];
  copy.me = member;
  copy.attempt?.robots.forEach((r) => {
    if (r.id !== member) r.queue = [];
    delete (r as unknown as Record<string, unknown>).dialogue;
  });
  return copy;
}
