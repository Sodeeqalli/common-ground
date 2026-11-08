# First playable implementation

This document describes the running build. The team specification remains the broader agreed design.

## Included

One persistent team world and one greenhouse mission, with roster variants for two, three or four robots. Each selected robot initially claims one component. The mission has up to eight rounds in the paired-skill order AE-01, AE-03, AE-05, AE-07, AE-02, AE-04, AE-06, AE-08. It finishes early when all components and robots are home.

A round progresses through private conversation, team coordination, route planning and simultaneous resolution. Everyone must finish/pass their conversation and explicitly ready their coordination/route phases. Non-roster members can watch the shared state and join a later attempt.

Each completed conversation earns one participation energy plus zero to two authored decision credits, capped at six stored energy. Guided repairs earn no additional credits. Passing at any stage produces exactly one total energy for that conversation. The server, not the browser, owns scoring and reward issuance.

During coordination each robot may give one energy to one other robot, once per round, subject to the recipient cap. An owned, uncollected component can be offered to another player, who must accept. This is a responsibility handoff, not an automatic two-way exchange; a teammate can take more than one task but carry only one component at a time.

Each directional attempt costs one energy. A blocked attempt rolls back one previous traversed step and cancels the remaining queue; rollback does not trigger pickup, battery or delivery effects. A key collected in this resolution opens the gate for everyone only after all queues resolve. Batteries award one energy per robot per location after resolution. Robots may share tiles and pass through one another.

All assigned components must be delivered by entering base, and all roster robots must be at base for success. Round-eight failure and voluntary host retreat preserve previously restored regions. Replaying a completed mission does not award the region again.

## Persistence and synchronization

D1 stores each team, its latest attempt, restored regions and restoration timestamp in one serialized state row. An optimistic version condition prevents one player overwriting another player's accepted update. Mission success and world restoration are one atomic row update. Request IDs prevent recent duplicate actions being applied twice; phase and reward validation provide an additional guard.

The client polls every 1.5 seconds and ignores responses older than the newest version it has seen. Independent private answers revalidate their exact choice against fresh state and retry competing writes. Phase-local actions such as route submission and readiness can also revalidate within the same round and phase. Readiness is tied to the assignments and energy the player saw, so a changed plan requires review. Conflicting shared actions receive a readable refresh-and-retry response. This version uses HTTP polling, not the specification's suggested WebSocket transport.

Guest membership is a random bearer token held in browser local storage; only its hash is stored in the member table. Returning to the same browser restores membership and accepted game state. There is no cross-device identity recovery: clearing storage or leaving membership requires joining as a new robot. Team state remains stored. No diagnosis, date of birth, open chat or personal narrative is requested.

There is no online-presence/heartbeat subsystem. “Team connected” means this browser can reach its team store. The ready barriers wait for unready members; an already-submitted action may resolve while that member is disconnected. The host can end a stranded attempt without deleting the world. Add explicit presence/rejoin handling before treating this as a public multiplayer service.

## Current limits

- Only the greenhouse is playable. The power station, bridge and workshop are marked Planned. More missions are necessary to test sustained replay.
- Race is a labelled future mode. Practice conversations and a movement sandbox work now.
- Private hosting is suitable for owner review, not independent teammate accounts or a judge-accessible demo. Change hosting access deliberately before that demo; private GitHub access is separate.
- The app uses aliases and invite codes, not full user accounts, member recovery or moderation tools. It is a hackathon prototype, not ready for open public matchmaking.
- Conversation content is original fiction with research-informed design. It is not an autism assessment, calibrated answer dataset or clinically validated intervention. No autistic-user evaluation or real-world transfer study has been conducted for this game.
- Scoring rewards a response's stated practical purpose in its fictional context, not a supposedly correct neurotypical interpretation. Team energy can still create pressure; review this trade-off with autistic adults before claiming an accessible learning experience.
- Modal focus is contained and controls support keyboards; reduced motion and sound-off defaults are implemented. Full accessibility conformance and a screen-reader-friendly spatial alternative to the visual maze remain unverified.

## Demo route

1. Create a team on one browser and join from another identity using its code.
2. The host selects the two players. Claim the pump and control module, then both ready.
3. Show a conversation clarification, the reply/new information, the next decision and optional repair. Choices remain private to each player.
4. Show a one-energy transfer. Both ready for route planning.
5. Move a robot two steps up to collect the team key. The gate opens after resolution. Preview a blocked route, undo it and submit a valid route.
6. Continue toward assigned components, retrieve them, and plan the return to base. Unspent energy carries over; no one needs to rush.
7. Finish with all cargo and robots home. Show the restored greenhouse, refresh the page and open the other player's world.
8. Explain that only one mission is shipped, and that the content/practice engine supports later packs without claiming they are built.

Do not alter energy or insert a fake completion state for judging. A complete normal match is supported; it may finish before round eight. For a short pitch, rehearse the real route and keep a recording of genuine completion as a backup.
