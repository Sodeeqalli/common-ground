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
  rulesVersion: 2;
  phase: Phase;
  round: number;
  roster: string[];
  robots: Robot[];
  objectives: Objective[];
  keys: string[];
  powerCharges: number;
  powerBy: string | null;
  rosterReady: string[];
  pauseRequested: boolean;
  paused: boolean;
  resumes: string[];
  swap: { objective: string; from: string; to: string } | null;
  log: string[];
};
export type TeamMessage = {
  id?: string;
  member: string;
  text: string;
  at?: string;
  round?: number;
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
};
export type Team = {
  id: string;
  name: string;
  code: string;
  owner: string;
  members: Member[];
  restored: string[];
  restoredAt: string | null;
  attempt: Attempt | null;
  version: number;
  processed: string[];
  messages: TeamMessage[];
  energyRequests?: EnergyRequest[];
  pings?: MapPing[];
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
export const KEY = { x: 5, y: 7 };
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
  [1, 8],
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
export const GENERATOR = KEY;
export const MAX_ROUNDS = 8;
export function makeAttempt(id: string, roster: string[]): Attempt {
  return {
    id,
    rulesVersion: 2,
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
    keys: [],
    powerCharges: 2,
    powerBy: null,
    rosterReady: [],
    pauseRequested: false,
    paused: false,
    resumes: [],
    swap: null,
    log: [],
  };
}
// The route preview uses the same gate state that the upcoming resolution will use.
export function gateKeys(a: Attempt): string[] {
  return ["coordination", "planning"].includes(a.phase)
    ? a.powerBy
      ? ["green"]
      : []
    : a.keys;
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
  const operator = a.robots.find((r) => r.id === a.powerBy);
  const powered =
    !!operator &&
    same(position(operator), GENERATOR) &&
    operator.energy >= 1 &&
    operator.queue.length === 0 &&
    a.powerCharges > 0;
  a.keys = powered || sandbox ? ["green"] : [];
  if (powered) {
    operator!.energy--;
    a.powerCharges--;
    a.log.push(
      `${operator!.id}: Powered the gate and pump interlock for this round. ${a.powerCharges} charge(s) remain.`,
    );
  }
  const collect = (r: Robot) => {
    if (r.cargo) return;
    const obj = a.objectives.find(
      (o) =>
        o.status === "waiting" && o.owner === r.id && same(o.at, position(r)),
    );
    if (!obj) return;
    if (obj.id === "pump" && (!powered || operator?.id === r.id)) {
      a.log.push(
        `${r.id}: Pump is locked. A different robot must power the relay during a collection round.`,
      );
      return;
    }
    obj.status = "carried";
    obj.carrier = r.id;
    r.cargo = obj.id;
    a.log.push(`${r.id}: Collected ${obj.name}.`);
  };
  for (const r of a.robots) {
    let earned = 0;
    collect(r); // A robot waiting at the pump can collect when a teammate powers it.
    for (const dir of r.queue) {
      if (r.energy < 1) break;
      r.energy--;
      const next = step(position(r), dir);
      if (!legal(next, a.keys)) {
        if (r.history.length > 1) r.history.pop();
        a.log.push(
          `${r.id}: Blocked move: one energy spent, one step rolled back, remaining route cancelled.`,
        );
        break;
      }
      r.history.push(next);
      const battery = BATTERIES.find((b) => same(b, next));
      if (battery) {
        const key = `${battery.x},${battery.y}`;
        if (!r.batteries.includes(key)) {
          r.batteries.push(key);
          earned++;
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
    }
    r.energy = Math.min(6, r.energy + earned);
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
    power: [a.powerBy, a.powerCharges],
  });
}
