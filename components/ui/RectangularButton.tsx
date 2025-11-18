"use client";

import Image from "next/image";

interface GameButtonProps {
    text: string;
    image?: string;
    width?: number;
    height?: number;
    onClick?: () => void;
}

export default function RectangularButton({
    text,
    image = "/images/buttons/button-rec.svg",
    width = 325,
    height = 125,
    onClick,
}: GameButtonProps) {
    return (
        <button
            onClick={onClick}
            className="
        font-extrabold 
        text-base sm:text-lg md:text-xl      
        text-text
        flex flex-col items-center relative
        transition-transform duration-200
        hover:scale-102 active:scale-95
        group
        w-[260px] sm:w-[300px] md:w-[325px]  
        h-[90px]  sm:h-[110px] md:h-[125px]
      "
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
          text-sm sm:text-lg md:text-xl       
        "
            >
                {text}
            </span>
        </button>
    );
}
