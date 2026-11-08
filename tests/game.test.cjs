const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  makeAttempt,
  execute,
  position,
  preview,
  BASE,
  KEY,
  GATE,
  shortestPath,
  PLAYLIST,
} = require("../.test-build/shared/game.js");
const {
  newTeam,
  applyAction,
  publicView,
  scenarios,
} = require("../.test-build/lib/game-server.js");
function fixture(n = 2) {
  const team = newTeam("t", "CODE", "Test", "p0", "Player 0");
  for (let i = 1; i < n; i++)
    team.members.push({ id: "p" + i, name: "Player " + i, color: "#397a60" });
  action(team, "p0", "new-mission", { roster: team.members.map((m) => m.id) });
  team.members.forEach((m, i) =>
    action(team, m.id, "claim", { objective: team.attempt.objectives[i].id }),
  );
  team.members.forEach((m) => action(team, m.id, "brief-ready"));
  return team;
}
function action(t, id, type, args = {}) {
  applyAction(t, id, { type, attemptId: t.attempt?.id, ...args });
}
function finishConversation(t, id, credits = true) {
  while (!t.attempt.robots.find((r) => r.id === id).dialogue.done) {
    const v = publicView(t, id);
    const s = scenarios.find((s) => s.id === PLAYLIST[t.attempt.round - 1]);
    const n = s.nodes[t.attempt.robots.find((r) => r.id === id).dialogue.node];
    const c =
      n.choices.find((c) => c.credit === (credits ? 1 : 0)) || n.choices[0];
    action(t, id, "answer", { choice: c.id });
  }
}
test("all 72 authored paths terminate with exactly two scored decisions and 1–3 energy", () => {
  let paths = 0;
  assert.equal(scenarios.length, 8);
  for (const s of scenarios) {
    function walk(id, credits, decisions, seen) {
      assert(!seen.has(id), "cycle");
      const n = s.nodes[id];
      assert(n, `missing ${id}`);
      const nextSeen = new Set([...seen, id]);
      if (n.type === "terminal") {
        assert.equal(decisions, 2);
        assert(credits >= 0 && credits <= 2);
        paths++;
        return;
      }
      if (n.choices) {
        for (const c of n.choices) {
          assert([0, 1].includes(c.credit));
          if (n.type === "repair") assert.equal(c.credit, 0);
          walk(
            c.next,
            credits + c.credit,
            decisions + (n.type === "decision" ? 1 : 0),
            nextSeen,
          );
        }
      } else walk(n.next, credits, decisions, nextSeen);
    }
    walk(s.startNode, 0, 0, new Set());
  }
  assert.equal(paths, 72);
});
test("closed gate remains closed for every player until all movement resolves", () => {
  const a = makeAttempt("a", ["p0", "p1"]);
  a.robots[0].energy = 6;
  a.robots[0].queue = ["up", "up"];
  a.robots[1].history = [
    { ...BASE },
    { x: 5, y: 8 },
    { ...KEY },
    { x: 4, y: 7 },
  ];
  a.robots[1].energy = 3;
  a.robots[1].queue = ["left", "left"];
  execute(a);
  assert.deepEqual(position(a.robots[1]), KEY);
  assert.equal(a.robots[1].energy, 2);
  assert.deepEqual(a.keys, ["green"]);
  a.robots[1].queue = ["left", "left"];
  execute(a);
  assert.deepEqual(position(a.robots[1]), GATE);
});
test("collision preview matches execution and cancels remaining moves", () => {
  const a = makeAttempt("a", ["p0", "p1"]);
  const r = a.robots[0];
  r.energy = 5;
  r.queue = ["up", "right", "down"];
  const p = preview(r, r.queue, []);
  assert(p.collision);
  execute(a);
  assert.deepEqual(position(r), p.end);
  assert.deepEqual(position(r), BASE);
  assert.equal(r.energy, 3);
});
test("batteries pay once per robot and cannot fund extra moves in the same queue", () => {
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
  assert.equal(r.batteries.length, 1);
});
test("pass and completed answers pay once; private answers never leak to teammates", () => {
  const t = fixture();
  finishConversation(t, "p0");
  assert.equal(t.attempt.robots[0].energy, 3);
  assert.throws(() => action(t, "p0", "pass"));
  const v = publicView(t, "p1");
  assert.equal(v.attempt.robots[0].dialogue.transcript.length, 0);
  assert.equal(v.attempt.robots[0].dialogue.credits, 0);
  assert(!("credit" in v.node.choices[0]));
  action(t, "p1", "pass");
  assert.equal(t.attempt.robots[1].energy, 1);
  assert.equal(t.attempt.phase, "coordination");
});
test("energy sharing conserves energy, pays once, and invalidates readiness", () => {
  const t = fixture();
  finishConversation(t, "p0");
  finishConversation(t, "p1");
  action(t, "p1", "coord-ready");
  action(t, "p0", "give", { to: "p1" });
  assert.deepEqual(
    t.attempt.robots.map((r) => r.energy),
    [2, 4],
  );
  assert.deepEqual(t.attempt.rosterReady, []);
  assert.throws(() => action(t, "p0", "give", { to: "p1" }));
});
test("task handoff requires the recipient and only affects uncollected cargo", () => {
  const t = fixture();
  for (const m of t.members) finishConversation(t, m.id);
  action(t, "p0", "swap-request", { objective: "pump", to: "p1" });
  assert.throws(() => action(t, "p0", "swap-answer", { accept: true }));
  action(t, "p1", "swap-answer", { accept: true });
  assert.equal(t.attempt.objectives[0].owner, "p1");
  assert.equal(t.attempt.objectives[1].owner, "p1");
});
test("pause requires everyone to resume; eight idle rounds end without restoring world", () => {
  const t = fixture();
  for (let round = 1; round <= 8; round++) {
    assert.equal(t.attempt.round, round);
    for (const m of t.members) action(t, m.id, "pass");
    for (const m of t.members) action(t, m.id, "coord-ready");
    if (round === 1) action(t, "p0", "pause");
    for (const m of t.members) action(t, m.id, "moves", { moves: [] });
    if (round === 1) {
      assert(t.attempt.paused);
      assert.throws(() => action(t, "p0", "next"));
      action(t, "p0", "resume");
      assert(t.attempt.paused);
      action(t, "p1", "resume");
      assert(!t.attempt.paused);
    }
    if (round < 8) for (const m of t.members) action(t, m.id, "next");
  }
  assert.equal(t.attempt.phase, "ended");
  assert.deepEqual(t.restored, []);
  assert.throws(() => action(t, "p0", "next"));
});
for (const size of [2, 3, 4])
  test(`${size} players can deliver every assigned component in eight rounds`, () => {
    const t = fixture(size);
    for (let round = 1; round <= 8; round++) {
      for (const m of t.members) finishConversation(t, m.id);
      for (const m of t.members) action(t, m.id, "coord-ready");
      for (const m of t.members) {
        const a = t.attempt,
          r = a.robots.find((r) => r.id === m.id);
        const obj = a.objectives.find(
          (o) => o.owner === m.id && o.status === "waiting",
        );
        let target = r.cargo || !obj ? BASE : obj.at; // Key first makes the short route a team unlock.
        if (round === 1) target = KEY;
        const path = shortestPath(position(r), target, a.keys);
        assert(path);
        action(t, m.id, "moves", { moves: path.slice(0, r.energy) });
      }
      if (t.attempt.phase === "success") break;
      if (t.attempt.phase === "round-end")
        for (const m of t.members) action(t, m.id, "next");
    }
    assert.equal(t.attempt.phase, "success");
    assert.deepEqual(t.restored, ["greenhouse"]);
    assert(t.restoredAt);
    const saved = t.restoredAt;
    action(t, "p0", "new-mission", { roster: t.members.map((m) => m.id) });
    action(t, "p0", "retreat");
    assert.deepEqual(t.restored, ["greenhouse"]);
    assert.equal(t.restoredAt, saved);
  });
test("overspending, stale attempts, outsiders, and non-host launch are rejected", () => {
  const t = fixture();
  assert.throws(() => action(t, "outsider", "pass"));
  assert.throws(() => action(t, "p1", "new-mission", { roster: ["p0", "p1"] }));
  assert.throws(() => applyAction(t, "p0", { type: "pass", attemptId: "old" }));
  for (const m of t.members) action(t, m.id, "pass");
  for (const m of t.members) action(t, m.id, "coord-ready");
  assert.throws(() => action(t, "p0", "moves", { moves: ["up", "up"] }));
  assert.throws(() => action(t, "p0", "moves", { moves: ["teleport"] }));
});
