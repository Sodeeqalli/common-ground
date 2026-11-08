const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  makeAttempt,
  execute,
  position,
  preview,
  BASE,
  GENERATOR,
  GATE,
  readinessContext,
  gateKeys,
} = require("../.test-build/shared/game.js");
const {
  newTeam,
  applyAction,
  publicView,
  scenarios,
  normalizeTeam,
} = require("../.test-build/lib/game-server.js");
function action(t, id, type, args = {}) {
  applyAction(t, id, { type, attemptId: t.attempt?.id, ...args });
}
function fixture(n = 2) {
  const t = newTeam("t", "CODE", "Test", "p0", "Fern");
  for (let i = 1; i < n; i++)
    t.members.push({ id: "p" + i, name: "Player " + i, color: "#397a60" });
  action(t, "p0", "new-mission", { roster: t.members.map((m) => m.id) });
  t.members.forEach((m, i) =>
    action(t, m.id, "claim", { objective: t.attempt.objectives[i].id }),
  );
  t.members.forEach((m) => action(t, m.id, "brief-ready"));
  return t;
}
const ROUTES = [
  [
    ["up", "up", "left"],
    ["up", "up"],
    ["up", "up", "up"],
    ["up", "up", "up"],
  ],
  [
    [],
    ["right", "right", "right", "up"],
    ["up", "left", "up"],
    ["up", "right", "right"],
  ],
  [[], ["up", "down", "down"], ["up", "right"], ["up", "up"]],
  [
    [],
    ["left", "left", "left"],
    ["left", "down", "down", "right"],
    ["down", "down", "left", "left"],
  ],
  [
    ["left", "left", "up", "up", "down", "down"],
    [],
    ["down", "down", "down"],
    ["down", "down", "down"],
  ],
  [["right", "right", "right"], [], ["down"], ["down"]],
  [["down", "down"], ["down", "down"], [], []],
];
test("the eight optional scenarios retain all 72 valid authored paths", () => {
  let paths = 0;
  assert.equal(scenarios.length, 8);
  for (const s of scenarios) {
    function visit(id, credits, decisions, seen) {
      assert(!seen.has(id));
      const n = s.nodes[id];
      assert(n);
      const next = new Set([...seen, id]);
      if (n.type === "terminal") {
        assert.equal(decisions, 2);
        assert(credits >= 0 && credits <= 2);
        paths++;
        return;
      }
      if (n.choices)
        for (const c of n.choices) {
          if (n.type === "repair") assert.equal(c.credit, 0);
          visit(
            c.next,
            credits + c.credit,
            decisions + (n.type === "decision" ? 1 : 0),
            next,
          );
        }
      else visit(n.next, credits, decisions, next);
    }
    visit(s.startNode, 0, 0, new Set());
  }
  assert.equal(paths, 72);
});
test("missions start with energy and go directly to coordination; answers cannot earn energy", () => {
  const t = fixture();
  assert.equal(t.attempt.phase, "coordination");
  assert.deepEqual(
    t.attempt.robots.map((r) => r.energy),
    [3, 3],
  );
  assert.throws(() => action(t, "p0", "answer", { choice: "AE-01-D1-C1" }));
  assert.equal(publicView(t, "p0").scenario, undefined);
});
test("pump cannot be collected without a different robot powering the relay", () => {
  const t = fixture(),
    a = t.attempt;
  a.robots[0].history = [{ x: 2, y: 5 }];
  execute(a);
  assert.equal(a.objectives[0].status, "waiting");
  a.phase = "coordination";
  a.robots[1].history = [GENERATOR];
  action(t, "p1", "power", { on: true });
  assert.deepEqual(gateKeys(a), ["green"]);
  execute(a);
  assert.equal(a.objectives[0].status, "carried");
  assert.equal(a.powerCharges, 1);
  assert.equal(a.robots[1].energy, 2);
});
test("relay commitment prevents movement; only two charges, and gate closes next round", () => {
  const t = fixture(),
    a = t.attempt;
  a.robots[1].history = [GENERATOR];
  for (let i = 0; i < 2; i++) {
    a.phase = "coordination";
    a.powerBy = null;
    action(t, "p1", "power", { on: true });
    for (const m of t.members) action(t, m.id, "coord-ready");
    assert.throws(() => action(t, "p1", "moves", { moves: ["down"] }));
    action(t, "p0", "moves", { moves: [] });
    action(t, "p1", "moves", { moves: [] });
    for (const m of t.members) action(t, m.id, "next");
    assert.deepEqual(a.keys, []);
    assert.equal(a.powerBy, null);
  }
  assert.equal(a.powerCharges, 0);
  assert.throws(() => action(t, "p1", "power", { on: true }));
});
test("collision previews agree with resolution for the planned gate state", () => {
  const a = makeAttempt("a", ["p0", "p1"]);
  a.phase = "planning";
  a.robots[0].history = [GENERATOR, { x: 4, y: 7 }];
  a.robots[0].energy = 3;
  a.robots[0].queue = ["left", "left"];
  let p = preview(a.robots[0], a.robots[0].queue, gateKeys(a));
  assert(p.collision);
  execute(a);
  assert.deepEqual(position(a.robots[0]), p.end);
  assert.equal(a.robots[0].energy, 2);
  a.phase = "planning";
  a.powerBy = "p1";
  a.robots[1].history = [GENERATOR];
  a.robots[0].history = [{ x: 4, y: 7 }];
  a.robots[0].queue = ["left", "left"];
  p = preview(a.robots[0], a.robots[0].queue, gateKeys(a));
  assert(!p.collision);
  execute(a);
  assert.deepEqual(position(a.robots[0]), p.end);
});
test("batteries award once per robot and only after execution", () => {
  const a = makeAttempt("a", ["p0", "p1"]),
    r = a.robots[0];
  r.history = [{ x: 1, y: 8 }];
  r.energy = 1;
  r.queue = ["up", "up"];
  execute(a);
  assert.deepEqual(position(r), { x: 1, y: 7 });
  assert.equal(r.energy, 1);
  r.energy = 3;
  r.queue = ["down", "up"];
  execute(a);
  assert.equal(r.energy, 1);
});
test("an energy request survives chat, is visible to teammates, and transfers only once", () => {
  const t = fixture();
  action(t, "p0", "energy-request");
  action(t, "p0", "energy-request");
  assert.equal(t.energyRequests.length, 1);
  const id = t.energyRequests[0].id;
  for (let i = 0; i < 65; i++)
    action(t, "p1", "message", { text: "Message " + i });
  assert.equal(t.messages.length, 60);
  assert.equal(publicView(t, "p1").energyRequests[0].id, id);
  const before = readinessContext(t.attempt);
  action(t, "p0", "coord-ready");
  action(t, "p1", "give", { to: "p0", request: id });
  assert.deepEqual(
    t.attempt.robots.map((r) => r.energy),
    [4, 2],
  );
  assert.equal(t.energyRequests[0].status, "fulfilled");
  assert.equal(t.energyRequests[0].fulfilledBy, "p1");
  assert.notEqual(readinessContext(t.attempt), before);
  assert.deepEqual(t.attempt.rosterReady, []);
  assert.throws(() => action(t, "p1", "give", { to: "p0", request: id }));
});
test("request decline is explicit; sender can cancel, but outsiders cannot", () => {
  const t = fixture(3);
  action(t, "p0", "energy-request");
  const request = t.energyRequests[0].id;
  assert.throws(() =>
    action(t, "p1", "request-response", { request, response: "cancel" }),
  );
  action(t, "p1", "request-response", { request, response: "not-now" });
  assert.equal(t.energyRequests[0].status, "pending");
  action(t, "p2", "request-response", { request, response: "not-now" });
  assert.equal(t.energyRequests[0].status, "unavailable");
  action(t, "p0", "energy-request");
  action(t, "p0", "request-response", {
    request: t.energyRequests[1].id,
    response: "cancel",
  });
  assert.equal(t.energyRequests[1].status, "cancelled");
});
test("task offers require recipient consent and reset shared readiness", () => {
  const t = fixture();
  action(t, "p0", "swap-request", { objective: "pump", to: "p1" });
  assert.equal(publicView(t, "p1").attempt.swap.from, "p0");
  assert.throws(() => action(t, "p0", "swap-answer", { accept: true }));
  action(t, "p1", "swap-answer", { accept: true });
  assert.equal(t.attempt.objectives[0].owner, "p1");
  assert.equal(t.attempt.swap, null);
});
test("map pings identify sender, round and tile; invalid tiles and kinds are rejected", () => {
  const t = fixture();
  action(t, "p0", "ping", { at: GENERATOR, kind: "meet" });
  const ping = publicView(t, "p1").pings[0];
  assert.deepEqual(ping.at, GENERATOR);
  assert.equal(ping.member, "p0");
  assert.equal(ping.round, 1);
  assert.throws(() =>
    action(t, "p0", "ping", { at: { x: 0, y: 0 }, kind: "meet" }),
  );
  assert.throws(() => action(t, "p0", "ping", { at: BASE, kind: "teleport" }));
});
test("chat is bounded, preserves literal text, and works before a mission", () => {
  const t = newTeam("t", "C", "T", "p0", "P");
  action(t, "p0", "message", { text: "<b>Hold the gate</b>" });
  assert.equal(t.messages[0].text, "<b>Hold the gate</b>");
  assert.throws(() => action(t, "p0", "message", { text: " " }));
  assert.throws(() => action(t, "p0", "message", { text: "x".repeat(281) }));
  assert.throws(() => action(t, "outsider", "message", { text: "No access" }));
});
for (const count of [2, 3, 4])
  test(`${count} players can win in seven rounds by coordinating two relay activations`, () => {
    const t = fixture(count);
    for (let round = 1; round <= 7; round++) {
      const a = t.attempt;
      assert.equal(a.phase, "coordination");
      assert.equal(a.round, round);
      if ([5, 6].includes(round)) action(t, "p1", "power", { on: true });
      for (const m of t.members) action(t, m.id, "coord-ready");
      for (let i = 0; i < count; i++)
        action(t, "p" + i, "moves", { moves: ROUTES[round - 1][i] });
      if (round < 7) for (const m of t.members) action(t, m.id, "next");
    }
    assert.equal(t.attempt.phase, "success");
    assert.equal(t.attempt.powerCharges, 0);
    assert.deepEqual(t.restored, ["greenhouse"]);
    const saved = t.restoredAt;
    action(t, "p0", "new-mission", { roster: t.members.map((m) => m.id) });
    action(t, "p0", "retreat");
    assert.deepEqual(t.restored, ["greenhouse"]);
    assert.equal(t.restoredAt, saved);
  });
test("wasting both relay charges before pump pickup creates a real failure", () => {
  const t = fixture(),
    a = t.attempt;
  a.robots[1].history = [GENERATOR];
  for (let round = 1; round <= 8; round++) {
    if (round <= 2) action(t, "p1", "power", { on: true });
    for (const m of t.members) action(t, m.id, "coord-ready");
    for (const m of t.members) action(t, m.id, "moves", { moves: [] });
    if (round < 8) for (const m of t.members) action(t, m.id, "next");
  }
  assert.equal(a.phase, "ended");
  assert.equal(a.powerCharges, 0);
  assert.equal(a.objectives[0].status, "waiting");
  assert.deepEqual(t.restored, []);
});
test("pause survives the boundary; everyone must resume; recharge cannot repeat", () => {
  const t = fixture();
  action(t, "p0", "pause");
  for (const m of t.members) action(t, m.id, "coord-ready");
  for (const m of t.members) action(t, m.id, "moves", { moves: [] });
  assert(t.attempt.paused);
  assert.throws(() => action(t, "p0", "next"));
  action(t, "p0", "resume");
  assert(t.attempt.paused);
  action(t, "p1", "resume");
  action(t, "p0", "next");
  assert.deepEqual(
    t.attempt.robots.map((r) => r.energy),
    [3, 3],
  );
  action(t, "p1", "next");
  assert.deepEqual(
    t.attempt.robots.map((r) => r.energy),
    [6, 6],
  );
  assert.throws(() => action(t, "p1", "next"));
});
test("legacy attempt upgrade preserves restored regions, team and chat", () => {
  const t = fixture();
  delete t.attempt.rulesVersion;
  t.attempt.phase = "conversation";
  t.restored = ["greenhouse"];
  t.messages = [{ member: "p0", text: "Hello" }];
  normalizeTeam(t);
  assert.equal(t.attempt.phase, "ended");
  assert.deepEqual(t.restored, ["greenhouse"]);
  assert.equal(t.messages[0].text, "Hello");
  assert(t.upgradeNotice);
});
test("invalid moves, stale attempts and non-host launch are rejected", () => {
  const t = fixture();
  assert.throws(() => action(t, "p1", "new-mission", { roster: ["p0", "p1"] }));
  assert.throws(() =>
    applyAction(t, "p0", {
      type: "ping",
      at: BASE,
      kind: "meet",
      attemptId: "old",
    }),
  );
  for (const m of t.members) action(t, m.id, "coord-ready");
  assert.throws(() =>
    action(t, "p0", "moves", { moves: ["up", "up", "up", "up"] }),
  );
  assert.throws(() => action(t, "p0", "moves", { moves: ["teleport"] }));
});
