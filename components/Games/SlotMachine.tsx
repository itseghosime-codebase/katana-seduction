"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import CircularButton from "../ui/CircularButton";
import SpinButton from "../ui/SpinButton";
import AmountSelector from "../ui/AmountSelector";
import ProgressSlider from "../ui/ProgressSlider";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";


interface SlotMachineProps {
    balance: number | null;
    setBalance: React.Dispatch<React.SetStateAction<number | null>>;
}


// ------------------------- Symbols -------------------------
const symbols = [
    "/images/characters/amor-hand.svg",
    "/images/characters/amor.svg",
    "/images/characters/blue-diamond.svg",
    "/images/characters/dager.svg",
    "/images/characters/diamond.svg",
    "/images/characters/flower.svg",
    "/images/characters/fox.svg",
    "/images/characters/gift-scroll.svg",
    "/images/characters/granade.svg",
    "/images/characters/lamp.svg",
    "/images/characters/malemasked.svg",
    "/images/characters/masked.svg",
    "/images/characters/medal.svg",
    "/images/characters/pink-diamond.svg",
    "/images/characters/ruby.svg",
    "/images/characters/sack-treasure.svg",
    "/images/characters/scroll.svg",
    "/images/characters/spikes.svg",
    "/images/characters/sword.svg",
    "/images/characters/template.svg",
];

// ------------------------- Bucket logic -------------------------
interface Bucket {
    symbol: string;
    min: number;
    max: number;
    value: number;
}

const bucketValues: Bucket[] = (() => {
    const buckets: Bucket[] = [];
    const count = symbols.length;
    let last = 0;
    for (let i = 0; i < count; i++) {
        const rem = Math.round(((i + 1) / count) * 100);
        const min = last + 1;
        const max = rem;
        last = rem;
        buckets.push({ symbol: symbols[i], min, max, value: Math.round((min + max) / 2) });
    }
    buckets[buckets.length - 1].max = 100;
    return buckets;
})();

function chooseSymbolByPower(power: number) {
    for (const b of bucketValues) {
        if (power >= b.min && power <= b.max) return b.symbol;
    }
    return symbols[0];
}

function choosePattern(power: number) {
    const bucket = bucketValues.find((b) => power >= b.min && power <= b.max);
    const bucketCenter = bucket ? bucket.value : Math.round(power);
    const remainder = Math.abs(power - bucketCenter);
    if (remainder <= 4) return "horizontal";
    if (remainder <= 10) return "vertical";
    return "diagonal";
}

// ------------------------- Helpers -------------------------
function randomColumn(rows: number, exclude: string[] = []): string[] {
    // Filter out any excluded symbols for this column
    const available = symbols.filter((s) => !exclude.includes(s));
    if (rows > available.length) {
        throw new Error("Not enough unique symbols to fill the column!");
    }

    const col: string[] = [];

    // Randomly pick without replacement
    const pool = [...available];
    for (let r = 0; r < rows; r++) {
        const idx = Math.floor(Math.random() * pool.length);
        col.push(pool[idx]);
        pool.splice(idx, 1); // remove to prevent duplicates
    }

    return col;
}


function applyWinningPattern(
    rows: number,
    cols: number,
    pattern: "horizontal" | "vertical" | "diagonal",
    winSymbol: string,
    middleRow: number
) {
    const grid: string[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "")
    );

    // Track used symbols per row to avoid duplicates
    const usedPerRow: string[][] = Array.from({ length: rows }, () => []);

    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            // Build pool excluding symbols already in this row
            const pool = symbols.filter(
                (s) => !usedPerRow[r].includes(s)
            );
            if (pool.length === 0) {
                throw new Error("Not enough unique symbols for this row");
            }
            const idx = Math.floor(Math.random() * pool.length);
            grid[r][c] = pool[idx];
            usedPerRow[r].push(pool[idx]);
        }
    }

    // Apply winning pattern
    if (pattern === "horizontal") {
        grid[middleRow] = grid[middleRow].map(() => winSymbol);
    } else if (pattern === "vertical") {
        const centerCol = Math.floor(cols / 2);
        for (let r = 0; r < rows; r++) grid[r][centerCol] = winSymbol;
    } else if (pattern === "diagonal") {
        const startCol = Math.max(0, Math.floor(cols / 2) - Math.floor(rows / 2));
        for (let r = 0; r < rows; r++) {
            const c = startCol + r;
            if (c >= 0 && c < cols) grid[r][c] = winSymbol;
        }
    }

    return grid;
}

function applyLosingGrid(rows: number, cols: number): string[][] {
    const grid: string[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "")
    );

    for (let c = 0; c < cols; c++) {
        const pool = [...symbols]; // fresh pool for each column
        for (let r = 0; r < rows; r++) {
            // pick random symbol from the pool
            const idx = Math.floor(Math.random() * pool.length);
            grid[r][c] = pool[idx];
            pool.splice(idx, 1); // remove to prevent column duplicates
        }
    }

    return grid;
}



// ------------------------- Component -------------------------
export default function SlotMachine({ balance, setBalance }: SlotMachineProps) {
    const rows = 5;
    const cols = 7;
    const middleRow = Math.floor(rows / 2);

    const [grid, setGrid] = useState<string[][]>(
        Array.from({ length: rows }, () => Array.from({ length: cols }, () => symbols[0]))
    );
    const [spinning, setSpinning] = useState(false);
    const intervals = useRef<(number | null)[]>([]);

    const searchParams = useSearchParams();
    const isReal = searchParams.get("real") === "1";

    // cached machine state
    const [minBet, setMinBet] = useState<number>(50);
    const [maxBet, setMaxBet] = useState<number>(1000);
    const [betAmount, setBetAmount] = useState<number>(10);
    const [progress, setProgress] = useState<number>(0);
    const [autoSpinning, setAutoSpinning] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);


    // const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
    // const [lastWinningPower, setLastWinningPower] = useState<number | null>(null);
    // const [lastSymbol, setLastSymbol] = useState<string | null>(null);

    // -------------------- Shoot Confetti -----------------------
    const shootConfetti = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval = window.setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                zIndex: 9999,
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                zIndex: 9999,
            });
        }, 250);
    };


    // ------------------------- fetch machine status ONCE -------------------------
    useEffect(() => {
        const fetchMachineStatus = async () => {
            try {
                const res = await fetch(`/api/slot/status?real=${isReal ? 1 : 0}`);
                const data = await res.json() as {
                    balance: number;
                    minBet: number;
                    maxAllowedBet: number;
                    canSpin: boolean;
                    mode: string;
                    isLoggedIn: boolean;
                };
                setBalance(data.balance);
                setMinBet(data.minBet);
                setMaxBet(data.maxAllowedBet);
                setIsLoggedIn(data.isLoggedIn)
            } catch (err) {
                console.error("fetchMachineStatus error:", err);
            }
        };

        fetchMachineStatus();

        // initialize grid once
        const initialGrid: string[][] = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => "")
        );
        for (let c = 0; c < cols; c++) {
            const col = randomColumn(rows);
            for (let r = 0; r < rows; r++) initialGrid[r][c] = col[r];
        }
        setGrid(initialGrid);
    }, [isReal]);

    // ------------------------- Spin helpers -------------------------
    const startColumnSpin = (colIndex: number) => {
        return window.setInterval(() => {
            setGrid((prev) => {
                const copy = prev.map((row) => [...row]);
                const newCol = randomColumn(rows);
                for (let r = 0; r < rows; r++) copy[r][colIndex] = newCol[r];
                return copy;
            });
        }, 70);
    };

    const stopColumnsSmoothly = async (finalGrid: string[][], delay = 150) => {
        for (let c = 0; c < cols; c++) {
            if (intervals.current[c]) {
                clearInterval(intervals.current[c]!);
                intervals.current[c] = null; // safer than `undefined as any`
            }

            setGrid((prev) => {
                const copy = prev.map((row) => [...row]);
                for (let r = 0; r < rows; r++) copy[r][c] = finalGrid[r][c];
                return copy;
            });

            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    };

    const animateToPower = (target: number, duration = 800) => {
        let start: number | null = null;
        const initial = progress;
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const t = Math.min(elapsed / duration, 1);
            setProgress(initial + (target - initial) * t);
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    // ------------------------- Main Spin -------------------------
    const spin = async () => {
        if (spinning) return;

        if (isReal && !isLoggedIn) {
            alert("You must log in to play the real game!");
            return;
        }

        setSpinning(true);
        // setLastWinAmount(null);
        // setLastWinningPower(null);
        // setLastSymbol(null);
        setProgress(0);

        for (let i = 0; i < cols; i++) {
            setTimeout(() => {
                intervals.current[i] = startColumnSpin(i);
            }, i * 100);
        }

        try {
            const res = await fetch(`/api/slot/play?real=${isReal ? 1 : 0}&bet_amount=${betAmount}`);
            const data = await res.json() as {
                bananaWon: number;
                newBalance: number;
                isWin: boolean;
                maxAllowedBet: number;
                minBet: number;
                canSpin: boolean;
                spinMessageExtra: string;
                mode: string;
                isLoggedIn: boolean;
                winningPower: number | null;
                symbol: string | null;
            };

            // console.log(data)

            // const winAmount = data.bananaWon ?? 0;
            const winningPower = data.winningPower ?? 0;
            const isWin = data.isWin ?? false;
            const returnedSymbol = data.symbol;

            const winSymbol =
                returnedSymbol && symbols.includes(returnedSymbol)
                    ? returnedSymbol
                    : chooseSymbolByPower(Math.max(1, Math.min(100, winningPower)));

            const pattern = choosePattern(Math.max(1, Math.min(100, winningPower)));

            const finalGrid = isWin
                ? applyWinningPattern(rows, cols, pattern, winSymbol, middleRow)
                : applyLosingGrid(rows, cols);

            await stopColumnsSmoothly(finalGrid);

            // ✅ Update balance from backend response
            setBalance(data.newBalance ?? balance);


            if (isWin) {
                setAutoSpinning(false)
                shootConfetti()
            };

            // setLastWinAmount(winAmount);
            // setLastWinningPower(winningPower);
            // setLastSymbol(winSymbol);

            animateToPower(winningPower);
        } catch (err) {
            console.error(err);
            intervals.current.forEach((i) => {
                if (i !== null) clearInterval(i);
            });
            // alert("Spin failed. Check your network or session.");
        } finally {
            setSpinning(false);
        }
    };

    // ------------------------- AutoSpin -------------------------
    // useEffect(() => {
    //     if (!autoSpinning || spinning) return;
    //     const timer = window.setTimeout(spin, 5000);
    //     return () => clearTimeout(timer);
    // }, [autoSpinning, spinning]);


    useEffect(() => {
        if (!autoSpinning || spinning) {
            setCountdown(null); // reset countdown if off or currently spinning
            return;
        }

        // start countdown from 5 seconds
        let remaining = 5;
        setCountdown(remaining);

        const interval = setInterval(() => {
            remaining -= 1;
            setCountdown(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                spin(); // trigger spin
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [autoSpinning, spinning]);


    const handleAutoSpin = () => setAutoSpinning((prev) => !prev);

    return (
        <div className="relative z-20">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                <div className="relative w-full">
                    <div className="relative z-5 grid grid-cols-7 gap-3 lg:gap-4 py-8 lg:py-12 px-6 md:px-8 lg:px-14">
                        {grid.map((row, rIdx) =>
                            row.map((cell, cIdx) => (
                                <div key={`${rIdx}-${cIdx}`} className="flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 lg:w-16 lg:h-16 overflow-hidden">
                                    <Image src={symbols.includes(cell) ? cell : symbols[0]} alt="Symbol" width={70} height={70} className="object-contain h-full w-full" draggable={false} />
                                </div>
                            ))
                        )}
                    </div>
                    <Image draggable={false} src="/images/game-bg.png" alt="background Box" fill sizes="100%" className="absolute top-0 left-0 w-full h-full z-0" />
                </div>
                <div className="flex flex-wrap justify-center md:flex-col gap-4 items-center w-full md:w-auto">
                    <CircularButton
                        text={
                            spinning
                                ? "ON"                        // spinning
                                : countdown !== null
                                    ? countdown.toString()        // show countdown
                                    : autoSpinning
                                        ? "ON"                        // auto-spin enabled
                                        : "AUTOSPIN"                  // auto-spin off
                        }
                        onClick={handleAutoSpin}
                        disabled={spinning}
                    />
                    <SpinButton onClick={spin} disabled={spinning || autoSpinning} />
                    <AmountSelector min={minBet} max={maxBet} step={1} value={betAmount} onChange={(val) => setBetAmount(val)} disabled={spinning || autoSpinning} />
                </div>
            </div>
            <div className="mt-4"><ProgressSlider progress={progress} /></div>
        </div>
    );
}
