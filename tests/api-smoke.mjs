// Run against a local, disposable D1 database: npm run test:api
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const {
  BASE,
  KEY,
  PLAYLIST,
  position,
  shortestPath,
  readinessContext,
} = require("../.test-build/shared/game.js");
const { scenarios } = require("../.test-build/lib/game-server.js");
const base = process.env.TEST_URL || "http://127.0.0.1:5173";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("This test creates fixtures. Use a local server.");
async function request(token, body) {
  const r = await fetch(base + "/api/game", {
    method: body ? "POST" : "GET",
    headers: {
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: r.status, data: await r.json() };
}
const created = await request(null, {
  type: "create",
  alias: "QA Fern",
  name: "API verification " + Date.now(),
});
assert.equal(created.status, 200, JSON.stringify(created.data));
const tokens = [created.data.token];
const ids = [created.data.team.me];
const joined = await request(null, {
  type: "join",
  alias: "QA Moss",
  code: created.data.team.code,
});
assert.equal(joined.status, 200);
tokens.push(joined.data.token);
ids.push(joined.data.team.me);
const read = async (i = 0) => {
  const r = await request(tokens[i]);
  assert.equal(r.status, 200, JSON.stringify(r.data));
  return r.data;
};
async function action(i, type, args = {}) {
  const view = await read(i);
  const r = await request(tokens[i], {
    type,
    version: view.version,
    attemptId: view.attempt?.id,
    requestId: crypto.randomUUID(),
    ...args,
  });
  assert.equal(r.status, 200, `${type}: ${JSON.stringify(r.data)}`);
  return r.data;
}
assert.equal((await read(1)).members.length, 2);
assert.equal((await request("invalid")).status, 401);
await action(0, "new-mission", { roster: ids });
const snap = await read();
const stale = await request(tokens[0], {
  type: "claim",
  objective: "pump",
  version: snap.version - 1,
  attemptId: snap.attempt.id,
  requestId: crypto.randomUUID(),
});
assert.equal(stale.status, 409);
const duplicateId = crypto.randomUUID();
const claimBody = {
  type: "claim",
  objective: "pump",
  version: snap.version,
  attemptId: snap.attempt.id,
  requestId: duplicateId,
};
const claim = await request(tokens[0], claimBody);
assert.equal(claim.status, 200);
const repeated = await request(tokens[0], claimBody);
assert.equal(repeated.status, 200);
assert.equal(repeated.data.version, claim.data.version);
await action(1, "claim", { objective: "controller" });
for (let i = 0; i < 2; i++) await action(i, "brief-ready");
// Independent private answers should both succeed; the server revalidates after a competing write.
const before = await read();
const responses = await Promise.all(
  tokens.map((token, i) =>
    request(token, {
      type: "answer",
      choice: "AE-01-D1-C1",
      version: before.version,
      attemptId: before.attempt.id,
      requestId: crypto.randomUUID(),
    }),
  ),
);
assert.deepEqual(
  responses.map((r) => r.status),
  [200, 200],
);
// A repeated choice with a fresh request ID must not pay twice or advance again.
const answerAgain = await request(tokens[0], {
  type: "answer",
  choice: "AE-01-D1-C1",
  version: before.version,
  attemptId: before.attempt.id,
  requestId: crypto.randomUUID(),
});
assert.equal(answerAgain.status, 400);
let completed;
for (let round = 1; round <= 8; round++) {
  for (let i = 0; i < 2; i++) {
    let v = await read(i);
    while (!v.attempt.robots.find((r) => r.id === ids[i]).dialogue.done) {
      const s = scenarios.find((s) => s.id === PLAYLIST[round - 1]);
      const r = v.attempt.robots.find((r) => r.id === ids[i]);
      const n = s.nodes[r.dialogue.node];
      const choice = n.choices.find((c) => c.credit === 1) || n.choices[0];
      v = await action(i, "answer", { choice: choice.id });
    }
  }
  const privacy = await read(1);
  assert.deepEqual(privacy.attempt.robots[0].dialogue.transcript, []);
  assert.deepEqual(privacy.attempt.robots[0].queue, []);
  if (round === 1) {
    const oldPlan = await read();
    await action(1, "give", { to: ids[0] });
    const staleReady = await request(tokens[0], {
      type: "coord-ready",
      version: oldPlan.version,
      attemptId: oldPlan.attempt.id,
      round: oldPlan.attempt.round,
      phase: oldPlan.attempt.phase,
      readyContext: readinessContext(oldPlan.attempt),
      requestId: crypto.randomUUID(),
    });
    assert.equal(
      staleReady.status,
      409,
      "changed energy must be reviewed before readying",
    );
  }
  const readySnapshot = await read();
  const acknowledgements = await Promise.all(
    tokens.map((token) =>
      request(token, {
        type: "coord-ready",
        version: readySnapshot.version,
        attemptId: readySnapshot.attempt.id,
        round: readySnapshot.attempt.round,
        phase: readySnapshot.attempt.phase,
        readyContext: readinessContext(readySnapshot.attempt),
        requestId: crypto.randomUUID(),
      }),
    ),
  );
  assert.deepEqual(
    acknowledgements.map((r) => r.status),
    [200, 200],
  );
  for (let i = 0; i < 2; i++) {
    const v = await read(i),
      a = v.attempt,
      r = a.robots.find((r) => r.id === ids[i]);
    const obj = a.objectives.find(
      (o) => o.owner === ids[i] && o.status === "waiting",
    );
    let target = r.cargo || !obj ? BASE : obj.at;
    if (round === 1) target = KEY;
    const path = shortestPath(position(r), target, a.keys);
    await action(i, "moves", { moves: path.slice(0, r.energy) });
  }
  completed = await read();
  if (completed.attempt.phase === "success") break;
  if (completed.attempt.phase === "round-end")
    for (let i = 0; i < 2; i++) await action(i, "next");
}
assert.equal(completed.attempt.phase, "success");
assert.deepEqual(completed.restored, ["greenhouse"]);
const persisted = await read(1);
assert.equal(persisted.restoredAt, completed.restoredAt);
assert.deepEqual(persisted.restored, ["greenhouse"]);
// New attempt and retreat do not erase the restored region.
await action(0, "new-mission", { roster: ids });
await action(0, "retreat");
assert.deepEqual((await read()).restored, ["greenhouse"]);
// Practice serves exactly eight scenarios and does not expose grading on choices.
const catalog = await (await fetch(base + "/api/scenarios")).json();
assert.equal(catalog.length, 8);
const practice = await (
  await fetch(base + "/api/scenarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "AE-01" }),
  })
).json();
assert(practice.node.choices.every((c) => !("credit" in c)));
console.log(
  "PASS: two independent identities, D1 joins, stale-version rejection, duplicate-click idempotency, concurrent actions, private answers, full mission completion, saved world, retry preservation, eight practice scenarios.",
);
