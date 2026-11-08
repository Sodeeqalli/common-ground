export type Point = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";
export type Member = { id: string; name: string; color: string };
export type Dialogue = {
  node: string;
  credits: number;
  done: boolean;
  transcript: { who: string; text: string }[];
  feedback: string;
};
export type Robot = {
  id: string;
  history: Point[];
  energy: number;
  cargo: string | null;
  batteries: string[];
  queue: Direction[];
  ready: boolean;
  donated: boolean;
  dialogue: Dialogue;
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
  | "conversation"
  | "coordination"
  | "planning"
  | "round-end"
  | "success"
  | "ended";
export type Attempt = {
  id: string;
  phase: Phase;
  round: number;
  roster: string[];
  robots: Robot[];
  objectives: Objective[];
  keys: string[];
  rosterReady: string[];
  pauseRequested: boolean;
  paused: boolean;
  resumes: string[];
  swap: { objective: string; from: string; to: string } | null;
  log: string[];
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
  messages: { member: string; text: string }[];
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
export function initialDialogue(round: number): Dialogue {
  return {
    node: `${PLAYLIST[round - 1]}-D1`,
    credits: 0,
    done: false,
    transcript: [],
    feedback: "",
  };
}
export function makeAttempt(id: string, roster: string[]): Attempt {
  return {
    id,
    phase: "briefing",
    round: 1,
    roster,
    robots: roster.map((id) => ({
      id,
      history: [{ ...BASE }],
      energy: 0,
      cargo: null,
      batteries: [],
      queue: [],
      ready: false,
      donated: false,
      dialogue: initialDialogue(1),
    })),
    objectives: COMPONENTS.slice(0, roster.length).map((o) => ({
      ...o,
      at: { ...o.at },
      owner: null,
      status: "waiting",
      carrier: null,
    })),
    keys: [],
    rosterReady: [],
    pauseRequested: false,
    paused: false,
    resumes: [],
    swap: null,
    log: [],
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
export function execute(attempt: Attempt) {
  let pendingKey = false;
  attempt.log = [];
  for (const robot of attempt.robots) {
    let earned = 0;
    for (const dir of robot.queue) {
      if (robot.energy < 1) break;
      robot.energy--;
      const next = step(position(robot), dir);
      if (!legal(next, attempt.keys)) {
        if (robot.history.length > 1) robot.history.pop();
        attempt.log.push(
          `${robot.id}: A blocked move used one energy and rolled back one step.`,
        );
        break;
      }
      robot.history.push(next);
      if (same(next, KEY) && !attempt.keys.includes("green")) pendingKey = true;
      const battery = BATTERIES.find((b) => same(b, next));
      if (battery) {
        const bid = `${battery.x},${battery.y}`;
        if (!robot.batteries.includes(bid)) {
          robot.batteries.push(bid);
          earned++;
        }
      }
      if (!robot.cargo) {
        const obj = attempt.objectives.find(
          (o) =>
            o.status === "waiting" && o.owner === robot.id && same(o.at, next),
        );
        if (obj) {
          obj.status = "carried";
          obj.carrier = robot.id;
          robot.cargo = obj.id;
          attempt.log.push(`${robot.id}: Collected ${obj.name}.`);
        }
      }
      if (same(next, BASE) && robot.cargo) {
        const obj = attempt.objectives.find((o) => o.id === robot.cargo)!;
        obj.status = "delivered";
        obj.carrier = null;
        robot.cargo = null;
        attempt.log.push(`${robot.id}: Delivered ${obj.name}.`);
      }
    }
    robot.energy = Math.min(6, robot.energy + earned);
    robot.queue = [];
    robot.ready = false;
  }
  if (pendingKey) {
    attempt.keys.push("green");
    attempt.log.push("The shared gate is now open for everyone.");
  }
  attempt.swap = null;
  if (
    attempt.objectives.every((o) => o.status === "delivered") &&
    attempt.robots.every((r) => same(position(r), BASE))
  )
    attempt.phase = "success";
  else if (attempt.round >= 8) attempt.phase = "ended";
  else attempt.phase = "round-end";
  attempt.paused = attempt.pauseRequested;
  attempt.resumes = [];
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
  });
}
