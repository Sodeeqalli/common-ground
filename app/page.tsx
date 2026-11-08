"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clipboard,
  Map as MapIcon,
  Settings2,
  X,
  Home,
  Plus,
  LogOut,
  Sprout,
  Lock,
  LoaderCircle,
} from "lucide-react";
import WorldArt, { RobotArt, WorldContributors } from "../components/world-art";
import MissionControl from "../components/mission-control";
import TeamRequests, { FreeChat } from "../components/team-coordination";
import { readinessContext, type Team, type Direction } from "../shared/game";
type View = Team & { me: string };
type Screen = "world" | "mission";
function Button({
  children,
  onClick,
  disabled = false,
  kind = "primary",
  className = "",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  kind?: string;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      className={`button ${kind} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
export default function CommonGround() {
  const [token, setToken] = useState(""),
    [loaded, setLoaded] = useState(false),
    [team, setTeam] = useState<View | null>(null),
    [screen, setScreen] = useState<Screen>("world");
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [auth, setAuth] = useState<"create" | "join" | null>(null),
    [alias, setAlias] = useState(""),
    [name, setName] = useState(""),
    [code, setCode] = useState("");
  const [settings, setSettings] = useState(false),
    [motion, setMotion] = useState(false),
    [quiet, setQuiet] = useState(false),
    [large, setLarge] = useState(false),
    [sound, setSound] = useState(false),
    [freeChat, setFreeChat] = useState(false);
  const [launch, setLaunch] = useState(false),
    [selected, setSelected] = useState<string[]>([]),
    [queue, setQueue] = useState<Direction[]>([]),
    [rules, setRules] = useState(false);
  const [connected, setConnected] = useState(true),
    [retreat, setRetreat] = useState(false);
  const modalOpen = !!(auth || launch || settings || rules || retreat);
  useEffect(() => {
    if (!modalOpen) return;
    const prior = document.activeElement as HTMLElement | null;
    const modal = document.querySelector<HTMLElement>('[role="dialog"]');
    const focusable = () =>
      Array.from(
        modal?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), [href], [tabindex="0"]',
        ) || [],
      );
    if (!modal?.contains(document.activeElement)) focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAuth(null);
        setLaunch(false);
        setSettings(false);
        setRules(false);
        setRetreat(false);
      }
      if (event.key === "Tab") {
        const items = focusable();
        if (event.shiftKey && document.activeElement === items[0]) {
          event.preventDefault();
          items.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
          event.preventDefault();
          items[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prior?.focus();
    };
  }, [modalOpen, auth, launch, settings, rules, retreat]);
  useEffect(() => {
    setToken(localStorage.getItem("cg-member") || "");
    try {
      const s = JSON.parse(localStorage.getItem("cg-settings") || "{}");
      setMotion(
        s.motion ?? matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      setQuiet(!!s.quiet);
      setLarge(!!s.large);
      setSound(!!s.sound);
      setFreeChat(!!s.freeChat);
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded)
      localStorage.setItem(
        "cg-settings",
        JSON.stringify({ motion, quiet, large, sound, freeChat }),
      );
  }, [motion, quiet, large, sound, freeChat, loaded]);
  const accept = (next: View) =>
    setTeam((old) =>
      !old || old.id !== next.id || next.version >= old.version ? next : old,
    );
  useEffect(() => {
    if (!token) return;
    let active = true;
    const poll = async () => {
      try {
        const r = await fetch("/api/game", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await r.json()) as View & {
          error?: string;
          token: string;
          team: View;
        };
        if (!active) return;
        if (r.status === 401) {
          setToken("");
          localStorage.removeItem("cg-member");
          setTeam(null);
          setError(
            "Your local membership could not be found. Please join again.",
          );
          return;
        }
        if (r.ok) {
          accept(data);
          setConnected(true);
        } else setConnected(false);
      } catch {
        if (active) setConnected(false);
      }
    };
    void poll();
    const timer = setInterval(poll, 1500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [token]);
  const a = team?.attempt,
    me = team?.members.find((m) => m.id === team.me),
    robot = a?.robots.find((r) => r.id === team?.me);
  const enteredMission = useRef("");
  useEffect(() => {
    if (!a || ["success", "ended"].includes(a.phase)) return;
    if (robot && (enteredMission.current !== a.id || launch))
      setScreen("mission");
    enteredMission.current = a.id;
    setLaunch(false);
  }, [a?.id, a?.phase, robot?.id, launch]);
  useEffect(() => {
    setQueue([]);
  }, [a?.id, a?.round, a?.phase]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);
  async function refresh() {
    if (!token) return;
    const r = await fetch("/api/game", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (r.ok) accept((await r.json()) as View);
  }
  function chime() {
    if (!sound) return;
    try {
      const ac = new AudioContext(),
        osc = ac.createOscillator(),
        gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      gain.gain.setValueAtTime(0.035, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
      osc.frequency.value = 440;
      osc.start();
      osc.stop(ac.currentTime + 0.2);
      osc.onended = () => void ac.close();
    } catch {}
  }
  async function act(type: string, extra: Record<string, unknown> = {}) {
    if (!team || busy) return false;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          version: team.version,
          attemptId: a?.id,
          round: a?.round,
          phase: a?.phase,
          readyContext: a ? readinessContext(a) : undefined,
          requestId: crypto.randomUUID(),
          ...extra,
        }),
      });
      const data = (await r.json()) as View & {
        error?: string;
        token: string;
        team: View;
      };
      if (!r.ok) {
        if (r.status === 409) await refresh();
        throw new Error(data.error || "Please try again.");
      }
      accept(data);
      if (type === "new-mission") {
        setScreen("mission");
        setLaunch(false);
      }
      if (
        ![
          "signal",
          "signal-ack",
          "signal-reply",
          "signal-clear",
          "ping",
          "message",
        ].includes(type)
      )
        chime();
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to update the mission.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function submitAuth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: auth, alias, name, code }),
      });
      const data = (await r.json()) as View & {
        error?: string;
        token: string;
        team: View;
      };
      if (!r.ok) throw new Error(data.error || "Unable to join.");
      localStorage.setItem("cg-member", data.token);
      setToken(data.token);
      setTeam(data.team);
      setAuth(null);
      setScreen("world");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to join.");
    } finally {
      setBusy(false);
    }
  }
  function launchMission() {
    if (!team) {
      setAuth("create");
      return;
    }
    setSelected(team.members.slice(0, 4).map((m) => m.id));
    setLaunch(true);
  }
  function add(dir: Direction) {
    if (robot && !robot.ready && queue.length < robot.energy)
      setQueue((q) => [...q, dir]);
  }
  useEffect(() => {
    if (screen !== "mission" || a?.phase !== "planning") return;
    const handler = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).closest("input,textarea,select,button") ||
        settings ||
        rules
      )
        return;
      const dir = (
        {
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
        } as Record<string, Direction>
      )[e.key];
      if (dir) {
        e.preventDefault();
        add(dir);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  const restored = !!team?.restored.includes("greenhouse");
  return (
    <div
      className={`app-shell ${motion ? "reduced-motion" : ""} ${large ? "large-text" : ""}`}
    >
      <header className="topbar" inert={modalOpen}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setScreen("world");
          }}
        >
          <span className="brand-mark">
            <Sprout size={23} />
          </span>
          <span>
            common ground<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="top-right">
          <button
            className="icon-button"
            aria-label="Open comfort settings"
            onClick={() => setSettings(true)}
          >
            <Settings2 size={19} />
          </button>
          {me && (
            <span className="profile">
              <RobotArt color={me.color} small />
              <span>{me.name}</span>
            </span>
          )}
        </div>
      </header>
      <div className="app-body" inert={modalOpen}>
        <aside className="sidebar">
          <nav aria-label="Game modes">
            <button
              className={screen === "world" ? "nav-item active" : "nav-item"}
              onClick={() => setScreen("world")}
            >
              <Home size={19} />
              <span>Our world</span>
              {restored && <span className="nav-count">1</span>}
            </button>
            <button
              className={screen === "mission" ? "nav-item active" : "nav-item"}
              onClick={() => (a ? setScreen("mission") : launchMission())}
            >
              <MapIcon size={19} />
              <span>Team missions</span>
              {a && !["success", "ended"].includes(a.phase) && (
                <span className="live-dot" />
              )}
            </button>
          </nav>
          <div className="team-panel">
            <span className="sidebar-label">
              {team ? "Team" : "Play together"}
            </span>
            <h3>{team?.name || "Your team"}</h3>
            {team ? (
              <>
                <div className="member-stack">
                  {team.members.slice(0, 4).map((m) => (
                    <span
                      key={m.id}
                      style={{ background: m.color + "20" }}
                      title={m.name}
                    >
                      <RobotArt color={m.color} small />
                    </span>
                  ))}
                  <small>{team.members.length} members</small>
                </div>
                <button
                  className="invite-code"
                  onClick={() =>
                    navigator.clipboard
                      .writeText(team.code)
                      .then(() => setNotice("Code copied."))
                      .catch(() => setNotice(`Team code: ${team.code}`))
                  }
                >
                  <span>
                    <small>Invite code</small>
                    <strong>{team.code}</strong>
                  </span>
                  <Clipboard size={15} />
                </button>
              </>
            ) : (
              <>
                <Button kind="outline" onClick={() => setAuth("create")}>
                  Create a team <Plus size={15} />
                </Button>
                <button className="text-button" onClick={() => setAuth("join")}>
                  Join a team <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
        </aside>
        <main id="main-content">
          <div className="status-line">
            <span className="breadcrumb">
              {team?.name || "Common Ground"} <ChevronRight size={13} />{" "}
              {screen === "world" ? "Our world" : "Greenhouse"}
            </span>
            {team && (
              <span className={`connection ${connected ? "" : "offline"}`}>
                <i />
                {connected ? "Connected" : "Reconnecting…"}
              </span>
            )}
          </div>
          {team && (
            <div className="mobile-team-bar">
              <span>
                {team.name} · {team.members.length} members
              </span>
              <button
                onClick={() =>
                  navigator.clipboard
                    .writeText(team.code)
                    .then(() => setNotice("Team code copied."))
                    .catch(() => setNotice(team.code))
                }
              >
                Invite: {team.code} <Clipboard size={12} />
              </button>
            </div>
          )}
          {team && (
            <TeamRequests
              team={team}
              busy={busy}
              quiet={quiet}
              onAction={act}
            />
          )}
          {error && (
            <div role="alert" className="alert">
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="toast">
              {notice}
            </div>
          )}
          {screen === "world" && (
            <>
              <section className="picture-heading">
                <h1>Our world</h1>
                <span className="picture-progress">
                  {team?.restored.length || 0} / 4 <span>complete</span>
                </span>
              </section>
              <section className="world-picture" aria-label="World progress">
                <WorldArt restored={team?.restored || []} />
                {team && team.restored.length > 0 && (
                  <WorldContributors team={team} />
                )}
              </section>
              <section className="world-missions" aria-label="Missions">
                <div className="world-mission available">
                  <span className="mission-number">01</span>
                  <div>
                    <h2>
                      Greenhouse{" "}
                      {restored && <Check size={16} aria-label="Complete" />}
                    </h2>
                    <small>2–4 players · 8 rounds</small>
                  </div>
                  <Button
                    onClick={() =>
                      a && !["success", "ended"].includes(a.phase)
                        ? setScreen("mission")
                        : launchMission()
                    }
                  >
                    {a && !["success", "ended"].includes(a.phase)
                      ? "Continue"
                      : restored
                        ? "Replay"
                        : "Play"}
                    <ArrowRight size={16} />
                  </Button>
                </div>
                {[
                  ["02", "Power station"],
                  ["03", "Bridge"],
                  ["04", "Workshop"],
                ].map(([n, name]) => (
                  <div
                    className="world-mission locked"
                    key={n}
                    aria-label={`${name}: unavailable`}
                    title="Not available yet"
                  >
                    <span className="mission-number">{n}</span>
                    <h2>{name}</h2>
                    <Lock size={15} aria-hidden="true" />
                  </div>
                ))}
              </section>
            </>
          )}
          {screen === "mission" && a && team && (
            <MissionControl
              reducedMotion={motion}
              quiet={quiet}
              team={team}
              busy={busy}
              queue={queue}
              setQueue={setQueue}
              act={act}
              onRules={() => setRules(true)}
              onRetreat={() => setRetreat(true)}
              onWorld={() => setScreen("world")}
            />
          )}
          {screen === "mission" && !a && (
            <div className="empty-state">
              <Sprout size={48} />
              <h1>Team mission</h1>
              <p>Join a team to play.</p>
              <Button onClick={launchMission}>Choose team</Button>
            </div>
          )}
          {team && freeChat && (
            <FreeChat team={team} busy={busy} quiet={quiet} onAction={act} />
          )}
        </main>
      </div>
      {auth && (
        <div className="modal-backdrop" onClick={() => setAuth(null)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={auth === "create" ? "Create a team" : "Join a team"}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              aria-label="Close"
              onClick={() => setAuth(null)}
            >
              <X size={20} />
            </button>
            <Sprout className="modal-leaf" size={32} />
            <h2>{auth === "create" ? "Create a team" : "Join a team"}</h2>
            <form onSubmit={submitAuth}>
              <label>
                Your robot name
                <input
                  autoFocus
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  maxLength={24}
                  placeholder="e.g. Sodeeq"
                  required
                />
              </label>
              {auth === "create" ? (
                <label>
                  Team name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={40}
                    placeholder="e.g. The Greenhouse Crew"
                    required
                  />
                </label>
              ) : (
                <label>
                  Team invite code
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="12-character team code"
                    required
                    autoCapitalize="characters"
                  />
                </label>
              )}
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <LoaderCircle className="spin" size={17} />
                ) : auth === "create" ? (
                  "Create team"
                ) : (
                  "Join team"
                )}
                <ArrowRight size={16} />
              </Button>
            </form>
            <button
              className="text-button"
              onClick={() => setAuth(auth === "create" ? "join" : "create")}
            >
              {auth === "create" ? "Join instead" : "Create instead"}
            </button>
            <p className="tiny">Adults · Use a nickname.</p>
          </section>
        </div>
      )}
      {launch && team && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Choose expedition team"
          >
            <button
              className="close"
              aria-label="Close"
              onClick={() => setLaunch(false)}
            >
              <X size={20} />
            </button>
            <h2>
              {team.owner === team.me ? "Choose players" : "Waiting for host"}
            </h2>
            {team.owner === team.me && <p>2–4 players</p>}
            {team.members.map((m) => (
              <label className="roster-choice" key={m.id}>
                {team.owner === team.me && (
                  <input
                    type="checkbox"
                    checked={selected.includes(m.id)}
                    disabled={m.id === team.me}
                    onChange={(e) =>
                      setSelected((ids) =>
                        e.target.checked
                          ? [...ids, m.id]
                          : ids.filter((id) => id !== m.id),
                      )
                    }
                  />
                )}
                <RobotArt small color={m.color} />
                <span>
                  {m.name}
                  {m.id === team.me ? " · you" : ""}
                </span>
              </label>
            ))}
            {team.members.length < 2 && (
              <div className="soft-note">
                Invite a teammate: <strong>{team.code}</strong>
              </div>
            )}
            {team.owner === team.me && (
              <Button
                disabled={busy || selected.length < 2 || selected.length > 4}
                onClick={() => act("new-mission", { roster: selected })}
              >
                Start mission <ArrowRight size={16} />
              </Button>
            )}
          </section>
        </div>
      )}
      {settings && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Comfort settings"
          >
            <button
              className="close"
              aria-label="Close"
              onClick={() => setSettings(false)}
            >
              <X size={20} />
            </button>
            <h2>Settings</h2>
            {[
              ["Reduce motion", "", motion, setMotion],
              [
                "Quiet mode",
                "Mute announcements; keep requests.",
                quiet,
                setQuiet,
              ],
              ["Larger text", "", large, setLarge],
              ["Sound effects", "", sound, setSound],
              ["Free chat", "Optional typing", freeChat, setFreeChat],
            ].map(([title, desc, on, set]) => (
              <label className="setting-row" key={String(title)}>
                <span>
                  <strong>{title as string}</strong>
                  <small>{desc as string}</small>
                </span>
                <input
                  type="checkbox"
                  checked={on as boolean}
                  onChange={(e) =>
                    (set as (v: boolean) => void)(e.target.checked)
                  }
                />
              </label>
            ))}
            <p className="tiny">
              Membership is saved in this browser. Leaving or clearing browser
              data removes it.
            </p>
            {team && (
              <button
                className="text-button muted"
                onClick={() => {
                  localStorage.removeItem("cg-member");
                  setTeam(null);
                  setToken("");
                  setSettings(false);
                  setScreen("world");
                }}
              >
                <LogOut size={15} /> Leave team on this device
              </button>
            )}
          </section>
        </div>
      )}
      {rules && (
        <div className="modal-backdrop">
          <section
            className="modal rules"
            role="dialog"
            aria-modal="true"
            aria-label="Mission rules"
          >
            <button
              className="close"
              onClick={() => setRules(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2>Rules</h2>
            <ol>
              <li>
                Deliver all components and bring everyone home within 8 rounds.
              </li>
              <li>
                1 energy per move. Start with 3; gain 3 each round. Maximum 6.
                Staying discards unused energy.
              </li>
              <li>
                Stand on plate A to open gate A. Leaving closes it. Holding is
                free.
              </li>
              <li>
                Moves resolve together, one step at a time. Plate changes apply
                before gate crossings.
              </li>
              <li>
                Blocked move: −1 energy, back one step, remaining moves
                cancelled.
              </li>
              <li>
                Share 1 energy per round. Batteries give +1 once per robot,
                after movement.
              </li>
            </ol>
            <Button onClick={() => setRules(false)}>Got it</Button>
          </section>
        </div>
      )}
      {retreat && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="End this attempt"
          >
            <h2>End mission?</h2>
            <p>This attempt will end. Completed areas stay saved.</p>
            <Button kind="outline" onClick={() => setRetreat(false)}>
              Keep going
            </Button>
            <Button
              onClick={() => {
                setRetreat(false);
                void act("retreat");
              }}
            >
              End this attempt
            </Button>
          </section>
        </div>
      )}
    </div>
  );
}
