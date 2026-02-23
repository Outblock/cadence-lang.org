import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Camera3DProps = {
  children: React.ReactNode;
  /** Slow drift rotation in degrees */
  driftX?: number;
  driftY?: number;
  /** Push-in effect: start scale -> end scale */
  pushIn?: [number, number];
  /** Duration of push-in in seconds */
  pushDuration?: number;
};

export const Camera3D: React.FC<Camera3DProps> = ({
  children,
  driftX = 2,
  driftY = 3,
  pushIn,
  pushDuration = 4,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slow drift rotation (simulates subtle camera sway)
  const rotateX = interpolate(
    frame,
    [0, durationInFrames],
    [-driftX / 2, driftX / 2],
  );
  const rotateY = interpolate(
    frame,
    [0, durationInFrames],
    [-driftY / 2, driftY / 2],
  );

  // Push-in (dolly zoom)
  const scale = pushIn
    ? interpolate(frame, [0, pushDuration * fps], [pushIn[0], pushIn[1]], {
        extrapolateRight: "clamp",
        extrapolateLeft: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill
      style={{
        perspective: 1200,
        perspectiveOrigin: "50% 50%",
      }}
    >
      <AbsoluteFill
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          transformStyle: "preserve-3d",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
