"use client";
import {
  FLOOR,
  BASE,
  KEY,
  GATE,
  BATTERIES,
  same,
  position,
  preview,
  type Attempt,
  type Member,
  type Direction,
} from "../shared/game";
import { RobotArt } from "./world-art";
export default function MissionMap({
  attempt,
  members,
  me,
  queue = [],
}: {
  attempt: Attempt;
  members: Member[];
  me: string;
  queue?: Direction[];
}) {
  const robot = attempt.robots.find((r) => r.id === me);
  const plan = robot ? preview(robot, queue, attempt.keys) : null;
  return (
    <div className="map-wrap">
      <div className="map-meta">
        <span>GREENHOUSE EXPEDITION</span>
        <span>All routes visible · No time pressure</span>
      </div>
      <div
        className="mission-map"
        role="img"
        aria-label="Mission map: home at column 6 row 10. Your route preview is shown with numbered steps."
      >
        {Array.from({ length: 121 }, (_, i) => {
          const p = { x: i % 11, y: Math.floor(i / 11) };
          const floor = FLOOR.some((f) => same(f, p));
          const base = same(p, BASE),
            gate = same(p, GATE),
            key = same(p, KEY),
            battery = BATTERIES.some((b) => same(b, p));
          const obj = attempt.objectives.find(
            (o) => same(o.at, p) && o.status === "waiting",
          );
          const robots = attempt.robots.filter((r) => same(position(r), p));
          const pathAt = plan?.path.findIndex((q) => same(q, p)) ?? -1;
          return (
            <div
              key={i}
              className={`tile ${floor ? "floor" : "wall"} ${base ? "base" : ""} ${pathAt >= 0 ? "path" : ""}`}
              title={`${p.x + 1}, ${p.y + 1}${obj ? `: ${obj.name}` : ""}`}
            >
              {!floor && i % 7 === 0 && <span className="tile-tree">♣</span>}
              {base && <span className="tile-icon home">⌂</span>}
              {gate && (
                <span
                  className={`tile-icon gate ${attempt.keys.length ? "open" : ""}`}
                >
                  {attempt.keys.length ? "╶" : "▥"}
                </span>
              )}
              {key && !attempt.keys.length && (
                <span className="tile-icon key">⚿</span>
              )}
              {battery && (
                <span
                  className={`tile-icon battery ${robot?.batteries.includes(`${p.x},${p.y}`) ? "used" : ""}`}
                >
                  ϟ
                </span>
              )}
              {obj && (
                <span
                  className={`component-marker ${obj.owner === me ? "mine" : ""}`}
                  aria-label={obj.name}
                >
                  {obj.icon}
                </span>
              )}
              {pathAt >= 0 && <span className="path-number">{pathAt + 1}</span>}
              {robots.length > 0 && (
                <div className="tile-robots">
                  {robots.map((r) => (
                    <span
                      key={r.id}
                      title={members.find((m) => m.id === r.id)?.name}
                      className={r.id === me ? "my-robot" : ""}
                    >
                      <RobotArt
                        color={members.find((m) => m.id === r.id)?.color}
                        small
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="map-legend">
        <span>
          <i className="legend-home">⌂</i> Base / delivery
        </span>
        <span>
          <i>⚿</i> Team key
        </span>
        <span>
          <i>▥</i> Gate
        </span>
        <span>
          <i>ϟ</i> +1 energy
        </span>
      </div>
    </div>
  );
}
