# Common Ground — presentation and demo script

**Dino Devs · Hack the Change 2026 · 8 November 2026**

Use slides 1–6 for the main presentation. Slides 7–10 are backup answers. Aim for **2:50**, leaving a ten-second margin under the participant portal's three-minute video limit. Rehearse aloud: the timings are targets, not a measured recording. Assign one speaker and one demo operator; additional teammates can take questions.

## The pitch

### 1. Common Ground — 0:00–0:25

“Can you hold this while I get through?”

That is a small request with a real consequence. Common Ground gives autistic adults a shared purpose: two people coordinate robot missions, while their small team builds a world that remembers what they achieved together.

### 2. Calm by design — 0:25–0:50

The challenge is deciding who moves, who waits and how to use limited energy. Turns are untimed, sound starts off, and players choose signals, pings or text.

Adult research describes varied sensory needs. We designed for control over the experience. A quieter game can still demand serious teamwork.

### 3. Demonstrate communication — 0:50–1:35

**Show a real prepared checkpoint or a clearly labelled recording. This 45-second block includes narration and clicks.**

“Can you hold plate A?”

The partner answers Yes and stays on the plate. The other robot crosses. Leaving early closes the gate, so they must agree when to move.

These are requests, acknowledgements and handovers between real people. They practise coordinating, with a clear consequence.

**Show the “I'm through” signal and the holder leaving after the carrier is safe.**

### 4. Give the team continuity — 1:35–2:00

Each pair belongs to a team of up to six. Success fills part of this world and records both contributors. Another pair can continue later.

Adult friendship research highlights acceptance and comfortable company. Our shared world gives repeated contact and shared memories somewhere to accumulate. Lasting bonds are the goal.

### 5. Show technical proof — 2:00–2:20

The game is deployed on Cloudflare. The server resolves both routes, checks plate occupancy and saves shared progress.

We completed all eight rounds in two independent browsers. Both contributors and the restored world survived a reload. The technical core is reliable human cooperation.

### 6. Close — 2:20–2:50

Related supported game programmes have improved social outcomes. Small adult simulation studies also show transfer to a specific trained task. That makes this direction worth testing; it does not establish outcomes for Common Ground.

Next, autistic adults should shape the game and evaluate enjoyment, connection and use beyond the maze.

Common Ground: a reason to connect, and a world to build together. We are Dino Devs.

## Demo preparation

- Use the [deployed game](https://common-ground.sodeeqalli.workers.dev), with two independent browser profiles or devices. Two ordinary tabs in one profile share an identity.
- Create a **private demo team**. Keep its invite code out of the recording. Use neutral demo names rather than personal details.
- Follow the genuine eight-round sequence in [live-multiplayer-check.md](live-multiplayer-check.md#played-routes). Prepare the gate-crossing position before presenting; call it a prepared checkpoint. Do not edit the database to manufacture a win.
- The 45-second demo is an excerpt, not an entire mission. Have a recording of a genuine successful run ready, with any cuts labelled. Show completion and contributor credit from that completed run when transitioning to slide 4.
- Keep the advanced Power station available for questions. The main presentation should establish one clear cooperation mechanism.
- Turn off OS notifications, set a legible browser zoom, and rehearse with the actual two devices. Record at least one uninterrupted successful take before relying on it live.
- If the network fails, play the recorded excerpt and say so. Static screenshots in the deck are a fallback, not the required video by themselves.

## Five-minute finals expansion

The earlier runbook transcription lists three minutes plus two minutes of questions for initial judging, and five plus three for finals. The current portal confirms judging windows but does not repeat these presentation durations; confirm your assigned slot. Keep the submission video within 2–3 minutes regardless.

For a five-minute presentation, expand rather than rushing through all ten slides:

1. **Add 30 seconds after slide 2:** explain that some people enjoy intense games; this design offers another choice. The sensory evidence concerns varied responsiveness and, in small experiments, repeated sound. It does not prescribe one palette or one “autistic brain type.”
2. **Add 40 seconds during slide 3:** show a No response or energy request, then a revised plan. Explain that the pair can lose through poor planning, while there is no wall-clock penalty for taking time to respond.
3. **Add 25 seconds after slide 4:** explain that both support and collection receive credit. A persistent team makes continuity possible, while either player can end an attempt and retain already completed areas.
4. **Add 25 seconds after slide 5:** explain version checks, request IDs and server-side route resolution. Explain that Power station adds independent A/B gates and reciprocal support. Do not call the polling system WebSockets.
5. **Add 20 seconds before the close:** propose a small Calgary pilot, participant-defined goals and a different cooperative task outside the maze. No partnership or completed evaluation is claimed.

## Evidence behind the spoken claims

The [team specification contains all 16 sources, samples, findings and limitations](team-spec.md#research-basis-and-claims). The main pitch deliberately uses a small number; the deck's notes contain source URLs. The full [judge notes and product comparisons](final-pitch.md) remain available for questions.

| Pitch claim | Supporting evidence | Boundary |
|---|---|---|
| Sensory access matters | [MacLennan et al.](https://link.springer.com/article/10.1007/s10803-021-05186-3): 49 adults described varied sensory experiences. [Gandhi et al.](https://link.springer.com/article/10.1007/s10803-020-04636-8): two small experiments found reduced auditory habituation. | Supports choice and reducing unwanted input; not a universal preference or a validation of our UI. |
| Structured play can support connection | [Cross et al.](https://link.springer.com/article/10.1007/s10803-024-06408-0): hobbyist survey and smaller autistic interview/group studies. | Selected samples; no proof that everyone likes strategy or that this game changes everyday behaviour. |
| Acceptance and comfortable company matter | [Crompton et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC7376620/): 12 adult interviews. | Persistent teams and contributor history are our design inference. Lasting bonds remain to be evaluated. |
| Benefits outside a game are plausible | [Beaumont et al.](https://link.springer.com/article/10.1007/s10803-020-04801-z): 70 child–parent dyads in a supported programme, with parent/teacher-rated gains. | Children, additional support and instruction; not our adult standalone game. |
| Adult computer practice can transfer narrowly | [Smith et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC4167908/): small adult interview-training trial with live role-play improvement. | Near-transfer to a trained vocational task; not evidence for general conversation or friendship. |
| Multiplayer and persistence work in the tested flow | [Production test report](live-multiplayer-check.md). | Engineering evidence, not user research or clinical validation. |

For the other evidence, use the existing register: R1 implicit cooperative groups; R3 adolescent multiplayer; R4 intervention synthesis; R6 adult vocational follow-up; R8 autistic gamer preferences; R9 varied play; R11 friendship narratives; R12 mutual communication context; R15 community participation; R16 adult environmental guidance. Do not count the adult follow-up as a new independent trial.

## Short answers to likely questions

**How does this relate to everyday communication?** Players practise asking, answering, declining, confirming readiness and coordinating handovers with a real partner. These actions resemble everyday teamwork. Transfer beyond the game is a hypothesis we would evaluate separately.

**Why isn't it just a normal co-op game?** Co-op games already support connection. We combine a bounded adult-focused task, untimed strategy, alternative communication options and the same small team's visible history. See slide 7; avoid claiming every other game is competitive or inaccessible.

**Why would people return?** The same teammates share unfinished goals and a record of what they achieved. That is the retention hypothesis. Two missions are shipped; a sustained community needs more content and user-led iteration.

**Why this quiet style?** Engagement can come from strategy and interdependence. Sensory preferences vary, so players control presentation and communication. We are testing whether this particular balance is enjoyable.

**What if my partner vanishes?** Either participant can end the attempt, retain completed areas, and start again with another teammate. There is no replacement bot or response timer.

**Is AI doing the communication?** No. Players coordinate with people. AI assisted development and research; disclose it clearly. No live model evaluates how someone communicates.

**What remains?** Co-design and evaluation with autistic adults, broader accessibility work, account recovery, community safeguards and more replayable missions. These are proposed next steps, not completed validation.
