# Common Ground — Team Concept and Hackathon Build Spec

**Working title:** Common Ground  
**Event:** Hack the Change 2026  
**Version:** 2 — November 7, 2026  
**Audience:** Autistic adults, with invited adult friends welcome.  
**Platform:** Browser game for laptops and phones.  
**Primary mode:** Team Missions — cooperative robot expeditions that restore a persistent shared world.  
**Secondary modes:** Race and Practice.  
**Content scope:** One adult pack, eight fully authored branching scenarios.  
**Status:** Concept and dialogue are authored. The playable browser game, mission maps and persistence system have not yet been implemented.  
**Primary prompt fit:** Community connection, inclusion and well-being.

> Build a place together, one mission at a time. Practise everyday conversations, plan robot routes, share responsibilities and return to a world that remembers what your team has accomplished.

This version supersedes the earlier race-first, multi-age specification. Build against this document. The eight adult conversations already exist in the larger dialogue bank; the other content is outside the current build scope.

## 1. Product concept

Common Ground is a calm multiplayer browser game for autistic adults who enjoy structured play. A persistent team gradually restores an illustrated robot community hub, assembled like a large puzzle. Each successful mission repairs one section of that place.

During a mission, two to four players control their own robots in a visible maze. They divide retrieval responsibilities, collect components, navigate keys and gates, share energy and return to base. Between movement phases, each player privately completes a short branching everyday conversation.

The communication activities provide structured practice and movement energy. The maze provides planning and resource decisions. Persistent team missions provide a shared objective and a visible record of time spent together.

### The two intended benefits

1. **Communication practice:** Clarify expectations, express needs, set boundaries and repair misunderstandings through actual dialogue choices and replies.
2. **Connection through shared play:** Give people a predictable activity they can return to with others, where asking for help and offering help serve a common purpose.

These are design intentions. Related research provides a rationale; this prototype has not established improvements in everyday communication, friendship or belonging.

### Decisions to preserve

- Adults only for the hackathon; no age-pack selector in the shipped interface.
- Eight existing adult scenarios, not a new content-writing expansion.
- Team Missions is the main experience, not a stretch feature.
- A persistent team owns its world progress. A room hosts a particular play session.
- Each mission has its own authored map and objectives. Do not present the same layout with a new title as a distinct mission.
- Players choose and can revise responsibilities; these are not permanent character classes.
- Everyone controls their own robot. Cooperation does not require voice or fast typing.
- Race and Practice reuse the core systems but have separate success conditions.
- No hardware robots, VR, live AI judging or generated dialogue is required.

## 2. What gives the game a reason to return

The shared world is an illustrated hub with missing or inactive sections. Completed sections remain repaired between sessions. Players can see the team's completed projects and choose from available future projects.

| World section | Mission purpose | Proposed planning difference | Hackathon status |
|---|---|---|---|
| Greenhouse | Recover equipment and restore the garden. | Split retrieval routes; open a shared shortcut; help everyone return. | Build this complete mission first. |
| Power station | Restore lights and machines. | Different layout with a long open route and a key-controlled return route. | First additional mission candidate. |
| Bridge | Reconnect another part of the hub. | Distinct retrieval areas and a shared central return corridor. | Future mission concept. |
| Workshop | Restore a place to display robot customisation. | Different component distribution and resource detours. | Future mission concept. |

The hub can start as a single SVG or illustrated grid with four regions. It does not require a city-building simulation, economy or free-placement editor.

On greenhouse completion, its region changes from a damaged outline to a planted, functioning garden. Show a short optional animation and a clear completion message. The restored region remains visible after refresh, reconnect and later visits.

Cosmetic world changes may be unlocked. Accessibility settings, readable interfaces and essential communication controls must always be available.

### Honest replay scope

The hackathon ships one complete mission and eight conversations. A replay of that mission can be fun with different routes or teammates, but it does not provide unlimited fresh content. The same adult conversations are reused in other modes and future prototype missions, labelled as practice replay when appropriate.

Long-term return would require additional maps, objectives and conversations. The second playable mission is the first stretch goal because it demonstrates continuation better than a large list of locked concepts. Unimplemented regions must say “Planned,” not appear playable.

## 3. Audience and modes

The initial audience is autistic adults interested in calm puzzles, strategy or structured social play. Invited non-autistic adults can join. No diagnosis is required or collected. Do not claim that all autistic adults share a gaming preference or communication need.

| Mode | Player purpose | Players | Success and progression |
|---|---|---:|---|
| **Team Missions** | Build a shared place through cooperative objectives. | 2–4 | Deliver all required components and get everyone home within eight rounds. First completion restores a world section. |
| **Race** | Enjoy a standalone competitive maze. | 2–4 | Reach the finish first under the race rules. Does not restore mission sections. |
| **Practice** | Explore conversations or learn movement without affecting others. | 1 | Self-paced completion or experimentation; no ranking or team-world reward. |

Home navigation should prioritise **Our World / Team Missions**, with Race and Practice beside it. Keep the underlying scenario schema pack-aware for possible future adult context packs; ship only the adult pack now.

## 4. Persistent team, temporary session

### Team identity

A team has:

- A persistent ID and chosen name.
- An invite code for joining the team.
- Member identities associated with chosen aliases and robots.
- A host/owner who can manage invitations and start sessions.
- Completed mission IDs, restored world sections and completion dates.
- A selected next project and, where relevant, an active mission attempt.

An invitation joins a team; it does not impersonate an existing member. Use server-issued member credentials and validate membership on every team mutation. Store a returning guest's credential locally on their browser for the prototype. Signing in is not required for this first build. Losing that credential requires joining as a new member or a later recovery flow; do not promise cross-device identity recovery unless implemented.

### Sessions and attendance

A room/session belongs to the persistent team and contains the players participating today. The team's membership can be larger than the current mission roster.

- Two to four available members can start a mission. The exact same people need not attend every session.
- Fix the active roster and map variant when an attempt starts. No mid-round joining, hidden rescaling or automatic bot replacement.
- Additional members can join the next attempt.
- One active Team Mission attempt per team in the MVP prevents conflicting world updates.
- A host proposes the available mission; the participating players explicitly ready up before it starts.
- A disconnected player keeps their place and state. Pause advancement while they reconnect.
- If the group cannot continue, the host can end the attempt through an explicit team-visible retreat action. Restart with the available players and a new assignment plan.
- A retreat ends that attempt, not the team or previously restored world sections. It grants no completion reward.

### Progress shown to members

Show “Greenhouse restored,” the next project and current objective status. Do not show a leaderboard of social ability, wrong answers, “weakest teammate” or individual responsibility for an unsuccessful attempt.

## 5. First playable mission: Restore the Greenhouse

### Briefing

> The team's greenhouse needs replacement equipment. Recover the marked components and deliver them to base. Get every robot back within eight rounds to restore the garden.

Everyone sees the whole map before beginning. The briefing lists all components, their locations, the base, relevant gates and the round limit. No hidden objectives or surprise rule changes.

### Component count by roster

Use reviewed map variants for two, three and four players. Each variant has one initial retrieval responsibility per player, with route lengths checked for that roster.

| Players | Required components |
|---:|---|
| 2 | Water pump and control module. |
| 3 | Water pump, control module and seed container. |
| 4 | Water pump, control module, seed container and moisture sensor. |

The narrative describes the other equipment as already available in smaller variants. Completion always grants the same greenhouse section once. More players should not mean easier reward farming or an extra world reward.

### Responsibilities

Players claim a component before starting. The lobby cannot launch until every component has exactly one owner and every player has an initial job. Examples for a three-player team:

| Assignment | Planning responsibility |
|---|---|
| Water pump | Reach the component through the shared key-controlled route. |
| Seed container | Plan the longer collection-and-return journey. |
| Control module | Complete the shorter route, then decide how to help with energy. |

Responsibilities communicate who is handling what; they do not create different dialogue scores or robot powers.

Uncollected objectives can be reassigned between rounds if the current owner and recipient confirm. Show the new assignment to everyone. A player may take another uncollected objective after finishing their first. A carried component cannot be handed off in this MVP; implement physical cargo handoffs only later if needed.

### Collection and delivery

- A component is a single team objective, not a personal duplicate.
- Only its current assigned owner can collect it. Other robots may pass through its tile.
- Entering its tile collects it automatically if the robot has an empty cargo slot.
- A robot can carry one component at a time. Cargo adds no extra movement cost.
- Entering base delivers carried cargo automatically and marks that component delivered.
- Delivery does not complete the mission by itself. All required components must be delivered and all active robots must be at base at the end of a movement phase.
- Reaching base does not permanently remove a robot from play. It can stay to support, or leave again if the team needs help.

A player who has delivered their component remains useful: they can complete subsequent conversation rounds, donate energy and take over an uncollected objective by agreement. Nobody is assigned a permanent support-only role.

### Eight-round limit

A successful mission can finish before round eight. The eight-scenario pack makes a full eight-round attempt available without repetition; it does not force every mission to use all eight conversations.

After round eight, if the success condition is unmet, show the team's recovered/delivered components and remaining route distances, then offer retry or return to the world. Use neutral wording such as “The expedition ended before everything was home.”

Delivered components within an unsuccessful attempt are attempt-local. A retry resets its components, energy, keys and positions; permanent world sections from previous successful missions remain intact. State this in the briefing so players know what is saved.

## 6. The round loop

```text
Private conversation practice
  choose a line → receive a reply → clarify/repair → respond again
                              ↓
Private explanation and 1–3 energy reward
                              ↓
Team coordination and optional energy transfer
                              ↓
Queue, preview and confirm each robot's moves
                              ↓
Server executes movement, pickups and deliveries
                              ↓
Check mission objective → save state → next round or restored world
```

### Phase rules

1. **Conversation:** Everyone starts with the same scheduled scenario and follows their own branch privately. No answer or decision timer.
2. **Feedback:** Explain the response and new information. Store reward issuance so reconnecting cannot award it again.
3. **Coordination:** Players can request/offer energy and inspect responsibilities. Confirm transfers before movement planning begins.
4. **Planning:** Queue moves within current energy, preview outcomes and press Ready. An empty queue is permitted.
5. **Execution:** Resolve all queues on the server. Do not let network arrival order determine pickup or finish advantages.
6. **Round end:** Apply battery rewards, check mission success and save a coherent snapshot. Offer a break before continuing.
7. **Mission end:** Commit success and world restoration together, or record retreat/round-limit result without granting the section.

Essential state changes remain visible in quiet mode. Optional messages can be hidden. Joining a group does not obligate a player to speak, explain their answers or disclose personal experiences.

## 7. Communication practice and energy scoring

Every scenario includes a situation, explicit goal, relevant constraints, two scored dialogue decisions, fictional replies, optional guided repairs and a short explanation.

| Component | Energy |
|---|---:|
| Finish the activity, or select Pass | +1 |
| First scored choice meets the stated communication objective | +1 |
| Second scored choice uses the new information and respects the stated constraints | +1 |

The maximum is three. Two accepted responses per decision receive equal credit in the authored bank. A direct refusal or boundary can receive the same credit as a cooperative alternative when both meet the fictional objective.

### Important rules

- Score the stated goal, not personality, empathy, eye contact, verbal fluency or conformity to an expected social style.
- The available context must support the explanation. Do not invent a probability that an interpretation is correct.
- Other people's reactions are fictional possibilities. A favourable reply does not make an unrealistic promise a good decision.
- A zero-credit choice receives feedback and an optional repair line. Repair adds no bonus and does not restore the missed credit.
- Selecting a supplied repair is guided practice, not evidence that a player independently generated a communication skill.
- Pass remains available throughout. Passing grants one energy total and discards any partial bonuses for that round.
- Award energy once, after completion or pass. Duplicate clicks, refreshes and reconnects cannot farm rewards.
- Individual choices and feedback remain private. Energy totals are visible for planning, so do not promise that teammates can infer nothing about performance; they simply do not receive the player's answers or a skill ranking.
- No bonus for answering quickly, sending messages or disclosing personal information.

### Example using AE-01

**Situation:** Maya asks for presentation slides “soon.” You can finish by six, not earlier.

**Decision one:** “What time do you need them? I can finish by six.” earns one bonus because it establishes the deadline and communicates capacity. A second accepted line checks whether six works for assembling the presentation.

Maya reveals that she needs a rough version by four and final edits by six. You can provide an outline by four, but not the full draft.

**Decision two:** “I can send an outline by four and finished slides by six. Would that work?” earns the second bonus. Promising the full draft by four does not, even if Maya responds positively.

A player completing both accepted choices earns three energy. A player who repairs one choice and makes one accepted choice earns two. Completing with two repairs, or passing, earns one.

Use the companion JSON for the exact dialogue and replies rather than maintaining a second answer key in UI code.

## 8. The eight adult scenarios we ship

The content already exists. Do not write additional packs before building the game.

| ID | Authored title | Situation | Skill pair |
|---|---|---|---|
| AE-01 | What does soon mean? | An unclear presentation deadline. | Clarifying expectations. |
| AE-02 | Before the guests arrive | A household task with an unspecified scope and deadline. | Clarifying expectations. |
| AE-03 | Interested, with a condition | An invitation where the setting affects participation. | Expressing needs. |
| AE-04 | Making a meeting usable | Requesting written actions and the correct document reference. | Expressing needs. |
| AE-05 | No room for another task | A work request that exceeds available capacity. | Setting boundaries. |
| AE-06 | Ending a visit | Ending a visit without promising another. | Setting boundaries. |
| AE-07 | Drafting versus sending | A misunderstood volunteer-task handoff. | Repairing misunderstandings. |
| AE-08 | A one-time favour | An occasional offer mistaken for a recurring commitment. | Repairing misunderstandings. |

Use the ordered playlist:

`AE-01 → AE-03 → AE-05 → AE-07 → AE-02 → AE-04 → AE-06 → AE-08`

It separates paired examples while providing eight unique situations per full attempt. These are practice variations, not a validated transfer assessment.

### Content handoff

- [Full dialogue document](./adult-dialogues.md): human-readable branches, replies, explanations and repairs.
- [Dialogue JSON](../content/adult-scenarios.json): implementation-ready node graphs and stable IDs.
- The repository contains only the eight adult conversations selected for this build.

**The build allowlist is exactly AE-01 through AE-08.** The repository content asset contains only those eight adult scenarios.

The shipped subset contains 16 scored decisions, 48 scored choices/replies and 16 guided repair paths. All dialogue is authored fiction, not a validated assessment or a prediction of how a real person will respond.

## 9. Energy sharing and team coordination

### Transfer rule

- During coordination, each player may send at most one energy to one teammate per round.
- Giving removes one from the sender and adds one to the recipient. It never creates energy.
- A sender must have at least one energy. The recipient must have room below the six-energy cap.
- Multiple teammates can send to the same player if capacity permits. A player's outgoing limit remains one.
- Apply each confirmed transfer atomically and once. Reject a now-invalid transfer with an explanation, without changing either balance.
- Show pending coordination before the group moves to planning. Once planning begins, freeze transfers until the next round so queued paths do not lose their budget.
- Requests are optional and do not automatically transfer anything. A player may decline or remain quiet without a score penalty.
- Donation is available across the map; it is an explicit game mechanic and does not require adjacent robots.

### Example

After the conversation in round six:

| Player | Mission status | Energy |
|---|---|---:|
| Alex | Carrying the last component, four moves from base. | 1 |
| Sam | Already delivered their component, two moves from base after collecting a battery. | 3 |

Sam gives Alex one energy. Both now have two. Alex moves two tiles toward base; Sam returns home. In round seven, Sam can donate again while remaining at base. If Alex earns at least one energy, that donation supplies the two moves needed to deliver the last component and return everyone home.

### Communication controls

Use buttons and visible assignments rather than compulsory chat:

- “I'll take this component.”
- “Can we swap this task?”
- “Could I have one energy?”
- “I can share one.”
- “I need a moment.”
- “Ready.”

Assignment changes and transfers require explicit actions; a preset message alone cannot mutate the game state. Rate-limit messages so the interface remains calm.

## 10. Maze rules

### Shared baseline

- Small, readable top-down grid; choose dimensions after checking both phone and laptop layouts.
- All walls, objectives, keys, gates, batteries and base/finish locations are visible.
- One energy per executed move: up, down, left or right; no diagonals.
- Robots may share tiles and pass through each other. No pushing, blocking or stealing.
- Start each attempt with zero energy. The first conversation supplies movement energy.
- Unspent energy carries forward to a maximum of six.
- Queue length cannot exceed available energy; queuing itself does not spend energy.
- Cancelled unexecuted commands do not consume energy.
- Each battery gives one energy at the end of execution, capped at six. It cannot extend the current movement queue.
- Batteries are personal pickups: each robot can use a given battery once per attempt. Display each player's collected state. Mission components are team-unique and use different rules.
- Show any energy overflow before a reward is applied; excess over six is discarded.

### Keys differ explicitly by mode

**Team Missions:** A collected key unlocks matching gates for the whole team. This makes a route-opening responsibility useful to others. To keep previews deterministic, keys collected this round unlock gates at the round boundary, for movement from the next round onward. Show “Opens next round” in the preview.

**Race:** Keys are personal. A robot can use a key later in its own queued route during the same execution. Show this race rule in its briefing. Use an explicit mode policy in the engine rather than separate inconsistent movement implementations.

### Wall or locked-gate collision

Retain the agreed, fully previewed penalty:

1. The attempted command costs one energy.
2. The robot returns to its previous successfully occupied tile; at its initial position it stays put.
3. Cancel its remaining commands without charging for them.
4. Previously collected keys, batteries and components remain collected. Delivered cargo remains delivered.

Maintain a position history. Collision rollback is not a fresh tile entry and must not trigger collection or delivery. The preview shows the rollback, energy cost and cancelled commands before commitment. No surprising invisible-wall punishment.

### Mission route design

Different jobs need different planning, not identical corridors with different object names. Include a shared key route, a longer retrieval route and an optional resource detour. Check the full journey: collecting an object is insufficient if the robot cannot reasonably return.

Target success with thoughtful planning at roughly two energy per player per round, not only perfect answers. Verify the first map with concrete simulated plans for each roster size. An all-pass team need not be guaranteed a win under the current rules, but should retain meaningful movement and useful choices. These are balancing targets until tested, not proven properties of an unbuilt map.

## 11. Race and Practice on the side

### Race

Race reuses private conversations, energy awards, movement planning and the maze engine. It has no mission cargo or persistent restoration rewards.

- Everyone starts on the same tile and races toward a visible finish.
- Keys and batteries are personal. No energy donations in Race.
- The earliest round with any finisher ends the race after all players' queues resolve.
- Stop a finishing robot's remaining commands at the finish tile.
- Same-round finishers share first place; animation speed or network latency never decides the winner.
- After eight rounds with no finisher, rank by minimum remaining legal moves to the goal, including the player's key state. Equal distances share a place.
- Race results are session results, not communication ability scores. They do not unlock team mission sections.

Ship one intentionally designed race layout after the main mission works. Reuse tiles, renderer and rules; do not assume the retrieval map automatically makes a good race.

### Practice

Offer two tabs:

1. **Conversation practice:** Choose any of the eight adult scenarios, explore branches, see explanations and replay freely. No leaderboard or transferable mission energy.
2. **Movement sandbox:** Learn queueing, preview, walls, keys and batteries without a mission deadline. Provide a reset button and clearly labelled practice energy controls.

Practice does not alter the team's world, mission inventory or completion record. A player can practise alone before joining a group. Saved reusable phrases are an optional local-only enhancement.

## 12. Persistent progress and reliability

Persistence is part of the core build, not an animation that resets when the page reloads.

### What must persist on the server

| Entity | Persisted state |
|---|---|
| Team | ID, name, owner, membership and invite configuration. |
| World | Restored sections, completed mission IDs/versions, completion timestamps, next available project. |
| Attempt | Mission/map version, roster, assignments, phase, round, scenario order and status. |
| Robot | Position history, energy, cargo, collected personal batteries and ready/queue state. |
| Team mission state | Shared keys, collected/delivered components and confirmed transfers. |
| Active conversation | Current node, awarded credits and reward-issued status, sufficient for reconnect. |

Audio/motion/text preferences can remain local to the browser. Do not retain private answer histories indefinitely after an attempt; long-term progression only needs mission results. Keep private per-player state out of shared room broadcasts.

### Completing a mission

In one database transaction:

1. Verify the server-owned success condition for the current attempt.
2. Mark the attempt completed.
3. Grant the world's section if this team has not already earned it.
4. Record the completion and unlock the next actually implemented project, if any.
5. Persist the new state before broadcasting the updated world.

Use a unique team/mission reward record and idempotent request handling. Replaying the same mission, duplicate messages or reconnects must not grant duplicate sections. Mission content updates should not silently re-award the same region.

### Recovery

Use durable database storage, not only browser localStorage or a server process's memory. A small database such as SQLite on a persistent volume is sufficient for a single-server prototype; use the team's existing hosted database if that is easier. Hosting must actually preserve the storage.

Commit accepted actions and coherent phase transitions so the room can reload after reconnect. A server restart must preserve the team and restored world, and should restore the last committed active-attempt state. Never claim an unsaved success. If an attempt cannot be safely resumed, explain that it needs restarting while retaining previously committed world progress.

## 13. Accessibility and calm social play

| Feature | Behaviour |
|---|---|
| Sound | Separate music/effects controls, off by default. |
| Motion | Fixed camera; reduced-motion option; no screen shake or flashing celebration. |
| Readability | Clear contrast, adjustable text and short dialogue chunks. |
| Colour | Labels and symbols accompany robot, objective, key and status colours. |
| Input | Keyboard and large touch controls; no drag-only interaction. |
| Predictability | Rules and phase indicators remain available; preview consequences before committing. |
| Time | Eight rounds are a mission limit, not a real-time countdown. Decisions are untimed. |
| Communication | Optional preset messages and explicit request/offer controls; no required voice. |
| Quiet mode | Hide optional chatter while retaining essential mission and readiness notices. |
| Breaks | Anyone can request a pause at the next round boundary. Resume when all active players confirm. |
| Personalisation | Names/aliases, robot shape and colour; cosmetic choices do not affect scores. |
| Ending | Clear results and opt-in retry; no automatic endless queue or daily streak penalty. |

Private invited groups are the hackathon model. Do not collect diagnoses or require personal experiences to be shared. Adult friends can participate without being scored as the “correct” communication model.

## 14. Research basis and claims

### Adult communication-practice evidence

A randomized study of 26 autistic adults found greater improvement on live standardized interview role-plays following simulated job interviews plus instruction. A six-month follow-up with 23 participants found higher odds of competitive employment or volunteering among trainees. These are promising but small, task-specific studies; they do not demonstrate that a robot maze improves everyday relationships. [Trial](https://pubmed.ncbi.nlm.nih.gov/24803366/), [follow-up](https://pubmed.ncbi.nlm.nih.gov/25986176/)

A broader 2025 review included 20 studies and 349 participants, with a positive pooled effect in the five studies included in its meta-analysis. Nineteen studies focused on children/adolescents and only one on adults. Use it as background, not as adult-specific proof. [Review](https://pubmed.ncbi.nlm.nih.gov/40043470/)

### Adult play and design evidence

| Research | What it supports considering | Boundary |
|---|---|---|
| Board-game research: 1,603 hobbyists surveyed, 13 autistic-player interviews and group sessions with 28 autistic participants. | Systematic play and games as a structure for social interaction. | Selected samples; not a universal autistic preference or proof of our game's benefits. [Cross et al.](https://link.springer.com/article/10.1007/s10803-024-06408-0) |
| Online discussion analysis and a survey of 145 autistic adults. | Control, sensory choices and flexible social participation. | Exact controls and co-op mechanics are our design choices. [Park et al.](https://doi.org/10.1145/3803421) |
| Interviews with 22 autistic adults about play. | Solo, social and parallel-play options. | Small qualitative study; preferences vary. [Pritchard-Rowe et al.](https://doi.org/10.1089/aut.2023.0008) |

### Our design inferences

Persistent teams and shared-world missions are proposed ways to create reasons to return and cooperate. We have not shown that persistence, component delivery or energy sharing improves belonging. The maze serves strategy and shared play; the conversations provide explicit communication practice. Do not claim that navigating walls itself teaches social understanding.

The authored choices are justified by their visible fictional goals and constraints. Research does not certify those answer keys. Circa is not required: it is an NLP dataset, not an adult autism curriculum. [Dataset context](https://github.com/google-research-datasets/circa)

**Approved research wording:** “Common Ground draws on research into autistic adults' gaming preferences and evidence from related simulated communication practice. We are applying those ideas to cooperative play; this prototype has not yet been evaluated for real-world communication or belonging outcomes.”

## 15. Technical architecture

Use the team's familiar browser stack. A practical proposal is shared TypeScript rules, a component-based client, a server with WebSockets and a durable database. This is a suggested implementation, not a required vendor or framework choice.

### Core systems

1. **Conversation engine:** Authored branching nodes, deterministic criteria, private feedback and exactly-once rewards.
2. **Mission engine:** Assignments, cargo, deliveries, shared gates, energy transfers and success conditions.
3. **Multiplayer engine:** Server-owned state, validated actions, synchronised phases and reconnect.
4. **World progression:** Persistent teams and atomic, idempotent section restoration.
5. **Maze rules and validation:** Accurate previews, route legality and roster-aware mission feasibility checks.

### Suggested modules

```text
client/
  team-world, mission-briefing, assignments, dialogue, coordination
  maze, movement-queue, feedback, race, practice, settings
server/
  teams, membership, sessions, actions, phases, persistence, rewards
shared/
  movement, mode-policies, mission-rules, path-search, types
content/
  adult-scenarios, mission-maps, race-map, world-sections, sources
```

### Data contracts

| Entity | Essential fields |
|---|---|
| Team | id, name, ownerId, memberIds, invite configuration, version. |
| Member | id, teamId, alias, robotStyle, credential reference. |
| WorldSection | id, teamId, sourceMissionId, restoredAt, visualState. |
| MissionDefinition | id, version, worldRewardId, prerequisite IDs, roster map variants, objectives, maxRounds. |
| Attempt | id, teamId, missionId/version, roster, mapVariant, status, phase, round, playlist, revision. |
| Objective | id, component type, tile, ownerId, status, carrierId, deliveredAtRound. |
| Robot | playerId, positionHistory, energy, cargoId, collectedBatteryIds, queuedMoves, ready. |
| Team resources | sharedKeys, pendingGateUnlocks, per-round transfer records. |
| Conversation state | playerId, scenarioId/version, nodeId, decisionCredits, completed/pass state, rewardIssued. |
| Action | requestId, authenticated memberId, attemptId, expectedRevision, type, payload. |

Validate action ownership, phase, current revision and legal state transitions. Reject client-supplied scores. Use unique request IDs to avoid duplicated transfers, pickups, deliveries or rewards. Shared broadcasts must exclude private answers and credentials.

### Map validation is more than finding one path

A key-aware path search can check reachability, but a mission also needs the whole team to collect and deliver all cargo within its energy/round rules. Validate:

- Base-to-component-to-base routes for every assigned job.
- Shared gate timing, including the next-round unlock rule.
- Two-, three- and four-player map variants.
- Cargo capacity, reassignment limits and legal transfers.
- A plausible complete team plan under the intended energy budget.
- Correct collision preview, battery pickup and delivery state.

Do not claim that ordinary shortest-path search proves cooperative balance. Save concrete playthrough fixtures for the actual mission rules, then try them with two real browser clients.

## 16. Hackathon deliverables and build order

### Committed scope

| Priority | Deliverable | Acceptance outcome |
|---|---|---|
| P0 | One complete gameplay slice | One adult conversation awards energy; a robot previews moves, collects cargo and delivers it. |
| P0 | Persistent team and shared-world screen | Two browsers join one team; restored state survives reload and restart. |
| P0 | Greenhouse Team Mission | Distinct responsibilities, component retrieval, shared keys, transfers and team completion work together. |
| P0 | Eight adult scenarios | Exact AE-01–AE-08 allowlist works for an eight-round attempt, with private feedback and repair paths. |
| P0 | Complete two-player multiplayer mission | Devices remain synchronised through success or the round limit. |
| P1 | Three/four-player mission variants | Every participant gets an initial job; the variants have checked full-team routes. |
| P1 | Practice | Individual conversation exploration and movement sandbox; no team-world mutations. |
| P1 | Race | Standalone finish-line mode with correct key/tie rules and no mission rewards. |
| P1 | Comfort and coordination | Audio/motion settings, keyboard/touch controls, presets, breaks and clear objective states. |
| P1 | Submission package | Working demo, README, research rationale and an accurate account of implemented features. |

P0 establishes the main experience; P1 completes the agreed side modes and support. Do not spend the early build on a campaign editor, a huge map catalogue or new dialogue. If deadline pressure forces a cut, report it explicitly rather than leaving a nonfunctional button presented as a feature. Preserve Team Missions, persistent world progress and the eight-scenario adult scope.

### Stretch, after the committed experience works

- Second playable mission with its own map, unlocked through greenhouse completion.
- Optional decorative choices for restored sections.
- Private locally saved phrases.
- Read-aloud controls.
- Further adult context packs, additional maps and richer mission mechanics.

### Outside this build

Multi-age rollout, public matchmaking, global leaderboards, open chat, voice chat, diagnostic collection, live AI assessment, generated scenarios, complex inventory crafting, a free-placement city builder, cross-device account recovery and claims of therapeutic effectiveness.

### Integration sequence

1. Agree on mission entities, action contracts, mode policies and the adult scenario allowlist.
2. Build one complete conversation-to-cargo-delivery loop with one map.
3. Connect two devices and execute the same mission state on both.
4. Implement durable team state and the atomic restoration transaction.
5. Test reload, reconnect, duplicate actions and unsuccessful-attempt handling.
6. Integrate all eight adult scenarios and reviewed roster variants.
7. Add Practice and Race through the shared engines.
8. Finish comfort controls, demo and documentation.
9. Add the second mission only after the first can be completed and its progress reliably recovered.

## 17. Team responsibility split

Assign names at kickoff. Combine roles if the team is smaller.

| Owner | Main responsibility | First handoff |
|---|---|---|
| Gameplay owner | Movement, cargo, keys/gates, transfers, mission success and map checks. | A pure mission-state update and one traversable map. |
| Multiplayer/persistence owner | Teams, membership, rooms, actions, snapshots and world rewards. | Two clients share a team and see a saved world state. |
| UI/accessibility owner | World, briefing, assignment, dialogue, coordination and responsive maze screens. | The complete main flow with clear states and controls. |
| Content/demo owner | Integrate the eight adult scenarios, review explanations, research rationale and pitch. | A working AE-01 plus the exact eight-ID manifest. |

The first cross-team milestone is two people completing one conversation, sharing energy and delivering a component in the same mission. The second is both returning to a permanently changed world.

## 18. Acceptance checklist

### Adult content and scoring

- [ ] Only AE-01 through AE-08 ship in the content picker and playlist.
- [ ] Every scenario has two scored decisions, multiple accepted choices, replies and optional guided repairs.
- [ ] Choice order is stable on reconnect; IDs, not screen position, determine scoring.
- [ ] Exactly one completion reward is granted; Pass produces one total energy.
- [ ] Explanations follow the visible goal and available information.
- [ ] Private choices are not broadcast to teammates.
- [ ] The UI distinguishes practice replay from previously unseen content.

### Team missions

- [ ] Every component has one initial owner; every player has an initial responsibility.
- [ ] Only the assigned player can collect a component, and cargo capacity is enforced.
- [ ] Reassignment of uncollected objectives requires the agreed confirmations.
- [ ] Returning to base delivers cargo once; rollback does not trigger delivery.
- [ ] A returning player can still practise, share energy and leave again if needed.
- [ ] Shared gates unlock at the next round boundary, consistently with preview.
- [ ] Transfers conserve energy, respect the cap and outgoing limit, and cannot be duplicated.
- [ ] Success requires every component delivered and every active robot at base.
- [ ] The eight-round limit is checked after execution, including a valid round-eight success.
- [ ] Retry resets attempt resources but never deletes earlier world restoration.
- [ ] Each roster variant has a checked full-team plan, not just individually reachable objects.

### Persistent state and multiplayer

- [ ] A team persists independently of a game room.
- [ ] Member identity cannot be selected merely by guessing a player ID.
- [ ] Invited members see the same saved world on separate browsers.
- [ ] Refresh and reconnect restore the current accepted state without duplicating actions.
- [ ] A server restart preserves completed sections and restores the last committed active state or explains a necessary retry.
- [ ] Completion and world reward are committed atomically and once.
- [ ] Only one active Team Mission attempt can mutate a team's progression.
- [ ] Departures and host retreat have an explicit visible outcome.

### Race, Practice and comfort

- [ ] Race has its own finish and personal-key rules, with same-round ties handled fairly.
- [ ] Race and Practice cannot grant mission-world rewards.
- [ ] Practice allows independent dialogue exploration and movement learning.
- [ ] Keyboard and touch flows work without drag-only actions.
- [ ] Labels accompany colours; settings are independently controlled by each player.
- [ ] Quiet mode retains essential objective, transfer and phase information.
- [ ] Break and resume behaviour is predictable; decisions remain untimed.
- [ ] No public social-skill ranking or blame screen is shown.

### Demo accuracy

- [ ] The visible restored section corresponds to a real saved team completion.
- [ ] Only implemented missions appear playable; planned regions are labelled.
- [ ] Any shortened demo or preloaded near-completion state is explicitly labelled.
- [ ] README and pitch state the actual shipped scope and evidence boundaries.

Software checks establish functional consistency, not clinical efficacy or real-world transfer.

## 19. Judge demonstration and pitch

### Demonstration sequence

1. Open the same persistent team on two devices. Show its unfinished greenhouse.
2. Start the greenhouse mission; each player claims a different component and previews the map.
3. Play a short adult conversation. Show a clarification, a reply and a repair path without exposing either player's private answers to the other.
4. Use the resulting energy to choose routes. Demonstrate one voluntary energy transfer and a shared gate opening.
5. Collect and deliver the final components; return both robots to base.
6. The mission ends and the greenhouse visibly transforms into a planted garden.
7. Refresh or reopen the world on the second device. The restored section remains.
8. Briefly show Race and Practice as secondary options and explain the eight-scenario adult scope.

A full eight-round game may exceed presentation time because decisions are untimed. Use either a short predeclared demo mission variant or a clearly labelled checkpoint to show the completion flow. Do not secretly change energy or fabricate persistence. Rehearse a full normal mission separately.

### Pitch

> Common Ground is a cooperative browser game for autistic adults and their friends. Teams practise everyday conversations, share responsibilities and guide robots through missions that rebuild a persistent shared world. Each completed project gives the group something lasting to return to. Calm controls and optional communication let people participate in different ways, with race and solo practice available alongside the main team experience.

### Questions we should be ready to answer

- **Why return?** The team keeps its restored world and chooses new projects. One prototype mission demonstrates that structure; more varied missions and content are needed for sustained replay.
- **Why adults?** A focused audience gives us coherent situations and a manageable prototype. Adult needs are worthwhile without claiming coverage of every age group.
- **What is cooperative?** Dividing retrieval work, opening shared routes, transferring a limited resource and ensuring everyone returns with the required components.
- **Does everyone need to talk?** No. Visible assignments, previews and optional request/offer buttons support coordination.
- **What connects conversations and the maze?** Conversations provide structured practice and energy; the mission uses that energy for shared planning. We do not claim the maze itself teaches social interpretation.
- **What is the technical core?** Branching scenario state, authoritative multiplayer mission logic, route feasibility checks and durable, idempotent world progression.
- **What does research establish?** It supports the design rationale and some related training approaches. Our game's effect on communication and belonging is not yet measured.
- **What comes next?** Feedback from intended adult players, evaluation of comfort and enjoyment, and investigation of whether practice transfers beyond the game. This future work does not block the hackathon prototype.

## 20. Handoff summary

Build a browser game for autistic adults with **eight scenarios and Team Missions as its main mode**. A persistent team shares responsibilities in a robot maze, delivers components, returns together and permanently restores a section of its world. Ship one complete mission first, then the agreed Race and Practice side modes. Demonstrate a real saved change to the shared world, not just a victory message.
