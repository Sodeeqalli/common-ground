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
          <h1>Greenhouse</h1>
        </div>
        <button className="button outline compact" onClick={onRules}>
          Rules
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
          <h2>
            {a.phase === "success" ? "Mission complete" : "Mission ended"}
          </h2>
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
            <details className="round-log">
              <summary>Round log</summary>
              {a.log.map((line, i) => (
                <p key={i}>
                  {team.members.reduce(
                    (s, m) => s.replaceAll(m.id, m.name),
                    line,
                  )}
                </p>
              ))}
            </details>
          )}
          <button className="button primary" onClick={onWorld}>
            Our world <ArrowRight size={16} />
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
                      ? holders.map((r) => name(r.id)).join(", ")
                      : "Plate empty"}
                  </p>
                </div>
              </div>
              <div className="ping-toolbar">
                <MapPin size={16} />
                <span>Ping:</span>
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
                <h3>Tasks</h3>
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
                  <h2>Spectating</h2>
                </>
              ) : (
                <>
                  {a.phase === "briefing" && (
                    <>
                      <h2>Choose a task</h2>
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
                                    : "Available"}
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
                          Change task
                        </button>
                      )}
                      <button
                        className="button primary"
                        disabled={
                          busy ||
                          a.objectives.some((o) => !o.owner) ||
                          a.rosterReady.includes(team.me)
                        }
                        onClick={() => act("brief-ready")}
                      >
                        {a.rosterReady.includes(team.me) ? "Waiting…" : "Ready"}
                      </button>
                    </>
                  )}
                  {a.phase === "coordination" && (
                    <>
                      <h2>Plan together</h2>
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
                              <p>Transfers the task, not the item.</p>
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
                        {a.rosterReady.includes(team.me) ? "Waiting…" : "Ready"}
                      </button>
                      <p className="tiny">
                        {a.rosterReady.length}/{a.roster.length} ready
                      </p>
                    </>
                  )}
                  {a.phase === "planning" && (
                    <>
                      <h2>Your route</h2>
                      <p className="tiny">
                        Preview assumes teammates stay put.
                      </p>
                      <div className="energy-display">
                        <span>Energy</span>
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
                              ? "Holding plate A"
                              : "No moves"}
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
                          Blocked: −1 energy, back one step. Route stops.
                        </div>
                      )}
                      <button
                        className="button primary"
                        disabled={busy || r.ready}
                        onClick={() => act("moves", { moves: queue })}
                      >
                        {r.ready
                          ? "Locked · waiting…"
                          : queue.length
                            ? "Lock route"
                            : same(position(r), PRESSURE_PLATE)
                              ? "Hold plate A"
                              : "Stay"}
                      </button>
                      <p className="tiny">
                        {a.robots.filter((x) => x.ready).length}/
                        {a.roster.length} ready
                      </p>
                    </>
                  )}
                  {a.phase === "round-end" && (
                    <>
                      <h2>Round {a.round} complete</h2>
                      <p>
                        {
                          a.objectives.filter((o) => o.status === "delivered")
                            .length
                        }
                        /{a.objectives.length} delivered · {8 - a.round} rounds
                        left
                      </p>
                      <details className="round-log">
                        <summary>Round log</summary>
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
                          <p>No changes.</p>
                        )}
                      </details>
                      {a.paused ? (
                        <>
                          <div className="soft-note">Paused</div>
                          <button
                            className="button primary"
                            disabled={busy || a.resumes.includes(team.me)}
                            onClick={() => act("resume")}
                          >
                            {a.resumes.includes(team.me)
                              ? "Waiting…"
                              : "Resume"}
                          </button>
                        </>
                      ) : (
                        <button
                          className="button primary"
                          disabled={busy || a.rosterReady.includes(team.me)}
                          onClick={() => act("next")}
                        >
                          {a.rosterReady.includes(team.me)
                            ? "Waiting…"
                            : "Next round · +3 energy"}
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
                  {a.pauseRequested ? "Break requested" : "Request break"}
                </button>
                {team.owner === team.me && (
                  <button className="text-button muted" onClick={onRetreat}>
                    End mission
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
