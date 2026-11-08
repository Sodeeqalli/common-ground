# Dino Devs — submission checklist

Checked against the live participant portal and official Devpost pages on **8 November 2026**. Nothing has been submitted by this preparation task.

## Required before submission

- [x] Working implementation: [public game](https://common-ground.sodeeqalli.workers.dev).
- [x] Source repository: [Sodeeqalli/common-ground](https://github.com/Sodeeqalli/common-ground).
- [x] Pitch script and presentation prepared; six main slides and four judge-reference slides.
- [x] Research and claim boundaries documented in [team-spec.md](team-spec.md#research-basis-and-claims).
- [x] AI-use record available in [AI-USE.md](AI-USE.md); copy the actual disclosure into the submission.
- [ ] Record and upload a **2–3 minute demo video**, then check that its link opens without your login. The participant portal says 2–3 minutes; Devpost says 2–5. A 2:50 video satisfies both. Slides alone do not satisfy the video requirement.
- [ ] Confirm the required **team ID**. The portal names the team **Dino Devs**, but the identifier visible on the team page is labelled **CODE**, not ID. Do not assume an invitation code is the submission ID or publish it as one without confirmation.
- [ ] Use the Devpost title structure: **`[confirmed team ID]-Dino Devs - Common Ground`**. Replace the bracketed field before submitting.
- [ ] Confirm the Devpost roster. The portal currently shows five memberships but four distinct displayed names, with Jasneet Singh appearing twice. Do not remove either account without the team's decision. Presenter roles are not recorded in the portal.
- [ ] Complete the project description, prompt fit, source/video/live links and AI disclosure. Suggested copy is below.
- [ ] Submit on Devpost and verify the submitted confirmation/status. A saved draft is not a submission.
- [ ] Check the assigned live judging slot and have the registered team present, with two devices and a recorded fallback ready.

## Deadline and judging discrepancy

The [participant instructions](https://hackthechangeyyc.ca/participant/important-info) explicitly say **11:30 a.m. ABT on Sunday, November 8**. The [participant judging page](https://hackthechangeyyc.ca/participant/judging) also says 11:30 a.m.; it lists main judging **12:45–2:55 p.m.**, finals **3:10–3:55 p.m.**, with no team-specific assignment visible during the check.

However, [Devpost's schedule](https://hack-the-change-2026.devpost.com/details/dates) lists **11:30 a.m. CST**, which is **10:30 a.m. MST in Alberta** on this date. The participant countdown also appeared inconsistent with its written local-time label. **Plan to submit by 10:30 a.m. Alberta time unless organisers explicitly resolve the discrepancy.** This is a conservative planning cutoff, not a new event rule.

The earlier runbook transcription gives 3 minutes + 2 minutes Q&A for the first round and 5 + 3 for finals. These durations were not freshly confirmed on the portal, so verify them with the assigned slot. This deck and script fit the shorter presentation.

## Rubric: 25 points total

The authenticated [participant rubric](https://hackthechangeyyc.ca/participant/judging) assigns **five points to each category**. Side pots are separate. The evidence below is our preparation mapping, not an organiser score or predicted win.

| Criterion | Points | What we should demonstrate |
|---|---:|---|
| Innovation & Creativity | 5 | Explain the specific combination of adult-focused co-op, flexible communication and persistent small-team history. Acknowledge existing co-op games. |
| Impact & Relevance to Prompt | 5 | Connect the game to community inclusion: purposeful peer coordination and repeated connection. Distinguish the implemented opportunity from unmeasured lasting benefit. |
| Feasibility & Scalability | 5 | Open the deployed browser game; show saved progress. Explain the proposed local pilot and the next work needed for sustained community use. |
| Technical Execution | 5 | Demonstrate two independent clients, occupancy-controlled gates, shared state, server authority and reload persistence. |
| User Experience & Design | 5 | Show clear choices, untimed turns, signals/optional chat and comfort settings; explain how design serves the activity. |

**Clio accessibility side pot — 3 points:** Strong thematic fit. The portal includes usability, privacy and responsible design. Explain private-by-default discovery, optional chat and honest evidence boundaries. Do not claim formal accessibility certification, production-grade moderation or comprehensive privacy controls.

**Benevity local-impact side pot — 3 points:** Pitch a proposed Calgary adult-community pilot with participant-led goals. No local organisation has agreed to partner, and no pilot has happened. Do not invent either.

**Voltex energy-data side pot — 3 points:** Not a fit. Fictional robot energy is not real-world energy data. Do not claim unused sponsor technologies to qualify for unrelated prizes.

## Ready-to-adapt submission copy

### One-line description

A calm, strategic browser game where autistic adults coordinate robot missions and build a lasting shared world with their team.

### Inspiration and prompt fit

Common Ground addresses community connection and inclusion. We wanted social interaction to have a useful shared purpose: asking for help, acknowledging a request and coordinating a handover all change whether two players can complete a mission. Research on autistic adults' play, relationships and sensory experiences informed our design. The project aims to create opportunities for everyday communication practice and lasting bonds; these outcomes have not yet been evaluated in our game.

### What it does

Teams of up to six share an unfinished world. Two teammates take on each mission, plan routes, occupy pressure plates, retrieve components and return home within a limited number of rounds. They can use strategy signals, map pings, actionable requests or optional text chat. Successful missions restore a region and credit both contributors. Turns are untimed; presentation and communication are adjustable. Greenhouse and Power station are playable, while Bridge and Workshop remain future areas.

### How we built it

React and TypeScript run on a Vinext/Vite application deployed to Cloudflare Workers, with D1 persistence. A deterministic server-side engine resolves paired routes and plate/gate dependencies. Version checks and request identifiers protect shared state against competing and repeated mutations. Clients poll for updates. The system saves team progress and contributions; it does not call an AI model to judge players or generate their conversations.

### A concrete engineering challenge

The gate must react correctly to both players' moves. Occupancy needs to be evaluated at each step so a teammate cannot cross a gate after its holder leaves. We also needed launch synchronization, durable requests and completion persistence to agree across separate browsers. A full deployed eight-round Greenhouse run verified those interactions and retained both contributors after reload.

### What we learned and what comes next

Purposeful communication worked better as part of the mission than as an interrupting multiple-choice exercise, so we removed the mandatory scenarios. We built the cooperation mechanism and shared history. The next step is co-design with autistic adults, followed by repeated-session evaluation of enjoyment, comfort and connection. Transfer to an unrelated shared task and participant-defined daily goals should be measured separately from improved maze performance. Sustained use also needs more missions, account recovery and community safeguards.

### AI assistance

OpenAI Codex assisted research synthesis, concept iteration, authored content, implementation, verification and presentation preparation. We also consulted ChatGPT, Google Gemini and Grok for idea feedback. The shared-world illustration was generated with the built-in image-generation tool. The project began from the OpenAI Sites Vinext starter and uses open-source dependencies. The team selected the direction and is responsible for reviewing and explaining the result. No AI model runs inside the shipped gameplay loop. See the repository's AI-use record for details.

Team members should review this disclosure for any additional tools or generated assets before submission. The artwork's provenance is documented in [world-art.md](world-art.md).

## Final rehearsal

1. Confirm who speaks, who operates the second player, and who takes technical/research questions.
2. Play the prepared gate sequence once on the actual devices. Check that a request and acknowledgement appear on both screens.
3. Rehearse the pitch with a stopwatch. Keep the submitted video below three minutes; do not accelerate speech to squeeze in backup slides.
4. Test public source, game and video links while signed out. Ensure no invite codes, tokens, unrelated tabs or notifications appear in the video.
5. Check team ID, roster, final title, prompt choice and disclosure, then submit and retain the confirmation.

## Authoritative sources

- [Participant team page](https://hackthechangeyyc.ca/participant/team): current Dino Devs membership view; login required.
- [Participant rubric and judging windows](https://hackthechangeyyc.ca/participant/judging): numeric scoring and side pots; login required.
- [Participant submission instructions](https://hackthechangeyyc.ca/participant/important-info): 2–3 minute video and local deadline wording; login required.
- [Devpost overview](https://hack-the-change-2026.devpost.com/): public title format and submission requirements.
- [Devpost rules](https://hack-the-change-2026.devpost.com/rules): original event work and AI disclosure.
- [Devpost dates](https://hack-the-change-2026.devpost.com/details/dates): conflicting timezone listing.

The prompt wording in our existing research notes came from the event's external runbook: technology supporting health, social connection and community well-being. Our chosen area is community connection and inclusion. That PDF was previously read; this pass independently rechecked the live rubric and submission pages rather than relying on an old transcription for requirements.
