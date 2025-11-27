"use client";

import SlotMachine from "@/components/Games/SlotMachine";
import HeaderBtn from "@/components/ui/HeaderBtn";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import KatanaLoader from "../ui/KatanaLoader";

export default function KatanaGame() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [balance, setBalance] = useState<number | null>(null);
  const [isRealGame, setIsRealGame] = useState(
    searchParams.get("real") === "1"
  );

  const [loadError, setLoadError] = useState<string | null>(null);

  // timing config
  const MIN_LOAD_TIME = 3000;              // loader visible at least 3s
  const EXTRA_DELAY_AFTER_READY = 2000;    // +2s after fetch completes

  const loadStart = useRef<number>(Date.now()); // when loader cycle started
  const [shouldShowLoader, setShouldShowLoader] = useState(true);

  const fetchCurrentBalance = async (realValue: number) => {
    // new cycle
    loadStart.current = Date.now();
    setShouldShowLoader(true);
    setLoadError(null);

    try {
      const res = await fetch(`/api/slot/status?real=${realValue}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Bad response");

      const data = await res.json();
      setBalance(data.balance ?? 0);

      // mark when backend finished
      const now = Date.now();
      const minEndTime = loadStart.current + MIN_LOAD_TIME;          // min total time
      const readyPlusDelay = now + EXTRA_DELAY_AFTER_READY;          // +2s after fetch
      const endTime = Math.max(minEndTime, readyPlusDelay);          // satisfy both

      const delay = Math.max(endTime - now, 0);

      setTimeout(() => {
        setShouldShowLoader(false);
      }, delay);
    } catch (e) {
      console.error(e);
      setLoadError("We can't reach the game server.");
      setBalance(null);

      // even on error, respect the timing so UX feels consistent
      const now = Date.now();
      const minEndTime = loadStart.current + MIN_LOAD_TIME;
      const readyPlusDelay = now + EXTRA_DELAY_AFTER_READY;
      const endTime = Math.max(minEndTime, readyPlusDelay);
      const delay = Math.max(endTime - now, 0);

      setTimeout(() => {
        setShouldShowLoader(false);
      }, delay);
    }
  };

  useEffect(() => {
    fetchCurrentBalance(isRealGame ? 1 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealGame]);

  const toggleGameMode = () => {
    const newMode = !isRealGame;
    setIsRealGame(newMode);
    setBalance(null);
    router.push(`/katana?real=${newMode ? 1 : 0}`);

    // start new loader cycle immediately
    loadStart.current = Date.now();
    setShouldShowLoader(true);
    fetchCurrentBalance(newMode ? 1 : 0);
  };

  const resetBalance = async () => {
    try {
      const realValue = isRealGame ? 1 : 0;

      // new loader cycle on reset
      loadStart.current = Date.now();
      setShouldShowLoader(true);
      setLoadError(null);

      await fetch(`/api/slot/reset?real=${realValue}`, {
        cache: "no-store",
      });

      await fetchCurrentBalance(realValue);
    } catch (e) {
      console.error("RESET FAILED", e);
      setLoadError("Reset failed.");

      const now = Date.now();
      const minEndTime = loadStart.current + MIN_LOAD_TIME;
      const readyPlusDelay = now + EXTRA_DELAY_AFTER_READY;
      const endTime = Math.max(minEndTime, readyPlusDelay);
      const delay = Math.max(endTime - now, 0);

      setTimeout(() => {
        setShouldShowLoader(false);
      }, delay);
    }
  };

  return (
    <>
      {/* HEADER */}
      <div
        className={`flex flex-wrap gap-4 items-center w-full justify-center ${!shouldShowLoader && balance ? "md:justify-between" : ""} bg-primary py-3 px-4 md:px-10`}
      >
        <div className="flex items-center gap-3">
          <Image
            src={"/images/katana_seduction.svg"}
            alt="Katana"
            width={50}
            height={50}
          />
          <h1 className="text-xl font-bold text-black">KATANA SEDUCTION</h1>
        </div>

        {!shouldShowLoader && balance !== null && (
          <div className="flex flex-wrap justify-center items-center gap-4">
            <button className="py-2.5 px-6 bg-[#A837E2] border-3 border-[#340F72] rounded-2xl font-bold">
              {balance.toLocaleString()}
            </button>

            <HeaderBtn
              text={isRealGame ? "DEMO GAME" : "REAL GAME"}
              image={
                isRealGame
                  ? "/images/buttons/real.svg"
                  : "/images/buttons/demo.svg"
              }
              color="text-white"
              onClick={toggleGameMode}
            />

            <HeaderBtn
              text="RESET"
              image="/images/buttons/real.svg"
              color="text-[#CFCFCF]"
              onClick={resetBalance}
            />
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="relative flex-1 flex items-center p-4 md:p-8 w-full">
        <Image
          src={"/images/start_background.png"}
          alt="Background"
          fill
          className="absolute inset-0 object-cover z-0"
        />

        {shouldShowLoader ? (
          <KatanaLoader
            serverReady={false /* it just animates by itself */}
            error={loadError}
            onRetry={() => fetchCurrentBalance(isRealGame ? 1 : 0)}
          />
        ) : (
          <>
            <Suspense fallback={<div className="text-white">Loading Slot…</div>}>
              <SlotMachine balance={balance} setBalance={setBalance} />
            </Suspense>
            <Image
              src={"/images/avatars/lets-play.png"}
              alt="Avatar"
              width={433}
              height={538}
              className="absolute bottom-0 right-0 pointer-events-none z-0 w-56 md:w-72 lg:w-96"
            />
          </>
        )}
      </div>
    </>
  );
}
