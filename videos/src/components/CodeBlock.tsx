import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, type Theme } from "../lib/colors";
import { FONT_FAMILY, MONO_FONT_FAMILY } from "../lib/fonts";
import { highlightCadence } from "../lib/highlight";

type CodeBlockProps = {
  code: string;
  theme: Theme;
  label?: string;
  title?: string;
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  theme,
  label,
  title,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = COLORS[theme];

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const scaleVal = interpolate(cardSpring, [0, 1], [0.85, 1]);
  const cardOpacity = cardSpring;
  const cardRotateX = interpolate(cardSpring, [0, 1], [25, 2]);
  const cardZ = interpolate(cardSpring, [0, 1], [-500, 0]);

  // Slow tilt during scene
  const sceneTiltY = interpolate(frame, [0, 6 * fps], [-2, 2], {
    extrapolateRight: "clamp",
  });

  // Code typewriter
  const codeDelay = Math.round(0.5 * fps);
  const codeFrame = Math.max(0, frame - codeDelay);
  const totalChars = code.length;
  const charsPerFrame = totalChars / (3 * fps);
  const visibleChars = Math.min(
    totalChars,
    Math.floor(codeFrame * charsPerFrame),
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        perspective: 1200,
        padding: "0 140px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          opacity: cardOpacity,
          transform: `rotateX(${cardRotateX}deg) rotateY(${sceneTiltY}deg) translateZ(${cardZ}px) scale(${scaleVal})`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Label + Title */}
        {label && (
          <div
            style={{
              fontFamily: MONO_FONT_FAMILY,
              fontSize: 14,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: colors.accent,
              marginBottom: 16,
            }}
          >
            {label}
          </div>
        )}
        {title && (
          <h2
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 48,
              fontWeight: 700,
              color: colors.text,
              margin: 0,
              marginBottom: 32,
              letterSpacing: -1,
            }}
          >
            {title}
          </h2>
        )}

        {/* Code window */}
        <div
          style={{
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: `0 25px 50px -12px ${theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)"}`,
          }}
        >
          {/* Title bar */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: `1px solid ${theme === "dark" ? "#ffffff08" : "#00000008"}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background:
                theme === "dark"
                  ? "#111111"
                  : "#f5f5f5",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: colors.red,
                opacity: 0.8,
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: colors.yellow,
                opacity: 0.8,
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: colors.green,
                opacity: 0.8,
              }}
            />
          </div>

          {/* Code content */}
          <pre
            style={{
              fontFamily: MONO_FONT_FAMILY,
              fontSize: 18,
              lineHeight: 1.7,
              margin: 0,
              padding: "28px 32px",
              whiteSpace: "pre-wrap",
            }}
          >
            {highlightCadence(code, theme, visibleChars)}
            {visibleChars < totalChars && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: "1.1em",
                  background: colors.accent,
                  marginLeft: 1,
                  verticalAlign: "middle",
                  opacity: frame % 16 < 8 ? 1 : 0,
                }}
              />
            )}
          </pre>
        </div>
      </div>
    </AbsoluteFill>
  );
};
