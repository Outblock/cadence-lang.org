import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, type Theme } from "../lib/colors";
import { FONT_FAMILY } from "../lib/fonts";

type HeroTitleProps = {
  theme: Theme;
};

export const HeroTitle: React.FC<HeroTitleProps> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = COLORS[theme];

  // "Smart Contracts Built for" line
  const line1Spring = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.8 * fps),
  });
  const line1Y = interpolate(line1Spring, [0, 1], [60, 0]);
  const line1Z = interpolate(line1Spring, [0, 1], [-200, 0]);
  const line1RotX = interpolate(line1Spring, [0, 1], [15, 0]);
  const line1Opacity = line1Spring;

  // "the AI Era." gradient line
  const line2Spring = spring({
    frame: frame - Math.round(0.3 * fps),
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.8 * fps),
  });
  const line2Y = interpolate(line2Spring, [0, 1], [60, 0]);
  const line2Z = interpolate(Math.max(0, line2Spring), [0, 1], [-300, 0]);
  const line2RotX = interpolate(Math.max(0, line2Spring), [0, 1], [20, 0]);
  const line2Opacity = Math.max(0, line2Spring);

  // Subtitle
  const subSpring = spring({
    frame: frame - Math.round(0.8 * fps),
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(0.8 * fps),
  });
  const subOpacity = Math.max(0, subSpring);
  const subY = interpolate(Math.max(0, subSpring), [0, 1], [30, 0]);
  const subZ = interpolate(Math.max(0, subSpring), [0, 1], [-150, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 120px",
        perspective: 1000,
      }}
    >
      <div style={{ textAlign: "center", transformStyle: "preserve-3d" }}>
        <h1
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 80,
            fontWeight: 700,
            color: colors.text,
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: -2,
            opacity: line1Opacity,
            transform: `translateY(${line1Y}px) translateZ(${line1Z}px) rotateX(${line1RotX}deg)`,
          }}
        >
          Smart Contracts Built for
        </h1>
        <h1
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 80,
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: -2,
            opacity: line2Opacity,
            transform: `translateY(${line2Y}px) translateZ(${line2Z}px) rotateX(${line2RotX}deg)`,
            background: `linear-gradient(to right, ${colors.accent}, ${colors.blue})`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          the AI Era.
        </h1>
        <p
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 28,
            color: colors.textDim,
            marginTop: 32,
            lineHeight: 1.6,
            maxWidth: 700,
            marginLeft: "auto",
            marginRight: "auto",
            opacity: subOpacity,
            transform: `translateY(${subY}px) translateZ(${subZ}px)`,
          }}
        >
          Resource-oriented programming designed for
          <br />
          digital ownership and AI-driven development.
        </p>
      </div>
    </AbsoluteFill>
  );
};
