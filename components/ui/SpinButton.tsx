"use client";

import Image from "next/image";

interface GameButtonProps {
    text?: string;
    image?: string;
    width?: number;
    height?: number;
    onClick?: () => void;
    disabled?: boolean;
}

export default function SpinButton({
    text = 'SPIN',
    image = "/images/buttons/button-cir.svg",
    width = 260,
    height = 260,
    onClick,
    disabled,
}: GameButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${disabled ? "cursor-not-allowed" : ""}
        font-extrabold 
        text-base sm:text-lg md:text-xl      
        text-text 
        flex flex-col items-center relative
        transition-transform duration-200
        hover:scale-102 active:scale-95
        group
        w-40 sm:w-44 lg:w-[200px]  
        h-40  sm:h-44 lg:h-[200px]`}
            style={{ position: "relative" }}
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
            <span
                className="
          absolute top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-full px-2 text-center
          transition-all duration-300
          group-hover:scale-105
          animate-pulse-slow
          text-xl md:text-3xl lg:text-5xl     
        "
            >
                {text}
            </span>
        </button>
    );
}
