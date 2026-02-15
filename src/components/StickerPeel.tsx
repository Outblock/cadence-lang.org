import { useRef, useEffect, useMemo, useState, CSSProperties } from 'react';

interface StickerPeelProps {
  imageSrc: string;
  rotate?: number;
  peelBackHoverPct?: number;
  peelBackActivePct?: number;
  peelEasing?: string;
  peelHoverEasing?: string;
  width?: number;
  shadowIntensity?: number;
  lightingIntensity?: number;
  initialPosition?: 'center' | 'random' | { x: number; y: number };
  peelDirection?: number;
  className?: string;
}

interface CSSVars extends CSSProperties {
  '--sticker-rotate'?: string;
  '--sticker-p'?: string;
  '--sticker-peelback-hover'?: string;
  '--sticker-peelback-active'?: string;
  '--sticker-peel-easing'?: string;
  '--sticker-peel-hover-easing'?: string;
  '--sticker-width'?: string;
  '--sticker-shadow-opacity'?: number;
  '--sticker-lighting-constant'?: number;
  '--peel-direction'?: string;
  '--sticker-start'?: string;
  '--sticker-end'?: string;
}

// Unique ID counter for SVG filter IDs (avoid collisions when multiple stickers)
let stickerIdCounter = 0;

const StickerPeel: React.FC<StickerPeelProps> = ({
  imageSrc,
  rotate = 30,
  peelBackHoverPct = 30,
  peelBackActivePct = 40,
  peelEasing = 'power3.out',
  peelHoverEasing = 'power2.out',
  width = 200,
  shadowIntensity = 0.6,
  lightingIntensity = 0.1,
  initialPosition = 'center',
  peelDirection = 0,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragTargetRef = useRef<HTMLDivElement>(null);
  const pointLightRef = useRef<SVGFEPointLightElement>(null);
  const pointLightFlippedRef = useRef<SVGFEPointLightElement>(null);
  const draggableInstanceRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [filterId] = useState(() => ++stickerIdCounter);

  const defaultPadding = 12;

  // Filter IDs unique per instance
  const ids = useMemo(
    () => ({
      pointLight: `pointLight-${filterId}`,
      pointLightFlipped: `pointLightFlipped-${filterId}`,
      dropShadow: `dropShadow-${filterId}`,
      expandAndFill: `expandAndFill-${filterId}`,
    }),
    [filterId],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initial position
  useEffect(() => {
    if (!mounted) return;
    const target = dragTargetRef.current;
    if (!target) return;

    if (initialPosition === 'center') return;

    let startX = 0,
      startY = 0;
    if (
      typeof initialPosition === 'object' &&
      initialPosition.x !== undefined &&
      initialPosition.y !== undefined
    ) {
      startX = initialPosition.x;
      startY = initialPosition.y;
    }

    import('gsap').then(({ gsap }) => {
      gsap.set(target, { x: startX, y: startY });
    });
  }, [mounted, initialPosition]);

  // Draggable
  useEffect(() => {
    if (!mounted) return;
    const target = dragTargetRef.current;
    if (!target) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      const { Draggable } = await import('gsap/Draggable');
      gsap.registerPlugin(Draggable);

      const draggable = Draggable.create(target, {
        type: 'x,y',
        inertia: true,
        onDrag(this: any) {
          const rot = gsap.utils.clamp(-24, 24, this.deltaX * 0.4);
          gsap.to(target, {
            rotation: rot,
            duration: 0.15,
            ease: 'power1.out',
          });
        },
        onDragEnd() {
          gsap.to(target, {
            rotation: 0,
            duration: 0.8,
            ease: 'power2.out',
          });
        },
      });

      draggableInstanceRef.current = draggable[0];

      cleanup = () => {
        if (draggableInstanceRef.current) {
          draggableInstanceRef.current.kill();
        }
      };
    })();

    return () => cleanup?.();
  }, [mounted]);

  // Light tracking
  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    let gsapRef: any;
    import('gsap').then(({ gsap }) => {
      gsapRef = gsap;
    });

    const updateLight = (e: Event) => {
      if (!gsapRef) return;
      const mouseEvent = e as MouseEvent;
      const rect = container.getBoundingClientRect();

      const x = mouseEvent.clientX - rect.left;
      const y = mouseEvent.clientY - rect.top;

      if (pointLightRef.current) {
        gsapRef.set(pointLightRef.current, { attr: { x, y } });
      }

      const normalizedAngle = Math.abs(peelDirection % 360);
      if (pointLightFlippedRef.current) {
        if (normalizedAngle !== 180) {
          gsapRef.set(pointLightFlippedRef.current, {
            attr: { x, y: rect.height - y },
          });
        } else {
          gsapRef.set(pointLightFlippedRef.current, {
            attr: { x: -1000, y: -1000 },
          });
        }
      }
    };

    container.addEventListener('mousemove', updateLight);
    return () => container.removeEventListener('mousemove', updateLight);
  }, [mounted, peelDirection]);

  // Touch handling
  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = () => container.classList.add('touch-active');
    const handleTouchEnd = () => container.classList.remove('touch-active');

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [mounted]);

  const cssVars: CSSVars = useMemo(
    () => ({
      '--sticker-rotate': `${rotate}deg`,
      '--sticker-p': `${defaultPadding}px`,
      '--sticker-peelback-hover': `${peelBackHoverPct}%`,
      '--sticker-peelback-active': `${peelBackActivePct}%`,
      '--sticker-peel-easing': peelEasing,
      '--sticker-peel-hover-easing': peelHoverEasing,
      '--sticker-width': `${width}px`,
      '--sticker-shadow-opacity': shadowIntensity,
      '--sticker-lighting-constant': lightingIntensity,
      '--peel-direction': `${peelDirection}deg`,
      '--sticker-start': `calc(-1 * ${defaultPadding}px)`,
      '--sticker-end': `calc(100% + ${defaultPadding}px)`,
    }),
    [
      rotate,
      peelBackHoverPct,
      peelBackActivePct,
      peelEasing,
      peelHoverEasing,
      width,
      shadowIntensity,
      lightingIntensity,
      peelDirection,
      defaultPadding,
    ],
  );

  const stickerMainStyle: CSSProperties = {
    clipPath: `polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end))`,
    transition: 'clip-path 0.6s ease-out',
    filter: `url(#${ids.dropShadow})`,
    willChange: 'clip-path, transform',
  };

  const flapStyle: CSSProperties = {
    clipPath: `polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-start) var(--sticker-start))`,
    top: `calc(-100% - var(--sticker-p) - var(--sticker-p))`,
    transform: 'scaleY(-1)',
    transition: 'all 0.6s ease-out',
    willChange: 'clip-path, transform',
  };

  const imageStyle: CSSProperties = {
    transform: `rotate(calc(${rotate}deg - ${peelDirection}deg))`,
    width: `${width}px`,
  };

  const shadowImageStyle: CSSProperties = {
    ...imageStyle,
    filter: `url(#${ids.expandAndFill})`,
  };

  // Don't render on server
  if (!mounted) return null;

  return (
    <div
      className={`absolute cursor-grab active:cursor-grabbing transform-gpu z-50 ${className}`}
      ref={dragTargetRef}
      style={cssVars}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .sticker-container-${filterId}:hover .sticker-main-${filterId},
          .sticker-container-${filterId}.touch-active .sticker-main-${filterId} {
            clip-path: polygon(var(--sticker-start) var(--sticker-peelback-hover), var(--sticker-end) var(--sticker-peelback-hover), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end)) !important;
          }
          .sticker-container-${filterId}:hover .sticker-flap-${filterId},
          .sticker-container-${filterId}.touch-active .sticker-flap-${filterId} {
            clip-path: polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-peelback-hover), var(--sticker-start) var(--sticker-peelback-hover)) !important;
            top: calc(-100% + 2 * var(--sticker-peelback-hover) - 1px) !important;
          }
          .sticker-container-${filterId}:active .sticker-main-${filterId} {
            clip-path: polygon(var(--sticker-start) var(--sticker-peelback-active), var(--sticker-end) var(--sticker-peelback-active), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end)) !important;
          }
          .sticker-container-${filterId}:active .sticker-flap-${filterId} {
            clip-path: polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-peelback-active), var(--sticker-start) var(--sticker-peelback-active)) !important;
            top: calc(-100% + 2 * var(--sticker-peelback-active) - 1px) !important;
          }
        `,
        }}
      />

      <svg width="0" height="0">
        <defs>
          <filter id={ids.pointLight}>
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feSpecularLighting
              result="spec"
              in="blur"
              specularExponent="100"
              specularConstant={lightingIntensity}
              lightingColor="white"
            >
              <fePointLight ref={pointLightRef} x="100" y="100" z="300" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
          </filter>

          <filter id={ids.pointLightFlipped}>
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feSpecularLighting
              result="spec"
              in="blur"
              specularExponent="100"
              specularConstant={lightingIntensity * 7}
              lightingColor="white"
            >
              <fePointLight
                ref={pointLightFlippedRef}
                x="100"
                y="100"
                z="300"
              />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
          </filter>

          <filter id={ids.dropShadow}>
            <feDropShadow
              dx="2"
              dy="4"
              stdDeviation={3 * shadowIntensity}
              floodColor="black"
              floodOpacity={shadowIntensity}
            />
          </filter>

          <filter id={ids.expandAndFill}>
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shape" />
            <feFlood floodColor="rgb(179,179,179)" result="flood" />
            <feComposite operator="in" in="flood" in2="shape" />
          </filter>
        </defs>
      </svg>

      <div
        className={`sticker-container-${filterId} relative select-none touch-none sm:touch-auto`}
        ref={containerRef}
        style={{
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
          transform: `rotate(${peelDirection}deg)`,
          transformOrigin: 'center',
        }}
      >
        <div className={`sticker-main-${filterId}`} style={stickerMainStyle}>
          <div style={{ filter: `url(#${ids.pointLight})` }}>
            <img
              src={imageSrc}
              alt=""
              className="block"
              style={imageStyle}
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <div
          className="absolute top-4 left-2 w-full h-full opacity-40"
          style={{ filter: 'brightness(0) blur(8px)' }}
        >
          <div className={`sticker-flap-${filterId}`} style={flapStyle}>
            <img
              src={imageSrc}
              alt=""
              className="block"
              style={shadowImageStyle}
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>

        <div
          className={`sticker-flap-${filterId} absolute w-full h-full left-0`}
          style={flapStyle}
        >
          <div style={{ filter: `url(#${ids.pointLightFlipped})` }}>
            <img
              src={imageSrc}
              alt=""
              className="block"
              style={shadowImageStyle}
              draggable="false"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickerPeel;
