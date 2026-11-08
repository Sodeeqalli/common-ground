"use client";
import {
  FLOOR,
  BASE,
  PRESSURE_PLATE,
  GATE,
  BATTERIES,
  same,
  position,
  previewMission,
  gateKeys,
  type Attempt,
  type Member,
  type Direction,
  type Point,
  type MapPing,
} from "../shared/game";
import { RobotArt } from "./world-art";
export default function MissionMap({
  attempt,
  members,
  me,
  queue = [],
  pings = [],
  pingKind = null,
  onPing,
}: {
  attempt: Attempt;
  members: Member[];
  me: string;
  queue?: Direction[];
  pings?: MapPing[];
  pingKind?: string | null;
  onPing?: (p: Point) => void;
}) {
  const r = attempt.robots.find((r) => r.id === me),
    keys = gateKeys(attempt),
    plan = r ? previewMission(attempt, me, queue) : null;
  const name = (id: string) =>
    members.find((m) => m.id === id)?.name || "Teammate";
  return (
    <div className={`map-wrap ${pingKind ? "ping-active" : ""}`}>
      <div className="map-meta">
        <span>Map</span>
        <span></span>
      </div>
      <div
        className="mission-map"
        role="group"
        aria-label="Mission map. Base at column 6 row 10, pressure plate A at column 6 row 8 controls gate A at column 4 row 8. Select a ping type to mark a walkable tile."
      >
        <svg
          className={`plate-wire ${keys.length ? "wire-open" : ""}`}
          viewBox="0 0 11 11"
          aria-hidden="true"
        >
          <path d="M 5.5 7.5 V 7.12 H 3.5 V 7.5" />
        </svg>
        {Array.from({ length: 121 }, (_, i) => {
          const p = { x: i % 11, y: Math.floor(i / 11) },
            floor = FLOOR.some((f) => same(f, p)),
            base = same(p, BASE),
            gate = same(p, GATE),
            plate = same(p, PRESSURE_PLATE),
            battery = BATTERIES.some((b) => same(b, p));
          const obj = attempt.objectives.find(
              (o) => same(o.at, p) && o.status === "waiting",
            ),
            robots = attempt.robots.filter((r) => same(position(r), p)),
            pathAt = plan?.path.findIndex((q) => same(q, p)) ?? -1,
            ping = pings.filter((q) => same(q.at, p)).at(-1);
          const label = `Tile ${p.x + 1}, ${p.y + 1}${base ? ": Base" : plate ? `: Pressure plate A ${keys.length ? "pressed" : "released"}; opens gate A` : gate ? `: Gate A ${keys.length ? "open" : "closed"}; controlled by plate A` : obj ? `: ${obj.name}` : ""}${robots.length ? ` · ${robots.map((r) => name(r.id)).join(", ")}` : ""}${ping ? ` · ${name(ping.member)}: ${ping.kind}` : ""}`;
          const content = (
            <>
              {!floor && i % 7 === 0 && <span className="tile-tree">♣</span>}
              {base && <span className="tile-icon home">⌂</span>}
              {gate && (
                <span className={`tile-icon gate ${keys.length ? "open" : ""}`}>
                  {keys.length ? "╶" : "▥"}
                </span>
              )}
              {plate && (
                <span
                  className={`tile-icon plate ${keys.length ? "pressed" : ""}`}
                >
                  ▣
                </span>
              )}
              {(plate || gate) && <span className="tile-link-label">A</span>}
              {battery && (
                <span
                  className={`tile-icon battery ${r?.batteries.includes(`${p.x},${p.y}`) ? "used" : ""}`}
                >
                  ϟ
                </span>
              )}
              {obj && (
                <span
                  className={`component-marker ${obj.owner === me ? "mine" : ""}`}
                >
                  {obj.icon}
                </span>
              )}
              {pathAt >= 0 && <span className="path-number">{pathAt + 1}</span>}
              {robots.length > 0 && (
                <span className="tile-robots">
                  {robots.map((robot) => (
                    <span
                      key={robot.id}
                      title={name(robot.id)}
                      className={robot.id === me ? "my-robot" : ""}
                    >
                      <RobotArt
                        color={members.find((m) => m.id === robot.id)?.color}
                        small
                      />
                    </span>
                  ))}
                </span>
              )}
              {ping && (
                <span
                  className="tile-ping"
                  title={`${name(ping.member)}: ${ping.kind}`}
                >
                  {ping.kind === "help"
                    ? "!"
                    : ping.kind === "meet"
                      ? "◎"
                      : "➜"}
                </span>
              )}
            </>
          );
          return floor ? (
            <button
              type="button"
              key={i}
              className={`tile floor ${base ? "base" : ""} ${plate || gate ? `linked-tile ${keys.length ? "link-open" : "link-closed"}` : ""} ${pathAt >= 0 ? "path" : ""}`}
              title={label}
              aria-label={label}
              aria-disabled={!pingKind}
              onClick={() => {
                if (pingKind) onPing?.(p);
              }}
            >
              {content}
            </button>
          ) : (
            <div key={i} className="tile wall" aria-hidden="true">
              {content}
            </div>
          );
        })}
      </div>
      <div className="map-legend">
        <span>
          <i>⌂</i> Base / delivery
        </span>
        <span>
          <i>▣ A</i> Pressure plate
        </span>
        <span>
          <i>▥ A</i> Linked gate
        </span>
        <span>
          <i>ϟ</i> +1 energy
        </span>
      </div>
      {pings.length > 0 && (
        <div className="ping-feed" aria-live="polite">
          {pings.slice(-3).map((p) => (
            <p key={p.id}>
              <strong>{name(p.member)}</strong>:{" "}
              {p.kind === "meet"
                ? "Meet here"
                : p.kind === "help"
                  ? "Need help"
                  : "My route"}{" "}
              · column {p.at.x + 1}, row {p.at.y + 1}{" "}
              <small>(round {p.round})</small>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
