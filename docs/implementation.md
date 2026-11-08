# Current implementation — shared strategy update

The current rules are [team-spec.md](team-spec.md), version 6. Missions no longer contain an answer/pass phase. Practice and Race have been removed from navigation; the Practice UI and endpoint are removed. Authored scenarios remain archived.

## Working features

- Persistent teams and world restoration; two-to-four-player greenhouse expedition.
- Shared planning, route previews, fixed energy income and an eight-round limit.
- Automatic occupancy-controlled plate A and gate A; no charges or activation API. Movement resolves one step per robot at a time, plate changes before gate entries. Pump access has no bypass or additional interlock.
- Seven preset signals, one per player, with explicit acknowledgements and round expiry. Plate requests have Yes/No replies; the letter is editable. Free chat is opt-in under Settings, with no floating launcher.
- Map pings with sender, label, coordinates and one pin per player, two-second throttling and round expiry.
- Persistent energy requests with fulfil/decline/cancel, accepted task handoffs, and visible pause requests.
- Low-stimulation four-part world picture driven by persisted restored-region IDs.

## Integration details

`components/mission-control.tsx` owns mission presentation. `components/team-coordination.tsx` provides inline mission signals and the request inbox across world and mission screens. `components/mission-map.tsx` renders the interactive map and pings. `shared/game.ts` owns deterministic resolution and gate previews. `lib/game-server.ts` validates actions. `app/api/game/route.ts` persists them using versioned D1 updates.

Live updates use 1.5-second HTTP polling, not WebSockets. Invalidated shared plans require review. A pending request is stored independently of signals, so later signals cannot replace it. Signal kinds are validated server-side; arbitrary signal kinds are rejected. Acknowledgements do not change readiness or task ownership. No external AI service, tone classifier or communication score is used.

Attempts from the old relay rules are ended safely during normalization. The obsolete migration banner is cleared from saved state and no longer rendered. Current pressure-plate attempts are preserved. Teams, saved chat and previously restored regions are retained. New attempts reset cargo, signals, pings and requests. The signals update preserves existing pressure-plate attempts. Free chat is hidden in the UI unless enabled in local comfort settings. Local browser identity still has no cross-device recovery.

## Verification

The rule suite covers all 72 archived dialogue paths, automatic mission energy, automatic plate activation/deactivation, same-step crossings, roster-order independence, plate handoffs, safe gate exits, conditional route previews, batteries, durable energy requests, consented task offers, labelled pings, signal validation, acknowledgements, replacement, throttling and round expiry, pause/recharge semantics, legacy state upgrades and coordinated wins for 2/3/4 players. A loss test reaches the eight-round deadline without completing the retrievals.

The local HTTP smoke test uses two independent identities and concurrent signals, readiness and route submissions. It verifies signal delivery and acknowledgement, optional chat and text validation, round expiry, request delivery and exactly-once fulfilment, changed-plan rejection, ping propagation, task-offer decline, an eight-round victory, world persistence and Practice endpoint removal.

## Limits

One mission is playable. Three future regions are locked; Practice and Race are absent. Full public-account recovery, matchmaking, moderation and heartbeat presence tracking are not built. “Connected” means this browser can reach the store; ready barriers wait for unready teammates, but already-submitted actions can resolve while a teammate is disconnected.

The owner-private hosted preview is not a judge-accessible deployment. GitHub access is separate. There is no claim of validated therapy or real-world communication improvement, and no autistic-user outcome evaluation has been performed. Full accessibility conformance remains unverified.

The mural uses a built-in image-generation asset in `public/world-mural-calm.png`, described in `docs/world-art.md`. SVG clipping reveals each saved region, with a pale monochrome base for unfinished areas. No animation or extra progress storage is introduced.

Selected roster members automatically enter a newly received active mission, closing the waiting dialog. Polls for the same mission do not override manual world navigation. Non-hosts see a read-only waiting roster.

Stay (empty routes, including plate holding) now discards remaining energy on resolution; the next round grants the usual three. Players who submit movement retain unused energy. The clock and teammate waiting time have no energy penalty. Collision records contain server-resolved source, attempted and rollback tiles. The map plays a single subtle bump on a newly received resolution; normal polling and refreshes do not replay it. Reduced motion skips the effect. The pre-move collision warning is removed.

Per-area `contributions` stores deduplicated member ID/name/colour snapshots. Credits are saved atomically with successful mission resolution, including all roster members. Replays append new contributors without changing the original restoration date. Read normalization can recover legacy credits from a retained successful attempt; missing history is never inferred from current membership. World attribution is a static text/avatar row below the picture; missions remain 2–4 players.

The UI uses a lower-saturation sage and warm-stone palette with softer light surfaces. Text and functional state labels retain contrast; the world image and robot art are gently desaturated. No dark mode or extra animation is introduced.
