'use client'
import RectangularButton from "@/components/ui/RectangularButton";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const startGame = (isReal: boolean) => {
    // navigate to /katana page with query parameter
    router.push(`/katana?real=${isReal ? 1 : 0}`);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-center bg-primary py-2 px-4 md:px-10 w-full">
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
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-black text-center">
            KATANA SEDUCTION
          </h1>
        </div>
      </div>
      <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 w-full">
        <Image
          src={'/images/start_background.png'}
          alt="Background Image"
          priority
          sizes="100%"
          fill
          draggable={false}
          className="h-full w-full inset-0 object-cover object-center absolute z-0"
        />

        <div className="flex flex-col items-center relative z-10 gap-2 lg:gap-4">
          <Image
            src={'/images/katana_seduction.svg'}
            alt="Katana Logo"
            width={160}
            height={160}
            draggable={false}
            className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56"
            priority
          />

          <RectangularButton text="PLAY FREE DEMO" onClick={() => startGame(false)} />
          <RectangularButton text="PLAY WITH MONEY" onClick={() => startGame(true)} />
        </div>

        {/* Absolute Characters */}
        <Image
          src={'/images/avatars/front-view.png'}
          alt="Character Front"
          priority
          width={400}
          height={500}
          draggable={false}
          className="
          absolute bottom-0 left-0 z-0
          w-56 md:w-72 lg:w-96
          pointer-events-none select-none
        "
        />

        <Image
          src={'/images/avatars/back-view.png'}
          alt="Character Back"
          priority
          width={400}
          height={500}
          draggable={false}
          className="
          absolute bottom-0 right-0 z-0
          w-56 md:w-72 lg:w-96
          pointer-events-none select-none
        "
        />
      </div>
    </>
  );
}
