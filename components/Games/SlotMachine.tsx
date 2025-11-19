"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import CircularButton from "../ui/CircularButton";
import SpinButton from "../ui/SpinButton";
import AmountSelector from "../ui/AmountSelector";
import ProgressSlider from "../ui/ProgressSlider";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

/* -------------------- Symbols -------------------- */
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

/* -------------------- Bucket logic (20 buckets, values across 1..100) -------------------- */
interface Bucket {
    symbol: string;
    min: number;
    max: number;
    value: number; // representative "power" of this symbol (like SYMBOLS.power)
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
        buckets.push({
            symbol: symbols[i],
            min,
            max,
            value: Math.round((min + max) / 2),
        });
    }
    buckets[buckets.length - 1].max = 100;
    return buckets;
})();

/** Same idea as symbolForWinningPower in the HTML version:
 * pick the bucket with the highest value <= power.
 */
function bucketForPower(power: number): Bucket {
    const p = Math.max(1, Math.min(100, power));
    let best = bucketValues[0];
    for (const b of bucketValues) {
        if (b.value <= p && b.value >= best.value) {
            best = b;
        }
    }
    return best;
}

/* -------------------- Pattern chooser (remainder-based like HTML) -------------------- */
export type Pattern =
    | "horizontal_3"
    | "horizontal_5"
    | "vertical_3"
    | "diagonal_main"
    | "diagonal_rev"
    | "zigzag"
    | "vshape"
    | "mega_cross";

/**
 * HTML version logic:
 *   const symbol = symbolForWinningPower(p)
 *   const rem    = p - symbol.power
 *   const mod    = rem % 3
 *   0 => Horizontal
 *   1 => Vertical
 *   2 => Diagonal
 *
 * Here we do the same, then map those 3 "families" into concrete grid patterns.
 */
function patternFromPower(power: number): Pattern {
    const bucket = bucketForPower(power || 1);
    const remainder = Math.max(0, power - bucket.value);
    const mod = remainder % 3;

    if (mod === 0) {
        // Horizontal family
        return "horizontal_5";
    } else if (mod === 1) {
        // Vertical family
        return "vertical_3";
    } else {
        // Diagonal family
        return "diagonal_main";
    }
}

/* -------------------- Helpers -------------------- */
function randomUniqueColumn(rows: number, exclude: string[] = []) {
    // returns a column where symbols in the same column are unique if possible
    const available = symbols.filter((s) => !exclude.includes(s));
    if (rows > available.length) {
        // allow repeats if not enough symbols
        const col: string[] = [];
        for (let r = 0; r < rows; r++) col.push(symbols[Math.floor(Math.random() * symbols.length)]);
        return col;
    }
    const pool = [...available];
    const col: string[] = [];
    for (let r = 0; r < rows; r++) {
        const idx = Math.floor(Math.random() * pool.length);
        col.push(pool[idx]);
        pool.splice(idx, 1);
    }
    return col;
}

/* -------------------- Winning grid creator (patterns) -------------------- */
function applyWinningPattern(
    rows: number,
    cols: number,
    pattern: Pattern,
    winSymbol: string,
    middleRow: number
) {
    const grid: string[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "")
    );

    // fill random base
    for (let c = 0; c < cols; c++) {
        const col = randomUniqueColumn(rows);
        for (let r = 0; r < rows; r++) grid[r][c] = col[r];
    }

    const patternCells: { r: number; c: number }[] = [];

    function mark(r: number, c: number) {
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
            grid[r][c] = winSymbol;
            patternCells.push({ r, c });
        }
    }

    switch (pattern) {
        case "horizontal_3": {
            const start = Math.floor((cols - 3) / 2);
            for (let c = start; c < start + 3; c++) mark(middleRow, c);
            break;
        }
        case "horizontal_5": {
            const start = Math.floor((cols - 5) / 2);
            for (let c = start; c < start + 5; c++) mark(middleRow, c);
            break;
        }
        case "vertical_3": {
            const midCol = Math.floor(cols / 2);
            const start = Math.floor((rows - 3) / 2);
            for (let r = start; r < start + 3; r++) mark(r, midCol);
            break;
        }
        case "diagonal_main": {
            const offset = Math.floor((cols - rows) / 2);
            for (let r = 0; r < rows; r++) {
                const c = r + offset;
                mark(r, c);
            }
            break;
        }
        case "diagonal_rev": {
            const offset = Math.floor((cols - rows) / 2);
            for (let r = 0; r < rows; r++) {
                const c = cols - 1 - (r + offset);
                mark(r, c);
            }
            break;
        }
        case "zigzag": {
            const mid = Math.floor(cols / 2);
            for (let r = 0; r < rows; r++) {
                const c = mid + (r % 2 === 0 ? -2 : 2);
                mark(r, c);
            }
            break;
        }
        case "vshape": {
            const mid = Math.floor(cols / 2);
            for (let r = 0; r < rows; r++) {
                const left = mid - r;
                const right = mid + r;
                mark(r, left);
                mark(r, right);
            }
            break;
        }
        case "mega_cross": {
            const midR = Math.floor(rows / 2);
            const midC = Math.floor(cols / 2);
            for (let c = 0; c < cols; c++) mark(midR, c);
            for (let r = 0; r < rows; r++) mark(r, midC);
            for (let i = 0; i < Math.min(rows, cols); i++) {
                mark(i, i);
                mark(i, cols - 1 - i);
            }
            break;
        }
    }

    return { grid, patternCells };
}


/* -------------------- Losing grid: avoid accidental matches -------------------- */
function hasContiguousMatch(grid: string[][]) {
    const rows = grid.length;
    const cols = grid[0].length;

    // horizontal
    for (let r = 0; r < rows; r++) {
        let run = 1;
        for (let c = 1; c < cols; c++) {
            if (grid[r][c] === grid[r][c - 1]) {
                run++;
                if (run >= 2) return true;
            } else run = 1;
        }
    }

    // vertical
    for (let c = 0; c < cols; c++) {
        let run = 1;
        for (let r = 1; r < rows; r++) {
            if (grid[r][c] === grid[r - 1][c]) {
                run++;
                if (run >= 2) return true;
            } else run = 1;
        }
    }

    // diagonals (just check immediate neighbors)
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const v = grid[r][c];
            if (!v) continue;
            if (r + 1 < rows && c + 1 < cols && grid[r + 1][c + 1] === v) return true;
            if (r + 1 < rows && c - 1 >= 0 && grid[r + 1][c - 1] === v) return true;
        }
    }

    return false;
}

function applyLosingGrid(rows: number, cols: number) {
    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const grid: string[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));

        for (let c = 0; c < cols; c++) {
            const col = randomUniqueColumn(rows);
            for (let r = 0; r < rows; r++) grid[r][c] = col[r];
        }

        if (!hasContiguousMatch(grid)) return grid;
    }

    // fallback: tweak grid
    const fallback: string[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
    for (let c = 0; c < cols; c++) {
        const col = randomUniqueColumn(rows);
        for (let r = 0; r < rows; r++) fallback[r][c] = col[r];
    }

    for (let r = 0; r < rows; r++) {
        for (let c = 1; c < cols; c++) {
            if (fallback[r][c] === fallback[r][c - 1]) {
                const rr = Math.floor(Math.random() * rows);
                const cc = Math.floor(Math.random() * cols);
                const tmp = fallback[r][c];
                fallback[r][c] = fallback[rr][cc];
                fallback[rr][cc] = tmp;
            }
        }
    }

    return fallback;
}

/* -------------------- Audio feedback -------------------- */
function playSpinTone() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 440;
        g.gain.value = 0.02;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        setTimeout(() => {
            o.frequency.setValueAtTime(660, ctx.currentTime);
        }, 80);
        setTimeout(() => {
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
            o.stop(ctx.currentTime + 0.3);
        }, 250);
    } catch (e) {
        // ignore audio failures
    }
}

function playWinTone(power: number) {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const base = 220 + (power / 100) * 880; // 220-1100Hz
        o.type = "triangle";
        o.frequency.value = base;
        g.gain.value = 0.02 + (power / 100) * 0.08;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        setTimeout(() => o.frequency.linearRampToValueAtTime(base * 1.25, ctx.currentTime + 0.12), 120);
        setTimeout(() => o.frequency.linearRampToValueAtTime(base * 1.5, ctx.currentTime + 0.28), 280);
        setTimeout(() => {
            g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
            o.stop(ctx.currentTime + 0.65);
        }, 600);
    } catch (e) { }
}

/* -------------------- Component -------------------- */

interface SlotMachineProps {
    balance: number | null;
    setBalance: React.Dispatch<React.SetStateAction<number | null>>;
}

export default function SlotMachine({ balance, setBalance }: SlotMachineProps) {
    const rows = 5;
    const cols = 7;
    const middleRow = Math.floor(rows / 2);

    const [grid, setGrid] = useState<string[][]>(() =>
        Array.from({ length: rows }, () => Array.from({ length: cols }, () => symbols[0]))
    );
    const [spinning, setSpinning] = useState(false);
    const intervals = useRef<(number | null)[]>([]);
    const searchParams = useSearchParams();
    const isReal = searchParams.get("real") === "1";

    // machine state & UI
    const [minBet, setMinBet] = useState<number>(50);
    const [maxBet, setMaxBet] = useState<number>(1000);
    const [betAmount, setBetAmount] = useState<number>(50);
    const [progress, setProgress] = useState<number>(0); // WinningPower visually
    const [autoSpinning, setAutoSpinning] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    // Win UI
    const [lastWinCredits, setLastWinCredits] = useState<number | null>(null);
    const [lastWinSymbol, setLastWinSymbol] = useState<string | null>(null);
    const [lastWinningPower, setLastWinningPower] = useState<number | null>(null);
    const [winPatternUsed, setWinPatternUsed] = useState<Pattern | null>(null);
    const [showWinBanner, setShowWinBanner] = useState(false);

    // Track winning cells
    const [winningCells, setWinningCells] = useState<Set<string>>(new Set());

    // init
    useEffect(() => {
        const fetchMachineStatus = async () => {
            try {
                const res = await fetch(`/api/slot/status?real=${isReal ? 1 : 0}`);
                const data = (await res.json()) as {
                    balance: number;
                    minBet: number;
                    maxAllowedBet: number;
                    canSpin: boolean;
                    mode: string;
                    isLoggedIn: boolean;
                };
                if (typeof data.balance === "number") setBalance(data.balance);
                if (typeof data.minBet === "number") setMinBet(data.minBet);
                if (typeof data.maxAllowedBet === "number") setMaxBet(data.maxAllowedBet);
                if (typeof data.isLoggedIn === "boolean") setIsLoggedIn(data.isLoggedIn);
            } catch (err) {
                console.error("fetchMachineStatus error:", err);
            }
        };

        fetchMachineStatus();

        // initial random grid
        const initialGrid: string[][] = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""));
        for (let c = 0; c < cols; c++) {
            const col = randomUniqueColumn(rows);
            for (let r = 0; r < rows; r++) initialGrid[r][c] = col[r];
        }
        setGrid(initialGrid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReal]);

    /* -------------------- Column spin animation helpers -------------------- */
    const startColumnSpin = (colIndex: number) => {
        playSpinTone();
        return window.setInterval(() => {
            setGrid((prev) => {
                const copy = prev.map((row) => [...row]);
                const newCol = randomUniqueColumn(rows);
                for (let r = 0; r < rows; r++) copy[r][colIndex] = newCol[r];
                return copy;
            });
        }, 55 + Math.floor(Math.random() * 30));
    };

    const stopColumnsSmoothly = async (finalGrid: string[][], baseDelay = 140) => {
        for (let c = 0; c < cols; c++) {
            if (intervals.current[c]) {
                clearInterval(intervals.current[c]!);
                intervals.current[c] = null;
            }
            for (let r = 0; r < rows; r++) {
                setGrid((prev) => {
                    const copy = prev.map((row) => [...row]);
                    copy[r][c] = finalGrid[r][c];
                    return copy;
                });
                // eslint-disable-next-line no-await-in-loop
                await new Promise((res) => setTimeout(res, 18));
            }
            const jitter = Math.floor(Math.random() * 60) - 20;
            // eslint-disable-next-line no-await-in-loop
            await new Promise((res) => setTimeout(res, baseDelay + jitter));
        }
    };

    /* smooth progress bar animation */
    const animateToPower = (target: number, duration = 700) => {
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

    /* -------------------- Spin logic (HTML-like WinningPower logic) -------------------- */
    const spin = async () => {
        if (spinning) return;

        if (isReal && !isLoggedIn) {
            alert("You must log in to play the real game!");
            return;
        }

        intervals.current.forEach((i) => i && clearInterval(i));
        intervals.current = [];

        setSpinning(true);
        setShowWinBanner(false);
        setLastWinCredits(null);
        setLastWinningPower(null);
        setLastWinSymbol(null);
        setWinPatternUsed(null);
        setWinningCells(new Set());
        setProgress(0);

        for (let i = 0; i < cols; i++) {
            setTimeout(() => {
                intervals.current[i] = startColumnSpin(i);
            }, i * 90);
        }

        try {
            const res = await fetch(`/api/slot/play?real=${isReal ? 1 : 0}&bet_amount=${betAmount}`);
            const data = (await res.json()) as {
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
                pattern?: Pattern | null;
            };

            // Clamp WinningPower like HTML logic
            const winningPowerRaw = data.winningPower ?? 0;
            const winningPower = Math.max(0, Math.min(100, winningPowerRaw));
            const isWin = !!data.isWin;

            // 🔗 Same process as HTML:
            // 1) pick symbol bucket from WinningPower
            const bucket = bucketForPower(winningPower || 1);
            const winSymbol = bucket.symbol;

            // 2) use remainder-based mapping to a pattern family, then concrete pattern
            const pattern = patternFromPower(winningPower || 1);

            let finalGrid = [];
            let patternCells: { r: number; c: number }[] = [];

            if (isWin) {
                const { grid: g, patternCells: cells } = applyWinningPattern(
                    rows,
                    cols,
                    pattern,
                    winSymbol,
                    middleRow
                );
                finalGrid = g;
                patternCells = cells;
            } else {
                finalGrid = applyLosingGrid(rows, cols);
            }

            await stopColumnsSmoothly(finalGrid);

            setBalance(typeof data.newBalance === "number" ? data.newBalance : balance);

            if (isWin) {
                const positions = new Set<string>();
                for (const cell of patternCells) {
                    positions.add(`${cell.r}-${cell.c}`);
                }
                setWinningCells(positions);

                setLastWinCredits(typeof data.bananaWon === "number" ? data.bananaWon : 0);
                setLastWinSymbol(winSymbol);
                setLastWinningPower(winningPower);
                setWinPatternUsed(pattern);
                setShowWinBanner(true);

                animateToPower(winningPower);
                playWinTone(winningPower);
                triggerConfettiByPower(winningPower);
            } else {
                setWinningCells(new Set());
                animateToPower(0);
            }
        } catch (err) {
            console.error("spin error:", err);
            intervals.current.forEach((i) => i && clearInterval(i));
        } finally {
            setSpinning(false);
            intervals.current.forEach((i) => i && clearInterval(i));
            intervals.current = [];
        }
    };

    /* -------------------- autoplay -------------------- */
    useEffect(() => {
        if (!autoSpinning || spinning) {
            setCountdown(null);
            return;
        }
        let remaining = 5;
        setCountdown(remaining);
        const interval = setInterval(() => {
            remaining -= 1;
            setCountdown(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
                spin();
            }
        }, 1000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoSpinning, spinning]);

    const handleAutoSpin = () => setAutoSpinning((st) => !st);

    /* -------------------- confetti helper scaled by power -------------------- */
    const triggerConfettiByPower = (power: number) => {
        const amount = Math.min(400, 30 + Math.floor((power / 100) * 400));
        const duration = 1600 + Math.floor((power / 100) * 2000);
        const end = Date.now() + duration;

        const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 9999 };

        const interval = setInterval(() => {
            const timeLeft = end - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = Math.floor((timeLeft / duration) * amount);
            confetti({ ...defaults, particleCount, origin: { x: 0.2, y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: 0.8, y: Math.random() - 0.2 } });
        }, 250);
    };

    /* format credits -> USD */
    const creditsToUSD = (credits: number | null) => {
        if (credits === null) return "-";
        const usd = credits / 100; // 100 credits = 1 USD
        return `$${usd.toFixed(2)}`;
    };

    /* cell class: if cell matches win set, highlight */
    const cellClass = (cell: string) => {
        const isWinning = showWinBanner && lastWinSymbol && cell === lastWinSymbol;
        return `flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 lg:w-16 lg:h-16 overflow-hidden relative transition-transform duration-300
      ${isWinning ? "scale-105 z-30" : ""}
    `;
    };

    return (
        <div className="relative z-20">
            {/* Win Banner */}
            {showWinBanner && lastWinCredits !== null && (
                <div className="absolute left-0  bottom-full z-50 pointer-events-none">
                    <div className="bg-yellow-400/95 text-black px-6 py-3 rounded-xl shadow-2xl flex flex-col items-center animate-pop">
                        <div className="font-bold text-lg">BIG WIN!</div>
                        <div className="mt-1 text-sm">
                            {lastWinCredits} credits • {creditsToUSD(lastWinCredits)}
                        </div>
                        <div className="mt-1 text-xs opacity-80">
                            {lastWinningPower ? `Power ${lastWinningPower}` : ""}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                {/* GRID */}
                <div className="relative w-full max-w-4xl">
                    <div className="relative z-5 grid grid-cols-7 gap-3 lg:gap-4 py-8 lg:py-12 px-6 md:px-8 lg:px-14 bg-black/40 rounded-xl">
                        {grid.map((row, rIdx) =>
                            row.map((cell, cIdx) => {
                                const isWinningCell = showWinBanner && winningCells.has(`${rIdx}-${cIdx}`);
                                return (
                                    <div
                                        key={`${rIdx}-${cIdx}`}
                                        className={cellClass(cell)}
                                        style={{
                                            transitionDelay: `${(cIdx * rows + rIdx) * 8}ms`,
                                        }}
                                    >
                                        <div
                                            className={`relative w-full h-full flex items-center justify-center rounded-md overflow-hidden
                      ${isWinningCell ? "animate-pulse" : ""}
                      ${!isWinningCell && spinning ? "opacity-90" : ""}`}
                                        >
                                            <Image
                                                src={symbols.includes(cell) ? cell : symbols[0]}
                                                alt="Symbol"
                                                width={70}
                                                height={70}
                                                className="object-contain h-full w-full select-none pointer-events-none"
                                                draggable={false}
                                            />

                                            {isWinningCell && (
                                                <div className="absolute inset-0 pointer-events-none">
                                                    <div className="w-full h-full mix-blend-screen opacity-80" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* background art */}
                    <Image
                        draggable={false}
                        src="/images/game-bg.png"
                        alt="background Box"
                        fill
                        sizes="100%"
                        className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
                    />
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-center md:flex-col gap-4 items-center w-full md:w-auto">
                    <CircularButton
                        text={
                            spinning
                                ? "AUTOSPIN"
                                : countdown !== null
                                    ? countdown.toString()
                                    : autoSpinning
                                        ? "ON"
                                        : "AUTOSPIN"
                        }
                        onClick={handleAutoSpin}
                        disabled={spinning}
                    />
                    <SpinButton onClick={spin} disabled={spinning || autoSpinning} />
                    <AmountSelector
                        min={minBet}
                        max={maxBet}
                        step={1}
                        value={betAmount}
                        onChange={(val) => setBetAmount(val)}
                        disabled={spinning || autoSpinning}
                    />
                </div>
            </div>

            {/* progress slider */}
            <div className="mt-4">
                <ProgressSlider progress={progress} />
            </div>

            {/* small legend & last win details (hidden by default) */}
            <div className="mt-3 text-xs text-gray-400 gap-4 hidden justify-center">
                <div>RTP: 96.3%</div>
                <div>
                    {lastWinCredits !== null
                        ? `Last win: ${lastWinCredits} credits (${creditsToUSD(lastWinCredits)})`
                        : "No recent win"}
                </div>
                <div>{winPatternUsed ? `Pattern: ${winPatternUsed}` : ""}</div>
            </div>
        </div>
    );
}
