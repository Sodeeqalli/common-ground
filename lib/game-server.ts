import bank from "../content/adult-scenarios.json";
import {
  makeAttempt,
  execute,
  COLORS,
  FLOOR,
  GENERATOR,
  same,
  position,
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
    attempt: null,
    version: 0,
    processed: [],
    messages: [],
  };
}
// Older active attempts cannot safely resume under the new resource/gate rules.
// Normalize on read and next write, preserving team identity and restored regions.
export function normalizeTeam(team: Team): Team {
  team.energyRequests ??= [];
  team.pings ??= [];
  const a = team.attempt;
  if (a && a.rulesVersion !== 2) {
    team.upgradeNotice =
      "Team missions now use shared planning instead of quizzes. Start a fresh expedition; your restored world is safe.";
    if (!["success", "ended"].includes(a.phase)) a.phase = "ended";
    a.powerCharges ??= 0;
    a.powerBy ??= null;
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
    demand(member === team.owner, "Only the team host can start a mission.");
    demand(
      !a || ["success", "ended"].includes(a.phase),
      "Finish or retreat from the current mission first.",
    );
    const roster = action.roster as string[];
    demand(
      Array.isArray(roster) &&
        roster.length >= 2 &&
        roster.length <= 4 &&
        new Set(roster).size === roster.length &&
        roster.includes(member) &&
        roster.every((id) => team.members.some((m) => m.id === id)),
      "Choose two to four team members, including the host.",
    );
    team.attempt = makeAttempt(crypto.randomUUID(), roster);
    team.energyRequests = [];
    team.pings = [];
    delete team.upgradeNotice;
    return;
  }
  if (type === "message") {
    const text = typeof action.text === "string" ? action.text.trim() : "";
    demand(
      text.length > 0 && text.length <= 280,
      "Write a message of 1–280 characters.",
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
  if (type === "retreat") {
    demand(member === team.owner, "Only the host can end this attempt.");
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
    team.pings = [
      ...(team.pings || [])
        .filter((p) => p.attemptId === a.id && p.round >= a.round - 1)
        .slice(-11),
      {
        id: crypto.randomUUID(),
        attemptId: a.id,
        member,
        at: { x: at.x, y: at.y },
        kind: action.kind as "meet" | "help" | "route",
        round: a.round,
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
  if (type === "power") {
    demand(a.phase === "coordination", "Agree on power before locking routes.");
    if (action.on === false) {
      demand(
        a.powerBy === member,
        "Only the operator can cancel their commitment.",
      );
      a.powerBy = null;
    } else {
      demand(
        !a.powerBy &&
          a.powerCharges > 0 &&
          same(position(r), GENERATOR) &&
          r.energy >= 1,
        "Stand on the relay with at least one energy and a charge remaining.",
      );
      a.powerBy = member;
    }
    a.rosterReady = [];
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
    demand(a.phase === "briefing", "Use a task swap after departure.");
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
    if (a.powerBy === member && r.energy < 1) a.powerBy = null;
    a.rosterReady = [];
    return;
  }
  if (type === "swap-request") {
    demand(
      a.phase === "coordination" && !a.swap,
      "Finish the pending task request first.",
    );
    const obj = a.objectives.find((o) => o.id === action.objective);
    const to = a.robots.find((r) => r.id === action.to);
    demand(
      obj &&
        obj.owner === member &&
        obj.status === "waiting" &&
        to &&
        to.id !== member,
      "Only an uncollected task you own can be offered to another teammate.",
    );
    a.swap = { objective: obj.id, from: member, to: to.id };
    a.rosterReady = [];
    return;
  }
  if (type === "swap-answer") {
    demand(
      a.phase === "coordination" &&
        a.swap &&
        [a.swap.from, a.swap.to].includes(member),
      "There is no task offer for you.",
    );
    if (action.accept) {
      demand(a.swap.to === member, "Only the recipient can accept.");
      a.objectives.find((o) => o.id === a.swap!.objective)!.owner = member;
    }
    a.swap = null;
    a.rosterReady = [];
    return;
  }
  if (type === "coord-ready") {
    demand(
      a.phase === "coordination" && !a.swap,
      "Resolve the task offer before planning.",
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
    demand(
      a.powerBy !== member || moves.length === 0,
      "The relay operator must stay for this round. Cancel during coordination to move instead.",
    );
    r.queue = moves;
    r.ready = true;
    if (a.robots.every((r) => r.ready)) {
      execute(a);
      if (
        String(a.phase) === "success" &&
        !team.restored.includes("greenhouse")
      ) {
        team.restored.push("greenhouse");
        team.restoredAt = new Date().toISOString();
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
      a.powerBy = null;
      a.keys = [];
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
