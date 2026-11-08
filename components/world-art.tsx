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
function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="18" rx="19" ry="8" fill="#526c4920" />
      <path d="M0 2v22" stroke="#887757" strokeWidth="5" />
      <circle cy="-8" r="20" fill="#73916b" />
      <circle cx="-10" cy="-4" r="13" fill="#829e72" />
      <circle cx="7" cy="-16" r="14" fill="#8faa7a" />
    </g>
  );
}
export default function WorldArt({ restored = false }: { restored?: boolean }) {
  return (
    <svg
      className="world-art"
      viewBox="0 0 820 530"
      role="img"
      aria-label={
        restored
          ? "Your team’s restored greenhouse in a garden island"
          : "A shared garden island with a greenhouse waiting to be restored"
      }
    >
      <defs>
        <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#d7ddce" />
        </pattern>
        <linearGradient id="land" x2="0" y2="1">
          <stop stopColor="#e0e7cc" />
          <stop offset="1" stopColor="#c7d4b3" />
        </linearGradient>
        <linearGradient id="glass" x2="1" y2="1">
          <stop stopColor={restored ? "#b7d9c7" : "#d7ddd1"} />
          <stop offset="1" stopColor={restored ? "#82b5a2" : "#bccbbf"} />
        </linearGradient>
      </defs>
      <rect width="820" height="530" fill="url(#dots)" />
      <ellipse cx="410" cy="434" rx="286" ry="53" fill="#78886a16" />
      <path
        d="M106 315L350 167Q385 146 424 165L720 328v34L472 493Q448 506 425 492L106 350z"
        fill="#a9ba90"
      />
      <path
        d="M106 315L350 167Q385 146 424 165L720 328L472 465Q448 479 425 465z"
        fill="url(#land)"
      />
      <path
        d="M203 333L393 226L634 361M347 413L540 300"
        fill="none"
        stroke="#ede9d8"
        strokeWidth="29"
        strokeLinecap="round"
      />
      <path
        d="M203 333L393 226L634 361M347 413L540 300"
        fill="none"
        stroke="#d0cdb7"
        strokeWidth="1.5"
        strokeDasharray="5 9"
      />
      <g opacity=".6">
        <path
          d="M170 303l79-45 83 47-79 45z"
          fill="#d6dbbe"
          stroke="#99ad89"
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        <path
          d="M516 346l77-43 87 47-78 44z"
          fill="#d6dbbe"
          stroke="#99ad89"
          strokeWidth="2"
          strokeDasharray="6 5"
        />
      </g>
      <g transform="translate(416 267)">
        <path d="M-96-27L0-81 112-17V64L17 120-96 55z" fill="#e7e9d9" />
        <path d="M17 24L112-31V64L17 120z" fill="url(#glass)" />
        <path
          d="M-96-40L17 24V120L-96 55z"
          fill={restored ? "#cfdfc8" : "#ccd4c4"}
        />
        <path d="M-96-40L-49-98 64-34 17 24z" fill="#d4e7da" />
        <path d="M-49-98L46-152 159-88 64-34z" fill="url(#glass)" />
        <path d="M17 24L64-34 159-88 112-31z" fill="#a8c9b7" />
        <path
          d="M-96-40L-49-98 64-34 17 24-96-40M-49-98L46-152 159-88 64-34M17 24L112-31 159-88M17 24V120M112-31V64"
          fill="none"
          stroke="#536e5a"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M-63-79L50-15M-25-111L88-47M10-132L123-68M-60-20V74M-21 2V96M47 7V102M79-11V83"
          stroke="#68836b"
          strokeWidth="3"
        />
        <path d="M-42 90V37l28 16v53" fill="#4b6d58" />
        {restored ? (
          <g stroke="#477b50" strokeWidth="4">
            <path d="M38 70V40m26 16V26m26 16V12" />
            <ellipse cx="31" cy="46" rx="10" ry="5" fill="#759c59" />
            <ellipse cx="45" cy="38" rx="10" ry="5" fill="#8aa96a" />
            <ellipse cx="57" cy="32" rx="10" ry="5" fill="#759c59" />
            <ellipse cx="72" cy="24" rx="10" ry="5" fill="#8aa96a" />
          </g>
        ) : (
          <g stroke="#8d8774" strokeWidth="6">
            <path d="M32 61l50-30m-48-4l46 30" />
          </g>
        )}
      </g>
      <Tree x={185} y={292} s={1.1} />
      <Tree x={238} y={234} s={0.85} />
      <Tree x={625} y={305} s={1.15} />
      <Tree x={657} y={360} s={0.7} />
      <Tree x={306} y={391} s={0.65} />
      <g transform="translate(345 325) scale(.8)">
        <ellipse cx="10" cy="50" rx="24" ry="9" fill="#526c4920" />
        <rect x="-10" y="10" width="40" height="35" rx="10" fill="#bd8453" />
        <rect x="-15" y="-13" width="50" height="34" rx="11" fill="#bd8453" />
        <rect x="-9" y="-6" width="38" height="18" rx="6" fill="#eee9da" />
        <circle cx="1" cy="3" r="3" fill="#384c3e" />
        <circle cx="19" cy="3" r="3" fill="#384c3e" />
        <path d="M10-13v-12" stroke="#bd8453" strokeWidth="3" />
        <circle cx="10" cy="-27" r="4" fill="#e2b966" />
      </g>
      <g transform="translate(472 409)">
        <rect x="-40" y="-12" width="92" height="26" rx="13" fill="#f9f8ef" />
        <text
          x="6"
          y="5"
          textAnchor="middle"
          fontSize="10"
          letterSpacing="1"
          fill="#55745b"
        >
          OUR GREENHOUSE
        </text>
      </g>
      <g fill="#e7bd71">
        <circle cx="267" cy="335" r="4" />
        <circle cx="274" cy="328" r="3" />
        <circle cx="588" cy="399" r="4" />
      </g>
    </svg>
  );
}
