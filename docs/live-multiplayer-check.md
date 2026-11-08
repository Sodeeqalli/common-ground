# Live multiplayer mission check

8 November 2026. Target: https://common-ground.sodeeqalli.workers.dev.

**Result: passed a complete eight-round Greenhouse mission on production.**

The user explicitly authorized creating live test teams and players. A private team, `Live QA Nov8`, was created with `QA Fern` in the in-app browser and `QA Moss` in Chrome. They used independent browser storage and joined through the public UI. No existing player team was used or modified. The team was not listed in Discover teams.

All mission actions were performed through browser controls against the deployed application. This was not a local simulation or a direct database state edit. The runtime was the previously deployed Worker version `147d3a71-b79a-4f1e-9c6b-f81381beedd2`.

## Results

| Check | Observed result |
|---|---|
| Team creation and joining | Both identities joined the same private team through its invite code |
| Partner launch | Both launch dialogs were open; starting from Fern automatically brought Moss into the mission |
| Task selection | Fern claimed Water pump; Moss claimed Control module; each browser saw the assignments |
| Strategy request | Fern sent “Can you hold plate A?”; Moss saw it and answered Yes; Fern saw the acknowledgement |
| Energy inbox | Fern requested energy; Moss saw the pending request and fulfilled it; both budgets updated; Fern then returned one energy for the planned routes |
| Map ping | A Meet here ping on plate A appeared on the teammate's board and in the coordinate caption |
| Shared phase progression | Both players' readiness and route submissions advanced every round |
| Pressure plate | Gate A opened with occupancy, closed when Moss left, and reopened when Moss returned; both browsers agreed |
| Waiting energy | Stay/Hold plate actions ended with zero energy, including while holding the gate open |
| Mission result | Both browsers displayed Mission complete on round 8 with 2/2 components and 2/2 robots home |
| Shared world | Both browsers showed 1/4 complete, the restored greenhouse, and Built by QA Fern / QA Moss |
| Persistence | Reloading both browsers retained each identity, restored region and both contributor names |
| Optional free chat | Off initially; enabled independently in Settings; a message in each direction arrived in the other browser |
| Browser diagnostics | No warnings or errors were returned by the browser logs checked after the run |

## Played routes

Directions below are the queued moves submitted through the UI. Both players began at base with three energy; neither mission state nor energy was patched.

| Round | Fern — pump carrier | Moss — controller carrier |
|---|---|---|
| 1 | Up, Up, Left | Up, Up |
| 2 | Stay | Right, Right, Right, Up |
| 3 | Stay | Up, Down, Down |
| 4 | Stay | Left, Left, Left |
| 5 | Left, Left, Up | Hold plate A |
| 6 | Up, Down, Down | Hold plate A |
| 7 | Right, Right, Right | Hold plate A |
| 8 | Down, Down | Down, Down |

## Scope and retained data

No application code change or redeployment was needed. The private QA team, two guest identities, completed greenhouse and two test chat messages remain in production. The completed-world tabs were kept available for inspection. Invite codes and bearer tokens are intentionally omitted from this public report.

This confirms the tested production Greenhouse flow, not every possible browser, network interruption or multiplayer edge case. Power station, failure/recovery paths and broader concurrency scenarios retain the separate local coverage in [release-check.md](release-check.md). This test does not establish clinical benefit or real-world communication outcomes.
