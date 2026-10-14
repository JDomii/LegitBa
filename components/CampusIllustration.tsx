import React from "react";

// Simple decorative campus scene (original artwork, not the logo).
export function CampusIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 300"
      className={className}
      role="img"
      aria-label="Illustration of a university building with a bell tower"
    >
      {/* soft sun and clouds */}
      <circle cx="400" cy="90" r="70" fill="#fbf0d3" />
      <g fill="#ffffff" opacity="0.95">
        <ellipse cx="90" cy="70" rx="42" ry="12" />
        <ellipse cx="120" cy="60" rx="28" ry="12" />
        <ellipse cx="300" cy="40" rx="36" ry="10" />
        <ellipse cx="324" cy="32" rx="22" ry="10" />
      </g>

      {/* lawn */}
      <path d="M0 262 Q130 240 260 252 T520 246 V300 H0Z" fill="#dcead9" />
      <path d="M0 278 Q150 262 290 272 T520 268 V300 H0Z" fill="#c6dcc3" />

      {/* bell tower */}
      <g>
        <rect x="408" y="92" width="48" height="160" fill="#8a1530" />
        <rect x="402" y="86" width="60" height="10" fill="#650c20" />
        <rect x="414" y="60" width="36" height="28" fill="#a3203a" />
        <path d="M410 60 L432 28 L454 60Z" fill="#d9a02a" />
        <rect x="430" y="14" width="3" height="16" fill="#650c20" />
        <path d="M424 74 a8 8 0 0 1 16 0 v14 h-16z" fill="#fbf0d3" />
        <circle cx="432" cy="120" r="11" fill="#fbf0d3" />
        <path d="M432 112 v8 h6" stroke="#650c20" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M422 160 a10 10 0 0 1 20 0 v26 h-20z" fill="#fbf0d3" />
        <path d="M422 206 a10 10 0 0 1 20 0 v46 h-20z" fill="#650c20" />
      </g>

      {/* main building */}
      <g>
        <rect x="40" y="176" width="350" height="76" fill="#f3e6d2" />
        <rect x="40" y="168" width="350" height="10" fill="#8a1530" />
        {/* wings: windows */}
        <g fill="#8a1530">
          {[60, 88, 116, 144].map((x) => (
            <rect key={`l${x}`} x={x} y="194" width="16" height="26" rx="2" />
          ))}
          {[266, 294, 322, 350].map((x) => (
            <rect key={`r${x}`} x={x} y="194" width="16" height="26" rx="2" />
          ))}
        </g>
        {/* central block with pediment */}
        <rect x="168" y="150" width="94" height="102" fill="#fbf4e6" />
        <path d="M158 150 L215 108 L272 150Z" fill="#8a1530" />
        <path d="M176 148 L215 119 L254 148Z" fill="#a3203a" />
        <circle cx="215" cy="136" r="7" fill="#fbf0d3" />
        {/* columns */}
        <g fill="#ffffff" stroke="#d8c7ac" strokeWidth="1">
          {[176, 196, 232, 252].map((x) => (
            <rect key={x} x={x - 5} y="156" width="10" height="90" />
          ))}
        </g>
        <path d="M205 246 v-40 a10 10 0 0 1 20 0 v40z" fill="#650c20" />
        <rect x="150" y="246" width="130" height="8" fill="#d9a02a" />
        <rect x="140" y="252" width="150" height="8" fill="#e8b84a" />
      </g>

      {/* trees */}
      <g>
        <rect x="14" y="214" width="6" height="40" fill="#650c20" />
        <circle cx="17" cy="204" r="26" fill="#4f8a5b" />
        <circle cx="4" cy="218" r="16" fill="#3f7a4f" />
        <rect x="486" y="222" width="6" height="34" fill="#650c20" />
        <circle cx="489" cy="212" r="24" fill="#4f8a5b" />
        <circle cx="504" cy="226" r="14" fill="#3f7a4f" />
      </g>
    </svg>
  );
}
