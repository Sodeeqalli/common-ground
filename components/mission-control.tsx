"use client";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Check,
  Pause,
  Zap,
  Undo2,
  MapPin,
  Home,
  Sprout,
} from "lucide-react";
import { useState } from "react";
import {
  BASE,
  PRESSURE_PLATE,
  plateHolders,
  position,
  same,
  previewMission,
  type Team,
  type Direction,
  type Point,
} from "../shared/game";
import MissionMap from "./mission-map";
import { RobotArt } from "./world-art";
type Props = {
  team: Team & { me: string };
  busy: boolean;
  queue: Direction[];
  setQueue: (q: Direction[] | ((q: Direction[]) => Direction[])) => void;
  act: (
    type: string,
    args?: Record<string, unknown>,
  ) => Promise<boolean | void>;
  onRules: () => void;
  onRetreat: () => void;
  onWorld: () => void;
};
const directions = [
  ["up", ArrowUp],
  ["left", ArrowLeft],
  ["down", ArrowDown],
  ["right", ArrowRight],
] as const;
export default function MissionControl({
  team,
  busy,
  queue,
  setQueue,
  act,
  onRules,
  onRetreat,
  onWorld,
}: Props) {
  const a = team.attempt!,
    r = a.robots.find((r) => r.id === team.me),
    name = (id: string) =>
      team.members.find((m) => m.id === id)?.name || "Teammate";
  const [pingKind, setPingKind] = useState<"meet" | "help" | "route" | null>(
    null,
  );
  const ended = ["success", "ended"].includes(a.phase),
    holders = plateHolders(a);
  const pending = (team.energyRequests || []).some(
    (q) => q.attemptId === a.id && q.from === team.me && q.status === "pending",
  );
  const ping = async (at: Point) => {
    if (pingKind && (await act("ping", { at, kind: pingKind })))
      setPingKind(null);
  };
  return (
    <>
      <div className="mission-header">
        <div>
          <div className="eyebrow">TEAM MISSION 01 · SHARED STRATEGY</div>
          <h1>Restore the greenhouse</h1>
          <p>
            Hold the plate. Open the gate. Bring every component and robot home.
          </p>
        </div>
        <button className="button outline compact" onClick={onRules}>
          Mission rules
        </button>
      </div>
      <div className="phase-track">
        {[
          ["briefing", "Choose jobs"],
          ["coordination", "Make a plan"],
          ["planning", "Lock routes"],
          ["round-end", "Review"],
        ].map(([phase, label], i) => (
          <span key={phase} className={a.phase === phase ? "current" : ""}>
            <i>{i + 1}</i>
            {label}
          </span>
        ))}
        <strong>ROUND {a.round} / 8</strong>
      </div>
      {ended ? (
        <section className="outcome">
          <div className="outcome-icon">
            {a.phase === "success" ? <Sprout size={46} /> : <Home size={46} />}
          </div>
          <div className="eyebrow">
            {a.phase === "success"
              ? "SAVED TO YOUR TEAM’S WORLD"
              : "EXPEDITION ENDED"}
          </div>
          <h2>
            {a.phase === "success"
              ? "You brought it home. Together."
              : "Time to rethink the route."}
          </h2>
          <p>
            {a.phase === "success"
              ? "All components delivered and all robots home. The greenhouse is permanently restored."
              : team.upgradeNotice ||
                "The attempt did not restore the greenhouse. Earlier world progress is safe. Regroup and try a different plan."}
          </p>
          <div className="outcome-stats">
            <span>
              <strong>
                {a.objectives.filter((o) => o.status === "delivered").length}/
                {a.objectives.length}
              </strong>
              components home
            </span>
            <span>
              <strong>
                {a.robots.filter((r) => same(position(r), BASE)).length}/
                {a.robots.length}
              </strong>
              robots home
            </span>
          </div>
          {a.log.length > 0 && (
            <div className="round-log">
              {a.log.map((line, i) => (
                <p key={i}>
                  {team.members.reduce(
                    (s, m) => s.replaceAll(m.id, m.name),
                    line,
                  )}
                </p>
              ))}
            </div>
          )}
          <button className="button primary" onClick={onWorld}>
            Return to our world <ArrowRight size={16} />
          </button>
        </section>
      ) : (
        <>
          <div className="mission-layout">
            <div className="board-column">
              <div
                className={`plate-status ${holders.length ? "is-open" : ""}`}
              >
                <span className="link-badge">A</span>
                <div>
                  <strong>
                    Plate A → Gate A · {holders.length ? "OPEN" : "CLOSED"}
                  </strong>
                  <p>
                    {holders.length
                      ? `${holders.map((r) => name(r.id)).join(", ")} is holding the plate. Stay until your teammate is through.`
                      : "Stand on plate A to open gate A. Leaving the plate closes the gate."}
                  </p>
                </div>
              </div>
              <div className="ping-toolbar">
                <MapPin size={16} />
                <span>Ping a tile:</span>
                {(["meet", "help", "route"] as const).map((kind) => (
                  <button
                    key={kind}
                    disabled={busy || !r}
                    aria-pressed={pingKind === kind}
                    onClick={() =>
                      setPingKind((k) => (k === kind ? null : kind))
                    }
                  >
                    {kind === "meet"
                      ? "Meet here"
                      : kind === "help"
                        ? "Need help"
                        : "My route"}
                  </button>
                ))}
              </div>
              <MissionMap
                attempt={a}
                me={team.me}
                members={team.members}
                queue={queue}
                pings={(team.pings || []).filter(
                  (p) => p.attemptId === a.id && p.round >= a.round - 1,
                )}
                pingKind={pingKind}
                onPing={ping}
              />
              {pingKind && (
                <p className="ping-hint" role="status">
                  Choose a walkable tile to send “
                  {pingKind === "meet"
                    ? "Meet here"
                    : pingKind === "help"
                      ? "Need help"
                      : "My route"}
                  ”.
                </p>
              )}
              <div className="crew-cards">
                {a.robots.map((robot) => (
                  <div
                    key={robot.id}
                    className={`crew-card ${robot.id === team.me ? "you" : ""}`}
                  >
                    <RobotArt
                      color={team.members.find((m) => m.id === robot.id)?.color}
                      small
                    />
                    <div>
                      <strong>
                        {name(robot.id)}
                        {robot.id === team.me ? " · you" : ""}
                      </strong>
                      <small>
                        {same(position(robot), PRESSURE_PLATE)
                          ? "Holding plate A"
                          : robot.cargo
                            ? a.objectives.find((o) => o.id === robot.cargo)
                                ?.name
                            : same(position(robot), BASE)
                              ? "At base"
                              : "On the route"}
                      </small>
                    </div>
                    <b>ϟ {robot.energy}</b>
                  </div>
                ))}
              </div>
              <div className="objectives">
                <h3>Our responsibilities</h3>
                {a.objectives.map((o) => (
                  <div key={o.id}>
                    <span
                      className={`objective-icon ${o.status === "delivered" ? "complete" : ""}`}
                    >
                      {o.status === "delivered" ? <Check size={15} /> : o.icon}
                    </span>
                    <span>
                      <strong>{o.name}</strong>
                      <small>
                        {o.owner ? name(o.owner) : "Unclaimed"}
                        {o.id === "pump" ? " · behind gate A" : ""}
                      </small>
                    </span>
                    <em>
                      {o.status === "delivered"
                        ? "Delivered"
                        : o.status === "carried"
                          ? "On the way"
                          : "To collect"}
                    </em>
                  </div>
                ))}
              </div>
            </div>
            <section className="action-panel">
              {!r ? (
                <>
                  <h2>You’re watching.</h2>
                  <p>
                    You can chat with the team and join the next expedition.
                  </p>
                </>
              ) : (
                <>
                  {a.phase === "briefing" && (
                    <>
                      <div className="eyebrow">PLAN BEFORE YOU LEAVE</div>
                      <h2>Who’s collecting what?</h2>
                      <p>
                        Claim one component each. Someone must stand on plate A
                        while a teammate crosses gate A and brings the pump
                        back.
                      </p>
                      <div className="job-list">
                        {a.objectives.map((o) => (
                          <button
                            key={o.id}
                            disabled={busy || !!o.owner}
                            className={o.owner === team.me ? "selected" : ""}
                            onClick={() => act("claim", { objective: o.id })}
                          >
                            <span className="job-symbol">{o.icon}</span>
                            <span>
                              <strong>{o.name}</strong>
                              <small>
                                {o.owner
                                  ? name(o.owner)
                                  : o.id === "pump"
                                    ? "Behind gate A"
                                    : "Available to claim"}
                              </small>
                            </span>
                            {o.owner === team.me && <Check size={18} />}
                          </button>
                        ))}
                      </div>
                      {a.objectives.some((o) => o.owner === team.me) && (
                        <button
                          className="text-button"
                          disabled={busy}
                          onClick={() => act("release")}
                        >
                          Change my responsibility
                        </button>
                      )}
                      <div className="soft-note">
                        <strong>What makes this a team mission?</strong>
                        <p>
                          Stand on pressure plate A to open gate A. Hold it
                          while your teammate collects the pump and comes back
                          through. Leaving closes the gate. No charges or
                          activation button.
                        </p>
                      </div>
                      <button
                        className="button primary"
                        disabled={
                          busy ||
                          a.objectives.some((o) => !o.owner) ||
                          a.rosterReady.includes(team.me)
                        }
                        onClick={() => act("brief-ready")}
                      >
                        {a.rosterReady.includes(team.me)
                          ? "Waiting for teammates…"
                          : "Ready to begin"}
                      </button>
                      <p className="tiny">
                        3 energy to start. +3 each new round, stored up to 6. No
                        quiz or conversation score.
                      </p>
                    </>
                  )}
                  {a.phase === "coordination" && (
                    <>
                      <div className="eyebrow">
                        TEAM PLANNING · ROUND {a.round}
                      </div>
                      <h2>Agree on the next move.</h2>
                      <p>
                        You have <strong>{r.energy} energy</strong>. Check the
                        map, share what you need, and agree who will hold the
                        pressure plate.
                      </p>
                      <div className="plate-control">
                        <span className="link-badge">A</span>
                        <strong>
                          {holders.length
                            ? "Gate A is open"
                            : "Gate A is closed"}
                        </strong>
                        <p>
                          {same(position(r), PRESSURE_PLATE)
                            ? "You are standing on plate A. Queue no moves to keep the gate open. Leave only when your teammate is clear."
                            : "Plate A is at column 6, row 8. Gate A is at column 4, row 8. Anyone standing on the plate holds the gate open."}
                        </p>
                        <small>
                          Holding costs no energy. No button to activate.
                        </small>
                      </div>
                      <div className="give-list">
                        {a.robots
                          .filter((x) => x.id !== team.me)
                          .map((other) => (
                            <div key={other.id}>
                              <span>
                                <strong>{name(other.id)}</strong>
                                <small>ϟ {other.energy} / 6</small>
                              </span>
                              <button
                                className="button outline compact"
                                disabled={
                                  busy ||
                                  r.donated ||
                                  r.energy < 1 ||
                                  other.energy >= 6
                                }
                                onClick={() => act("give", { to: other.id })}
                              >
                                {r.donated
                                  ? "Shared this round"
                                  : "Give 1 energy"}
                              </button>
                            </div>
                          ))}
                      </div>
                      {!a.swap &&
                        a.objectives
                          .filter(
                            (o) =>
                              o.owner === team.me && o.status === "waiting",
                          )
                          .map((o) => (
                            <details key={o.id}>
                              <summary>
                                Offer your {o.name.toLowerCase()} task
                              </summary>
                              <p>
                                They can accept or decline. This transfers
                                responsibility, not cargo.
                              </p>
                              {a.robots
                                .filter((x) => x.id !== team.me)
                                .map((other) => (
                                  <button
                                    key={other.id}
                                    className="text-button"
                                    disabled={busy}
                                    onClick={() =>
                                      act("swap-request", {
                                        objective: o.id,
                                        to: other.id,
                                      })
                                    }
                                  >
                                    Offer to {name(other.id)}
                                  </button>
                                ))}
                            </details>
                          ))}
                      <button
                        className="button primary"
                        disabled={
                          busy || !!a.swap || a.rosterReady.includes(team.me)
                        }
                        onClick={() => act("coord-ready")}
                      >
                        {a.rosterReady.includes(team.me)
                          ? "Waiting for the team…"
                          : "Ready to plan my route"}
                      </button>
                      <p className="tiny">
                        {a.rosterReady.length}/{a.roster.length} ready. Changed
                        energy or jobs reset readiness.
                      </p>
                    </>
                  )}
                  {a.phase === "planning" && (
                    <>
                      <div className="eyebrow">CHOOSE YOUR ROUTE</div>
                      <h2>
                        {same(position(r), PRESSURE_PLATE)
                          ? "Hold the plate or move on?"
                          : "Make each step count."}
                      </h2>
                      <p>
                        Queue up to {r.energy} moves. Gate A is currently{" "}
                        {holders.length ? "open" : "closed"}.
                      </p>
                      <p className="soft-note">
                        Preview assumes teammates stay put. Everyone moves one
                        step at a time; arriving on plate A opens the gate,
                        leaving closes it on that same step.
                      </p>
                      <div className="energy-display">
                        <span>AVAILABLE ENERGY</span>
                        <strong>
                          ϟ {r.energy}
                          <small> / 6</small>
                        </strong>
                      </div>
                      <div className="direction-pad">
                        {directions.map(([dir, Icon]) => (
                          <button
                            key={dir}
                            className={`dir-${dir}`}
                            aria-label={`Queue ${dir}`}
                            disabled={
                              busy || r.ready || queue.length >= r.energy
                            }
                            onClick={() => setQueue((q) => [...q, dir])}
                          >
                            <Icon size={23} />
                          </button>
                        ))}
                      </div>
                      <div className="move-queue" aria-label="Planned moves">
                        {queue.length ? (
                          queue.map((dir, i) => (
                            <span key={i}>
                              {
                                { up: "↑", down: "↓", left: "←", right: "→" }[
                                  dir
                                ]
                              }
                              <small>{i + 1}</small>
                            </span>
                          ))
                        ) : (
                          <p>
                            {same(position(r), PRESSURE_PLATE)
                              ? "Stay on plate A to hold gate A open."
                              : "No moves queued. Unspent energy carries over."}
                          </p>
                        )}
                      </div>
                      <div className="queue-tools">
                        <button
                          className="text-button"
                          disabled={r.ready || !queue.length}
                          onClick={() => setQueue((q) => q.slice(0, -1))}
                        >
                          <Undo2 size={14} /> Undo
                        </button>
                        <button
                          className="text-button"
                          disabled={r.ready || !queue.length}
                          onClick={() => setQueue([])}
                        >
                          Clear
                        </button>
                      </div>
                      {previewMission(a, r.id, queue).collision && (
                        <div className="warning">
                          Blocked route: costs 1 energy, rolls back one step and
                          cancels the remaining moves.
                        </div>
                      )}
                      <button
                        className="button primary"
                        disabled={busy || r.ready}
                        onClick={() => act("moves", { moves: queue })}
                      >
                        {r.ready
                          ? "Route locked · waiting…"
                          : queue.length
                            ? "Lock in my route"
                            : same(position(r), PRESSURE_PLATE)
                              ? "Stay here & hold gate A"
                              : "Stay here & save energy"}
                      </button>
                      <p className="tiny">
                        {a.robots.filter((x) => x.ready).length}/
                        {a.roster.length} routes ready. Routes resolve together.
                      </p>
                    </>
                  )}
                  {a.phase === "round-end" && (
                    <>
                      <div className="eyebrow">REVIEW AND ADAPT</div>
                      <h2>Round {a.round} complete.</h2>
                      <p>
                        {
                          a.objectives.filter((o) => o.status === "delivered")
                            .length
                        }
                        /{a.objectives.length} components delivered.{" "}
                        {8 - a.round} rounds left.
                      </p>
                      <div className="round-log">
                        {a.log.length ? (
                          a.log.map((line, i) => (
                            <p key={i}>
                              {team.members.reduce(
                                (s, m) => s.replaceAll(m.id, m.name),
                                line,
                              )}
                            </p>
                          ))
                        ) : (
                          <p>Positions saved. Check your team’s next move.</p>
                        )}
                      </div>
                      {a.paused ? (
                        <>
                          <div className="soft-note">
                            The team is taking a break. No countdown.
                          </div>
                          <button
                            className="button primary"
                            disabled={busy || a.resumes.includes(team.me)}
                            onClick={() => act("resume")}
                          >
                            {a.resumes.includes(team.me)
                              ? "Waiting for everyone…"
                              : "I’m ready to resume"}
                          </button>
                        </>
                      ) : (
                        <button
                          className="button primary"
                          disabled={busy || a.rosterReady.includes(team.me)}
                          onClick={() => act("next")}
                        >
                          {a.rosterReady.includes(team.me)
                            ? "Waiting for the team…"
                            : "Next round · +3 energy each"}
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </section>
          </div>
          {r && (
            <div className="mission-bottom">
              <div className="quick-messages">
                <button
                  disabled={busy || pending || r.energy >= 6}
                  onClick={() => act("energy-request")}
                >
                  <Zap size={13} />
                  {pending ? "Energy request pending" : "Request 1 energy"}
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    act("message", { text: "Not ready yet—please wait." })
                  }
                >
                  Not ready yet
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    act("message", { text: "I can help. What do you need?" })
                  }
                >
                  I can help
                </button>
                <button
                  disabled={busy}
                  onClick={() => act("message", { text: "Nice teamwork!" })}
                >
                  Nice teamwork!
                </button>
              </div>
              <div className="bottom-controls">
                <button
                  className="text-button"
                  disabled={busy || a.pauseRequested}
                  onClick={() => act("pause")}
                >
                  <Pause size={14} />
                  {a.pauseRequested
                    ? "Break requested"
                    : "Break after this round"}
                </button>
                {team.owner === team.me && (
                  <button className="text-button muted" onClick={onRetreat}>
                    End this attempt
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
