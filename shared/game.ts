export type Point = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";
export type Member = { id: string; name: string; color: string };
export type Robot = {
  id: string;
  history: Point[];
  energy: number;
  cargo: string | null;
  batteries: string[];
  queue: Direction[];
  ready: boolean;
  donated: boolean;
};
export type Objective = {
  id: string;
  name: string;
  icon: string;
  at: Point;
  owner: string | null;
  status: "waiting" | "carried" | "delivered";
  carrier: string | null;
};
export type Phase =
  | "briefing"
  | "coordination"
  | "planning"
  | "round-end"
  | "success"
  | "ended";
export type Attempt = {
  id: string;
  rulesVersion: 3;
  phase: Phase;
  round: number;
  roster: string[];
  robots: Robot[];
  objectives: Objective[];
  sandbox?: boolean;
  rosterReady: string[];
  pauseRequested: boolean;
  paused: boolean;
  resumes: string[];
  swap: { objective: string; from: string; to: string } | null;
  log: string[];
  collisions?: { member: string; from: Point; attempted: Point; to: Point }[];
};
export type TeamMessage = {
  id?: string;
  member: string;
  text: string;
  at?: string;
  round?: number;
};
export const STRATEGY_SIGNALS = {
  hold: "I'll hold plate {plate}",
  ask_hold: "Can you hold plate {plate}?",
  collect: "I'll collect",
  takeover: "Can you take over plate {plate}?",
  wait: "Wait",
  ready: "I'm ready",
  through: "I'm through",
} as const;
export const PLATE_SIGNALS = ["hold", "ask_hold", "takeover"];
export const REQUEST_SIGNALS = ["ask_hold", "takeover"];
export type SignalKind = keyof typeof STRATEGY_SIGNALS;
export function signalLabel(kind: SignalKind, plate = "A") {
  return STRATEGY_SIGNALS[kind].replace("{plate}", plate);
}
export type StrategySignal = {
  id: string;
  attemptId: string;
  member: string;
  kind: SignalKind;
  round: number;
  sentAt: number;
  acknowledgedBy: string[];
  plate?: string;
  responses?: Record<string, "yes" | "no">;
};
export type EnergyRequest = {
  id: string;
  attemptId: string;
  from: string;
  status: "pending" | "fulfilled" | "cancelled" | "unavailable";
  passedBy: string[];
  fulfilledBy?: string;
};
export type MapPing = {
  id: string;
  attemptId: string;
  member: string;
  at: Point;
  kind: "meet" | "help" | "route";
  round: number;
  sentAt?: number;
};
export type Team = {
  id: string;
  name: string;
  code: string;
  owner: string;
  members: Member[];
  restored: string[];
  restoredAt: string | null;
  contributions?: Record<string, Member[]>;
  attempt: Attempt | null;
  version: number;
  processed: string[];
  messages: TeamMessage[];
  energyRequests?: EnergyRequest[];
  pings?: MapPing[];
  signals?: StrategySignal[];
  signalSentAt?: Record<string, number>;
  upgradeNotice?: string;
};
export const PLAYLIST = [
  "AE-01",
  "AE-03",
  "AE-05",
  "AE-07",
  "AE-02",
  "AE-04",
  "AE-06",
  "AE-08",
];
export const COLORS = ["#38785f", "#b57543", "#667aa7", "#9d718e"];
export const BASE = { x: 5, y: 9 };
export const PRESSURE_PLATE = { x: 5, y: 7 };
export const GATE = { x: 3, y: 7 };
export const BATTERIES = [
  { x: 1, y: 7 },
  { x: 9, y: 7 },
];
export const FLOOR: Point[] = [
  [5, 9],
  [5, 8],
  [5, 7],
  [4, 7],
  [3, 7],
  [2, 7],
  [2, 6],
  [2, 5],
  [6, 7],
  [7, 7],
  [8, 7],
  [8, 6],
  [8, 5],
  [5, 6],
  [5, 5],
  [4, 5],
  [4, 4],
  [4, 3],
  [5, 3],
  [6, 5],
  [7, 5],
  [7, 4],
  [7, 3],
  [4, 9],
  [3, 9],
  [2, 9],
  [1, 9],
  [1, 7],
  [1, 6],
  [1, 5],
  [6, 9],
  [7, 9],
  [8, 9],
  [9, 9],
  [9, 8],
  [9, 7],
  [9, 6],
  [9, 5],
].map(([x, y]) => ({ x, y }));
export const COMPONENTS = [
  { id: "pump", name: "Water pump", icon: "◉", at: { x: 2, y: 5 } },
  { id: "controller", name: "Control module", icon: "▣", at: { x: 8, y: 5 } },
  { id: "seeds", name: "Seed container", icon: "✿", at: { x: 5, y: 3 } },
  { id: "sensor", name: "Moisture sensor", icon: "◇", at: { x: 7, y: 3 } },
];
export const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
export const position = (r: Robot) => r.history[r.history.length - 1];
export const MAX_ROUNDS = 8;
export function makeAttempt(id: string, roster: string[]): Attempt {
  return {
    id,
    rulesVersion: 3,
    phase: "briefing",
    round: 1,
    roster,
    robots: roster.map((id) => ({
      id,
      history: [{ ...BASE }],
      energy: 3,
      cargo: null,
      batteries: [],
      queue: [],
      ready: false,
      donated: false,
    })),
    objectives: COMPONENTS.slice(0, roster.length).map((o) => ({
      ...o,
      at: { ...o.at },
      owner: null,
      status: "waiting",
      carrier: null,
    })),
    rosterReady: [],
    pauseRequested: false,
    paused: false,
    resumes: [],
    swap: null,
    log: [],
  };
}
// Gate A is controlled entirely by occupancy of pressure plate A.
export function plateHolders(a: Attempt) {
  return a.robots.filter((r) => same(position(r), PRESSURE_PLATE));
}
export function gateKeys(a: Attempt): string[] {
  return a.sandbox || plateHolders(a).length ? ["green"] : [];
}
// Other players' routes are private. Show a conditional preview with them stationary.
export function previewMission(a: Attempt, id: string, queue: Direction[]) {
  const copy = structuredClone(a);
  copy.robots.forEach((r) => {
    r.queue = r.id === id ? queue : [];
  });
  const traces = execute(copy);
  return {
    ...traces[id],
    end: position(copy.robots.find((r) => r.id === id)!),
  };
}
export function step(p: Point, d: Direction): Point {
  return {
    x: p.x + (d === "right" ? 1 : d === "left" ? -1 : 0),
    y: p.y + (d === "down" ? 1 : d === "up" ? -1 : 0),
  };
}
export function legal(p: Point, keys: string[]) {
  return (
    FLOOR.some((f) => same(f, p)) && (!same(p, GATE) || keys.includes("green"))
  );
}
export function preview(robot: Robot, queue: Direction[], keys: string[]) {
  const history = robot.history.map((p) => ({ ...p }));
  const path: Point[] = [];
  let collision = false;
  let spent = 0;
  for (const dir of queue) {
    if (spent >= robot.energy) break;
    spent++;
    const next = step(history[history.length - 1], dir);
    if (!legal(next, keys)) {
      collision = true;
      if (history.length > 1) history.pop();
      path.push({ ...history[history.length - 1] });
      break;
    }
    history.push(next);
    path.push(next);
  }
  return { path, collision, spent, end: history[history.length - 1] };
}
export function execute(a: Attempt, sandbox = false) {
  a.log = [];
  a.collisions = [];
  const traces: Record<string, { path: Point[]; collision: boolean }> = {};
  const earned: Record<string, number> = {};
  const stopped = new Set<string>();
  for (const r of a.robots) {
    traces[r.id] = { path: [], collision: false };
    earned[r.id] = 0;
  }
  const open = () => sandbox || !!a.sandbox || plateHolders(a).length > 0;
  let wasOpen = open();
  const collect = (r: Robot) => {
    if (r.cargo) return;
    const obj = a.objectives.find(
      (o) =>
        o.status === "waiting" && o.owner === r.id && same(o.at, position(r)),
    );
    if (!obj) return;
    obj.status = "carried";
    obj.carrier = r.id;
    r.cargo = obj.id;
    a.log.push(`${r.id}: Collected ${obj.name}.`);
  };
  const block = (r: Robot, beat: number, attempted: Point) => {
    const from = { ...position(r) };
    if (r.history.length > 1) r.history.pop();
    a.collisions!.push({
      member: r.id,
      from,
      attempted,
      to: { ...position(r) },
    });
    traces[r.id].collision = true;
    stopped.add(r.id);
    a.log.push(
      `${r.id}: Step ${beat}: blocked move; one energy spent, one step rolled back, remaining route cancelled.`,
    );
  };
  const move = (r: Robot, next: Point) => {
    r.history.push(next);
    traces[r.id].path.push(next);
    const battery = BATTERIES.find((b) => same(b, next));
    if (battery) {
      const key = `${battery.x},${battery.y}`;
      if (!r.batteries.includes(key)) {
        r.batteries.push(key);
        earned[r.id]++;
      }
    }
    collect(r);
    if (same(next, BASE) && r.cargo) {
      const obj = a.objectives.find((o) => o.id === r.cargo)!;
      obj.status = "delivered";
      obj.carrier = null;
      r.cargo = null;
      a.log.push(`${r.id}: Delivered ${obj.name}.`);
    }
  };
  a.robots.forEach(collect);
  // Resolve one queued step per robot per beat, independent of roster order.
  // Plate arrivals/departures resolve before gate entries on the same beat.
  const beats = Math.max(0, ...a.robots.map((r) => r.queue.length));
  for (let i = 0; i < beats; i++) {
    const gateEntries: { r: Robot; next: Point }[] = [];
    for (const r of a.robots) {
      if (stopped.has(r.id) || !r.queue[i] || r.energy < 1) continue;
      r.energy--;
      const next = step(position(r), r.queue[i]);
      if (!FLOOR.some((f) => same(f, next))) block(r, i + 1, next);
      else if (same(next, GATE)) gateEntries.push({ r, next });
      else move(r, next);
    }
    const gateOpen = open();
    for (const { r, next } of gateEntries) {
      if (gateOpen) move(r, next);
      else block(r, i + 1, next);
    }
    const nowOpen = open();
    if (nowOpen !== wasOpen)
      a.log.push(
        `Step ${i + 1}: Gate A ${nowOpen ? "opened — plate A is occupied" : "closed — plate A is empty"}.`,
      );
    wasOpen = nowOpen;
  }
  for (const r of a.robots) {
    // An empty route is Stay (including holding a plate), not a way to bank energy.
    r.energy = r.queue.length ? Math.min(6, r.energy + earned[r.id]) : 0;
    r.queue = [];
    r.ready = false;
  }
  a.swap = null;
  if (
    a.objectives.every((o) => o.status === "delivered") &&
    a.robots.every((r) => same(position(r), BASE))
  )
    a.phase = "success";
  else if (a.round >= MAX_ROUNDS) {
    a.phase = "ended";
    a.log.push(
      "Round limit reached. This attempt did not restore the greenhouse.",
    );
  } else a.phase = "round-end";
  a.paused = a.pauseRequested;
  a.resumes = [];
  return traces;
}
export function shortestPath(
  from: Point,
  to: Point,
  keys: string[],
): Direction[] | null {
  const q: { p: Point; path: Direction[] }[] = [{ p: from, path: [] }];
  const seen = new Set([`${from.x},${from.y}`]);
  for (let i = 0; i < q.length; i++) {
    const { p, path } = q[i];
    if (same(p, to)) return path;
    for (const d of ["up", "down", "left", "right"] as Direction[]) {
      const n = step(p, d),
        k = `${n.x},${n.y}`;
      if (legal(n, keys) && !seen.has(k)) {
        seen.add(k);
        q.push({ p: n, path: [...path, d] });
      }
    }
  }
  return null;
}

// Readiness is tied to the plan players saw, not unrelated teammate acknowledgements.
export function readinessContext(a: Attempt) {
  return JSON.stringify({
    jobs: a.objectives.map((o) => [o.id, o.owner, o.status]),
    energy:
      a.phase === "coordination"
        ? a.robots.map((r) => [r.id, r.energy, r.donated])
        : null,
    swap: a.swap,
    positions: a.robots.map((r) => [r.id, position(r)]),
  });
}
