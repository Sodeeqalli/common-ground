const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  makeAttempt,
  missionFor,
  MISSIONS,
  gateKeys,
  execute,
  position,
  shortestPath,
} = require("../.test-build/shared/game.js");
const {
  newTeam,
  applyAction,
  normalizeTeam,
} = require("../.test-build/lib/game-server.js");
const routes = [
  [
    ["up", "up", "left"],
    ["up", "up", "right"],
  ],
  [["left", "up", "up"], ["right"]],
  [["up", "up", "left"], []],
  [["left", "right", "right"], []],
  [["down", "down", "down"], []],
  [["down"], ["up", "up", "up"]],
  [[], ["up", "right", "right"]],
  [[], ["left", "left", "down"]],
  [[], ["down", "down", "down"]],
  [
    ["right", "right", "down"],
    ["left", "left", "down"],
  ],
  [["down"], ["down"]],
];
function team() {
  const t = newTeam("power-test", "CODE", "Power QA", "p0", "Fern");
  t.members.push({ id: "p1", name: "Moss", color: "#397a60" });
  return t;
}
function act(t, id, type, args = {}) {
  applyAction(t, id, {
    type,
    attemptId: t.attempt?.id,
    round: t.attempt?.round,
    ...args,
  });
}
test("discovery defaults private and only the creator may toggle it", () => {
  const t = team();
  assert.equal(t.discoverable, false);
  assert.throws(
    () => act(t, "p1", "set-discovery", { enabled: true }),
    /creator/,
  );
  assert.throws(
    () => act(t, "p0", "set-discovery", { enabled: "yes" }),
    /setting/,
  );
  act(t, "p0", "set-discovery", { enabled: true });
  assert.equal(t.discoverable, true);
  act(t, "p0", "set-discovery", { enabled: false });
  assert.equal(t.discoverable, false);
});
test("old saves retain greenhouse rules and unavailable map IDs are rejected", () => {
  const a = makeAttempt("old", ["p0", "p1"]);
  delete a.missionId;
  assert.equal(missionFor(a).id, "greenhouse");
  assert.equal(missionFor(a).rounds, 8);
  assert.throws(
    () =>
      act(team(), "p0", "new-mission", {
        roster: ["p0", "p1"],
        missionId: "missing",
      }),
    /available mission/,
  );
});
test("each power component has only its corresponding gate as access", () => {
  const map = MISSIONS.power;
  for (let i = 0; i < 2; i++) {
    const target = map.components[i].at;
    assert.deepEqual(shortestPath(map.base, target, [], map), null);
    assert.deepEqual(
      shortestPath(map.base, target, [map.links[1 - i].key], map),
      null,
    );
    assert(shortestPath(map.base, target, [map.links[i].key], map).length > 0);
  }
});
test("power plates independently open gates; same-beat entries ignore roster order", () => {
  for (const reverse of [false, true])
    for (const link of MISSIONS.power.links) {
      const a = makeAttempt("power", ["collector", "holder"], "power");
      const [collector, holder] = a.robots;
      collector.history = [{ x: link.gate.x, y: link.gate.y + 1 }];
      collector.queue = ["up"];
      holder.history = [{ x: link.plate.x, y: link.plate.y + 1 }];
      holder.queue = ["up"];
      // The tile below each plate is outside the path; use the real neighbouring hall tile instead.
      holder.history = [
        { x: link.plate.x + (link.label === "A" ? -1 : 1), y: link.plate.y },
      ];
      holder.queue = [link.label === "A" ? "right" : "left"];
      if (reverse) a.robots.reverse();
      execute(a);
      assert.deepEqual(position(collector), link.gate);
      assert.deepEqual(gateKeys(a), [link.key]);
      assert.equal(a.collisions.length, 0);
      holder.queue = [link.label === "A" ? "left" : "right"];
      collector.queue = [];
      execute(a);
      assert.deepEqual(gateKeys(a), []);
    }
});
test("two players can restore Power in eleven rounds by taking turns holding both plates", () => {
  const t = team();
  t.restored = ["greenhouse"];
  t.contributions = { greenhouse: [{ ...t.members[0] }] };
  act(t, "p1", "new-mission", { roster: ["p0", "p1"], missionId: "power" });
  ["cell", "coil"].forEach((objective, i) =>
    act(t, "p" + i, "claim", { objective }),
  );
  ["p0", "p1"].forEach((id) => act(t, id, "brief-ready"));
  for (const [i, moves] of routes.entries()) {
    ["p0", "p1"].forEach((id) => act(t, id, "coord-ready"));
    moves.forEach((route, j) => act(t, "p" + j, "moves", { moves: route }));
    assert.equal(t.attempt.collisions.length, 0, `round ${i + 1}`);
    if (i < routes.length - 1) {
      assert.equal(t.attempt.phase, "round-end");
      ["p0", "p1"].forEach((id) => act(t, id, "next"));
    }
  }
  assert.equal(t.attempt.phase, "success");
  assert.equal(t.attempt.round, 11);
  assert.deepEqual(t.restored, ["greenhouse", "power"]);
  assert.deepEqual(
    t.contributions.power.map((p) => p.id),
    ["p0", "p1"],
  );
  assert.equal(t.contributions.greenhouse.length, 1);
  normalizeTeam(t);
  assert.equal(t.contributions.power.length, 2);
  act(t, "p0", "new-mission", { roster: ["p0", "p1"], missionId: "power" });
  act(t, "p1", "retreat");
  assert.deepEqual(t.restored, ["greenhouse", "power"]);
});
test("Power runs for twelve rounds and still permits failure", () => {
  const a = makeAttempt("power", ["p0", "p1"], "power");
  a.round = 11;
  execute(a);
  assert.equal(a.phase, "round-end");
  a.round = 12;
  execute(a);
  assert.equal(a.phase, "ended");
});
