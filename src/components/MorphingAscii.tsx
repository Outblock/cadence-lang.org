import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AsciiRenderer, Float, useTexture, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

// ----------------------------------------------------
// SCENE COMPONENTS
// ----------------------------------------------------

function FlowCoin() {
  const texture = useTexture('/assets/flow-logo.svg');

  return (
    <group scale={0.85}>
      {/* Front Face */}
      <mesh position={[0, 0, 0.11]}>
        <circleGeometry args={[2, 64]} />
        <meshStandardMaterial map={texture} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Back Face */}
      <mesh position={[0, 0, -0.11]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[2, 64]} />
        <meshStandardMaterial map={texture} roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Edge */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[2, 2, 0.22, 64, 1, true]} />
        <meshStandardMaterial color="#00FF94" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

function CryptoKitty3D() {
  const { scene } = useGLTF('/assets/cryptokitty.glb');

  // We apply a meshStandardMaterial to all children to ensure it catches the green lighting beautifully
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Keep original geometry but ensure it has some roughness for the ASCII shader light
        child.material.roughness = 0.5;
        child.material.metalness = 0.2;
      }
    });
  }, [scene]);

  return (
    <group position={[0, -0.4, 0]}>
      <primitive object={scene} scale={2.2} />
    </group>
  );
}

useGLTF.preload('/assets/cryptokitty.glb');

function AsciiScene({ activeCycleIdx, fgColor }: { activeCycleIdx: number; fgColor: string }) {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 10]} intensity={3} />
      <pointLight position={[-10, -10, -10]} intensity={1} />

      <Suspense fallback={null}>
        <Float speed={2.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <group visible={activeCycleIdx === 0}>
            <FlowCoin />
          </group>
          <group visible={activeCycleIdx === 1}>
            <CryptoKitty3D />
          </group>
        </Float>
      </Suspense>

      {/* Ascii shader layer */}
      <AsciiRenderer
        fgColor={fgColor}
        bgColor="transparent"
        characters=" .:'-+*=%@#"
        resolution={0.25}
        color={false}
        invert={false}
      />
    </>
  );
}

// ----------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------

export function MorphingAscii() {
  const [activeCycleIdx, setActiveCycleIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCycleIdx(prev => (prev + 1) % 2);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div className="w-full h-[280px] lg:h-[700px] lg:w-[700px]" />;
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-0 m-0 pointer-events-none lg:pointer-events-auto lg:cursor-grab lg:active:cursor-grabbing group w-full h-[280px] lg:h-[700px] lg:w-[700px] lg:relative lg:-right-5 overflow-hidden lg:overflow-visible">

      {/* 3D ASCII Canvas - No box, totally borderless */}
      <div
        className="absolute inset-0 overflow-hidden lg:overflow-visible ascii-wrapper"
      >
        {resolvedTheme === 'light' && (
          <style>{`
            .ascii-wrapper > div {
              font-weight: 900 !important;
            }
          `}</style>
        )}
        <Canvas camera={{ position: [0, 0, 6.5], fov: 50 }}>
          <color attach="background" args={['transparent']} />
          <AsciiScene
            activeCycleIdx={activeCycleIdx}
            fgColor={resolvedTheme === 'light' ? '#000000' : '#00FF94'}
          />
          {/* Disable rotation on mobile to avoid scroll conflict */}
          <OrbitControls
            autoRotate
            autoRotateSpeed={6}
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Canvas>
      </div>

    </div>
  );
}
