# Final hackathon release check

8 November 2026. This records technical checks, not target-user or clinical validation.

## Changes from the preceding build

- Different tasks can be claimed concurrently without an unnecessary stale-view error. Competing claims for the same task still have only one winner.
- An unrelated signal update no longer blocks an otherwise valid energy transfer. Duplicate transfer and resource checks remain enforced.
- The creator can update discoverability despite an unrelated team update. Other members still cannot change visibility.
- Requests from an ended attempt no longer appear on the world screen.
- The team spec now contains a consolidated R1–R16 evidence register. The pitch includes the spoken script, everyday analogues, bond-building rationale, sensory rationale, product comparisons, demo sequence and judge questions.

## Verification

| Check | Result |
|---|---|
| TypeScript typecheck | Passed |
| Deterministic rule suite | 38 tests passed: maps, plate/gate timing, energy, collisions, signals, requests, pause/resume, legacy state, contribution credits, both wins and deadline failures |
| Production Worker/client build | Passed |
| Local HTTP/D1 integration suite | Passed: both independent identities, concurrent actions, stale-plan rejection, duplicate IDs, eight-round Greenhouse win, eleven-round Power win, persisted restoration and contributors |
| New concurrency regressions | Passed: independent task claims, same-task competition, energy transfer after unrelated update, visibility change after team update |
| Discovery API | Passed: private default, creator-only opt-in, minimal listing fields, search, code-free join, hidden/full-team rejection, six-member limit |
| Mission permissions | Passed: non-owner pair can start, either participant can end, observer cannot interrupt |
| Browser Greenhouse run | Completed all eight rounds through two independent browser identities; both components and robots home; both names and coloured region retained after reload |
| Partner entry | With both launch dialogs open, selected partner entered the host's new mission automatically |
| Coordination UI | Confirmed editable plate B request and Yes response, persistent energy inbox and fulfilment, map ping, optional free text off/on, quiet and reduced-motion controls |
| Failure/recovery UI | Confirmed visible obstacle caption, Stay energy becoming zero, break/resume, non-owner launch and confirmed end, completed world retained, obsolete request cards hidden |
| Desktop layout | At 1280 × 720, full board fit within viewport; controls scroll separately; Play/Replay measured 120 × 48 pixels |
| Phone layout | At 390 × 844, no horizontal page overflow; 330-pixel board; a substantial part of the full mission was played at this size |
| Hydration | Fresh production-preview loads and development load/reload: no hydration errors observed; development console had no warnings/errors in the checked fresh tab |
| Documentation | Local Markdown file links and whitespace checks passed |

Production-build testing used isolated local QA storage (`.wrangler/qa-discovery`) on port 8788. It did not reset or play the user's development team. Port 5173 remains the normal development server. QA preview is stopped after the pass; tests create their own local fixtures.

Commands: `npm run typecheck`, `npm test`, the Sites production build helper, and `TEST_URL=http://127.0.0.1:8788 npm run test:api` against the built Worker. Re-run only against local QA storage; the HTTP suite intentionally refuses non-local URLs.

## Demo and MVP boundaries

- Use two independent identities. Two tabs with the same browser origin share membership. Localhost is not accessible from another person's phone.
- The initial managed preview was owner-private. Deployment update, 8 November 2026: https://common-ground.sodeeqalli.workers.dev is public in our own Cloudflare account, with a fresh D1 database. Browser rendering, discovery reads and unauthenticated-access rejection were checked live; a subsequent authorized full live Greenhouse mission passed on two independent browsers, including persisted restoration and contributors. See [live multiplayer check](live-multiplayer-check.md); Power station and the broader regression suite remain local tests. See [system architecture](system-architecture.md) for deployment and verification details.
- Browser guest identity has no recovery. Leaving/clearing storage loses access to that identity, while its server member slot remains. Rejoining creates another member; avoid leaving the prepared demo identities.
- Two maps are playable. Bridge and Workshop are locked. The archived dialogue scripts have no runtime UI.
- Text chat is opt-in, with no moderation system. Discovery does not include compatibility matching or online-presence guarantees. These are hackathon prototype limits, not a claim of readiness for an unrestricted public community launch.
- No autistic-adult usability study, accessibility conformance audit, real-world communication outcome study or long-term friendship study has been completed. The technical checks above establish the tested behaviours, not every possible device/network combination or a guarantee of zero defects.

For presentation, use [final-pitch.md](final-pitch.md). For source details and appropriate claims, use [team-spec.md](team-spec.md#research-basis-and-claims).
