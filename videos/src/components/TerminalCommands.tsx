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

type TerminalCommandsProps = {
  theme: Theme;
};

type CommandDef = {
  label: string;
  parts: { text: string; color: string }[];
  hint: string;
};

const getCommands = (colors: (typeof COLORS)["dark"]): CommandDef[] => [
  {
    label: "skills",
    parts: [
      { text: "npx", color: colors.cmdYellow },
      { text: " skills add ", color: colors.textMuted },
      { text: "outblock/cadence-lang.org", color: colors.cmdGreen },
    ],
    hint: "Install the Cadence skill for your AI coding agent",
  },
  {
    label: "mcp",
    parts: [
      { text: "npx", color: colors.cmdYellow },
      { text: " install-mcp ", color: colors.textMuted },
      { text: "@outblock/cadence-mcp", color: colors.cmdGreen },
      { text: " --client ", color: colors.cmdBlue },
      { text: "claude-code", color: colors.cmdGreen },
    ],
    hint: "Install the Cadence MCP server",
  },
  {
    label: "llms.txt",
    parts: [
      { text: "curl", color: colors.cmdYellow },
      { text: " -s ", color: colors.cmdBlue },
      { text: "https://cadence-lang.org/llms.txt", color: colors.cmdCyan },
    ],
    hint: "Fetch Cadence context for LLMs",
  },
];

export const TerminalCommands: React.FC<TerminalCommandsProps> = ({
  theme,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = COLORS[theme];
  const commands = getCommands(colors);

  // Section title
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 160px",
        perspective: 1200,
      }}
    >
      <div style={{ width: "100%", maxWidth: 900 }}>
        {/* Section label */}
        <div
          style={{
            fontFamily: MONO_FONT_FAMILY,
            fontSize: 14,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: colors.accent,
            marginBottom: 16,
            opacity: titleSpring,
          }}
        >
          AI-Native Toolchain
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: 56,
            fontWeight: 700,
            color: colors.text,
            margin: 0,
            marginBottom: 48,
            opacity: titleSpring,
            letterSpacing: -1,
          }}
        >
          One Command Away
        </h2>

        {/* Command cards */}
        {commands.map((cmd, i) => {
          const delay = 0.4 * fps + i * 0.35 * fps;
          const cmdSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 100 },
          });
          const cmdFrame = Math.max(0, frame - delay);
          const fullText = cmd.parts.map((p) => p.text).join("");
          const charsPerFrame = fullText.length / (1.5 * fps);
          const visibleChars = Math.floor(cmdFrame * charsPerFrame);

          const slideX = interpolate(cmdSpring, [0, 1], [-40, 0]);
          const cardZ = interpolate(cmdSpring, [0, 1], [-300 - i * 100, 0]);
          const cardRotateY = interpolate(cmdSpring, [0, 1], [-15, 0]);

          return (
            <div
              key={cmd.label}
              style={{
                marginBottom: 20,
                opacity: Math.max(0, cmdSpring),
                transform: `translateX(${slideX}px) translateZ(${cardZ}px) rotateY(${cardRotateY}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                style={{
                  background: colors.bgCode,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 12,
                  padding: "20px 28px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                {/* Label badge */}
                <div
                  style={{
                    fontFamily: MONO_FONT_FAMILY,
                    fontSize: 11,
                    color: colors.accent,
                    background: `${colors.accent}15`,
                    padding: "4px 10px",
                    borderRadius: 6,
                    whiteSpace: "nowrap",
                  }}
                >
                  {cmd.label}
                </div>

                {/* Command with typewriter */}
                <div
                  style={{
                    fontFamily: MONO_FONT_FAMILY,
                    fontSize: 16,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  <span style={{ color: colors.textMuted, userSelect: "none" }}>
                    $
                  </span>
                  <span>
                    {renderTypedCommand(cmd.parts, visibleChars)}
                    {visibleChars < fullText.length && (
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
                  </span>
                </div>
              </div>
              {/* Hint */}
              <div
                style={{
                  fontFamily: MONO_FONT_FAMILY,
                  fontSize: 12,
                  color: colors.textMuted,
                  marginTop: 6,
                  marginLeft: 28,
                }}
              >
                {cmd.hint}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

function renderTypedCommand(
  parts: { text: string; color: string }[],
  visibleChars: number,
) {
  let shown = 0;
  return parts.map((part, i) => {
    const partStart = shown;
    shown += part.text.length;
    if (partStart >= visibleChars) return null;
    const visible = Math.min(part.text.length, visibleChars - partStart);
    return (
      <span key={i} style={{ color: part.color }}>
        {part.text.slice(0, visible)}
      </span>
    );
  });
}
