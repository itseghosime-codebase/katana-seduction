'use client'
import SlotMachine from '@/components/Games/SlotMachine'
import HeaderBtn from '@/components/ui/HeaderBtn'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState<number | null>(null);

  // Initialize mode from query param
  const initialReal = searchParams.get('real') === '1';
  const [isRealGame, setIsRealGame] = useState(initialReal);

  const toggleGameMode = () => {
    const newMode = !isRealGame;
    setIsRealGame(newMode);
    router.push(`/katana?real=${newMode ? 1 : 0}`);
  };

  const resetBalance = async () => {
    try {
      const realValue = isRealGame ? 1 : 0;

      // reset the backend
      await fetch(`/api/slot/reset?real=${realValue}`, {
        method: "GET",
        cache: "no-store",
      });

      // now fetch new balance using the SAME session cookie
      const statusRes = await fetch(`/api/slot/status?real=${realValue}`, {
        method: "GET",
        cache: "no-store",
      });

      const statusData = await statusRes.json();
      setBalance(statusData.balance);

    } catch (e) {
      console.error("Reset failed", e);
    }
  };



  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center w-full justify-center md:justify-between bg-primary py-2 px-4 md:px-10">

        {/* Logo + Title */}
        <div className="flex items-center gap-2 md:gap-3 justify-center">
          <Image
            src={'/images/katana_seduction.svg'}
            alt="Katana Logo"
            width={50}
            height={50}
            draggable={false}
            className="w-10 h-10 md:w-14 md:h-14"
            priority
          />
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-black text-center shrink-0">
            KATANA SEDUCTION
          </h1>
        </div>

        <div className='flex items-center justify-center gap-3 flex-wrap md:gap-5'>

          {/* Balance */}
          <button className="py-2.5 font-bold min-h-12 min-w-22 shadow-[inset_-1px_-1px_7px_rgba(0,0,0,0.3)] px-6 bg-[#A837E2] border-3 border-[#340F72] rounded-2xl">
            {balance !== null ? balance.toLocaleString() : '---'}
          </button>

          {/* Toggle Button */}
          <HeaderBtn
            text={!isRealGame ? 'REAL GAME' : 'DEMO GAME'}
            image={isRealGame ? '/images/buttons/real.svg' : '/images/buttons/demo.svg'}
            color="text-white"
            onClick={toggleGameMode}
          />

          {/* Reset Button */}
          <HeaderBtn
            text='RESET'
            image='/images/buttons/real.svg'
            color='text-[#CFCFCF]'
            onClick={resetBalance}
          />
        </div>
      </div>

      {/* Body */}
      <div className="relative flex-1 flex items-center p-4 md:p-8 w-full">
        <Image
          src={'/images/start_background.png'}
          alt="Background Image"
          priority
          sizes="100%"
          draggable={false}
          fill
          className="h-full w-full inset-0 bg-cover object-cover object-center absolute z-0"
        />

        {/* Game */}
        <div className='flex items-center justify-start'>
          <SlotMachine balance={balance} setBalance={setBalance} />
        </div>

        {/* Absolute Characters */}
        <Image
          src={'/images/avatars/lets-play.png'}
          alt="Character Back"
          priority
          draggable={false}
          width={433}
          height={538}
          className="
            absolute bottom-0 right-0 z-0
            w-56 md:w-72 lg:w-96
            pointer-events-none select-none
          "
        />
      </div>
    </>
  )
}
