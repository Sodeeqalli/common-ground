# Common Ground

**Different minds. A world built together.**

A cooperative browser game for autistic adults and invited adult friends, built for Hack the Change 2026. Teams practise everyday conversations, share energy and retrieve components to restore a persistent shared world.

## Playable now

- Create a named team and invite friends using a code. Two to four members join an expedition; up to twelve can belong to a team.
- **Restore the Greenhouse:** choose responsibilities, play private branching conversations, voluntarily share energy or hand off an uncollected task, preview robot routes, then execute together.
- A shared key opens a gate on the next round. Personal batteries, a six-energy cap, one-item carrying capacity and a wall rollback make routes worth planning.
- Deliver every required component and bring every robot home within eight rounds to permanently restore the greenhouse. Successful completion and restoration are saved together.
- Eight adult scenarios, each with two scored decisions, multiple accepted responses, fictional replies, guided repairs and explanations. Pass earns one energy. No live AI grades players.
- Individual **Practice** includes all eight conversations and a movement sandbox.
- No countdown or music. Optional sound, larger conversation text, reduced motion and quiet messages. Keyboard and touch controls; responsive phone layout.

**Race and the other three regions are explicitly marked planned.** This first build includes one complete team mission. It is research-informed practice, not a validated therapy or evidence of real-world communication improvement.

## Team documents

- [Full team specification](docs/team-spec.md)
- [Eight adult dialogue scripts](docs/adult-dialogues.md)
- [Scenario data](content/adult-scenarios.json)
- [Current implementation and limits](docs/implementation.md)
- [AI assistance disclosure](docs/AI-USE.md)

## Run locally

Requires Node **22.13+** and npm. Clone the repository, then:

```sh
npm ci
npm run build
```

On a **fresh local database**, apply the initial migration once:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_spicy_wind_dancer.sql
```

Then start the development server:

```sh
npm run dev
```

Open its printed URL. For a two-player test on one laptop, use `http://127.0.0.1:5173` for the host and `http://localhost:5173` for a teammate. They have separate browser storage but use the same local database. Alternatively, use separate browser profiles. Two tabs at the same origin share one membership.

Create a team, share its code, join from the second identity, then have the host select both members and open the briefing. Claim different components and click ready on both screens.

A phone cannot access the laptop's loopback URL; a shared, accessible deployment is required for a real two-device demo. The initial hosted preview is owner-private. GitHub collaborator access and hosting audience are separate settings.

Do not rerun the initial SQL against an existing database. For schema changes, edit `db/schema.ts`, run `npm run db:generate`, review the new SQL and apply only the new migration. Never rewrite an applied migration.

## Verify

```sh
npm run typecheck
npm test
npm run test:api  # requires the local dev server and migrated local DB; run npm test first
npm run build
```

The rule suite covers all 72 full dialogue paths, rewards, private answers, energy transfers, accepted task handoffs, pause/resume, gate timing, collisions, batteries, eight-round failure, and successful 2/3/4-player missions. The HTTP smoke test creates local QA teams and checks D1 persistence, independent identities, concurrent actions, stale versions, duplicate requests and completion. It refuses non-local URLs.

## Architecture

React + TypeScript on the supplied Vinext/Cloudflare Worker starter. D1 stores team state and hashed guest membership tokens. Clients poll every 1.5 seconds; mutations use server validation, version checks and request IDs. No WebSocket server, external AI service or API key is required.

- `shared/game.ts`: deterministic map, route preview and movement resolution.
- `lib/game-server.ts`: authoritative conversation, mission and reward transitions.
- `app/api/game/route.ts`: guest identity, D1 persistence and optimistic concurrency.
- `app/api/scenarios/route.ts`: independent practice API.
- `app/page.tsx`: world, mission, practice and comfort controls.
- `components/`: SVG world/robot art and maze renderer.
- `content/`: the eight authored adult conversations.

Game-specific source was authored during the event. The supplied framework and dependencies retain their original licenses. Disclose actual AI assistance in the submission, and review the content and code as a team.
