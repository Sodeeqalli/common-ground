# Common Ground

**Different minds. A world built together.**

A cooperative browser game for autistic adults and invited adult friends, built for Hack the Change 2026. Teams coordinate routes, share responsibilities and retrieve components to restore a persistent shared world.

## Playable now

- Create a named team and invite friends using a code, or opt into Discover teams so others can find and join it. Two members play each mission; up to six belong to the team and share one world. Any member can choose a partner.
- **Restore the Greenhouse:** choose responsibilities, plan with strategy signals, ping the map, share energy, then execute routes together.
- Pressure plate A automatically opens gate A while occupied. Leaving closes it; no charges, activation button or holding cost. Matching A badges and a connecting wire show the relationship. The pump is behind the gate with no lower bypass. Start with 3 energy; gain 3 per new round, capped at 6.
- Deliver every required component and bring every robot home within eight rounds to permanently restore the greenhouse. Successful completion and restoration are saved together.
- Persistent energy requests have Give / Not now / Cancel controls. Seven preset signals support explicit acknowledgements. Each player has one signal and one map ping per round; replacements are throttled. Free chat is optional in Settings and off by default.
- **Our world** is a quiet four-part picture. Saved mission completions colour their area; unfinished areas stay as a pale sketch. No reveal animation.
- No countdown or music. Optional sound, larger text, reduced motion and quiet announcements. Keyboard and touch controls; responsive phone layout.

**Our world, Team missions and Discover teams are exposed.** Greenhouse and Power station are playable; Bridge and Workshop remain locked. Power station has two independent plate/gate pairs and a twelve-round limit, requiring partners to take turns supporting one another. Each mission restores its own world region and records both contributors. It is research-informed practice, not a validated therapy or evidence of real-world communication improvement.

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

Create a team, share its code, join from the second identity, then have either player choose the other as their partner and open the briefing. Claim different components and click ready on both screens. Agree who will hold plate A while the other player retrieves the pump and returns through gate A. The holder queues no moves; once the carrier is clear, both can head home.

Existing teams can start a new expedition after the rules upgrade. Previous restored regions remain saved. Historical chat remains available to players who opt in. The signals update preserves existing pressure-plate missions.

A phone cannot access the laptop's loopback URL; a shared, accessible deployment is required for a real two-device demo. The initial hosted preview is owner-private. GitHub collaborator access and hosting audience are separate settings.

Do not rerun the initial SQL against an existing database. For schema changes, edit `db/schema.ts`, run `npm run db:generate`, review the new SQL and apply only the new migration. Never rewrite an applied migration.

## Verify

```sh
npm run typecheck
npm test
npm run test:api  # requires the local dev server and migrated local DB; run npm test first
npm run build
```

The rule suite covers all 72 archived dialogue paths, durable requests, signal/ping validation and round expiry, retired task-transfer rejection, per-step plate arrivals/departures/handoffs, energy, collisions, pause/resume, old-state upgrades, real failure, and eight-round greenhouse wins (including legacy 3/4-player saves), an eleven-round Power win, independent A/B gates, discovery controls and the twelve-round deadline. The HTTP smoke test creates local QA teams and checks D1 persistence, independent identities, concurrent actions, stale versions, duplicate requests and completion. It refuses non-local URLs.

## Architecture

React + TypeScript on the supplied Vinext/Cloudflare Worker starter. D1 stores team state and hashed guest membership tokens. Clients poll every 1.5 seconds; mutations use server validation, version checks and request IDs. No WebSocket server, external AI service or API key is required.

- `shared/game.ts`: deterministic map, route preview and movement resolution.
- `lib/game-server.ts`: authoritative mission, signal, ping and request transitions.
- `app/api/game/route.ts`: guest identity, D1 persistence and optimistic concurrency.
- `app/page.tsx`: world, mission and comfort controls.
- `components/`: mission controls, team channel, interactive maze and SVG art.
- `content/`: the eight authored adult conversations.

Game-specific source was authored during the event. The supplied framework and dependencies retain their original licenses. Disclose actual AI assistance in the submission, and review the content and code as a team.
