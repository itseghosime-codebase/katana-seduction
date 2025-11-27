"use client";

import { useState } from "react";
import Image from "next/image";
import { HiMiniSpeakerWave, HiMiniSpeakerXMark } from "react-icons/hi2";
import { IoMdSettings, IoMdClose } from "react-icons/io";
import { FiMoreVertical } from "react-icons/fi";

type HelpersProps = {
  sound: boolean;
  onToggleSound: () => void;
};

export default function Helpers({ sound, onToggleSound }: HelpersProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* DESKTOP / TABLET (md+) – stack on top-right */}
      <div className="hidden md:flex absolute z-90 text-white right-0 top-0 flex-col items-center justify-center gap-3">
        <button>
          <Image
            src={"/images/buttons/info.svg"}
            alt="Info Button"
            width={44}
            height={44}
            draggable={false}
            className="w-10 h-10 md:w-11 md:h-11 bg-black rounded-full"
            priority
          />
        </button>

        <button
          className="bg-[#9651F3] text-black rounded-full h-11 w-11 flex items-center justify-center"
          onClick={() => setSettingsOpen(true)}
        >
          <IoMdSettings size={20} />
        </button>

        <button
          className="bg-[#9651F3] text-black rounded-full h-11 w-11 flex items-center justify-center"
          onClick={onToggleSound}
        >
          {sound ? <HiMiniSpeakerWave size={20} /> : <HiMiniSpeakerXMark size={20} />}
        </button>
      </div>

      {/* MOBILE ONLY – FAB bottom-right that expands */}
      <div className="md:hidden fixed bottom-4 right-4 z-90 flex flex-col items-end">
        {/* Expanded row of buttons */}
        <div
          className={
            "flex flex-col items-center gap-2 mb-2 transition-all duration-200 " +
            (mobileOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-3 pointer-events-none")
          }
        >
          {/* Info */}
          <button className="bg-black/80 rounded-full h-10 w-10 flex items-center justify-center">
            <Image
              src={"/images/buttons/info.svg"}
              alt="Info Button"
              width={36}
              height={36}
              draggable={false}
              className="w-9 h-9 rounded-full"
              priority
            />
          </button>

          {/* Settings */}
          <button
            className="bg-[#9651F3] text-black rounded-full h-10 w-10 flex items-center justify-center"
            onClick={() => {
              setSettingsOpen(true);
              setMobileOpen(false);
            }}
          >
            <IoMdSettings size={18} />
          </button>

          {/* Sound */}
          <button
            className="bg-[#9651F3] text-black rounded-full h-10 w-10 flex items-center justify-center"
            onClick={onToggleSound}
          >
            {sound ? <HiMiniSpeakerWave size={18} /> : <HiMiniSpeakerXMark size={18} />}
          </button>
        </div>

        {/* Main FAB toggle */}
        <button
          className="h-12 w-12 rounded-full bg-[#9651F3] text-black flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <IoMdClose size={22} /> : <FiMoreVertical size={22} />}
        </button>
      </div>

      {/* Center settings modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-95 flex items-center justify-center">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSettingsOpen(false)}
          />

          {/* content */}
          <div className="relative z-96 w-[90%] max-w-md rounded-2xl bg-[#150821] border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.7)] p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm md:text-base font-semibold tracking-wide text-white">
                Settings
              </h2>
              <button
                className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                onClick={() => setSettingsOpen(false)}
              >
                <IoMdClose size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm text-gray-200">
              <span>Sound</span>
              <button
                className="px-3 py-1 rounded-full bg-[#9651F3] text-black text-xs font-medium"
                onClick={onToggleSound}
              >
                {sound ? "On" : "Off"}
              </button>
            </div>

            <div className="text-[11px] md:text-xs text-gray-400 mt-1">
              Add more settings here later (graphics, speed, autoplay rules, etc).
            </div>
          </div>
        </div>
      )}
    </>
  );
}
