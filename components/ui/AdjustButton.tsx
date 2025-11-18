"use client";

import Image from "next/image";

interface GameButtonProps {
    text: string;
    disabled?: boolean;
    image?: string;
    width?: number;
    height?: number;
    onClick?: () => void;
}

export default function AdjustButton({
    text,
    disabled,
    image = "/images/buttons/button-cir.svg",
    width = 130,
    height = 130,
    onClick,
}: GameButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
        font-extrabold 
        text-base sm:text-lg md:text-xl      
        text-text 
        flex flex-col items-center relative
        transition-transform duration-200
        hover:scale-102 active:scale-95
        group w-20 h-20
      ${disabled ? "cursor-not-allowed" : ""}`}
            style={{ position: "relative" }}
            disabled={disabled}
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
            <Image
                draggable={false}
                src={text}
                alt="Add/Substract"
                sizes="100%"
                height={35}
                width={35}
                className="
          absolute top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-9 h-9 px-2 text-center
          transition-all duration-300
          group-hover:scale-105
          animate-pulse-slow 
        "/>
        </button>
    );
}
