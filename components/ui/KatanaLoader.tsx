"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import HeaderBtn from "./HeaderBtn";

type KatanaLoaderProps = {
  error?: string | null;
  onRetry?: () => void;
  serverReady: boolean;
  headSize?: number;
  headImage?: string;
};

export default function KatanaLoader({
  error,
  onRetry,
  serverReady,
  headSize = 50,
  headImage = "/images/characters/loading.svg",
}: KatanaLoaderProps) {

  const [progress, setProgress] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    let frame: number;
    let last = performance.now();

    const animate = (now: number) => {
      const delta = now - last;
      last = now;

      setProgress((p) => {
        if (serverReady) {
          // Smooth push to 100%
          const to100 = p + delta * 0.1; // slow final stretch
          return Math.min(100, to100);
        }
        let next = p + Math.random() * 0.6;
        if (Math.random() < 0.03) next = p + Math.random() * 0.3;
        if (Math.random() < 0.015) next = p + 5 + Math.random() * 5;

        return Math.min(95, next); // never reach 100 until backend says so
      });

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    animRef.current = frame;

    return () => cancelAnimationFrame(frame);
  }, [serverReady]);

  return (
    <>
      <div className="absolute inset-0 bg-black/45 z-0" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-10 gap-4 select-none">

        {/* BAR + HEAD */}
        <div className="w-full max-w-4xl mt-2 px-4 mx-auto flex flex-col items-center justify-center gap-10">
          <Image
            src={'/images/katana_seduction.svg'}
            alt="Katana Logo"
            width={160}
            height={160}
            draggable={false}
            className="w-32 h-32 sm:w-44 sm:h-44"
            priority
          />
          <div className="relative w-full h-5 bg-[#DFA8FF]">

            {/* Fill */}
            <div
              className="h-full bg-linear-to-r from-[#9850FB] to-[#330E56]"
              style={{ width: `${progress}%` }}
            />

            {/* Loader Head */}
            <div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `calc(${progress}% - ${headSize / 2}px)`,
                width: headSize,
                height: headSize,
              }}
            >
              <Image
                draggable={false}
                src={headImage}
                alt="loader-head"
                width={headSize}
                height={headSize}
                className="w-full h-full object-contain animate-spin drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
              />
            </div>
          </div>

          {/* LABEL */}
          <p className="text-center font-semibold font-montserrat text-[#E8C1FF] text-lg md:text-xl tracking-[15px]">
            LOADING...
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-3 flex flex-col items-center gap-2">
            <span className="text-xs text-red-200 text-center max-w-xs">
              {error}
            </span>

            {onRetry && (
              <HeaderBtn
                text="Retry"
                image="/images/buttons/demo.svg"
                color="text-white"
                onClick={onRetry}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
