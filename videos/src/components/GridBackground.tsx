import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, type Theme } from "../lib/colors";

type GridBackgroundProps = {
  theme: Theme;
  showGlow?: boolean;
  /** Parallax: grid moves slower than content */
  parallax?: number;
};

export const GridBackground: React.FC<GridBackgroundProps> = ({
  theme,
  showGlow = true,
  parallax = 0.3,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const colors = COLORS[theme];

  const glowOpacity = showGlow
    ? interpolate(frame, [0, 1 * fps], [0, 0.12], {
        extrapolateRight: "clamp",
      })
    : 0;

  // Parallax: grid drifts slowly
  const gridX = interpolate(frame, [0, durationInFrames], [0, -30 * parallax]);
  const gridY = interpolate(frame, [0, durationInFrames], [0, -20 * parallax]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        // Push grid back in Z space for depth
        transform: "translateZ(-100px) scale(1.1)",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Grid */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(to right, ${colors.gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${colors.gridLine} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          backgroundPosition: `${gridX}px ${gridY}px`,
        }}
      />
      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />
      {/* Top glow */}
      {showGlow && (
        <div
          style={{
            position: "absolute",
            top: -150,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 300,
            borderRadius: "50%",
            background: colors.accent,
            opacity: glowOpacity,
            filter: "blur(120px)",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
