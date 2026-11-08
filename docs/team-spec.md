# Common Ground — Team specification

Version 3 · 8 November 2026 · Browser game · Adults only

## Product and scope

A calm cooperative robot strategy game for autistic adults and invited adult friends. Teams restore a persistent shared world by completing missions together. Communication is useful to the mission: coordinate a relay, request energy, offer responsibility, mark a route and agree on timing.

There are no mandatory scenario questions, dialogue-score rewards or AI judgments in Team Missions. Eight original adult conversations remain in optional Practice. The mission is allowed to be difficult and teams can lose. No one needs to type, speak or use a prescribed sentence to receive movement energy.

The shipped world has one playable mission, Restore the Greenhouse. The power station, bridge and workshop are labelled Planned. Race is also planned. Practice conversations and a movement sandbox are playable.

## Teams and persistence

- A team has a name, invite code, members, latest expedition and permanently restored regions.
- Up to twelve members can belong to a team. The host selects two to four for an expedition, including themselves.
- Invited members outside the expedition can watch and chat. Mission actions belong to the selected roster.
- Guest identity is remembered in this browser. Clearing browser data or leaving membership loses that identity; rejoining creates another robot. Full account recovery is not built.
- Team progress, accepted actions, chat, requests and pings are server-backed. The local and hosted databases are separate.

## Greenhouse mission

Retrieve the assigned components, deliver them by entering base, and return every roster robot to base by the end of round eight. Delivery alone is not victory. Successful completion and world restoration are saved atomically. Retry or failure does not erase earlier restored regions.

| Players | Required components |
|---|---|
| 2 | Water pump, control module |
| 3 | Water pump, control module, seed container |
| 4 | Water pump, control module, seed container, moisture sensor |

Each player initially claims one component. During coordination they can offer an uncollected responsibility to someone else. The recipient must accept. This is a task handoff, not a cargo teleport: a robot still carries at most one item. After accepting multiple tasks, a player needs multiple deliveries.

All routes and the map remain visible. Robots can occupy the same tile. No hidden social-intention answer key is involved.

## Why actual teamwork is required

The relay is at column 6, row 8. The gate is at column 4, row 8. The pump is at column 3, row 6.

1. The team has exactly **two relay charges** for an attempt.
2. A robot must already be standing on the relay at the start of coordination to commit to powering it.
3. The operator needs at least one energy. When routes resolve, operating consumes one energy and one shared charge.
4. The operator must submit an empty route and remain on the relay for that entire round.
5. Power opens the gate and releases the pump interlock for that round only. It is available throughout resolution, independent of player ordering.
6. A **different robot** must reach the pump while powered, or already be waiting on the pump tile. Ownership still determines who collects it.
7. Arriving at the relay during movement does not power it immediately. Commit during the next coordination phase.
8. The gate closes for the next round unless someone commits another charge. A carried pump stays collected; returning it does not need continuous power.

The outer path remains available. A team can conserve a return-gate charge by taking the longer route. Wasting both charges before collection makes the pump unavailable for the rest of the attempt. The host may end a stranded attempt, or the team can reach the eight-round limit and retry.

## Energy and movement

- Each robot starts with three energy.
- Each new round adds three energy, capped at six. Readiness acknowledgements cannot repeat this reward.
- Each directional attempt costs one energy. Unspent energy carries over.
- During coordination a player can give one energy to one teammate once per round, respecting the six-energy cap. Transfers conserve energy.
- If an operator gives away their last energy, their relay commitment is cancelled and everyone must review readiness again.
- Each battery tile grants each robot one energy once per attempt, after movement. It cannot fund extra moves in that same submitted queue.
- A wall or closed-gate attempt costs one energy, rolls the robot back one previously traversed step, and cancels the remaining queue. Rollback does not collect items, recharge or deliver cargo.
- The preview uses the same planned relay state as execution. The operator cannot queue movement while committed.

## Round loop

**Briefing → Coordination → Route planning → Resolution/review → Next coordination**

Briefing happens once. Each player claims a responsibility; all ready to begin. Coordination lets players chat, ping, transfer energy, negotiate task handoffs and commit the relay. All ready before route planning. Changes to assignments, energy or relay commitments reset readiness.

Players then queue routes or choose to stay. Routes execute after everyone locks in. The server validates energy, roles, ownership and the relay commitment. Resolution shows a factual event log. No one is scored for message length, tone, friendliness or number of messages.

All players explicitly continue to the next round. Anyone can request a break at the next boundary; at a paused boundary everyone must resume before continuing. Round limits constrain strategy, not response speed: there is no real-time countdown.

## Communication tools

### Team chat

- Free text, one to 280 characters per message; the latest 60 messages are retained.
- Available in the world, during missions and during Practice for current team members.
- Sender and round are shown. Text is rendered literally, never as HTML.
- A fixed chat button indicates unread messages. There is no required script, voice channel or message score.
- Quiet mode disables chat announcements; it does not hide actionable requests.

### Map pings

Choose Meet here, Need help or My route, then select a walkable tile by touch, mouse or keyboard. Both map markers and a text feed identify the sender, kind and coordinates. Recent pings cover the current and preceding round; the server retains at most twelve. A ping communicates intent; it does not move or command a teammate’s robot.

### Actionable requests

An energy request stays in a visible team inbox across screen changes and refreshes. The sender can cancel. Teammates can Give 1 energy during coordination, or reply Not now. The request closes when fulfilled, cancelled or all other roster members decline. A normal transfer to that requester also resolves their request. Repeated clicks cannot apply the transfer twice. Requests do not expire because another chat message arrived.

Task offers appear in the same inbox with Accept and Decline/cancel. Only the recipient can accept. Pending task offers block readiness until resolved, because the team has not agreed on ownership.

Break requests also remain visible. Quiet mode retains these mission-critical controls. New attempts clear old requests and pings while retaining team chat and world progress.

## Optional adult Practice

AE-01 through AE-08 remain available individually, with their authored choices, replies, new information, repairs and explanations. They do not interrupt missions or change energy, resources or world restoration. The bank’s internal criterion credits are content metadata, not player ratings. No live model evaluates a response.

The movement sandbox has a permanently open gate and replenishes six practice energy after each sequence. It does not affect a team.

## Comfort and inclusion

Sound starts off; music is absent. Reduced motion, larger text, quiet chat announcements, untimed decisions, visible rules and route previews remain available. Communication can be short text, a ping or a structured request. There is no penalty for using supports, no forced voice and no requirement to disclose a diagnosis.

Autistic adults have different preferences. The game is intended for adults who want this style of play, not as a claim about what all autistic people enjoy. Invited non-autistic friends participate in the same reciprocal responsibilities.

## Technical and reliability requirements

React/TypeScript with the supplied Vinext/Cloudflare Worker starter. D1 stores team state and hashed guest tokens. The client polls every 1.5 seconds. Server-owned validation, optimistic versions and request identifiers protect mutations.

Chat and safe phase-local actions can revalidate after a competing write. Readiness only carries over if jobs, energy and relay commitments are unchanged. Shared decisions that no longer match the viewed state ask the player to review and retry. Successful restoration is part of the same state update as mission success.

Older active attempts are ended with an explicit upgrade notice because their quiz/key rules cannot safely resume under the relay rules. Team identity, chat and restored regions remain. No destructive schema migration is needed.

## Acceptance and demonstration

- Two browsers can exchange free text and see persistent energy requests, fulfilment confirmations, accepted/declined task offers and labelled map pings.
- Completing or skipping optional Practice never changes the mission’s state.
- A single robot cannot both operate the relay and collect the pump.
- The operator cannot move; gate preview and execution agree; charges cannot be duplicated.
- Coordinated 2/3/4-player teams can complete the required deliveries within eight rounds.
- Wasted charges or insufficient progress can cause failure. Retrying preserves the world.
- Reconnect restores accepted state; duplicate mutation IDs do not repeat transfers.
- A genuine full match and saved restoration are demonstrable without fabricated completion checkpoints.

For judging, show the live team channel, a persistent energy request, a map ping, and a relay commitment. Have the carrier cross and collect the pump while the operator stays. Explain that the resulting coordination is the practice opportunity; everyday communication improvement has not been established.

## Research basis and claims

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

Persistent teams and shared-world missions are proposed ways to create reasons to return and cooperate. We have not shown that persistence, component delivery or energy sharing improves belonging. Team missions create opportunities to share information, request help, negotiate responsibilities and confirm plans. The eight authored conversations remain optional individual practice. Do not claim that navigating walls itself teaches social understanding.

The authored choices are justified by their visible fictional goals and constraints. Research does not certify those answer keys. Circa is not required: it is an NLP dataset, not an adult autism curriculum. [Dataset context](https://github.com/google-research-datasets/circa)

**Approved research wording:** “Common Ground draws on research into autistic adults' gaming preferences and evidence from related simulated communication practice. We are applying those ideas to cooperative play; this prototype has not yet been evaluated for real-world communication or belonging outcomes.”
