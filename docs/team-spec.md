# Common Ground — Team specification

Version 8 · 8 November 2026 · Browser game · Adults only

## Product and scope

Common Ground is a cooperative browser game designed to support everyday communication and lasting social connection for autistic adults and adult friends. A team of up to six builds one persistent world, two players at a time. Each mission gives partners a concrete reason to ask for help, respond, clarify timing and repair a shared plan. The world remembers what they accomplished together.

The product has two linked aims: purposeful communication practice with a real person, and repeated opportunities to build familiarity and bonds with chosen teammates. A calm, configurable interface supports access to those experiences. Research supports this direction; outcomes for this implementation have not yet been measured. See the consolidated evidence register below and the [final pitch](final-pitch.md).

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

| Mission       | Players | Components                 | Round limit |
| ------------- | ------- | -------------------------- | ----------- |
| Greenhouse    | 2       | Water pump, control module | 8           |
| Power station | 2       | Power cell, generator coil | 12          |

Previously saved 3/4-player greenhouse attempts remain compatible; new missions always use two players.

Players claim components before departure. Ownership stays fixed for the mission; task transfers are not available. A robot carries at most one item.

The complete map remains visible; route previews help individual planning, while other players’ submitted queues remain private. Robots can occupy the same tile. No hidden social-intention answer key is involved.

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

| Round | Cell collector     | Coil collector   |
| ----- | ------------------ | ---------------- |
| 1     | Up, Up, Left       | Up, Up, Right    |
| 2     | Left, Up, Up       | Right (onto A)   |
| 3     | Up, Up, Left       | Stay on A        |
| 4     | Left, Right, Right | Stay on A        |
| 5     | Down, Down, Down   | Stay on A        |
| 6     | Down (onto B)      | Up, Up, Up       |
| 7     | Stay on B          | Up, Right, Right |
| 8     | Stay on B          | Left, Left, Down |
| 9     | Stay on B          | Down, Down, Down |
| 10    | Right, Right, Down | Left, Left, Down |
| 11    | Down               | Down             |

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

### Strategic challenge with a calm presentation

Engagement comes from limited energy, a finite number of rounds, linked gates, reciprocal responsibilities and a genuine possibility of failure. Decisions are untimed; resources are limited. Players can think carefully without making every strategy successful. Power station adds two separate plate/gate relationships so that supporting and retrieving change hands.

The quieter presentation reduces avoidable sensory demands: no music, sound off by default, sparse feedback, muted but readable colours and reduced-motion controls. R13–R16 explain why sensory fit can matter for participation. These are design choices, not a measured sensory threshold or a promise that every autistic person will find the interface comfortable. Some autistic people seek intense stimulation or enjoy action games.

For the pitch, invite perspective-taking: “If this feels quieter than the games you usually play, consider whose comfort those games assume. We put the challenge in the shared decisions, and give players more control over how they take part.” Do not tell a judge that boredom proves they have the wrong brain type. Enjoyment still needs player feedback.

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

Evidence checked 8 November 2026. This register consolidates the studies used in the project discussion: cooperative games, transfer outside gameplay, adult simulated practice, adult play preferences, friendship, mutual understanding and sensory experience. Fourteen primary research papers, one systematic review and one professional guideline are included. Sample sizes overlap where a follow-up revisits an earlier trial; do not add them into a single participant total. Product comparisons are separately sourced in the [pitch](final-pitch.md#comparison-with-existing-games-and-applications); they are not clinical evidence.

The central research proposition is that structured play can create useful communication practice and opportunities for connection. Some related interventions have measured benefits beyond gameplay. Applying those findings to an independently played adult browser game is a research-informed design hypothesis, not a demonstrated outcome of this prototype.

### Communication and transfer beyond gameplay

#### R1 — Cooperative games with help-seeking built into success (2017)

**Source:** [Impact of an implicit social skills training group in children with autism spectrum disorder without intellectual disability: A before-and-after study](https://pmc.ncbi.nlm.nih.gov/articles/PMC5513455/).

**Design and finding:** Six autistic children aged 9–10 participated in 22 weeks of facilitated cooperative-game groups. Social/adaptation measures improved. Assessments incorporated caregiver observations, school information and parent reports of everyday behaviour. The games required participants to seek peers’ assistance to complete them.

**Use here:** The closest precedent for making help-seeking and reciprocal coordination part of the puzzle itself. **Boundary:** Very small uncontrolled study in a clinical setting, with assessors involved in care. Everyday reports are encouraging, but do not establish causation or adult generalization.

#### R2 — Game-based programme with outcomes reported at home and school (2021)

**Source:** Beaumont et al., [Randomized Controlled Trial of a Video Gaming-Based Social Skills Program for Children on the Autism Spectrum](https://doi.org/10.1007/s10803-020-04801-z).

**Design and finding:** Seventy child–parent dyads, children aged 7–12, were randomized to ten weeks of parent-supported Secret Agent Society or a caregiver-supported cognitive-game comparison. SAS showed greater improvement on parent-rated social skills and problem behaviours and teacher-rated social skills.

**Use here:** Stronger evidence that a game-based programme can produce reported benefits beyond the game, including a school context. **Boundary:** It tested a supported programme with additional instruction, not an ordinary co-op game alone; participants were children. Ratings are not direct proof of all everyday communication improving.

#### R3 — Cooperative multiplayer missions and spontaneous exchanges (2023)

**Source:** Gabrielli et al., [Co-Design of a Virtual Reality Multiplayer Adventure Game for Adolescents With Autism Spectrum Disorder: Mixed Methods Study](https://pmc.ncbi.nlm.nih.gov/articles/PMC10746967/).

**Design and finding:** Twelve adolescents played Zentastic in groups of two to four, with facilitators, across three weekly sessions. Researchers observed spontaneous social exchanges and improved therapist-completed Social Skills Questionnaire scores. Missions differed in the amount of interaction they elicited.

**Use here:** Supports designing the mission mechanics themselves to invite communication. **Boundary:** Small feasibility study, no control group. The authors explicitly identify transfer to everyday settings as future research. Do not describe this as established real-world transfer.

#### R4 — Broader synthesis of gamified interventions (2025)

**Source:** Wang et al., [The use of gamified interventions to enhance social interaction and communication among people with autism spectrum disorder: A systematic review and meta-analysis](https://pubmed.ncbi.nlm.nih.gov/40043470/).

**Design and finding:** Twenty studies, 349 participants. Five studies entered the meta-analysis, with a positive pooled effect on social interaction/communication: standardized mean difference 0.46, 95% CI 0.08–0.85. Nineteen of the twenty studies focused on children/adolescents.

**Use here:** The broader approach has a research base beyond one prototype. **Boundary:** This is a synthesis of varied interventions and measures, not twenty randomized trials or twenty adult studies. The pooled result is not a 46% improvement and does not establish everyday transfer for every included game.

#### R5 — Adult simulated practice improving live interview performance (2014)

**Source:** Smith et al., [Virtual reality job interview training in adults with autism spectrum disorder](https://pubmed.ncbi.nlm.nih.gov/24803366/).

**Design and finding:** Twenty-six autistic adults were randomized to simulated interviews plus didactic training (16) or treatment as usual (10). Trainees improved more on live standardized job-interview role-plays.

**Use here:** Adult evidence that computer-mediated practice can extend to a related interaction with a live person. **Boundary:** Small trial of a specific vocational skill. A standardized interview assessment is not everyday friendship, and a realistic interview simulator differs substantially from a maze.

#### R6 — Vocational follow-up of the adult trial (2015)

**Source:** Smith et al., [Vocational outcomes for young adults with autism spectrum disorders at six months after virtual reality job interview training](https://pubmed.ncbi.nlm.nih.gov/25986176/).

**Design and finding:** A follow-up survey reached 23 of the original 26 participants. Trainees had greater odds of obtaining a competitive employment or volunteering position than controls.

**Use here:** A real-world outcome following targeted adult simulated practice. **Boundary:** Small follow-up of R5, not an independent replication; combined employment/volunteering outcome. It does not show that a cooperative maze improves employment or general conversation.

### Adult play, accessibility and social participation

#### R7 — Board games as a structure for adult social connection (online 2024; journal issue 2025)

**Source:** Cross et al., [Game Changer: Exploring the Role of Board Games in the Lives of Autistic People](https://link.springer.com/article/10.1007/s10803-024-06408-0).

**Design and finding:** Three studies: a survey of 1,603 board gamers, interviews with 13 autistic hobbyists, and group sessions with 28 autistic adults. Findings included enjoyment of systems, games easing interaction and games providing an alternative way to form social relationships.

**Use here:** A shared, rule-based activity can give interaction a concrete purpose. **Boundary:** Selected samples and qualitative social findings. The 1,603 respondents were not all autistic. This does not establish a universal preference for logic games or a lasting improvement outside play.

#### R8 — Autistic gamers’ own preferences and barriers (2026)

**Source:** Park et al., [Understanding the Perspectives of Autistic Gamers through an Online Autistic Community and a Survey](https://doi.org/10.1145/3803421).

**Design and finding:** Analysis of 160 gaming-related posts and 7,989 comments, plus a survey of 145 autistic adults. Themes included autonomy, sensory experiences, respectful communities and inclusion. Preferences varied; solo play was also valued.

**Use here:** Offer control over communication and presentation. Make supportive community participation central to the design. **Boundary:** Preference research, not a treatment trial. Our exact palette, pair size, presets and chat defaults are design decisions; they were not clinically tested by this paper.

#### R9 — Different ways of playing and different social needs (online 2023; journal issue 2024)

**Source:** Pritchard-Rowe et al., [Diversity in Autistic Play: Autistic Adults’ Experiences](https://doi.org/10.1089/aut.2023.0008).

**Design and finding:** Interviews with 22 autistic adults identified the value of solitary and social play, parallel play, and individual preferences regarding play partners. Some described smaller groups and familiar or accommodating partners as more comfortable; preferences could change with energy and circumstances.

**Use here:** Choice of partner, breaks and flexible communication are meaningful access features. **Boundary:** Qualitative findings, not evidence that two is the ideal group size. Common Ground currently requires a partner for missions; it does not ship a solo or parallel-play mode.

### Friendship, belonging and mutual understanding

#### R10 — Comfort and belonging in autistic relationships (2020)

**Source:** Crompton et al., [“I never realised everybody felt as happy as I do when I am around autistic people”: A thematic analysis of autistic adults’ relationships with autistic and neurotypical friends and family](https://journals.sagepub.com/doi/10.1177/1362361320908976).

**Design and finding:** Interviews with 12 autistic adults identified cross-neurotype understanding, minority status and belonging. Participants described comfort and ease with autistic friends and family. The authors highlight autistic-led social opportunities and informal peer support.

**Use here:** Build opportunities to know and feel understood by others, rather than assuming lack of social interest. **Boundary:** Small, mostly female, speaking adult sample. It did not test persistent game teams or require excluding non-autistic friends.

#### R11 — Friendship understood through comfort, acceptance and trust (online 2025; journal issue 2026)

**Source:** Brake, [Understanding “Friendship” Among Autistic Adults: Insights From Narratives of Everyday and Social Life](https://onlinelibrary.wiley.com/doi/10.1111/socf.70005).

**Design and finding:** Qualitative analysis of autistic adults’ accounts of friendship emphasizes comfort, acceptance and trust, situated in their lived experiences and environments.

**Use here:** Give chosen teammates repeated opportunities to accommodate one another, cooperate and build shared history. **Boundary:** These are qualitative friendship findings, not a comparison of stable teams versus random matchmaking. They do not establish that all autistic people need deeper bonds than other people.

#### R12 — Communication success depends on the interaction context (2020)

**Source:** Crompton et al., [Autistic peer-to-peer information transfer is highly effective](https://pmc.ncbi.nlm.nih.gov/articles/PMC7545656/).

**Design and finding:** Seventy-two adults participated in story-retelling chains. Autistic-only chains did not differ significantly from non-autistic-only chains in information retention; mixed chains lost more detail and had lower rapport ratings.

**Use here:** Frame communication as mutual coordination shaped by partners and context. Both players share responsibility for clarity. **Boundary:** One experimental task, not evidence that mixed friendships fail or that diagnosis should determine teammate matching. The game does not infer or verify diagnoses.

### Sensory experience and access to participation

#### R13 — Autistic adults describe varied sensory experiences (online 2021; issue 2022)

**Source:** MacLennan et al., [In Our Own Words: The Complex Sensory Experiences of Autistic Adults](https://link.springer.com/article/10.1007/s10803-021-05186-3).

**Design and finding:** A stakeholder-informed online study of 49 autistic adults described heightened and reduced sensory responsiveness, sensory seeking and the importance of context. Experiences could be distressing or enjoyable.

**Use here:** Offer control over sound, motion and communication instead of assuming one sensory preference. **Boundary:** Self-reported experience, not a trial of this interface; “autistic” does not mean universally hypersensitive or quiet-game preferring.

#### R14 — Physiological and neural evidence about repeated sounds (online 2020; issue 2021)

**Source:** Gandhi et al., [Autonomic and Electrophysiological Evidence for Reduced Auditory Habituation in Autism](https://pubmed.ncbi.nlm.nih.gov/32926307/).

**Design and finding:** Two independent experiments measured responses to repeated sounds: skin conductance in 13 autistic and 13 matched non-autistic young adults; and magnetoencephalography in 24 participants, 12 autistic, spanning pre-adolescence to young adulthood. Both found reduced auditory habituation in the autistic group.

**Use here:** A reason to avoid unnecessary recurring sound: repeated input may fade into the background less readily for some people. **Boundary:** Small, task-specific group findings. This does not establish a universal inability to filter input, validate a colour palette, or show what playing our game does to the brain.

#### R15 — Sensory fit relates to community participation (2022)

**Source:** [Sensory Processing and Community Participation in Autistic Adults](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2022.876127/full).

**Design and finding:** Six adult case narratives combined sensory profiles, interviews and one week of GPS data. Sensory sensitivity and avoidance appeared alongside descriptions of exhausting environments and restricted community participation.

**Use here:** Treat environment design as part of access to social activity, not merely visual taste. **Boundary:** Small descriptive case study, not proof of causation or a population estimate; applying it to a browser game is a design inference.

#### R16 — Adult guidance on adapting environments

**Source:** [NICE CG142, recommendation 1.1.8](https://www.nice.org.uk/guidance/cg142/chapter/recommendations).

**Guidance:** Consider individual sensory sensitivities and adaptations to noise, lighting, colours/patterns and personal space, with breaks where environments cannot be adjusted.

**Use here:** Supports taking sensory accommodation seriously. **Boundary:** Guidance for adult care environments, not an evaluation or endorsement of Common Ground. Digital application and the exact interface choices are ours.

### From evidence to this game

| Design choice                                         | Research rationale                                                               | What is implemented                                           | What remains a hypothesis                                          |
| ----------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| A gate that needs a partner on a plate                | R1 and R3: cooperation can invite communication                                  | A concrete reason to request support and coordinate departure | Better help-seeking outside the game                               |
| Signals, acknowledgements, Yes/No and energy requests | R1–R3 support purposeful practice; R8–R9 support accommodating preferences       | Multiple ways to ask, respond, decline and confirm            | Transfer from these controls to everyday conversations             |
| Two-player missions inside a team of up to six        | R9 highlights varied group and partner preferences                               | Choose one partner; others share the world and can watch      | This exact arrangement being optimal for comfort or belonging      |
| Persistent team and contributor credits               | R7, R10–R11 support meaningful social participation and relationships            | Return to the same team and visible shared accomplishments    | More durable friendships or increased trust over time              |
| Opt-in discovery and invite codes                     | Provides access to the shared activity                                           | Join a listed team or invite chosen friends                   | Discovery resulting in compatible, lasting relationships           |
| Untimed decisions and sensory/communication choices   | R8–R9 and R13–R16 support autonomy, varied needs and environmental accommodation | No countdown, optional chat/sound, reduced motion and breaks  | Specific settings improving comfort or outcomes for a given player |
| No social-normality scoring                           | R12 supports a relational view of communication                                  | Success depends on joint actions, not sounding neurotypical   | Long-term effects on confidence, masking or wellbeing              |

Communication with a real teammate during play is already a real interpersonal interaction, even when mediated by buttons. Transfer means an additional change in another context: for example, a player more comfortably requesting help with a work task. The first is part of the shipped experience; the second is an intended outcome to investigate. Completing a maze or sending more messages does not, by itself, establish transfer.

The bond-building pathway is **chosen teammates → repeated shared goals → opportunities for mutual support → visible shared history → reasons to return**. Persistent progress supplies continuity; trust and friendship are hoped-for human outcomes. Participation remains voluntary, with no attendance streaks, response deadlines or penalty for declining chat. A player can end an attempt and choose another partner. Keeping a team should never take priority over someone’s comfort.

### Claims for the final pitch

**Use:** “Research suggests structured cooperative play can support social communication, and some supported game-based programmes have reported benefits beyond gameplay. Common Ground applies that idea to real teammate interactions: asking for help, confirming plans and supporting each other while building a world they can return to.” Cite R1–R3 for the practice rationale, R2 for reported home/school outcomes, R5–R6 for adult task-specific transfer, and R7/R10/R11 for connection.

**Use:** “Designed to support everyday communication and give lasting bonds a place to grow.” This expresses intended impact, not measured efficacy.

**If asked about validation:** “We have built and technically tested the mechanism. The research supports the direction; evaluating transfer and relationship outcomes with autistic adults is our next step.” State this once clearly; the pitch can then focus on the working product.

Avoid saying clinically proven, guaranteed lasting friendships, improved everyday communication in our users, reduced loneliness, or that all autistic people prefer quiet logical games. Do not call child findings adult findings, treat a clinical programme as game-only evidence, or imply that we co-designed this prototype with autistic adults. Research supports potential, not a promised effect size for Common Ground.

The purpose is mutual understanding and chosen connection. Eye contact, conformity, message volume and speed are not success criteria. These studies concern autism; their findings cannot automatically be extended to every neurodivergent group.

### A practical next evaluation

This is a roadmap, not work claimed as completed or needed before a hackathon demonstration. Invite autistic adults to shape the questions and activities. Assess three distinct things:

1. **During play:** Can players make and understand requests, decline comfortably, confirm a plan and recover from a misunderstanding? Include comfort and perceived pressure, not only task completion.
2. **Outside the game:** Before and after repeated sessions, offer a different collaborative activity requiring help-seeking and plan repair; pair observations with participant-defined everyday goals. A comparison condition would help distinguish practice effects from game-specific gains.
3. **Over time:** Do people choose to return to the same teammates, feel accepted and supported, and describe a meaningful connection? Revisit after several weeks. Retention and contributor counts alone are not evidence of friendship.

Keep participation voluntary. Any study data collection needs an explicit plan and consent; the MVP does not silently collect clinical outcomes or analyze chat to score social ability.

### Historical materials

The eight authored conversations are archived, not part of the current gameplay or a validated curriculum. [Circa](https://github.com/google-research-datasets/circa) was considered as an NLP dataset; it is not an autism intervention and supplies no efficacy evidence for this game. Dialogue choices were fictional authoring decisions, not statistical truths about neurotypical intentions.

For the spoken pitch, demo sequence, source-to-slide mapping and judge questions, use [final-pitch.md](final-pitch.md).

## Mission layout

On desktop, the complete square board fits in the available viewport. Route controls, requests, pings, signals, and crew share an independently scrolling right panel. Phones, short windows and narrow layouts stack the board above controls. Entry nickname guidance and the route-preview note are omitted.

## Availability and ending an attempt

There is no response deadline, auto-move or inactivity penalty. Players can leave and return to saved mission state. Either mission participant can explicitly end the attempt after confirmation, then choose another teammate for a fresh mission from round one. This discards that unfinished attempt, but completed areas and contributor credits stay saved. Spectators, including the team creator when not playing, cannot end the pair's mission. New missions always contain exactly two players. Existing saved three/four-player attempts and larger teams are preserved; new joins stop at six members.

Pitch: “A team of up to six builds one shared world, two people at a time.” Do not claim automatic partner matching, availability detection, mid-mission substitutions or simultaneous missions; those are not built.
