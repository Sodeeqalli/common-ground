# Current implementation — shared strategy update

The current rules are [team-spec.md](team-spec.md), version 7. Missions no longer contain an answer/pass phase. Practice and Race have been removed from navigation; the Practice UI and endpoint are removed. Authored scenarios remain archived.

## Working features

- Persistent teams and world restoration; two-player Greenhouse and Power station missions in a team of up to six.
- Shared planning, route previews, fixed energy income and map-specific limits of eight and twelve rounds.
- Automatic occupancy-controlled plate A and gate A; no charges or activation API. Movement resolves one step per robot at a time, plate changes before gate entries. Pump access has no bypass or additional interlock.
- Seven preset signals, one per player, with explicit acknowledgements and round expiry. Plate requests have Yes/No replies; the letter is editable. Free chat is opt-in under Settings, with an expandable bottom-left bar.
- Map pings with sender, label, coordinates and one pin per player, two-second throttling and round expiry.
- Persistent energy requests with fulfil/decline/cancel, retired task-transfer rejection, and visible pause requests.
- Low-stimulation four-part world picture driven by persisted restored-region IDs.

## Integration details

`components/mission-control.tsx` owns mission presentation. `components/team-coordination.tsx` provides inline mission signals and the request inbox across world and mission screens. `components/mission-map.tsx` renders the interactive map and pings. `shared/game.ts` owns deterministic resolution and gate previews. `lib/game-server.ts` validates actions. `app/api/game/route.ts` persists them using versioned D1 updates.

Live updates use 1.5-second HTTP polling, not WebSockets. Invalidated shared plans require review. A pending request is stored independently of signals, so later signals cannot replace it. Signal kinds are validated server-side; arbitrary signal kinds are rejected. Acknowledgements do not change readiness or task ownership. No external AI service, tone classifier or communication score is used.

Attempts from the old relay rules are ended safely during normalization. The obsolete migration banner is cleared from saved state and no longer rendered. Current pressure-plate attempts are preserved. Teams, saved chat and previously restored regions are retained. New attempts reset cargo, signals, pings and requests. The signals update preserves existing pressure-plate attempts. Free chat is hidden in the UI unless enabled in local comfort settings. Local browser identity still has no cross-device recovery.

## Verification

The rule suite covers all 72 archived dialogue paths, automatic mission energy, automatic plate activation/deactivation, same-step crossings, roster-order independence, plate handoffs, safe gate exits, conditional route previews, batteries, durable energy requests, retired task-offer rejection and saved-mission recovery, labelled pings, signal validation, acknowledgements, replacement, throttling and round expiry, pause/recharge semantics, legacy state upgrades and two-player coordinated wins and completion of legacy 3/4-player saves. A loss test reaches the eight-round deadline without completing the retrievals.

The local HTTP smoke test uses two independent identities and concurrent signals, readiness and route submissions. It verifies signal delivery and acknowledgement, optional chat and text validation, round expiry, request delivery and exactly-once fulfilment, changed-plan rejection, ping propagation, task-transfer endpoint removal, an eight-round victory, world persistence and Practice endpoint removal.

## Limits

Two missions are playable. Bridge and Workshop remain locked; Practice and Race are absent. Full public-account recovery, automatic matchmaking, moderation and heartbeat presence tracking are not built. “Connected” means this browser can reach the store; ready barriers wait for unready teammates, but already-submitted actions can resolve while a teammate is disconnected.

The owner-private hosted preview is not a judge-accessible deployment. GitHub access is separate. There is no claim of validated therapy or real-world communication improvement, and no autistic-user outcome evaluation has been performed. Full accessibility conformance remains unverified.

The mural uses a built-in image-generation asset in `public/world-mural-calm.png`, described in `docs/world-art.md`. SVG clipping reveals each saved region, with a pale monochrome base for unfinished areas. No animation or extra progress storage is introduced.

Selected roster members automatically enter a newly received active mission, closing the waiting dialog. Polls for the same mission do not override manual world navigation. Any team member can choose one partner; the launcher always joins their own mission.

Stay (empty routes, including plate holding) now discards remaining energy on resolution; the next round grants the usual three. Players who submit movement retain unused energy. The clock and teammate waiting time have no energy penalty. Collision records contain server-resolved source, attempted and rollback tiles. The map plays a single subtle bump on a newly received resolution; normal polling and refreshes do not replay it. Reduced motion skips the effect. The pre-move collision warning is removed.

Per-area `contributions` stores deduplicated member ID/name/colour snapshots. Credits are saved atomically with successful mission resolution, including all roster members. Replays append new contributors without changing the original restoration date. Read normalization can recover legacy credits from a retained successful attempt; missing history is never inferred from current membership. World attribution is a static text/avatar row below the picture; new missions have exactly two players.

The UI uses a lower-saturation sage and warm-stone palette with softer light surfaces. Text and functional state labels retain contrast; the world image and robot art are gently desaturated. No dark mode or extra animation is introduced.

Active desktop missions use a viewport-height shell, compact header and a size-contained board column. The board scales to both available width and height; controls scroll independently on the right. Focused controls-panel arrow keys scroll the panel instead of queuing a route. Narrow or short viewports fall back to the stacked page layout. Requests render once, inside the panel during active missions and in the existing location otherwise. Optional chat renders once as a collapsible bottom-left bar across world and mission screens.

Obstacle feedback is a static, high-visibility strip above the board. It names the affected players and respects Quiet mode for announcements; no additional motion or sound is introduced.

Team joins stop at six members. Mission launch validates exactly two distinct existing members including the launcher; no owner restriction. Ending remains roster-restricted and available to either participant with confirmation. Active attempts cannot be overwritten, and restored areas/credits survive an ended attempt. HTTP and rule checks cover non-owner pairs, spectator denial and membership limits. The redundant plate/gate status card is removed; the map retains its labelled plate, gate and connecting line.

## Discovery and map selection

`Team.discoverable` is false by default; old saves without it stay private. Only the creator may toggle it. The directory returns ID, name and member count for opt-in teams below six members, with a bounded name search. Code-free joins recheck visibility and capacity and use the existing atomic version-checked team/member write. No invite codes, member aliases, chat, credentials or progress appear in listings. A current browser member must explicitly leave their identity before joining another team. Hosting audience is unchanged.

`Attempt.missionId` selects the map definition; missing values mean Greenhouse. Mission definitions provide floor, base, batteries, objectives, round limit and linked plates/gates. Preview, server resolution, pings and presentation share that definition. A and B open independently, with plate changes resolved before gate entries. Power success restores `power`, preserving greenhouse progress and separate contributor credits. No D1 schema migration is required.

Additional checks exercise creator-only discovery, private defaults, directory field boundaries, code-free joins, stale hidden/full listings, map access without bypasses, both same-step gates, legacy mission IDs, twelve-round failure and a complete eleven-round Power victory through both rules and HTTP persistence.
