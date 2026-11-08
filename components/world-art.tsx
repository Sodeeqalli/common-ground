import type { Team } from "../shared/game";

export function RobotArt({
  color = "#397a60",
  label = "",
  small = false,
}: {
  color?: string;
  label?: string;
  small?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 72"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={!label}
      className={small ? "robot-art small" : "robot-art"}
    >
      <ellipse cx="32" cy="65" rx="20" ry="5" fill="#183b2820" />
      <path
        d="M22 53v9m20-9v9"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <rect x="17" y="32" width="30" height="25" rx="9" fill={color} />
      <path
        d="M13 38v12m38-12v12"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M32 17V9" stroke={color} strokeWidth="3" />
      <circle cx="32" cy="7" r="4" fill="#dba85d" />
      <rect x="12" y="16" width="40" height="27" rx="10" fill={color} />
      <rect x="17" y="21" width="30" height="15" rx="6" fill="#e8eee1" />
      <circle cx="25" cy="28" r="2.5" fill="#243e33" />
      <circle cx="39" cy="28" r="2.5" fill="#243e33" />
      <rect x="26" y="44" width="12" height="5" rx="2" fill="#e8eee1" />
    </svg>
  );
}

const WORLD_AREAS = [
  { id: "greenhouse", name: "Greenhouse", x: 0, y: 0 },
  { id: "power", name: "Power station", x: 768, y: 0 },
  { id: "bridge", name: "Bridge", x: 0, y: 512 },
  { id: "workshop", name: "Workshop", x: 768, y: 512 },
] as const;
export function WorldContributors({ team }: { team: Team }) {
  return (
    <div className="world-contributions">
      {WORLD_AREAS.filter((area) => team.restored.includes(area.id)).map(
        (area) => {
          const members = team.contributions?.[area.id] || [];
          return (
            <section
              key={area.id}
              className="area-contributors"
              aria-label={`${area.name} contributors`}
            >
              <h2>{area.name}</h2>
              {members.length ? (
                <div className="contributor-credit">
                  <span>Built by</span>
                  <ul>
                    {members.map((member) => (
                      <li key={member.id}>
                        <RobotArt small color={member.color} />
                        <span>{member.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>Built by your team</p>
              )}
            </section>
          );
        },
      )}
    </div>
  );
}
export default function WorldArt({ restored = [] }: { restored?: string[] }) {
  const regions = WORLD_AREAS;
  return (
    <svg
      className="world-art mural-art"
      viewBox="0 0 1536 1024"
      role="img"
      aria-label={`Our world: ${regions.filter((r) => restored.includes(r.id)).length} of 4 areas complete. ${regions.map((r) => `${r.name}: ${restored.includes(r.id) ? "coloured in" : "unfinished"}`).join(". ")}`}
    >
      <defs>
        <filter id="world-pencil" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="0.32" intercept="0.66" />
            <feFuncG type="linear" slope="0.32" intercept="0.66" />
            <feFuncB type="linear" slope="0.32" intercept="0.64" />
          </feComponentTransfer>
        </filter>
        {regions.map((r) => (
          <clipPath id={`world-piece-${r.id}`} key={r.id}>
            <rect x={r.x} y={r.y} width="768" height="512" />
          </clipPath>
        ))}
      </defs>
      <image
        href="/world-mural-calm.png"
        width="1536"
        height="1024"
        filter="url(#world-pencil)"
      />
      {regions
        .filter((r) => restored.includes(r.id))
        .map((r) => (
          <image
            key={r.id}
            href="/world-mural-calm.png"
            width="1536"
            height="1024"
            clipPath={`url(#world-piece-${r.id})`}
          />
        ))}
    </svg>
  );
}
