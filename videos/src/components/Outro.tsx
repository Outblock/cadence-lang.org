import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, type Theme } from "../lib/colors";
import { FONT_FAMILY, MONO_FONT_FAMILY } from "../lib/fonts";

type OutroProps = {
  theme: Theme;
};

export const Outro: React.FC<OutroProps> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = COLORS[theme];

  // Logo
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);

  // Tagline
  const tagSpring = spring({
    frame: frame - Math.round(0.3 * fps),
    fps,
    config: { damping: 200 },
  });
  const tagY = interpolate(Math.max(0, tagSpring), [0, 1], [40, 0]);

  // URL
  const urlSpring = spring({
    frame: frame - Math.round(0.7 * fps),
    fps,
    config: { damping: 200 },
  });

  // Glow pulse
  const glowPulse = interpolate(
    frame,
    [0.5 * fps, 1 * fps, 2 * fps],
    [0, 0.2, 0.1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: colors.accent,
          opacity: glowPulse,
          filter: "blur(150px)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          position: "relative",
        }}
      >
        <Img
          src={staticFile("cadence-logo.svg")}
          style={{
            height: 100,
            opacity: logoSpring,
            transform: `scale(${logoScale})`,
          }}
        />

        <h1
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 72,
            fontWeight: 800,
            margin: 0,
            opacity: Math.max(0, tagSpring),
            transform: `translateY(${tagY}px)`,
            background: `linear-gradient(to right, ${colors.accent}, ${colors.blue})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Secure by Design
        </h1>

        <p
          style={{
            fontFamily: MONO_FONT_FAMILY,
            fontSize: 20,
            color: colors.textDim,
            margin: 0,
            opacity: Math.max(0, urlSpring),
            letterSpacing: 2,
          }}
        >
          cadence-lang.org
        </p>
      </div>
    </AbsoluteFill>
  );
};
