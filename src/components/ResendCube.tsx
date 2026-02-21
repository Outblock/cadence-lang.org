import React from 'react';

export function ResendCube() {
    return (
        <div className="cube-container w-[200px] h-[200px] perspective-[800px]">
            <div className="cube relative w-full h-full transform-style-3d animate-spin-slow">
                <div className="face front absolute w-full h-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md translate-z-[100px] flex items-center justify-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full blur-xl" />
                </div>
                <div className="face back absolute w-full h-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md translate-z-[-100px] rotate-y-180 flex items-center justify-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full blur-xl" />
                </div>
                <div className="face right absolute w-full h-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md rotate-y-90 translate-z-[100px] flex items-center justify-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full blur-xl" />
                </div>
                <div className="face left absolute w-full h-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md rotate-y-[-90px] translate-z-[100px] flex items-center justify-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full blur-xl" />
                </div>
                <div className="face top absolute w-full h-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md rotate-x-90 translate-z-[100px] flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-2 opacity-20">
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <div className="w-2 h-2 bg-white rounded-full" />
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                </div>
                <div className="face bottom absolute w-full h-full border border-zinc-800 bg-zinc-950/80 backdrop-blur-md rotate-x-[-90px] translate-z-[100px] flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-t from-emerald-500/10 to-transparent" />
                </div>
            </div>
            <style jsx>{`
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .translate-z-\[100px\] { transform: translateZ(100px); }
        .translate-z-\[-100px\] { transform: translateZ(-100px); }
        .rotate-y-180 { transform: rotateY(180deg) translateZ(100px); }
        .rotate-y-90 { transform: rotateY(90deg) translateZ(100px); }
        .rotate-y-\[-90px\] { transform: rotateY(-90deg) translateZ(100px); }
        .rotate-x-90 { transform: rotateX(90deg) translateZ(100px); }
        .rotate-x-\[-90px\] { transform: rotateX(-90deg) translateZ(100px); }
        
        @keyframes spin-slow {
          from { transform: rotateX(-15deg) rotateY(0deg); }
          to { transform: rotateX(-15deg) rotateY(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
        </div>
    );
}
