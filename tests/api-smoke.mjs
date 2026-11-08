// Local-only integration fixtures; never point this at a production team.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const {
  readinessContext,
  PRESSURE_PLATE,
  gateKeys,
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
await action(0, "new-mission", { roster: ids });
await together("signal", [
  { kind: "ask_hold", plate: "A" },
  { kind: "collect" },
]);
const history = await read(1);
assert.equal(history.signals.length, 2);
const signal = history.signals.find((s) => s.member === ids[0]);
assert.equal(signal.kind, "ask_hold");
await action(1, "signal-reply", { signal: signal.id, response: "yes" });
assert.deepEqual(
  (await read()).signals.find((s) => s.id === signal.id).responses,
  { [ids[1]]: "yes" },
);
assert.equal(
  (await request(tokens[0], body(await read(), "message", { text: " " })))
    .status,
  400,
);
assert.deepEqual((await read()).messages, []);
await together("message", [
  { text: "Optional plan from Fern" },
  { text: "Optional plan from Moss" },
]);
assert.equal((await read(1)).messages.length, 2);
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
await action(1, "signal", { kind: "collect" });
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
await action(0, "ping", { at: PRESSURE_PLATE, kind: "meet" });
const ping = (await read(1)).pings[0];
assert.equal(ping.member, ids[0]);
assert.deepEqual(ping.at, PRESSURE_PLATE);
const retiredOffer = await request(
  tokens[0],
  body(await read(), "swap-request", { objective: "pump", to: ids[1] }),
);
assert.equal(retiredOffer.status, 400);
assert.equal(
  (await read()).attempt.objectives.find((o) => o.id === "pump").owner,
  ids[0],
);
const routes = [
  [
    ["up", "up", "left"],
    ["up", "up"],
  ],
  [[], ["right", "right", "right", "up"]],
  [[], ["up", "down", "down"]],
  [[], ["left", "left", "left"]],
  [["left", "left", "up"], []],
  [["up", "down", "down"], []],
  [["right", "right", "right"], []],
  [
    ["down", "down"],
    ["down", "down"],
  ],
];
for (let round = 1; round <= 8; round++) {
  const state = await read();
  assert.equal(state.attempt.round, round);
  assert.equal(state.attempt.phase, "coordination");
  await together("coord-ready");
  await together(
    "moves",
    routes[round - 1].map((moves) => ({ moves })),
  );
  const after = await read();
  assert.equal(
    gateKeys(after.attempt).length > 0,
    [1, 4, 5, 6, 7].includes(round),
  );
  assert.equal(after.attempt.powerCharges, undefined);
  routes[round - 1].forEach((route, i) => {
    if (!route.length) assert.equal(after.attempt.robots[i].energy, 0);
  });
  if (round < 8) {
    await together("next");
    assert.deepEqual((await read()).signals, []);
    assert.deepEqual((await read()).pings, []);
  }
}
const done = await read(),
  other = await read(1);
assert.equal(done.attempt.phase, "success");
assert.deepEqual(gateKeys(done.attempt), []);
assert.deepEqual(done.restored, ["greenhouse"]);
assert.equal(other.restoredAt, done.restoredAt);
assert.deepEqual(
  done.contributions.greenhouse.map((m) => m.id),
  ids,
);
assert.deepEqual(other.contributions, done.contributions);
assert.equal(done.messages.length, 2);
assert.deepEqual(done.signals, []);
await action(0, "new-mission", { roster: ids });
assert.deepEqual((await read()).energyRequests, []);
assert.deepEqual((await read()).pings, []);
await action(0, "retreat");
assert.deepEqual((await read(1)).restored, ["greenhouse"]);
assert.deepEqual((await read(1)).contributions, done.contributions);
assert.equal((await fetch(base + "/api/scenarios")).status, 404);
console.log(
  "PASS: two identities, concurrent signals/readiness/routes, yes/no replies, optional chat, blank-text rejection, round expiry, persistent requests and pings, retired task-transfer rejection, stale-plan checks, automatic pressure-plate gate, eight-round strategic victory with no energy banking on Stay, saved world and contributor names, retry preservation and removal of the Practice endpoint.",
);

if (process.env.QA_TEAM_REPORT) {
  const { writeFile } = await import("node:fs/promises");
  await writeFile(
    process.env.QA_TEAM_REPORT,
    JSON.stringify({ code: first.data.team.code }),
  );
}
