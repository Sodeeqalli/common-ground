"use client";
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Zap, Check, ArrowRight } from "lucide-react";
import type { Team } from "../shared/game";
type Props = {
  team: Team & { me: string };
  busy: boolean;
  quiet: boolean;
  onAction: (
    type: string,
    args?: Record<string, unknown>,
  ) => Promise<boolean | void>;
};
export default function TeamChannel({ team, busy, quiet, onAction }: Props) {
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState(""),
    [seen, setSeen] = useState("");
  const history = useRef<HTMLDivElement>(null);
  const last = team.messages.at(-1)?.id || String(team.messages.length);
  useEffect(() => {
    setSeen(localStorage.getItem(`cg-chat-seen-${team.id}`) || "");
  }, [team.id]);
  useEffect(() => {
    if (open) {
      setSeen(last);
      localStorage.setItem(`cg-chat-seen-${team.id}`, last);
      const el = history.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [open, last, team.id]);
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
  const unread = !!team.messages.length && last !== seen && !open;
  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || busy) return;
    const ok = await onAction("message", { text: draft.trim() });
    if (ok) setDraft("");
  }
  return (
    <>
      {(pending.length > 0 ||
        a?.swap ||
        a?.pauseRequested ||
        completed.length > 0) && (
        <section
          className="team-inbox"
          aria-label="Team requests"
          aria-live="polite"
        >
          <div className="inbox-title">
            <MessageCircle size={16} />
            <strong>Team requests</strong>
            <span>{pending.length + (a?.swap ? 1 : 0)} pending</span>
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
          {a?.swap && (
            <div className="request-card">
              <ArrowRight size={20} />
              <div>
                <strong>
                  {name(a.swap.from)} offers{" "}
                  {a.objectives.find((o) => o.id === a.swap!.objective)?.name}{" "}
                  to {name(a.swap.to)}
                </strong>
              </div>
              <div className="request-buttons">
                {a.swap.to === team.me && (
                  <button
                    className="button primary compact"
                    disabled={busy}
                    onClick={() => onAction("swap-answer", { accept: true })}
                  >
                    Accept task
                  </button>
                )}
                {[a.swap.from, a.swap.to].includes(team.me) && (
                  <button
                    disabled={busy}
                    onClick={() => onAction("swap-answer", { accept: false })}
                  >
                    Decline / cancel
                  </button>
                )}
              </div>
            </div>
          )}
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
      <button
        className={`channel-launcher ${unread ? "unread" : ""}`}
        aria-expanded={open}
        aria-controls="team-channel"
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle size={19} />
        <span>Team chat</span>
        {unread && <b>New</b>}
        {pending.length > 0 && (
          <span className="request-count">
            {pending.length} request{pending.length === 1 ? "" : "s"}
          </span>
        )}
      </button>
      {open && (
        <section
          id="team-channel"
          className="team-channel"
          aria-label="Team chat"
        >
          <header>
            <div>
              <strong>{team.name}</strong>
            </div>
            <button aria-label="Close team chat" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </header>
          <div
            className="channel-history"
            ref={history}
            role="log"
            aria-live={quiet ? "off" : "polite"}
          >
            {!team.messages.length && (
              <p className="channel-empty">No messages yet.</p>
            )}
            {team.messages.map((m, i) => (
              <article
                key={m.id || i}
                className={m.member === team.me ? "own-message" : ""}
              >
                <div>
                  <strong>{name(m.member)}</strong>
                  <small>{m.round ? `Round ${m.round}` : "Team"}</small>
                </div>
                <p>{m.text}</p>
              </article>
            ))}
          </div>
          <form onSubmit={send}>
            <label htmlFor="team-message">Message</label>
            <textarea
              id="team-message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={280}
              rows={2}
              placeholder="Message…"
            />
            <div>
              <small>{draft.length}/280</small>
              <button
                className="button primary compact"
                disabled={busy || !draft.trim()}
                type="submit"
              >
                Send <Send size={14} />
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
