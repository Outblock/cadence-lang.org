import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  continueRender,
  delayRender,
} from "remotion";
import { COLORS, type Theme } from "../lib/colors";

const ASCII_CHARS = " .,:;i1tfLCG08@";
const RESOLUTION = 0.15; // Fraction of full res for ASCII sampling
const COLS_TARGET = 160;

type Logo3DProps = {
  theme: Theme;
};

export const Logo3D: React.FC<Logo3DProps> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const colors = COLORS[theme];

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctx2dRef = useRef<CanvasRenderingContext2D | null>(null);
  const [handle] = useState(() => delayRender("Loading 3D model"));
  const [ready, setReady] = useState(false);

  // ASCII grid dimensions
  const cols = COLS_TARGET;
  const rows = Math.floor((height / width) * cols * 0.5); // Adjust for char aspect ratio

  // Sampling canvas dimensions (integers)
  const sampleW = Math.floor(width * RESOLUTION);
  const sampleH = Math.floor(height * RESOLUTION);

  // Initialize Three.js scene once
  useEffect(() => {
    // Create offscreen canvas for WebGL
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.5);
    cameraRef.current = camera;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 3);
    dir.position.set(10, 10, 10);
    scene.add(dir);
    const point = new THREE.PointLight(0xffffff, 1);
    point.position.set(-10, -10, -10);
    scene.add(point);

    // 2D canvas for pixel sampling
    const canvas2d = document.createElement("canvas");
    canvas2d.width = sampleW;
    canvas2d.height = sampleH;
    canvasRef.current = canvas2d;
    ctx2dRef.current = canvas2d.getContext("2d");

    // Load GLB model
    const loader = new GLTFLoader();
    loader.load(
      staticFile("logo.glb"),
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: "#ffffff",
              roughness: 0.4,
              metalness: 0.6,
            });
          }
        });
        scene.add(model);
        modelRef.current = model;
        setReady(true);
        continueRender(handle);
      },
      undefined,
      (err) => {
        console.error("Failed to load logo.glb:", err);
        continueRender(handle);
      },
    );

    return () => {
      renderer.dispose();
    };
  }, []);

  // Entrance spring
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const logoScale = interpolate(entranceSpring, [0, 1], [0, 1.2]);

  // Continuous rotation driven by frame
  const rotationY = frame * 0.04;

  // Subtle float bobbing
  const floatY = Math.sin(frame * 0.05) * 0.15;

  // Glow pulse
  const glowOpacity = interpolate(
    frame,
    [0.5 * fps, 1.5 * fps, 3 * fps],
    [0, 0.15, 0.06],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Render the 3D scene and convert to ASCII — runs every frame
  const asciiText = useMemo(() => {
    if (
      !ready ||
      !rendererRef.current ||
      !sceneRef.current ||
      !cameraRef.current ||
      !modelRef.current ||
      !ctx2dRef.current ||
      !canvasRef.current
    ) {
      return "";
    }

    const model = modelRef.current;
    model.rotation.set(0, rotationY, 0);
    model.scale.setScalar(logoScale);
    model.position.set(0, floatY, 0);

    // Render scene
    rendererRef.current.render(sceneRef.current, cameraRef.current);

    // Draw WebGL canvas to 2D canvas (downscaled)
    const ctx = ctx2dRef.current;
    ctx.clearRect(0, 0, sampleW, sampleH);
    ctx.drawImage(rendererRef.current.domElement, 0, 0, sampleW, sampleH);

    // Read pixels
    const imageData = ctx.getImageData(0, 0, sampleW, sampleH);
    const data = imageData.data;

    const cellW = sampleW / cols;
    const cellH = sampleH / rows;

    const lines: string[] = [];
    for (let row = 0; row < rows; row++) {
      let line = "";
      for (let col = 0; col < cols; col++) {
        const px = Math.min(Math.floor(col * cellW + cellW / 2), sampleW - 1);
        const py = Math.min(Math.floor(row * cellH + cellH / 2), sampleH - 1);
        const idx = (py * sampleW + px) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (0.3 * r + 0.59 * g + 0.11 * b) / 255;
        const charIdx = Math.floor(brightness * (ASCII_CHARS.length - 1));
        line += ASCII_CHARS[charIdx];
      }
      lines.push(line);
    }
    return lines.join("\n");
  }, [frame, ready, rotationY, logoScale, floatY]);

  const fgColor = theme === "dark" ? "#00FF94" : "#000000";

  return (
    <AbsoluteFill>
      {/* Glow behind */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: colors.accent,
          opacity: glowOpacity,
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />

      {/* ASCII output */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          opacity: entranceSpring,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <pre
          style={{
            margin: 0,
            color: fgColor,
            fontSize: 11,
            lineHeight: 1.05,
            fontFamily: "'Courier New', monospace",
            letterSpacing: "-0.02em",
            whiteSpace: "pre",
            textAlign: "center",
          }}
        >
          {asciiText}
        </pre>
      </div>
    </AbsoluteFill>
  );
};
