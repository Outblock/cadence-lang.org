import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS, type Theme } from "../lib/colors";
import { MONO_FONT_FAMILY } from "../lib/fonts";

// Pre-rendered ASCII art of the Cadence logo
const ASCII_LOGO = `
        .::---::.
     .:=+*%%@@%%*+=:.
   .:+%@@@#*++*#@@@%+:.
  .=*@@@*=:.  .:=*@@@*=.
 .+%@@#=.        .=#@@%+.
 :*@@%=.   .:::.   .=%@@*
.+@@#=.   .+%@@%+.  .=#@@
:*@@=.   .+%@@@@%+.  .=@@
:*@@=.   :*@@#*@@*:  .=@@
.+@@#=.   .=#@@%=.  .=#@@
 :*@@%=.   .:==:.  .=%@@*
 .+%@@#=.        .=#@@%+.
  .=*@@@*=:.  .:=*@@@*=.
   .:+%@@@#*++*#@@@%+:.
     .:=+*%%@@%%*+=:.
        .::---::.
`.trim();

type AsciiLogoProps = {
  theme: Theme;
};

export const AsciiLogo: React.FC<AsciiLogoProps> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = COLORS[theme];

  const lines = ASCII_LOGO.split("\n");
  const totalChars = ASCII_LOGO.replace(/\n/g, "").length;

  // Characters reveal progressively
  const revealProgress = spring({
    frame,
    fps,
    config: { damping: 30, stiffness: 40 },
    durationInFrames: Math.round(2 * fps),
  });

  const visibleChars = Math.floor(revealProgress * totalChars);

  // Build visible ASCII
  let charCount = 0;
  const visibleLines = lines.map((line) => {
    const lineChars = line.replace(/ /g, "").length;
    const lineStart = charCount;
    charCount += lineChars;

    if (charCount <= visibleChars) return line;
    if (lineStart >= visibleChars) return line.replace(/[^ ]/g, " ");

    const charsToShow = visibleChars - lineStart;
    let shown = 0;
    return line
      .split("")
      .map((ch) => {
        if (ch === " ") return ch;
        shown++;
        return shown <= charsToShow ? ch : " ";
      })
      .join("");
  });

  // Glow pulse after reveal
  const glowIntensity = interpolate(
    frame,
    [2 * fps, 2.5 * fps, 3 * fps],
    [0, 1, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scale = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: Math.round(1.5 * fps),
  });

  // 3D rotation reveal
  const rotateY3d = interpolate(scale, [0, 1], [90, 0]);
  const translateZ = interpolate(scale, [0, 1], [-400, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        perspective: 1000,
      }}
    >
      <div
        style={{
          transform: `rotateY(${rotateY3d}deg) translateZ(${translateZ}px) scale(${0.6 + scale * 0.4})`,
          transformStyle: "preserve-3d",
          position: "relative",
        }}
      >
        {/* Glow behind */}
        <div
          style={{
            position: "absolute",
            inset: -40,
            background: colors.accent,
            opacity: glowIntensity * 0.15,
            filter: "blur(60px)",
            borderRadius: "50%",
          }}
        />
        <pre
          style={{
            fontFamily: MONO_FONT_FAMILY,
            fontSize: 16,
            lineHeight: 1.1,
            color: colors.accent,
            textAlign: "center",
            margin: 0,
            whiteSpace: "pre",
            textShadow: `0 0 ${10 + glowIntensity * 20}px ${colors.accentDim}`,
          }}
        >
          {visibleLines.join("\n")}
        </pre>
      </div>
    </AbsoluteFill>
  );
};
