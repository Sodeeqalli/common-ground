# Common Ground — Team specification

Version 7 · 8 November 2026 · Browser game · Adults only

## Product and scope

A calm cooperative robot strategy game for autistic adults and invited adult friends. Teams restore a persistent shared world by completing missions together. Communication is useful to the mission: hold a pressure plate, request energy, mark a route and agree on timing.

There are no mandatory scenario questions, dialogue-score rewards or AI judgments in Team Missions. Practice and Race are removed from the app. The eight conversations remain archived in the repository. The mission is allowed to be difficult and teams can lose. No one needs to type, speak or use a prescribed sentence to receive movement energy.

The shipped world has two playable missions: Greenhouse (8 rounds) and Power station (12 rounds). Bridge and Workshop remain locked in the unfinished picture. Each successful mission colours its own area and credits its pair using saved team progress. There is no reveal animation.

## Teams and persistence

- A team has a name, invite code, members, latest expedition and permanently restored regions.
- Discover teams lists only teams whose creator explicitly opts in, on creation or later in Settings. New and existing teams default to private. Listed teams show only name and member count, with search and code-free joining. Full teams disappear; hiding or filling a team also blocks stale discovery joins. Only the creator changes visibility. Invite-code joining still works for private teams. Discovery does not change the hosted site audience.
- The directory is optional: current members can browse, but joining another team requires explicitly leaving their current browser identity in Settings. Guest recovery and switching between saved memberships are not built.
- Teams are designed for 2–6 members (one creator while inviting). Any member can choose one partner and start a two-player mission. One mission is active per team at a time.
- Invited members outside the expedition can watch. Mission actions belong to the selected roster.
- Guest identity is remembered in this browser. Clearing browser data or leaving membership loses that identity; rejoining creates another robot. Full account recovery is not built.
- Completed areas show a quiet “Built by” row with robot avatars and contributor names. Every member of a successful mission roster is credited, including plate holders and helpers. Successful replays add new people once each; failures and spectators earn no completion credit. Name and colour snapshots persist through retries and later membership changes. Legacy records only recover names from a retained successful attempt; otherwise the area says “Built by your team” until a new success supplies names. There are no ranks or contribution scores.
- Team progress, contributor records, accepted actions, signals, requests and pings are server-backed. The local and hosted databases are separate.

## Greenhouse mission

Retrieve the assigned components, deliver them by entering base, and return every roster robot to base by the end of round eight. Delivery alone is not victory. Successful completion and world restoration are saved atomically. Retry or failure does not erase earlier restored regions.

| Mission | Players | Components | Round limit |
|---|---|---|---|
| Greenhouse | 2 | Water pump, control module | 8 |
| Power station | 2 | Power cell, generator coil | 12 |

Previously saved 3/4-player greenhouse attempts remain compatible; new missions always use two players.

Players claim components before departure. Ownership stays fixed for the mission; task transfers are not available. A robot carries at most one item.

All routes and the map remain visible. Robots can occupy the same tile. No hidden social-intention answer key is involved.

## Why actual teamwork is required

Pressure plate **A** is at column 6, row 8. Matching gate **A** is at column 4, row 8. The pump is at column 3, row 6. Both map tiles show an A badge, a connecting wire, and explicit open/closed state.

1. Any robot standing on plate A automatically opens gate A. No activation button, charges, or holding energy cost.
2. Leaving the plate closes the gate unless another robot is still on it. Holding continues across round boundaries.
3. Robots resolve one queued move each per movement step. Plate arrivals and departures resolve before gate entries on the same step, independent of roster order.
4. A player can stay with an empty route, move off freely, or hand over the plate to a teammate. No operator role is locked.
5. A robot already on the gate tile may exit after closure; closure never crushes or teleports it. Entering a closed gate has the normal blocked-move penalty.
6. The pump requires its assigned collector, with no separate electronic lock. The lower-left bypass is closed at column 2, row 9, so getting into and out of the pump area requires the gate.
7. Coordinate before leaving: “Are you through?” has a real consequence. Everyone still needs to return home within eight rounds.


## Power station mission

Two independent gates guard opposite chambers. Plate A (column 8, row 8) opens Gate A (column 4, row 6); Plate B (column 4, row 8) opens Gate B (column 8, row 6). The power cell is at column 2, row 4; the generator coil is at column 10, row 4. Base is column 6, row 10. Coordinates here are one-based, matching the UI.

Each partner must hold a plate for the other. A route cannot bypass either gate. The pair first collects one component while its partner holds, then exchanges responsibilities: the first collector holds the opposite plate while the second crosses, collects and returns. Both bring their cargo home within twelve rounds. Plate letters, gate labels and distinct connecting-line patterns identify each pairing without adding animation or extra panels. Energy and collision rules are unchanged.

A tested eleven-round solution is below. Left player claims the power cell; right player claims the generator coil. `Stay` is an empty route; it discards unused energy. Both ready and lock after coordinating each round.

| Round | Cell collector | Coil collector |
|---|---|---|
| 1 | Up, Up, Left | Up, Up, Right |
| 2 | Left, Up, Up | Right (onto A) |
| 3 | Up, Up, Left | Stay on A |
| 4 | Left, Right, Right | Stay on A |
| 5 | Down, Down, Down | Stay on A |
| 6 | Down (onto B) | Up, Up, Up |
| 7 | Stay on B | Up, Right, Right |
| 8 | Stay on B | Left, Left, Down |
| 9 | Stay on B | Down, Down, Down |
| 10 | Right, Right, Down | Left, Left, Down |
| 11 | Down | Down |

This is a validation route, not a prescribed player script. The map leaves room for different orders, energy sharing and route planning. Greenhouse remains the main demo; Power demonstrates reciprocal support and map variety. Either can be selected without completing the other, but the team has only one active mission.

## Energy and movement

- Each robot starts with three energy.
- Each new round adds three energy, capped at six. Readiness acknowledgements cannot repeat this reward.
- Each directional attempt costs one energy. Unspent energy carries over only when a non-empty route was submitted. Stay (including holding plate A) discards remaining energy at round resolution; the next round starts with the normal three energy. Time spent deciding or waiting for teammates has no penalty.
- During coordination a player can give one energy to one teammate once per round, respecting the six-energy cap. Transfers conserve energy.
- A robot can hold the plate even at zero energy. Energy transfers never deactivate it.
- Each battery tile grants each robot one energy once per attempt, after movement. It cannot fund extra moves in that same submitted queue.
- A wall or closed-gate attempt costs one energy, rolls the robot back one previously traversed step, and cancels the remaining queue. Rollback does not collect items, recharge or deliver cargo.
- The preview uses the same movement engine with teammates assumed stationary. A teammate moving on or off the plate can change the outcome. The preview includes the current player’s own effect on the plate.

## Round loop

**Briefing → Coordination → Route planning → Resolution/review → Next coordination**

Briefing happens once. Each player claims a responsibility; all ready to begin. Coordination lets players signal, ping, transfer energy, decide who will hold the plate. All ready before route planning. Changes to assignments, energy or positions reset readiness.

Players then queue routes or choose to stay. Routes execute after everyone locks in. The server validates energy, roles, ownership and per-step plate occupancy. Resolution shows relevant current state and obstacle feedback; the event log is not displayed. No one is scored for message length, tone, friendliness or number of messages.

All players explicitly continue to the next round. Anyone can request a break at the next boundary; at a paused boundary everyone must resume before continuing. Round limits constrain strategy, not response speed: there is no real-time countdown.

## Communication tools

### Strategy signals

Seven presets: I'll hold plate [letter]; Can you hold plate [letter]?; I'll collect; Can you take over plate [letter]?; Wait; I'm ready; I'm through. A compact A–Z selector changes the letter in plate signals; Greenhouse uses A, and Power station uses A and B. Selecting a letter changes the message only, never the map. Each roster member has at most one current signal, shown in the mission controls panel beside the map on desktop and below it on smaller screens. A new signal replaces the previous one. Requests offer Yes/No replies, identified by player; players can change their reply. Other signals offer Got it, meaning seen. Replies never move robots, change assignments or lock readiness. Players can clear their own signal.

Free chat is opt-in per browser under Settings and off by default. When enabled it appears in a collapsed Free chat bar at the bottom left. Other players may keep it off; there are no unread badges or pop-up prompts. It supports 1–280 literal characters per message, one message per two seconds, retaining 60 server-side and displaying the latest 20. Chat and signals make no sounds, even when other game effects are on. Free chat is optional for all players, with no diagnosis gate.

Signals expire on the next round and new mission. Different signals are limited to one every two seconds; repeating the same signal is idempotent. No pop-ups, flashing, sounds or unread badges. Quiet mode disables live announcements while retaining visible signals and requests. No communication score.

### Map pings

Choose Meet here, Need help or Go here, then select a walkable tile by touch, mouse or keyboard. Map markers and a short list identify sender, kind and coordinates. One pin per player; the next replaces it, with a two-second interval between changes. Pins clear each round. A ping communicates intent; it does not move or command a teammate's robot.

### Actionable requests

An energy request stays in a visible team inbox across screen changes and refreshes. The sender can cancel. Teammates can Give 1 energy during coordination, or reply Not now. The request closes when fulfilled, cancelled or all other roster members decline. A normal transfer to that requester also resolves their request. Repeated clicks cannot apply the transfer twice. Requests do not expire because another signal arrived.

Old pending task offers are cleared without changing ownership, so existing missions can continue. Retired task-transfer actions are rejected.

Break requests also remain visible. Quiet mode retains these mission-critical controls. New attempts clear old requests and pings while retaining world progress.

## Presentation

Our world, Team missions and Discover teams appear in navigation. Our world uses a sparse four-part illustration: restored areas have muted colour; unfinished areas are pale. Colours are accompanied by the completion count and a checkmark. The world picture has no animations, flashing or celebration effects. Mission collisions use one subtle 650 ms bump and rollback with a readable “Hit obstacle” strip above the grid, with no shake, sound or warning banner. Reduced motion shows the final position and caption without movement. Existing world progress is reused without resetting teams.

Copy is limited to labels, actions, useful state and errors. Detailed mechanics are behind Rules. Round log is removed from the UI; show current positions, energy, tasks, gate state and brief collision feedback. At the mission’s round limit, the outcome reads “Moves ended” and “Unable to complete mission.” The earlier scenario scripts remain in content and documentation, but their UI and API route are removed.

## Comfort and inclusion

Sound starts off; music is absent. Reduced motion, larger text, quiet signal announcements, untimed decisions, visible rules and route previews remain available. Communication can be a preset signal, a ping or a structured request. There is no penalty for using supports, no forced voice and no requirement to disclose a diagnosis.

Autistic adults have different preferences. The game is intended for adults who want this style of play, not as a claim about what all autistic people enjoy. Invited non-autistic friends participate in the same reciprocal responsibilities.

## Technical and reliability requirements

React/TypeScript with the supplied Vinext/Cloudflare Worker starter. D1 stores team state and hashed guest tokens. The client polls every 1.5 seconds. Server-owned validation, optimistic versions and request identifiers protect mutations.

Signals and safe phase-local actions can revalidate after a competing write. Readiness only carries over if jobs, energy and positions are unchanged. Shared decisions that no longer match the viewed state ask the player to review and retry. Successful restoration is part of the same state update as mission success.

Attempts from the old map and relay rules are ended safely under the pressure-plate rules. The obsolete upgrade banner is cleared; current pressure-plate attempts are preserved. Team identity and restored regions remain. Old chat remains available when a player enables Free chat. The signals and energy updates preserve current pressure-plate attempts; the Stay rule takes effect on their next resolution. No destructive schema migration is needed.

Selected players automatically enter a new active mission when polling receives it; any waiting dialog closes. Any member can choose a partner for a new mission; an active mission cannot be replaced. Returning to Our world during an existing mission does not force repeated navigation.

## Acceptance and demonstration

- Two browsers can exchange and acknowledge preset signals and see persistent energy requests, fulfilment confirmations, labelled map pings.
- Completed areas stay coloured after reload or replay. Practice and Race are absent.
- A single robot cannot leave the plate and cross the closed gate alone.
- Plate occupancy updates on each step, including arrival, departure and handoff; roster order does not affect gate access.
- Two-player pairs can win both maps within their limits; legacy 3/4-player greenhouse saves remain supported.
- Insufficient progress can cause failure. Retrying preserves the world.
- Reconnect restores accepted state; duplicate mutation IDs do not repeat transfers.
- A genuine full match and saved restoration are demonstrable without fabricated completion checkpoints.

For judging, show the strategy signals and acknowledgements, a persistent energy request, a map ping, and a pressure-plate opening. Have the carrier cross and collect the pump while their teammate stays on the plate, then show the gate close when the last holder leaves. Explain that the resulting coordination is the practice opportunity; everyday communication improvement has not been established.

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

### Persistent teams and meaningful relationships

There is evidence for valuing meaningful relationships, acceptance and mutual understanding among autistic adults. That supports a rationale for continuity; it does not establish a universal autistic need for unusually deep bonds or prove that fixed game teams create them. These studies concern autism and should not be generalized to every neurodivergent group.

- **Crompton et al. (2020):** Semi-structured interviews with 12 autistic adults identified cross-neurotype understanding, minority status and belonging. Participants described comfort and ease with autistic friends and family; the authors highlight autistic-led social opportunities and informal peer support. The small, mostly female, speaking adult sample limits generalization. [Primary article](https://journals.sagepub.com/doi/10.1177/1362361320908976)
- **Brake (2026; first published online August 2025):** Qualitative research into autistic adults’ accounts of friendship emphasizes comfort, acceptance and trust. It treats friendship as participants understand and practice it, including how friends accommodate one another’s needs. It does not compare persistent versus randomly matched game teams. [Primary article](https://onlinelibrary.wiley.com/doi/10.1111/socf.70005)

**Our inference:** A small returning team, repeated shared activities and visible shared history give players opportunities to develop familiarity and mutual understanding. The team name, saved world and contributor credits retain that history between sessions. Pair missions let members choose whom to play with without coordinating six people at once. Opt-in discovery creates an entry point; subsequent missions keep the chosen team rather than automatically rematching strangers.

Continuity is voluntary. Players may leave, choose another partner, decline chat or end an unfinished attempt. The design should not make preserving a team more important than a player’s comfort.

**Pitch wording:** “Research with autistic adults highlights the importance of acceptance, trust and feeling understood in friendship. Common Ground gives a small team a world to return to together, so players have repeated opportunities to build familiarity through shared goals. Persistent teams are our research-informed design choice.”

### Our design inferences

Persistent teams and shared-world missions are proposed ways to create reasons to return and cooperate. We have not shown that persistence, component delivery or energy sharing improves belonging. Team missions create opportunities to share information, request help, negotiate responsibilities and confirm plans. The eight authored conversations are archived and not part of this MVP. Do not claim that navigating walls itself teaches social understanding.

The authored choices are justified by their visible fictional goals and constraints. Research does not certify those answer keys. Circa is not required: it is an NLP dataset, not an adult autism curriculum. [Dataset context](https://github.com/google-research-datasets/circa)

**Approved research wording:** “Common Ground draws on research into autistic adults' gaming preferences and evidence from related simulated communication practice. We are applying those ideas to cooperative play; this prototype has not yet been evaluated for real-world communication or belonging outcomes.”

### Mission layout

On desktop, the complete square board fits in the available viewport. Route controls, requests, pings, signals, and crew share an independently scrolling right panel. Phones, short windows and narrow layouts stack the board above controls. Entry nickname guidance and the route-preview note are omitted.

### Availability and ending an attempt

There is no response deadline, auto-move or inactivity penalty. Players can leave and return to saved mission state. Either mission participant can explicitly end the attempt after confirmation, then choose another teammate for a fresh mission from round one. This discards that unfinished attempt, but completed areas and contributor credits stay saved. Spectators, including the team creator when not playing, cannot end the pair's mission. New missions always contain exactly two players. Existing saved three/four-player attempts and larger teams are preserved; new joins stop at six members.

Pitch: “A team of up to six builds one shared world, two people at a time.” Do not claim automatic partner matching, availability detection, mid-mission substitutions or simultaneous missions; those are not built.
