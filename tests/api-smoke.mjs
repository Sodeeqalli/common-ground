// Local-only integration fixtures; never point this at a production team.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const {
  readinessContext,
  GENERATOR,
} = require("../.test-build/shared/game.js");
const base = process.env.TEST_URL || "http://127.0.0.1:5173";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error("Use a local server: this test creates QA teams.");
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
const first = await request(null, {
  type: "create",
  alias: "QA Fern",
  name: "Strategy QA " + Date.now(),
});
assert.equal(first.status, 200, JSON.stringify(first.data));
const second = await request(null, {
  type: "join",
  alias: "QA Moss",
  code: first.data.team.code,
});
assert.equal(second.status, 200, JSON.stringify(second.data));
const tokens = [first.data.token, second.data.token],
  ids = [first.data.team.me, second.data.team.me];
const read = async (i = 0) => {
  const r = await request(tokens[i]);
  assert.equal(r.status, 200);
  return r.data;
};
function body(v, type, args = {}) {
  return {
    type,
    version: v.version,
    attemptId: v.attempt?.id,
    round: v.attempt?.round,
    phase: v.attempt?.phase,
    readyContext: v.attempt ? readinessContext(v.attempt) : undefined,
    requestId: crypto.randomUUID(),
    ...args,
  };
}
async function action(i, type, args = {}) {
  const v = await read(i),
    r = await request(tokens[i], body(v, type, args));
  assert.equal(r.status, 200, `${type}: ${JSON.stringify(r.data)}`);
  return r.data;
}
async function together(type, args = [{}, {}]) {
  const v = await read();
  const result = await Promise.all(
    tokens.map((token, i) => request(token, body(v, type, args[i]))),
  );
  assert.deepEqual(
    result.map((r) => r.status),
    [200, 200],
    JSON.stringify(result),
  );
}
assert.equal((await request("invalid")).status, 401);
await together("message", [
  { text: "I can run the relay." },
  { text: "I will collect the pump." },
]);
const history = await read(1);
assert.equal(history.messages.length, 2);
assert(history.messages.some((m) => m.text === "I can run the relay."));
await action(0, "new-mission", { roster: ids });
const snap = await read();
const claimBody = body(snap, "claim", { objective: "pump" });
const claim = await request(tokens[0], claimBody);
assert.equal(claim.status, 200);
const repeated = await request(tokens[0], claimBody);
assert.equal(repeated.data.version, claim.data.version);
const stale = await request(
  tokens[1],
  body(snap, "claim", { objective: "controller" }),
);
assert.equal(stale.status, 409);
await action(1, "claim", { objective: "controller" });
await together("brief-ready");
assert.equal((await read()).attempt.phase, "coordination");
assert.equal((await read()).scenario, undefined);
await action(0, "energy-request");
const requestId = (await read(1)).energyRequests[0].id;
await action(0, "energy-request");
assert.equal((await read()).energyRequests.length, 1);
await action(1, "message", { text: "Sending one now." });
assert.equal((await read(1)).energyRequests[0].status, "pending");
const oldReady = await read();
await action(1, "give", { to: ids[0], request: requestId });
const changedReady = await request(tokens[0], body(oldReady, "coord-ready"));
assert.equal(changedReady.status, 409);
assert.equal((await read()).energyRequests[0].status, "fulfilled");
const duplicate = await request(
  tokens[1],
  body(await read(1), "give", { to: ids[0], request: requestId }),
);
assert.equal(duplicate.status, 400);
// Return one energy so the route fixture starts with the ordinary 3/3 budget.
await action(0, "give", { to: ids[1] });
await action(0, "ping", { at: GENERATOR, kind: "meet" });
const ping = (await read(1)).pings[0];
assert.equal(ping.member, ids[0]);
assert.deepEqual(ping.at, GENERATOR);
await action(0, "swap-request", { objective: "pump", to: ids[1] });
assert.equal((await read(1)).attempt.swap.from, ids[0]);
await action(1, "swap-answer", { accept: false });
assert.equal((await read()).attempt.swap, null);
const routes = [
  [
    ["up", "up", "left"],
    ["up", "up"],
  ],
  [[], ["right", "right", "right", "up"]],
  [[], ["up", "down", "down"]],
  [[], ["left", "left", "left"]],
  [["left", "left", "up", "up", "down", "down"], []],
  [["right", "right", "right"], []],
  [
    ["down", "down"],
    ["down", "down"],
  ],
];
for (let round = 1; round <= 7; round++) {
  const state = await read();
  assert.equal(state.attempt.round, round);
  assert.equal(state.attempt.phase, "coordination");
  if ([5, 6].includes(round)) await action(1, "power", { on: true });
  await together("coord-ready");
  if (round === 5) {
    const invalid = await request(
      tokens[1],
      body(await read(1), "moves", { moves: ["down"] }),
    );
    assert.equal(invalid.status, 400);
  }
  await together(
    "moves",
    routes[round - 1].map((moves) => ({ moves })),
  );
  if (round < 7) await together("next");
}
const done = await read(),
  other = await read(1);
assert.equal(done.attempt.phase, "success");
assert.equal(done.attempt.powerCharges, 0);
assert.deepEqual(done.restored, ["greenhouse"]);
assert.equal(other.restoredAt, done.restoredAt);
assert.equal(done.messages.length, 3);
await action(0, "new-mission", { roster: ids });
assert.deepEqual((await read()).energyRequests, []);
assert.deepEqual((await read()).pings, []);
await action(0, "retreat");
assert.deepEqual((await read(1)).restored, ["greenhouse"]);
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
assert.deepEqual((await read()).restored, ["greenhouse"]);
console.log(
  "PASS: two identities, concurrent chat/readiness/routes, persistent requests and pings, consented task offers, stale-plan checks, relay constraint, seven-round strategic victory, saved world, retry preservation and eight independent practice scenarios.",
);
