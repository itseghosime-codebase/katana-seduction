"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ProgressSliderProps {
  progress?: number;        // external progress value (0–100)
  animated?: boolean;       // enable built-in animation
  duration?: number;        // animation speed
}

export default function ProgressSlider({
  progress,
  animated = false,
  duration = 4500,
}: ProgressSliderProps) {

  const [internalProgress, setInternalProgress] = useState(0);
  const finalProgress = progress ?? internalProgress;

  // Built-in animation mode
  useEffect(() => {
    if (!animated) return;

    let start: number | null = null;

    const easeInOut = (t: number) => {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;

      const elapsed = timestamp - start;
      const t = Math.min(elapsed / duration, 1);

      setInternalProgress(easeInOut(t) * 100);

      if (t < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [animated, duration]);

  const HEAD_SIZE = 50;

  return (
    <div className="w-full max-w-4xl mt-5 px-4 mx-auto select-none">

      {/* Track */}
      <div className="relative w-full h-5 bg-[#DFA8FF]">

        {/* Fill */}
        <div
          className="h-full bg-linear-to-r from-[#9850FB] to-[#330E56]"
          style={{ width: `${finalProgress}%` }}
        />

        {/* Slider Head */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `calc(${finalProgress}% - ${HEAD_SIZE / 2}px)`,
            width: HEAD_SIZE,
            height: HEAD_SIZE,
          }}
        >
          <Image
            draggable={false}
            src="/images/icons/slider-icon.svg"
            alt="tracker"
            width={HEAD_SIZE}
            height={HEAD_SIZE}
            className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]"
          />
        </div>
      </div>

      {/* Percentage */}
      <p className="text-center font-extrabold font-montserrat text-text text-lg md:text-xl mt-1 tracking-wide">
        {Math.round(finalProgress)}%
      </p>
    </div>
  );
}
