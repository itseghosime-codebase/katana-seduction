"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface GameButtonProps {
  text?: string;
  image?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
  disabled?: boolean;
  /** When true, the image spins with accelerating speed, and decelerates when false */
  spinning?: boolean;
}

export default function SpinButton({
  text = "SPIN",
  image = "/images/buttons/button-str.svg",
  width = 260,
  height = 260,
  onClick,
  disabled,
  spinning = false,
}: GameButtonProps) {
  const [angle, setAngle] = useState(0);

  const velocityRef = useRef(0); // degrees per ms
  const lastTimeRef = useRef<number | null>(null);
  const spinningRef = useRef(spinning);

  // keep ref in sync with prop
  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  // Tunables
  const MIN_SPEED = 0.07;  // base start speed
  const MAX_SPEED = 0.55;  // max speed
  const ACCEL = 0.0011;    // acceleration
  const DECEL = 0.0008;    // deceleration
  const STOP_EPS = 0.0002; // near-zero threshold

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

      const shouldSpin = spinningRef.current;
      const targetSpeed = shouldSpin ? MAX_SPEED : 0;
      let v = velocityRef.current;

      if (shouldSpin && v === 0) {
        v = MIN_SPEED; // kick off from rest
      }

      if (targetSpeed > v) {
        v = Math.min(targetSpeed, v + ACCEL * dt); // accelerate
      } else if (targetSpeed < v) {
        v = Math.max(targetSpeed, v - DECEL * dt); // decelerate
      }

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

  // heartbeat / breathing only when not spinning
  const heartbeatClass = !spinning && !disabled ? "heartbeat-loop" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${disabled ? "cursor-not-allowed" : ""}
        font-extrabold 
        text-base sm:text-lg md:text-xl      
        text-[#E6D7FF] 
        flex flex-col items-center relative
        transition-transform duration-200
        hover:scale-102 active:scale-95
        group
        w-40 sm:w-44 lg:w-[200px]  
        h-40 sm:h-44 lg:h-[200px]
        ${heartbeatClass}
      `}
      style={{ position: "relative" }}
    >
      {/* Rotating wrapper */}
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

      {/* Static label */}
      <span
        className="
          absolute top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-full px-2 text-center
          transition-all duration-300
          group-hover:scale-105
          text-xl md:text-3xl lg:text-4xl     
        "
      >
        {text}
      </span>
    </button>
  );
}
