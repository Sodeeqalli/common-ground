# Current implementation — shared strategy update

The current rules are [team-spec.md](team-spec.md), version 4. Missions no longer contain an answer/pass phase. All eight adult scenarios remain in optional Practice; internal scenario credits never award mission energy.

## Working features

- Persistent teams and world restoration; two-to-four-player greenhouse expedition.
- Shared planning, route previews, fixed energy income and an eight-round limit.
- Automatic occupancy-controlled plate A and gate A; no charges or activation API. Movement resolves one step per robot at a time, plate changes before gate entries. Pump access has no bypass or additional interlock.
- Free text team chat with 60-message history, unread indicator and 280-character messages.
- Map pings with sender, label, coordinates and recent-round visibility.
- Persistent energy requests with fulfil/decline/cancel, accepted task handoffs, and visible pause requests.
- Optional individual conversations and open-gate movement sandbox.

## Integration details

`components/mission-control.tsx` owns mission presentation. `components/team-channel.tsx` provides chat and the request inbox across world, mission and practice screens. `components/mission-map.tsx` renders the interactive map and pings. `shared/game.ts` owns deterministic resolution and gate previews. `lib/game-server.ts` validates actions. `app/api/game/route.ts` persists them using versioned D1 updates.

Live updates use 1.5-second HTTP polling, not WebSockets. Invalidated shared plans require review. A pending request is stored independently of chat, so later messages cannot replace it. Chat is literal text, not executable markup. No external AI service, tone classifier or communication score is used.

Older active attempts return an explicit restart notice and are ended under the new rules. Teams, saved chat and previously restored regions are retained. New attempts reset cargo, pings and requests. Local browser identity still has no cross-device recovery.

## Verification

The rule suite covers all 72 optional dialogue paths, automatic mission energy, automatic plate activation/deactivation, same-step crossings, roster-order independence, plate handoffs, safe gate exits, conditional route previews, batteries, durable energy requests, consented task offers, labelled pings, message validation, pause/recharge semantics, legacy state upgrades and coordinated wins for 2/3/4 players. A loss test reaches the eight-round deadline without completing the retrievals.

The local HTTP smoke test uses two independent identities and concurrent chat, readiness and route submissions. It verifies request delivery and exactly-once fulfilment, changed-plan rejection, ping propagation, task-offer decline, a seven-round victory, world persistence and optional Practice isolation.

## Limits

One mission is playable. Race and three future regions are labelled Planned. Full public-account recovery, matchmaking, moderation and heartbeat presence tracking are not built. “Team connected” means this browser can reach the store; ready barriers wait for unready teammates, but already-submitted actions can resolve while a teammate is disconnected.

The owner-private hosted preview is not a judge-accessible deployment. GitHub access is separate. There is no claim of validated therapy or real-world communication improvement, and no autistic-user outcome evaluation has been performed. Full accessibility conformance remains unverified.
