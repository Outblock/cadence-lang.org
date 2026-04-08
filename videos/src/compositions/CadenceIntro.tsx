import React, { useEffect } from "react";
import { z } from "zod";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { GridBackground } from "../components/GridBackground";
import { Logo3D } from "../components/Logo3D";
import { HeroTitle } from "../components/HeroTitle";
import { TerminalCommands } from "../components/TerminalCommands";
import { AIChatDemo } from "../components/AIChatDemo";
import { Outro } from "../components/Outro";
import { COLORS, type Theme } from "../lib/colors";
import { loadGeist, loadGeistMono } from "../lib/fonts";

export const CadenceIntroSchema = z.object({
  theme: z.enum(["dark", "light"]),
});

type CadenceIntroProps = z.infer<typeof CadenceIntroSchema>;

export const CadenceIntro: React.FC<CadenceIntroProps> = ({ theme }) => {
  const { fps } = useVideoConfig();
  const colors = COLORS[theme];

  useEffect(() => {
    loadGeist();
    loadGeistMono();
  }, []);

  const T = Math.round(0.4 * fps); // 12 frame transitions

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <TransitionSeries>
        {/* Scene 1: 3D Logo (0–3s) */}
        <TransitionSeries.Sequence durationInFrames={3 * fps}>
          <AbsoluteFill>
            <GridBackground theme={theme} showGlow />
            <Logo3D theme={theme} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* Scene 2: Hero Title (3–6s) */}
        <TransitionSeries.Sequence durationInFrames={3 * fps}>
          <AbsoluteFill>
            <GridBackground theme={theme} showGlow />
            <HeroTitle theme={theme} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* Scene 3: Terminal Commands (6–10s) */}
        <TransitionSeries.Sequence durationInFrames={4 * fps}>
          <AbsoluteFill>
            <GridBackground theme={theme} />
            <TerminalCommands theme={theme} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* Scene 4: AI Chat Demo (10–13.5s) */}
        <TransitionSeries.Sequence durationInFrames={Math.round(3.5 * fps)}>
          <AbsoluteFill>
            <GridBackground theme={theme} />
            <AIChatDemo theme={theme} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: T })}
        />

        {/* Scene 5: Outro (13.5–15.5s) */}
        <TransitionSeries.Sequence durationInFrames={2 * fps}>
          <AbsoluteFill>
            <GridBackground theme={theme} showGlow />
            <Outro theme={theme} />
          </AbsoluteFill>
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
