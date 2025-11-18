"use client";

import Image from "next/image";

interface GameButtonProps {
    text: string;
    image?: string;
    width?: number;
    height?: number;
    color?: string;
    onClick?: () => void;
}

export default function HeaderBtn({
    text,
    image = "/images/buttons/button-rec.svg",
    width = 130,
    height = 57,
    color = 'text-text',
    onClick,
}: GameButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
                 font-extrabold 
        text-base sm:text-lg md:text-xl      
        ${color}
        flex flex-col items-center relative
        transition-transform duration-200
        hover:scale-102 active:scale-95
        group
        w-[130px]  
        h-[57px]`}
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
          text-xs       
        "
            >
                {text}
            </span>
        </button>
    );
}
