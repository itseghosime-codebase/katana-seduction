"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface GameButtonProps {
  text: string;
  image?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
  disabled?: boolean;
  /** When true, the image spins with accelerating speed, and decelerates when false */
  spinning?: boolean;
}

export default function CircularButton({
  text,
  image = "/images/buttons/button-str.svg",
  width = 130,
  height = 130,
  onClick,
  disabled,
  spinning = false,
}: GameButtonProps) {
  const [angle, setAngle] = useState(0);

  const velocityRef = useRef(0); // degrees per ms
  const lastTimeRef = useRef<number | null>(null);

  const spinningRef = useRef(spinning);
  const disabledRef = useRef(!!disabled);

  // keep refs in sync with props
  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  useEffect(() => {
    disabledRef.current = !!disabled;
  }, [disabled]);

  // Tunables for “feel”
  const MIN_SPEED = 0.08;  // base start speed (deg/ms)
  const MAX_SPEED = 0.6;   // max speed (deg/ms)
  const ACCEL = 0.0010;    // acceleration toward MAX (deg/ms²)
  const DECEL = 0.0007;    // decel toward 0 (deg/ms²)
  const STOP_EPS = 0.0002; // threshold to consider as stopped

  useEffect(() => {
    let frameId: number;

    const loop = (time: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = time;
        frameId = requestAnimationFrame(loop);
        return;
      }

      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const shouldSpin = spinningRef.current && !disabledRef.current;

      // decide target speed
      const targetSpeed = shouldSpin ? MAX_SPEED : 0;
      let v = velocityRef.current;

      if (shouldSpin && v === 0) {
        // kick from rest
        v = MIN_SPEED;
      }

      if (targetSpeed > v) {
        // accelerate
        v = Math.min(targetSpeed, v + ACCEL * dt);
      } else if (targetSpeed < v) {
        // decelerate
        v = Math.max(targetSpeed, v - DECEL * dt);
      }

      // snap to full stop if very small
      if (!shouldSpin && Math.abs(v) < STOP_EPS) {
        v = 0;
      }

      velocityRef.current = v;

      if (v !== 0) {
        setAngle((prev) => (prev + v * dt) % 360);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      lastTimeRef.current = null;
      velocityRef.current = 0;
    };
  }, []);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-extrabold 
        text-base sm:text-lg md:text-xl      
        text-[#E6D7FF] 
        flex flex-col items-center relative
        transition-transform duration-200
        hover:scale-102 active:scale-95
        group w-[130px] h-[130px] ${
          disabled ? "cursor-not-allowed" : ""
        }`}
      style={{ position: "relative" }}
    >
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `rotate(${angle}deg)`,
          transformOrigin: "50% 50%",
          willChange: "transform",
        }}
      >
        <Image
          draggable={false}
          src={image}
          alt={text}
          width={width}
          height={height}
          sizes="100%"
          priority
          className="
            w-full h-full object-contain     
            transition-shadow duration-300
            group-hover:brightness-110
          "
        />
      </div>

      <span
        className="
          absolute top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-full px-2 text-center
          transition-all duration-300
          group-hover:scale-105
          animate-pulse-slow
          text-xs    
        "
      >
        {text}
      </span>
    </button>
  );
}
