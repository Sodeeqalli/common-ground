import bank from "../content/adult-scenarios.json";
import {
  makeAttempt,
  execute,
  initialDialogue,
  PLAYLIST,
  COLORS,
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
function settleDialogue(team: Team, member: string) {
  const a = team.attempt!,
    r = a.robots.find((r) => r.id === member)!;
  const scenario = scenarios.find((s) => s.id === PLAYLIST[a.round - 1])!;
  let node = scenario.nodes[r.dialogue.node];
  // Traverse authored reply/context nodes until the next decision or terminal.
  while (node && !["decision", "repair", "terminal"].includes(node.type)) {
    if (node.text)
      r.dialogue.transcript.push({
        who:
          node.type === "reply" ? node.speaker || "Reply" : "New information",
        text: node.text,
      });
    r.dialogue.node = node.next!;
    node = scenario.nodes[r.dialogue.node];
  }
  demand(node, "This conversation could not continue.");
  if (node.type === "terminal" && !r.dialogue.done) {
    r.dialogue.done = true;
    r.energy = Math.min(6, r.energy + 1 + r.dialogue.credits);
  }
  if (a.robots.every((r) => r.dialogue.done)) {
    a.phase = "coordination";
    a.rosterReady = [];
  }
}
export function applyAction(
  team: Team,
  member: string,
  action: Record<string, unknown>,
) {
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
  if (type === "message") {
    const allowed = [
      "I need a moment.",
      "Could I have one energy?",
      "I can share one.",
      "Nice teamwork!",
    ];
    demand(allowed.includes(action.text as string), "Choose a preset message.");
    team.messages = [
      ...team.messages.slice(-5),
      { member, text: action.text as string },
    ];
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
      a.phase = "conversation";
      a.rosterReady = [];
    }
    return;
  }
  if (type === "answer") {
    demand(
      a.phase === "conversation" && !r.dialogue.done,
      "Your conversation is already complete.",
    );
    const scenario = scenarios.find((s) => s.id === PLAYLIST[a.round - 1])!;
    const node = scenario.nodes[r.dialogue.node];
    const choice = node.choices?.find((c) => c.id === action.choice);
    demand(
      choice,
      "That choice is not available at this point in the conversation.",
    );
    r.dialogue.transcript.push({ who: "You", text: choice.text });
    r.dialogue.credits += choice.credit;
    r.dialogue.feedback =
      choice.explanation ||
      "You clarified your message. Repairs do not add energy.";
    r.dialogue.node = choice.next;
    settleDialogue(team, member);
    return;
  }
  if (type === "pass") {
    demand(
      a.phase === "conversation" && !r.dialogue.done,
      "Your round reward has already been issued.",
    );
    r.dialogue.credits = 0;
    r.dialogue.done = true;
    r.dialogue.feedback =
      "You passed this conversation. One energy is available for your route.";
    r.energy = Math.min(6, r.energy + 1);
    if (a.robots.every((r) => r.dialogue.done)) {
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
    demand(
      to && to.id !== member && !r.donated && r.energy >= 1 && to.energy < 6,
      "You can give one energy per round to a teammate with space.",
    );
    r.energy--;
    to.energy++;
    r.donated = true;
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
      a.phase = "conversation";
      a.rosterReady = [];
      a.robots.forEach((r) => {
        r.dialogue = initialDialogue(a.round);
        r.donated = false;
      });
    }
    return;
  }
  throw new Error("Unknown action.");
}
export function publicView(team: Team, member: string) {
  const copy = structuredClone(team) as Team & {
    me?: string;
    scenario?: unknown;
    node?: unknown;
    progress?: unknown;
  };
  copy.processed = [];
  copy.me = member;
  const a = copy.attempt;
  if (a) {
    const s = scenarios.find((s) => s.id === PLAYLIST[a.round - 1])!;
    const me = a.robots.find((r) => r.id === member);
    copy.scenario = {
      id: s.id,
      title: s.title,
      context: s.context,
      goal: s.goal,
      openingLine: s.openingLine,
      skill: s.skill,
    };
    if (me) {
      const n = s.nodes[me.dialogue.node];
      copy.node = {
        ...n,
        choices: n?.choices?.map((c) => ({ id: c.id, text: c.text })),
      };
    }
    a.robots.forEach((r) => {
      if (r.id !== member) {
        r.dialogue = {
          node: "",
          credits: 0,
          done: r.dialogue.done,
          transcript: [],
          feedback: "",
        };
        r.queue = [];
      }
    });
  }
  return copy;
}
