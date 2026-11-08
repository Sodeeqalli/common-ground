"use client";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Check,
  ChevronRight,
  Clipboard,
  Leaf,
  Map as MapIcon,
  Settings2,
  Users,
  X,
  RotateCcw,
  Home,
  BookOpen,
  Flag,
  Pause,
  Plus,
  LogOut,
  HeartHandshake,
  Sprout,
  Lock,
  CheckCircle2,
  LoaderCircle,
  Undo2,
} from "lucide-react";
import WorldArt, { RobotArt } from "../components/world-art";
import MissionMap from "../components/mission-map";
import MissionControl from "../components/mission-control";
import TeamChannel from "../components/team-channel";
import {
  BASE,
  position,
  preview,
  gateKeys,
  same,
  makeAttempt,
  readinessContext,
  type Team,
  type Direction,
} from "../shared/game";
type Choice = { id: string; text: string };
type Scene = {
  id: string;
  title: string;
  skill: string;
  context: string;
  goal: string;
  openingLine: string;
  startNode: string;
};
type NodeView = {
  type: string;
  text?: string;
  phrase?: string;
  prompt?: string;
  choices?: Choice[];
};
type View = Team & { me: string; scenario?: Scene; node?: NodeView };
type PracticeReply = {
  node: NodeView;
  nodeId: string;
  transcript: { who: string; text: string }[];
  explanation: string;
  error?: string;
};
type Screen = "world" | "mission" | "practice";
const directions: { dir: Direction; icon: typeof ArrowUp; key: string }[] = [
  { dir: "up", icon: ArrowUp, key: "↑" },
  { dir: "left", icon: ArrowLeft, key: "←" },
  { dir: "down", icon: ArrowDown, key: "↓" },
  { dir: "right", icon: ArrowRight, key: "→" },
];
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
    [sound, setSound] = useState(false);
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
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded)
      localStorage.setItem(
        "cg-settings",
        JSON.stringify({ motion, quiet, large, sound }),
      );
  }, [motion, quiet, large, sound, loaded]);
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
          <span className="edition">A WORLD BUILT TOGETHER</span>
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
          <div className="sidebar-label">YOUR LITTLE CORNER</div>
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
            <button
              className={screen === "practice" ? "nav-item active" : "nav-item"}
              onClick={() => setScreen("practice")}
            >
              <BookOpen size={19} />
              <span>Practice</span>
            </button>
            <div
              className="nav-item disabled"
              title="Race is planned after Team Missions"
            >
              <Flag size={19} />
              <span>Race</span>
              <span className="small-tag">LATER</span>
            </div>
          </nav>
          <div className="team-panel">
            <span className="sidebar-label">
              {team ? "YOUR TEAM" : "BETTER, TOGETHER"}
            </span>
            <h3>{team?.name || "A place for your people."}</h3>
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
                      .then(() =>
                        setNotice(
                          "Team code copied. Share it with your invited teammates.",
                        ),
                      )
                      .catch(() => setNotice(`Team code: ${team.code}`))
                  }
                >
                  <span>
                    <small>TEAM INVITE CODE</small>
                    <strong>{team.code}</strong>
                  </span>
                  <Clipboard size={15} />
                </button>
                <p className="tiny">
                  Your world stays with your team, even when you log off.
                </p>
              </>
            ) : (
              <>
                <p>
                  Make a team. Take a little time. Build something that lasts.
                </p>
                <Button kind="outline" onClick={() => setAuth("create")}>
                  Create a team <Plus size={15} />
                </Button>
                <button className="text-button" onClick={() => setAuth("join")}>
                  I have a team code <ArrowRight size={14} />
                </button>
              </>
            )}
          </div>
          <div className="sidebar-foot">
            <Leaf size={18} />
            <p>
              Different minds.
              <br />
              <strong>Common ground.</strong>
            </p>
          </div>
        </aside>
        <main id="main-content">
          <div className="status-line">
            <span className="breadcrumb">
              {team?.name || "Welcome home"} <ChevronRight size={13} />{" "}
              {screen === "world"
                ? "Our world"
                : screen === "mission"
                  ? "Greenhouse expedition"
                  : "Your own pace"}
            </span>
            {team && (
              <span className={`connection ${connected ? "" : "offline"}`}>
                <i />
                {connected ? "Team connected" : "Reconnecting…"}
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
            <TeamChannel team={team} busy={busy} quiet={quiet} onAction={act} />
          )}
          {team?.upgradeNotice && (
            <div className="soft-note">{team.upgradeNotice}</div>
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
              <section className="world-heading">
                <div>
                  <div className="eyebrow">
                    SMALL MISSIONS. SOMETHING MEANINGFUL.
                  </div>
                  <h1>
                    {restored
                      ? "Look what we built."
                      : "Every place starts\nwith a little care."}
                  </h1>
                  <p>
                    {restored
                      ? "Your greenhouse is growing. Your team made that happen."
                      : "A shared world, waiting to come to life. Find your people,\nshare the journey, and leave things a little better."}
                  </p>
                </div>
                <div className="progress-stamp">
                  <Sprout size={26} />
                  <strong>
                    {restored ? "01" : "00"}
                    <span> / 04</span>
                  </strong>
                  <small>PLACES RESTORED</small>
                </div>
              </section>
              <section className="world-scene">
                <div className="scene-label">
                  <span className="live-dot" />
                  <span>COMMON GROUND</span>
                  <small>YOUR SHARED WORLD</small>
                </div>
                <WorldArt restored={restored} />
                <div className="scene-caption">
                  <span>
                    {restored
                      ? "A little greener. A little more ours."
                      : "A quiet place with a lot of possibility."}
                  </span>
                  <span>
                    EXPLORE AT YOUR PACE <ArrowRight size={13} />
                  </span>
                </div>
              </section>
              <section className="mission-feature">
                <div className="mission-illustration">
                  <Sprout size={38} />
                  <span>01</span>
                </div>
                <div className="mission-copy">
                  <div className="eyebrow">
                    {restored
                      ? "COMPLETED TOGETHER"
                      : "YOUR FIRST TEAM MISSION"}
                  </div>
                  <h2>Bring the greenhouse back.</h2>
                  <p>
                    Hold the pressure plate, share responsibilities, and
                    retrieve the missing components before eight rounds run out.
                  </p>
                  <div className="pills">
                    <span>
                      <Users size={13} /> 2–4 players
                    </span>
                    <span>
                      <MapIcon size={13} /> Up to 8 rounds
                    </span>
                    <span>
                      <HeartHandshake size={13} /> Cooperative
                    </span>
                  </div>
                </div>
                <div className="mission-action">
                  <Button
                    onClick={() =>
                      a && !["success", "ended"].includes(a.phase)
                        ? setScreen("mission")
                        : launchMission()
                    }
                  >
                    {a && !["success", "ended"].includes(a.phase)
                      ? "Return to mission"
                      : restored
                        ? "Play mission again"
                        : "Plan our expedition"}{" "}
                    <ArrowRight size={16} />
                  </Button>
                  <small>
                    {restored
                      ? "Practice replay · progress stays saved"
                      : "No timers. No one left behind."}
                  </small>
                </div>
              </section>
              <div className="section-title">
                <h2>A world worth returning to</h2>
                <span>ONE PLACE AT A TIME</span>
              </div>
              <div className="future-grid">
                {[
                  [
                    "02",
                    "The power station",
                    "A spark for the whole neighbourhood.",
                  ],
                  ["03", "The bridge", "Make a connection to somewhere new."],
                  ["04", "The workshop", "A space to make things your own."],
                ].map(([n, t, d]) => (
                  <article className="future-card" key={n}>
                    <span className="future-number">{n}</span>
                    <Lock size={16} />
                    <h3>{t}</h3>
                    <p>{d}</p>
                    <span className="planned">PLANNED EXPEDITION</span>
                  </article>
                ))}
              </div>
              <div className="practice-strip">
                <BookOpen size={21} />
                <div>
                  <strong>A little practice, just for you.</strong>
                  <p>
                    Explore everyday conversations without a team or a score to
                    beat.
                  </p>
                </div>
                <button
                  className="text-button"
                  onClick={() => setScreen("practice")}
                >
                  Try practice <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {screen === "mission" && a && team && (
            <MissionControl
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
              <h1>Your first expedition awaits.</h1>
              <p>Create a team or join an invited group to get started.</p>
              <Button onClick={launchMission}>Plan an expedition</Button>
            </div>
          )}
          {screen === "practice" && <Practice onError={setError} />}
          <footer>
            <span>COMMON GROUND · HACK THE CHANGE 2026</span>
            <span>Research-informed practice. Not a validated therapy.</span>
          </footer>
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
            <div className="eyebrow">LET’S FIND COMMON GROUND</div>
            <h2>
              {auth === "create"
                ? "Make a place for your team."
                : "Your people are waiting."}
            </h2>
            <p>
              {auth === "create"
                ? "Give your group a name. Your shared world and progress will stay with this team."
                : "Enter the code your teammate shared with you."}
            </p>
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
                  "Create our team"
                ) : (
                  "Join the team"
                )}
                <ArrowRight size={16} />
              </Button>
            </form>
            <button
              className="text-button"
              onClick={() => setAuth(auth === "create" ? "join" : "create")}
            >
              {auth === "create"
                ? "Already have a code? Join a team"
                : "Need a new team? Create one"}
            </button>
            <p className="tiny">
              For adults and invited adult friends. Your alias is enough; no
              diagnosis or personal story needed.
            </p>
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
            <div className="eyebrow">THE GREENHOUSE EXPEDITION</div>
            <h2>Who’s coming along?</h2>
            <p>
              Choose two to four people. Everyone will claim a retrieval job
              before departure.
            </p>
            {team.members.map((m) => (
              <label className="roster-choice" key={m.id}>
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
                <RobotArt small color={m.color} />
                <span>
                  {m.name}
                  {m.id === team.me ? " · you" : ""}
                </span>
              </label>
            ))}
            {team.members.length < 2 && (
              <div className="soft-note">
                Invite a teammate with code <strong>{team.code}</strong>. They
                can join on another device or browser profile. Practice is
                available while you wait.
              </div>
            )}
            {team.owner !== team.me ? (
              <p>The team host starts expeditions.</p>
            ) : (
              <Button
                disabled={busy || selected.length < 2 || selected.length > 4}
                onClick={() => act("new-mission", { roster: selected })}
              >
                Open mission briefing <ArrowRight size={16} />
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
            <div className="eyebrow">MAKE YOURSELF COMFORTABLE</div>
            <h2>Your pace. Your settings.</h2>
            {[
              ["Reduce motion", "Keep transitions simple.", motion, setMotion],
              [
                "Quiet mode",
                "Silence chat announcements. Requests stay visible.",
                quiet,
                setQuiet,
              ],
              [
                "Larger text",
                "Give the words a little more room.",
                large,
                setLarge,
              ],
              [
                "Gentle sound effects",
                "An optional soft note after your actions.",
                sound,
                setSound,
              ],
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
              Settings stay on this device. This prototype remembers your
              membership in this browser. Leaving or clearing browser data loses
              that membership; rejoining creates a new robot. Music is not used.
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
                <LogOut size={15} /> Leave this device’s membership
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
            <h2>Small rules. Shared purpose.</h2>
            <ol>
              <li>
                Everyone collects an assigned component and returns it to base.
                All robots must be home to finish.
              </li>
              <li>
                Start with 3 energy and gain 3 each new round. Each move costs
                1; store up to 6. Scenarios are optional Practice only.
              </li>
              <li>
                You can give one energy to one teammate each round before
                planning.
              </li>
              <li>
                Stand on pressure plate A to open gate A. Leaving closes it.
                Holding the plate costs no energy. Robots move one queued step
                together at a time; plate changes apply before gate crossings on
                that step. Wait until your teammate is through before leaving.
                Batteries give +1 once per robot, after movement.
              </li>
              <li>
                A blocked move costs 1, rolls you back one step and cancels the
                rest. Preview assumes teammates stay in place; their moves can
                change the gate.
              </li>
              <li>
                Take up to eight rounds. There is no real-time countdown.
                Unsuccessful attempts can be retried; earlier world progress
                remains.
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
            <h2>Return to the world?</h2>
            <p>
              This ends the current expedition. Its cargo and energy will reset
              on retry. Your previously restored places remain saved.
            </p>
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
function Practice({ onError }: { onError: (s: string) => void }) {
  const [list, setList] = useState<Scene[]>([]),
    [scene, setScene] = useState<Scene | null>(null),
    [node, setNode] = useState<NodeView | null>(null),
    [nodeId, setNodeId] = useState(""),
    [thread, setThread] = useState<{ who: string; text: string }[]>([]),
    [feedback, setFeedback] = useState(""),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState<"talk" | "move">("talk");
  const [sandbox, setSandbox] = useState(() => {
      const a = makeAttempt("practice", ["you", "other"]);
      a.robots = a.robots.slice(0, 1);
      a.robots[0].energy = 6;
      a.sandbox = true;
      a.phase = "round-end";
      return a;
    }),
    [moves, setMoves] = useState<Direction[]>([]);
  useEffect(() => {
    fetch("/api/scenarios")
      .then((r) => r.json() as Promise<Scene[]>)
      .then(setList)
      .catch(() => onError("Practice could not load. Please try again."));
  }, [onError]);
  async function start(s: Scene) {
    setBusy(true);
    try {
      const r = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: s.id }),
      });
      const d = (await r.json()) as PracticeReply;
      if (!r.ok) throw new Error(d.error);
      setScene(s);
      setNode(d.node);
      setNodeId(d.nodeId);
      setThread([]);
      setFeedback("");
    } catch (e) {
      onError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function answer(c: Choice) {
    if (!scene) return;
    setBusy(true);
    try {
      const r = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: scene.id, node: nodeId, choice: c.id }),
      });
      const d = (await r.json()) as PracticeReply;
      if (!r.ok) throw new Error(d.error);
      setNode(d.node);
      setNodeId(d.nodeId);
      setThread((t) => [...t, ...d.transcript]);
      setFeedback(d.explanation);
    } catch (e) {
      onError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="mission-header">
        <div>
          <div className="eyebrow">A LITTLE SPACE TO EXPLORE</div>
          <h1>At your own pace.</h1>
          <p>No team waiting. No score to beat. Just a chance to try things.</p>
        </div>
      </div>
      <div className="practice-tabs">
        <button
          className={tab === "talk" ? "active" : ""}
          onClick={() => setTab("talk")}
        >
          <BookOpen size={16} /> Everyday conversations
        </button>
        <button
          className={tab === "move" ? "active" : ""}
          onClick={() => setTab("move")}
        >
          <MapIcon size={16} /> Movement sandbox
        </button>
      </div>
      {tab === "talk" && !scene && (
        <div className="scenario-grid">
          {list.map((s, i) => (
            <button disabled={busy} key={s.id} onClick={() => start(s)}>
              <span className="scenario-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="skill-label">{s.skill}</span>
              <h2>{s.title}</h2>
              <p>{s.context}</p>
              <span className="text-button">
                Explore conversation <ArrowRight size={15} />
              </span>
            </button>
          ))}
        </div>
      )}
      {tab === "talk" && scene && (
        <section className="practice-conversation">
          <button className="text-button" onClick={() => setScene(null)}>
            <ArrowLeft size={15} /> All conversations
          </button>
          <h2>{scene.title}</h2>
          <p>{scene.context}</p>
          <div className="goal">
            <strong>Your goal</strong>
            <p>{scene.goal}</p>
          </div>
          <div className="dialogue-thread">
            <blockquote>{scene.openingLine}</blockquote>
            {thread.map((t, i) => (
              <div
                key={i}
                className={`speech ${t.who === "You" ? "your-speech" : ""}`}
              >
                <small>{t.who}</small>
                <p>{t.text}</p>
              </div>
            ))}
          </div>
          {feedback && (
            <div className="feedback">
              <Leaf size={17} />
              <p>{feedback}</p>
            </div>
          )}
          {node?.type === "terminal" ? (
            <>
              <h3>A thought to take with you</h3>
              <p>{node.text}</p>
              <blockquote>{node.phrase}</blockquote>
              <Button onClick={() => start(scene)}>
                Explore another response <RotateCcw size={16} />
              </Button>
            </>
          ) : (
            <>
              <h3>
                {node?.type === "repair"
                  ? "Try clarifying your message."
                  : "What do you say next?"}
              </h3>
              <div className="choices">
                {node?.choices?.map((c) => (
                  <button key={c.id} disabled={busy} onClick={() => answer(c)}>
                    {c.text}
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="tiny">
            Original fictional practice. Real people may respond differently. No
            energy or team progress is affected.
          </p>
        </section>
      )}
      {tab === "move" && (
        <div className="mission-layout">
          <MissionMap
            attempt={sandbox}
            me="you"
            members={[{ id: "you", name: "You", color: "#397a60" }]}
            queue={moves}
          />
          <section className="action-panel">
            <h2>Find your feet.</h2>
            <p>
              Try queueing a route. The gate is already open in this sandbox.
              You have six practice energy, replenished after each move
              sequence.
            </p>
            <div className="direction-pad">
              {directions.map((d) => (
                <button
                  className={`dir-${d.dir}`}
                  key={d.dir}
                  disabled={moves.length >= 6}
                  aria-label={`Queue ${d.dir}`}
                  onClick={() => setMoves((q) => [...q, d.dir])}
                >
                  <d.icon size={22} />
                </button>
              ))}
            </div>
            <div className="move-queue">
              {moves.map((d, i) => (
                <span key={i}>{directions.find((x) => x.dir === d)?.key}</span>
              ))}
            </div>
            {preview(sandbox.robots[0], moves, gateKeys(sandbox)).collision && (
              <div className="warning">
                This route hits a wall. The attempted step rolls you back and
                ends the route.
              </div>
            )}
            <Button
              onClick={async () => {
                const { execute } = await import("../shared/game");
                const next = structuredClone(sandbox);
                next.robots[0].queue = moves;
                execute(next, true);
                next.robots[0].energy = 6;
                next.sandbox = true;
                setSandbox(next);
                setMoves([]);
              }}
            >
              Execute practice route
            </Button>
            <button
              className="text-button"
              onClick={() => {
                setSandbox((a) => ({
                  ...a,
                  robots: a.robots.map((r) => ({
                    ...r,
                    history: [{ ...BASE }],
                    batteries: [],
                  })),
                }));
                setMoves([]);
              }}
            >
              Reset to base
            </button>
            <button className="text-button" onClick={() => setMoves([])}>
              Clear queue
            </button>
            <p className="tiny">
              Sandbox progress is local and never changes your team’s world.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
