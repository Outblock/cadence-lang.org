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

type AIChatDemoProps = {
  theme: Theme;
};

const QUESTION = "How do I create an NFT collection in Cadence?";
const ANSWER_PROSE = "Here's a basic NFT collection in Cadence:\n\n";
const ANSWER_CODE = `access(all) contract MyNFT {
    access(all) resource NFT {
        access(all) let id: UInt64
        init() { self.id = self.uuid }
    }

    access(all) resource Collection {
        access(all) var ownedNFTs: @{UInt64: NFT}

        access(all) fun deposit(token: @NFT) {
            self.ownedNFTs[token.id] <-! token
        }
    }
}`;
const ANSWER = ANSWER_PROSE + ANSWER_CODE;

export const AIChatDemo: React.FC<AIChatDemoProps> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = COLORS[theme];

  // Panel slide in
  const panelSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },
  });
  const panelX = interpolate(panelSpring, [0, 1], [500, 0]);
  const panelZ = interpolate(panelSpring, [0, 1], [-600, 0]);
  const panelRotateY = interpolate(panelSpring, [0, 1], [-25, -3]);

  // Question typing
  const qDelay = Math.round(0.6 * fps);
  const qFrame = Math.max(0, frame - qDelay);
  const qCharsPerFrame = QUESTION.length / (1.2 * fps);
  const qVisible = Math.min(
    QUESTION.length,
    Math.floor(qFrame * qCharsPerFrame),
  );

  // Answer streaming (starts after question is done)
  const aDelay = qDelay + Math.round(1.5 * fps);
  const aFrame = Math.max(0, frame - aDelay);
  const aCharsPerFrame = ANSWER.length / (3 * fps);
  const aVisible = Math.min(
    ANSWER.length,
    Math.floor(aFrame * aCharsPerFrame),
  );

  // Section title
  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 100px",
        perspective: 1400,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 60,
          alignItems: "center",
          width: "100%",
          maxWidth: 1200,
        }}
      >
        {/* Left: description */}
        <div style={{ flex: "0 0 360px", opacity: titleOpacity }}>
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
            Built-in AI Assistant
          </div>
          <h2
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 48,
              fontWeight: 700,
              color: colors.text,
              margin: 0,
              marginBottom: 20,
              lineHeight: 1.15,
              letterSpacing: -1,
            }}
          >
            Ask Cadence AI
          </h2>
          <p
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: 20,
              color: colors.textDim,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Get instant answers about Cadence syntax, best practices, and smart
            contract patterns — powered by Claude.
          </p>
        </div>

        {/* Right: Chat panel */}
        <div
          style={{
            flex: 1,
            transform: `translateX(${panelX}px) translateZ(${panelZ}px) rotateY(${panelRotateY}deg)`,
            transformStyle: "preserve-3d",
            opacity: panelSpring,
          }}
        >
          <div
            style={{
              background: colors.bgCard,
              border: `1px solid ${colors.border}`,
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: `0 25px 50px -12px ${theme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)"}`,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: `1px solid ${colors.border}`,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: colors.accent,
                }}
              />
              <span
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: 14,
                  fontWeight: 600,
                  color: colors.text,
                }}
              >
                Cadence AI
              </span>
              <span
                style={{
                  fontFamily: MONO_FONT_FAMILY,
                  fontSize: 11,
                  color: colors.textMuted,
                  marginLeft: "auto",
                }}
              >
                Cmd + /
              </span>
            </div>

            {/* Messages */}
            <div style={{ padding: "20px 24px", minHeight: 360 }}>
              {/* User message */}
              {qVisible > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontFamily: MONO_FONT_FAMILY,
                      fontSize: 11,
                      color: colors.accent,
                      marginBottom: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    you
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: 16,
                      color: colors.text,
                      lineHeight: 1.5,
                    }}
                  >
                    {QUESTION.slice(0, qVisible)}
                    {qVisible < QUESTION.length && (
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
                  </div>
                </div>
              )}

              {/* AI response */}
              {aVisible > 0 && (
                <div>
                  <div
                    style={{
                      fontFamily: MONO_FONT_FAMILY,
                      fontSize: 11,
                      color: colors.cmdGreen,
                      marginBottom: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    cadence ai
                  </div>
                  <pre
                    style={{
                      fontFamily: MONO_FONT_FAMILY,
                      fontSize: 14,
                      color: colors.text,
                      lineHeight: 1.5,
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {/* Prose part */}
                    {aVisible <= ANSWER_PROSE.length
                      ? ANSWER_PROSE.slice(0, aVisible)
                      : (
                        <>
                          {ANSWER_PROSE}
                          {highlightCadence(
                            ANSWER_CODE,
                            theme,
                            aVisible - ANSWER_PROSE.length,
                          )}
                        </>
                      )}
                    {aVisible < ANSWER.length && (
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: colors.accent,
                          marginLeft: 4,
                          verticalAlign: "middle",
                          opacity: interpolate(
                            frame % 30,
                            [0, 15, 30],
                            [0.3, 1, 0.3],
                          ),
                        }}
                      />
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
