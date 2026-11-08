"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  missionFor,
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
  quiet = false,
  reducedMotion = false,
  onPing,
}: {
  attempt: Attempt;
  members: Member[];
  me: string;
  queue?: Direction[];
  pings?: MapPing[];
  pingKind?: string | null;
  quiet?: boolean;
  reducedMotion?: boolean;
  onPing?: (p: Point) => void;
}) {
  const map = missionFor(attempt);
  const r = attempt.robots.find((r) => r.id === me),
    keys = gateKeys(attempt),
    plan = r ? previewMission(attempt, me, queue) : null;
  const name = (id: string) =>
    members.find((m) => m.id === id)?.name || "Teammate";
  const collisionKey = attempt.collisions?.length
    ? `${attempt.id}:${attempt.round}`
    : "";
  const seenCollision = useRef(collisionKey);
  const [bumping, setBumping] = useState<NonNullable<Attempt["collisions"]>>(
    [],
  );
  useEffect(() => {
    const fresh = collisionKey && seenCollision.current !== collisionKey;
    seenCollision.current = collisionKey;
    if (!fresh || reducedMotion) {
      setBumping([]);
      return;
    }
    setBumping(attempt.collisions || []);
    const timer = setTimeout(() => setBumping([]), 700);
    return () => clearTimeout(timer);
  }, [collisionKey, reducedMotion]);
  return (
    <div className={`map-wrap ${pingKind ? "ping-active" : ""}`}>
      <div
        className="map-notice"
        aria-live={quiet ? "off" : "polite"}
        aria-atomic="true"
      >
        {!!attempt.collisions?.length && (
          <p className="collision-caption">
            <strong>Hit obstacle</strong>
            <span
              title={attempt.collisions.map((c) => name(c.member)).join(", ")}
            >
              {attempt.collisions.map((c) => name(c.member)).join(", ")}
            </span>
          </p>
        )}
      </div>
      <div
        className="mission-map"
        role="group"
        aria-label={`${map.name} map. Base at column ${map.base.x + 1} row ${map.base.y + 1}. ${map.links.map((l) => `Plate ${l.label} at column ${l.plate.x + 1} row ${l.plate.y + 1} opens gate ${l.label} at column ${l.gate.x + 1} row ${l.gate.y + 1}.`).join(" ")} Select a ping type to mark a walkable tile.`}
      >
        {map.links.map((link) => (
          <svg
            key={link.label}
            className={`plate-wire ${keys.includes(link.key) ? "wire-open" : ""}`}
            viewBox="0 0 11 11"
            aria-hidden="true"
          >
            <path
              d={link.wire}
              style={
                link.label === "B" ? { strokeDasharray: "0.04 0.1" } : undefined
              }
            />
          </svg>
        ))}
        {Array.from({ length: 121 }, (_, i) => {
          const p = { x: i % 11, y: Math.floor(i / 11) },
            floor = map.floor.some((f) => same(f, p)),
            base = same(p, map.base),
            gate = map.links.find((l) => same(p, l.gate)),
            plate = map.links.find((l) => same(p, l.plate)),
            link = gate || plate,
            isOpen = !!link && keys.includes(link.key),
            battery = map.batteries.some((b) => same(b, p));
          const obj = attempt.objectives.find(
              (o) => same(o.at, p) && o.status === "waiting",
            ),
            robots = attempt.robots.filter((r) => same(position(r), p)),
            pathAt = plan?.path.findIndex((q) => same(q, p)) ?? -1,
            ping = pings.filter((q) => same(q.at, p)).at(-1);
          const label = `Tile ${p.x + 1}, ${p.y + 1}${base ? ": Base" : plate ? `: Pressure plate ${plate.label} ${isOpen ? "pressed" : "released"}; opens gate ${plate.label}` : gate ? `: Gate ${gate.label} ${isOpen ? "open" : "closed"}; controlled by plate ${gate.label}` : obj ? `: ${obj.name}` : ""}${robots.length ? ` · ${robots.map((r) => name(r.id)).join(", ")}` : ""}${ping ? ` · ${name(ping.member)}: ${ping.kind}` : ""}`;
          const content = (
            <>
              {!floor && i % 7 === 0 && <span className="tile-tree">♣</span>}
              {base && <span className="tile-icon home">⌂</span>}
              {gate && (
                <span className={`tile-icon gate ${isOpen ? "open" : ""}`}>
                  {isOpen ? "╶" : "▥"}
                </span>
              )}
              {plate && (
                <span className={`tile-icon plate ${isOpen ? "pressed" : ""}`}>
                  ▣
                </span>
              )}
              {(plate || gate) && (
                <span className="tile-link-label">{link?.label}</span>
              )}
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
                      className={`${robot.id === me ? "my-robot" : ""} ${bumping.some((c) => c.member === robot.id) ? "bumping-robot" : ""}`}
                    >
                      <RobotArt
                        color={members.find((m) => m.id === robot.id)?.color}
                        small
                      />
                    </span>
                  ))}
                </span>
              )}
              {bumping
                .filter((c) => same(c.from, p))
                .map((c) => (
                  <span
                    key={c.member}
                    className="collision-motion"
                    aria-hidden="true"
                    style={
                      {
                        "--bump-x": `${(c.attempted.x - c.from.x) * 70}%`,
                        "--bump-y": `${(c.attempted.y - c.from.y) * 70}%`,
                        "--return-x": `calc(${(c.to.x - c.from.x) * 100}% + ${(c.to.x - c.from.x) * 2}px)`,
                        "--return-y": `calc(${(c.to.y - c.from.y) * 100}% + ${(c.to.y - c.from.y) * 2}px)`,
                      } as CSSProperties
                    }
                  >
                    <RobotArt
                      small
                      color={members.find((m) => m.id === c.member)?.color}
                    />
                  </span>
                ))}
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
              className={`tile floor ${base ? "base" : ""} ${plate || gate ? `linked-tile ${isOpen ? "link-open" : "link-closed"}` : ""} ${pathAt >= 0 ? "path" : ""}`}
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
          <i>▣</i> Pressure plate
        </span>
        <span>
          <i>▥</i> Linked gate
        </span>
        <span>
          <i>ϟ</i> +1 energy
        </span>
      </div>
    </div>
  );
}
