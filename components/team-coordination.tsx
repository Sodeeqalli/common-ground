"use client";
import { useEffect, useState } from "react";
import {
  MessageCircle,
  Zap,
  Check,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  STRATEGY_SIGNALS,
  PLATE_SIGNALS,
  REQUEST_SIGNALS,
  signalLabel,
  type SignalKind,
  type Team,
} from "../shared/game";
type Props = {
  team: Team & { me: string };
  busy: boolean;
  quiet: boolean;
  onAction: (
    type: string,
    args?: Record<string, unknown>,
  ) => Promise<boolean | void>;
};
export default function TeamRequests({ team, busy, quiet, onAction }: Props) {
  const a = team.attempt,
    r = a?.robots.find((r) => r.id === team.me),
    active = !!a && !["success", "ended"].includes(a.phase);
  const requests = (team.energyRequests || []).filter(
    (q) => q.attemptId === a?.id,
  );
  const pending = requests.filter((q) => q.status === "pending");
  const completed = requests.filter((q) => q.status !== "pending").slice(-2);
  const name = (id: string) =>
    team.members.find((m) => m.id === id)?.name || "Teammate";
  return (
    <>
      {(pending.length > 0 || a?.pauseRequested || completed.length > 0) && (
        <section
          className="team-inbox"
          aria-label="Team requests"
          aria-live={quiet ? "off" : "polite"}
        >
          <div className="inbox-title">
            <MessageCircle size={16} />
            <strong>Team requests</strong>
            <span>{pending.length} pending</span>
          </div>
          {pending.map((q) => (
            <div className="request-card" key={q.id}>
              <Zap size={20} />
              <div>
                <strong>
                  {q.from === team.me
                    ? "You requested 1 energy"
                    : `${name(q.from)} needs 1 energy`}
                </strong>
                <p>
                  {a?.phase === "coordination"
                    ? ""
                    : "Available next planning phase."}
                  {q.passedBy.length > 0 &&
                    ` ${q.passedBy.map(name).join(", ")} cannot spare one right now.`}
                </p>
              </div>
              <div className="request-buttons">
                {q.from === team.me ? (
                  <button
                    disabled={busy || !active}
                    onClick={() =>
                      onAction("request-response", {
                        request: q.id,
                        response: "cancel",
                      })
                    }
                  >
                    Cancel request
                  </button>
                ) : (
                  r && (
                    <>
                      <button
                        className="button primary compact"
                        disabled={
                          busy ||
                          !active ||
                          a?.phase !== "coordination" ||
                          r.donated ||
                          r.energy < 1 ||
                          (a.robots.find((x) => x.id === q.from)?.energy ||
                            0) >= 6
                        }
                        onClick={() =>
                          onAction("give", { to: q.from, request: q.id })
                        }
                      >
                        Give 1 energy
                      </button>
                      <button
                        disabled={
                          busy || !active || q.passedBy.includes(team.me)
                        }
                        onClick={() =>
                          onAction("request-response", {
                            request: q.id,
                            response: "not-now",
                          })
                        }
                      >
                        {q.passedBy.includes(team.me)
                          ? "Replied: not now"
                          : "Not now"}
                      </button>
                    </>
                  )
                )}
              </div>
            </div>
          ))}
          {a?.pauseRequested && active && (
            <p className="request-status">
              A teammate requested a break.{" "}
              {a.paused ? "Waiting to resume." : "Pause after this round."}
            </p>
          )}
          {completed.map((q) => (
            <p key={q.id} className="request-status">
              <Check size={13} />
              {q.status === "fulfilled"
                ? `${name(q.fulfilledBy!)} gave 1 energy to ${name(q.from)}.`
                : q.status === "unavailable"
                  ? `No teammate can spare energy for ${name(q.from)} right now.`
                  : `${name(q.from)} cancelled their energy request.`}
            </p>
          ))}
        </section>
      )}
    </>
  );
}

export function TeamSignals({ team, busy, quiet, onAction }: Props) {
  const a = team.attempt;
  const [cooling, setCooling] = useState(false);
  const [plate, setPlate] = useState("A");
  const own = team.signals?.find(
    (s) =>
      s.member === team.me && s.attemptId === a?.id && s.round === a?.round,
  );
  const sentAt = team.signalSentAt?.[team.me] || 0;
  useEffect(() => {
    const remaining = Math.max(0, sentAt + 2000 - Date.now());
    setCooling(remaining > 0);
    const timeout = setTimeout(() => setCooling(false), remaining);
    return () => clearTimeout(timeout);
  }, [sentAt]);
  if (!a || ["success", "ended"].includes(a.phase)) return null;
  const playing = a.roster.includes(team.me);
  const name = (id: string) =>
    team.members.find((m) => m.id === id)?.name || "Teammate";
  return (
    <section className="strategy-signals" aria-label="Strategy signals">
      <div className="signals-heading">
        <h3>Signals</h3>
        {playing && (
          <label className="plate-picker">
            Plate{" "}
            <select
              aria-label="Plate letter"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
            >
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                <option key={letter}>{letter}</option>
              ))}
            </select>
          </label>
        )}
      </div>
      {playing && (
        <div className="signal-buttons">
          {(Object.entries(STRATEGY_SIGNALS) as [SignalKind, string][]).map(
            ([kind]) => (
              <button
                key={kind}
                disabled={busy || cooling}
                aria-pressed={
                  own?.kind === kind &&
                  (!PLATE_SIGNALS.includes(kind) ||
                    (own.plate || "A") === plate)
                }
                onClick={() =>
                  onAction("signal", {
                    kind,
                    ...(PLATE_SIGNALS.includes(kind) ? { plate } : {}),
                  })
                }
              >
                {signalLabel(kind, plate)}
              </button>
            ),
          )}
        </div>
      )}
      <div
        className="signal-list"
        aria-live={quiet ? "off" : "polite"}
        aria-relevant="additions text"
      >
        {a.roster.map((id) => {
          const signal = team.signals?.find(
            (s) =>
              s.member === id && s.attemptId === a.id && s.round === a.round,
          );
          if (!signal) return null;
          return (
            <div className="signal-row" key={id}>
              <div>
                <strong>{name(id)}</strong>
                <span>{signalLabel(signal.kind, signal.plate)}</span>
                {Object.entries(signal.responses || {}).map(
                  ([who, response]) => (
                    <small key={who}>
                      {name(who)}: {response === "yes" ? "Yes" : "No"}
                    </small>
                  ),
                )}
                {signal.acknowledgedBy.length > 0 && (
                  <small>
                    Seen by {signal.acknowledgedBy.map(name).join(", ")}
                  </small>
                )}
              </div>
              {id === team.me ? (
                <button
                  disabled={busy}
                  onClick={() => onAction("signal-clear")}
                >
                  Clear
                </button>
              ) : (
                playing &&
                (REQUEST_SIGNALS.includes(signal.kind) ? (
                  <div className="signal-replies">
                    {(["yes", "no"] as const).map((response) => (
                      <button
                        key={response}
                        disabled={busy}
                        aria-pressed={signal.responses?.[team.me] === response}
                        onClick={() =>
                          onAction("signal-reply", {
                            signal: signal.id,
                            response,
                          })
                        }
                      >
                        {response === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    disabled={busy || signal.acknowledgedBy.includes(team.me)}
                    onClick={() =>
                      onAction("signal-ack", { signal: signal.id })
                    }
                  >
                    {signal.acknowledgedBy.includes(team.me)
                      ? "Seen"
                      : "Got it"}
                  </button>
                ))
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function FreeChat({ team, busy, quiet, onAction }: Props) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [cooling, setCooling] = useState(false);
  const latestOwn = [...team.messages]
    .reverse()
    .find((m) => m.member === team.me)?.at;
  useEffect(() => {
    const remaining = latestOwn
      ? Math.max(0, Date.parse(latestOwn) + 2000 - Date.now())
      : 0;
    setCooling(remaining > 0);
    const timer = setTimeout(() => setCooling(false), remaining);
    return () => clearTimeout(timer);
  }, [latestOwn]);
  return (
    <section
      className={`optional-chat chat-dock ${open ? "is-open" : ""}`}
      aria-label="Free chat"
      data-scroll-panel
    >
      <button
        className="chat-toggle"
        aria-expanded={open}
        aria-controls="free-chat-panel"
        onClick={() => setOpen(!open)}
      >
        <MessageCircle size={18} />
        <span>Free chat</span>
        {open ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
      {open && (
        <div id="free-chat-panel" className="chat-dock-body">
          <p className="chat-note">
            Only players with Free chat on see messages.
          </p>
          <div
            className="optional-chat-history"
            role="log"
            aria-label="Free chat messages"
            aria-live={quiet ? "off" : "polite"}
          >
            {team.messages.slice(-20).map((message, i) => (
              <p key={message.id || i}>
                <strong>
                  {team.members.find((m) => m.id === message.member)?.name ||
                    "Teammate"}
                </strong>
                <span>{message.text}</span>
              </p>
            ))}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!draft.trim() || busy || cooling) return;
              if (await onAction("message", { text: draft.trim() }))
                setDraft("");
            }}
          >
            <label htmlFor="optional-team-message">Message</label>
            <textarea
              id="optional-team-message"
              rows={2}
              maxLength={280}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              className="button outline compact"
              disabled={busy || cooling || !draft.trim()}
              type="submit"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
