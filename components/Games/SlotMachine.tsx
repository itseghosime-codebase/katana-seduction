"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import CircularButton from "../ui/CircularButton";
import SpinButton from "../ui/SpinButton";
import AmountSelector from "../ui/AmountSelector";
import ProgressSlider from "../ui/ProgressSlider";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";

const symbols = [
    "/images/characters/dager.svg",
    "/images/characters/masked.svg",
    "/images/characters/flower.svg",
    "/images/characters/medal.svg",
    "/images/characters/malemasked.svg",
    "/images/characters/sword.svg",
    "/images/characters/amor.svg",
    "/images/characters/fox.svg",
    "/images/characters/amor-hand.svg",
    "/images/characters/granade.svg",
    "/images/characters/scroll.svg",
    "/images/characters/spikes.svg",
    "/images/characters/sack-treasure.svg",
    "/images/characters/lamp.svg",
    "/images/characters/gift-scroll.svg",
    "/images/characters/template.svg",
    "/images/characters/ruby.svg",
    "/images/characters/pink-diamond.svg",
    "/images/characters/blue-diamond.svg",
    "/images/characters/diamond.svg",
];

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

export type Pattern =
    | "horizontal_3"
    | "horizontal_5"
    | "vertical_3"
    | "diagonal_main"
    | "diagonal_rev"
    | "zigzag"
    | "vshape"
    | "mega_cross";

function patternFromPower(power: number): Pattern {
    const bucket = bucketForPower(power || 1);
    const remainder = Math.max(0, power - bucket.value);
    const mod = remainder % 3;

    if (mod === 0) return "horizontal_5";
    if (mod === 1) return "vertical_3";
    return "diagonal_main";
}

function randomUniqueColumn(rows: number, exclude: string[] = []) {
    const available = symbols.filter((s) => !exclude.includes(s));
    if (rows > available.length) {
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

function hasContiguousMatch(grid: string[][]) {
    const rows = grid.length;
    const cols = grid[0].length;

    for (let r = 0; r < rows; r++) {
        let run = 1;
        for (let c = 1; c < cols; c++) {
            if (grid[r][c] === grid[r][c - 1]) {
                run++;
                if (run >= 2) return true;
            } else run = 1;
        }
    }

    for (let c = 0; c < cols; c++) {
        let run = 1;
        for (let r = 1; r < rows; r++) {
            if (grid[r][c] === grid[r - 1][c]) {
                run++;
                if (run >= 2) return true;
            } else run = 1;
        }
    }

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
        const grid: string[][] = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => "")
        );

        for (let c = 0; c < cols; c++) {
            const col = randomUniqueColumn(rows);
            for (let r = 0; r < rows; r++) grid[r][c] = col[r];
        }

        if (!hasContiguousMatch(grid)) return grid;
    }

    const fallback: string[][] = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "")
    );
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
    } catch (e) { }
}

function playWinTone(power: number) {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const base = 220 + (power / 100) * 880;
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

function playLoseTone() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sawtooth";
        o.frequency.value = 440;
        g.gain.value = 0.03;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.18);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
        o.stop(ctx.currentTime + 0.24);
    } catch (e) { }
}

interface SlotMachineProps {
    balance: number | null;
    setBalance: React.Dispatch<React.SetStateAction<number | null>>;
}

type Outcome = "win" | "lose" | null;

type ConfettiFn = (opts?: confetti.Options) => void;

type SpinResponse = {
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

    const [minBet, setMinBet] = useState<number>(50);
    const [maxBet, setMaxBet] = useState<number>(1000);
    const [betAmount, setBetAmount] = useState<number>(50);
    const [progress, setProgress] = useState<number>(0);
    const [autoSpinning, setAutoSpinning] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const [lastWinCredits, setLastWinCredits] = useState<number | null>(null);
    const [lastWinSymbol, setLastWinSymbol] = useState<string | null>(null);
    const [lastWinningPower, setLastWinningPower] = useState<number | null>(null);
    const [winPatternUsed, setWinPatternUsed] = useState<Pattern | null>(null);
    const [showResultBanner, setShowResultBanner] = useState(false);
    const [lastOutcome, setLastOutcome] = useState<Outcome>(null);
    const [networkError, setNetworkError] = useState<string | null>(null);

    const [winningCells, setWinningCells] = useState<Set<string>>(new Set());
    const [idleHighlightCell, setIdleHighlightCell] = useState<string | null>(null);

    const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const confettiInstanceRef = useRef<ConfettiFn | null>(null);

    const [shakeOffset, setShakeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const shakeIntervalRef = useRef<number | null>(null);

    const [aberrationFlash, setAberrationFlash] = useState(false);

    const autoSpinRef = useRef(false);
    const spinningRef = useRef(false);
    const forceStopRef = useRef(false);
    const canSpinRef = useRef(true);

    const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    useEffect(() => {
        autoSpinRef.current = autoSpinning;
    }, [autoSpinning]);

    useEffect(() => {
        spinningRef.current = spinning;
    }, [spinning]);

    useEffect(() => {
        const fetchMachineStatus = async () => {
            try {
                const res = await fetch(`/api/slot/status?real=${isReal ? 1 : 0}`);
                if (!res.ok) throw new Error("Bad response");

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

                setNetworkError(null);
            } catch (err) {
                console.error("fetchMachineStatus error:", err);
                setNetworkError("No network connection. We can't reach the game server right now.");
            }
        };

        fetchMachineStatus();

        const initialGrid: string[][] = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => "")
        );
        for (let c = 0; c < cols; c++) {
            const col = randomUniqueColumn(rows);
            for (let r = 0; r < rows; r++) initialGrid[r][c] = col[r];
        }
        setGrid(initialGrid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isReal]);

    useEffect(() => {
        const canvas = confettiCanvasRef.current;
        if (!canvas) return;

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };

        resize();
        window.addEventListener("resize", resize);

        confettiInstanceRef.current = confetti.create(canvas, {
            resize: true,
            useWorker: true,
        }) as ConfettiFn;

        return () => {
            window.removeEventListener("resize", resize);
            confettiInstanceRef.current = null;
            if (shakeIntervalRef.current) {
                window.clearInterval(shakeIntervalRef.current);
                shakeIntervalRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const isIdle = !spinning && !autoSpinning && lastOutcome !== "win";
        if (!isIdle) {
            setIdleHighlightCell(null);
            return;
        }

        const interval = window.setInterval(() => {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            const key = `${r}-${c}`;
            setIdleHighlightCell(key);
            setTimeout(() => {
                setIdleHighlightCell((current) => (current === key ? null : current));
            }, 600);
        }, 8000);

        return () => window.clearInterval(interval);
    }, [spinning, autoSpinning, lastOutcome]);

    const triggerScreenShake = (power: number) => {
        const duration = 320 + (power / 100) * 320;
        const intensity = 3 + (power / 100) * 4;

        const start = performance.now();

        if (shakeIntervalRef.current) {
            window.clearInterval(shakeIntervalRef.current);
        }

        shakeIntervalRef.current = window.setInterval(() => {
            const elapsed = performance.now() - start;
            if (elapsed >= duration) {
                setShakeOffset({ x: 0, y: 0 });
                if (shakeIntervalRef.current) {
                    window.clearInterval(shakeIntervalRef.current);
                    shakeIntervalRef.current = null;
                }
                return;
            }

            const progress = 1 - elapsed / duration;
            const magnitude = intensity * progress;
            const x = (Math.random() * 2 - 1) * magnitude;
            const y = (Math.random() * 2 - 1) * magnitude;
            setShakeOffset({ x, y });
        }, 16);
    };

    const triggerAberrationFlash = (power: number) => {
        const flashDuration = 140 + (power / 100) * 200;
        setAberrationFlash(true);
        setTimeout(() => setAberrationFlash(false), flashDuration);
    };

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
                if (forceStopRef.current) {
                    setGrid((prev) => {
                        const copy = prev.map((row) => [...row]);
                        for (let cc = c; cc < cols; cc++) {
                            for (let rr = 0; rr < rows; rr++) {
                                copy[rr][cc] = finalGrid[rr][cc];
                            }
                        }
                        return copy;
                    });
                    return;
                }

                setGrid((prev) => {
                    const copy = prev.map((row) => [...row]);
                    copy[r][c] = finalGrid[r][c];
                    return copy;
                });

                await new Promise((res) => setTimeout(res, 18));
            }

            const jitter = Math.floor(Math.random() * 60) - 20;
            await new Promise((res) => setTimeout(res, baseDelay + jitter));
        }
    };

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

    const triggerConfettiByPower = (power: number) => {
        const instance = confettiInstanceRef.current ?? (confetti as unknown as ConfettiFn);
        if (!instance) return;

        const intensity = Math.max(0.3, power / 100);
        const duration = 1300 + 900 * intensity;
        const animationEnd = Date.now() + duration;

        const colors = ["#D58EFF", "#FF80E5", "#FFE066", "#FFFFFF"];

        if (power < 40) {
            instance({
                particleCount: 30 + 30 * intensity,
                spread: 45,
                startVelocity: 40 + 20 * intensity,
                scalar: 0.9 + intensity * 0.3,
                origin: { x: 0.5, y: 0.5 },
                gravity: 0.85,
                ticks: 80,
                colors,
            });
            return;
        }

        instance({
            particleCount: 60 + 60 * intensity,
            spread: 70,
            startVelocity: 55 + 25 * intensity,
            scalar: 1.1 + intensity * 0.5,
            origin: { x: 0.5, y: 0.45 },
            gravity: 0.9,
            ticks: 110,
            colors,
        });

        instance({
            particleCount: 40 + 40 * intensity,
            spread: 360,
            startVelocity: 45 + 20 * intensity,
            scalar: 0.8 + intensity * 0.4,
            origin: { x: 0.5, y: 0.5 },
            gravity: 0.7,
            ticks: 90,
            colors,
        });

        const sideDefaults = {
            startVelocity: 50 + 20 * intensity,
            spread: 55,
            gravity: 0.95,
            ticks: 100,
            scalar: 0.9 + intensity * 0.3,
            colors,
        };

        const sideInterval = window.setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                clearInterval(sideInterval);
                return;
            }

            const pc = 10 + Math.floor(12 * intensity);

            instance({
                ...sideDefaults,
                particleCount: pc,
                angle: 60,
                origin: { x: 0.05, y: 0.6 },
            });

            instance({
                ...sideDefaults,
                particleCount: pc,
                angle: 120,
                origin: { x: 0.95, y: 0.6 },
            });
        }, 140);

        const drizzleEnd = animationEnd - 300;
        const drizzleInterval = window.setInterval(() => {
            const timeLeft = drizzleEnd - Date.now();
            if (timeLeft <= 0) {
                clearInterval(drizzleInterval);
                return;
            }

            instance({
                particleCount: 4 + Math.floor(4 * intensity),
                startVelocity: 15 + 10 * intensity,
                spread: 20,
                origin: { x: 0.5 + (Math.random() - 0.5) * 0.3, y: 0.1 },
                gravity: 1.2,
                ticks: 120,
                scalar: 0.6 + intensity * 0.3,
                shapes: ["circle"],
                colors,
            });
        }, 90);

        if (power >= 85) {
            setTimeout(() => {
                instance({
                    particleCount: 100,
                    spread: 100,
                    startVelocity: 70,
                    scalar: 1.7,
                    origin: { x: 0.5, y: 0.4 },
                    gravity: 0.9,
                    ticks: 120,
                    colors,
                });
            }, 400);
        }
    };

    const AUTO_SPIN_BREAK_MS = 3000;

    const spin = async () => {
        if (spinningRef.current) return;

        if (isReal && !isLoggedIn) {
            alert("You must log in to play the real game!");
            return;
        }

        if (networkError) {
            console.warn("Spin prevented because of network issue:", networkError);
            setAutoSpinning(false);
            return;
        }

        spinningRef.current = true;
        setSpinning(true);

        setShowResultBanner(false);
        setLastWinCredits(null);
        setLastWinningPower(null);
        setLastWinSymbol(null);
        setWinPatternUsed(null);
        setWinningCells(new Set());
        setLastOutcome(null);
        setProgress(0);
        forceStopRef.current = false;

        let data: SpinResponse;

        try {
            const res = await fetch(`/api/slot/play?real=${isReal ? 1 : 0}&bet_amount=${betAmount}`);
            if (!res.ok) throw new Error(`${res.status}`);
            data = (await res.json()) as SpinResponse;
        } catch (err) {
            console.error("network error:", err);
            setNetworkError("No internet or server unreachable.");
            spinningRef.current = false;
            setSpinning(false);
            return;
        }

        canSpinRef.current = data.canSpin;

        intervals.current.forEach((i) => i && clearInterval(i));
        intervals.current = [];

        for (let i = 0; i < cols; i++) {
            setTimeout(() => {
                intervals.current[i] = startColumnSpin(i);
            }, i * 90);
        }

        try {
            const winningPowerRaw = data.winningPower ?? 0;
            const winningPower = Math.max(0, Math.min(100, winningPowerRaw));
            const isWin = !!data.isWin;

            const bucket = bucketForPower(winningPower || 1);
            const winSymbol = bucket.symbol;
            const pattern = patternFromPower(winningPower || 1);

            let finalGrid: string[][] = [];
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
            await wait(isWin && winningPower >= 80 ? 220 : 140);

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
                setLastOutcome("win");
                setShowResultBanner(true);

                animateToPower(winningPower);
                playWinTone(winningPower);
                triggerConfettiByPower(winningPower);

                if (winningPower >= 85) {
                    triggerScreenShake(winningPower);
                    triggerAberrationFlash(winningPower);
                }
            } else {
                setWinningCells(new Set());
                setLastOutcome("lose");
                setShowResultBanner(true);
                animateToPower(0);
                playLoseTone();
            }
        } catch (err) {
            console.error("spin error:", err);
            intervals.current.forEach((i) => i && clearInterval(i));
            intervals.current = [];
            canSpinRef.current = false;
            setNetworkError("No network connection. Spin failed – please check your internet and try again.");
        }

        intervals.current.forEach((i) => i && clearInterval(i));
        intervals.current = [];

        forceStopRef.current = false;

        spinningRef.current = false;
        setSpinning(false);

        if (autoSpinRef.current && canSpinRef.current) {
            await wait(AUTO_SPIN_BREAK_MS);
            if (!autoSpinRef.current) return;
            if (spinningRef.current) return;
            spin();
        }
    };

    const handleAutoSpin = () => {
        if (isReal && !isLoggedIn) {
            alert("You must log in to use AUTOSPIN in real mode.");
            return;
        }

        if (networkError) {
            alert("Network error. AUTOSPIN cannot start until the connection is restored.");
            return;
        }

        setAutoSpinning((prev) => {
            const next = !prev;
            autoSpinRef.current = next;

            if (!next) {
                forceStopRef.current = true;
            } else {
                forceStopRef.current = false;
                if (!spinningRef.current) {
                    spin();
                }
            }

            return next;
        });
    };

    const creditsToUSD = (credits: number | null | number) => {
        if (credits === null || credits === undefined) return "-";
        const usd = credits / 100;
        return `$${usd.toFixed(2)}`;
    };

    const cellClass = (cell: string, isWinningCell: boolean, isIdleGlow: boolean) => {
        const base =
            "flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 lg:w-16 lg:h-16 overflow-hidden relative transition-transform duration-300";
        const winning = isWinningCell ? " win-cell scale-105 z-30" : "";
        const idle = isIdleGlow ? " idle-glow" : "";
        return base + winning + idle;
    };

    const isIdle = !spinning && !autoSpinning;

    const resultMainText = () => {
        if (!lastOutcome) return "";
        return lastOutcome === "win" ? "YOU WIN" : "YOU LOSE";
    };

    const resultSubText = () => {
        if (lastOutcome === "win" && lastWinCredits !== null) {
            return `You won ${creditsToUSD(lastWinCredits)} (${lastWinCredits} credits)`;
        }
        if (lastOutcome === "lose") {
            return `You lost ${creditsToUSD(betAmount)} (${betAmount} credits)`;
        }
        return "";
    };

    return (
        <div className="relative z-20">
            {networkError && (
                <div className="mb-3 px-4 py-3 rounded-lg bg-red-600/20 border border-red-500/60 text-red-200 text-sm flex items-center gap-2 max-w-2xl mx-auto">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span>{networkError}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                <div
                    className="relative w-full max-w-4xl"
                    style={{
                        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
                        transition: "transform 40ms ease-out",
                    }}
                >
                    <div
                        className={
                            "relative z-5 grid grid-cols-7 gap-3 lg:gap-4 py-8 lg:py-12 px-6 md:px-8 lg:px-14 " +
                            "overflow-hidden" +
                            "transition-transform duration-200 " +
                            (spinning ? "scale-[0.98] opacity-80" : "") +
                            (isIdle ? " idle-breathe" : "")
                        }
                    >
                        {grid.map((row, rIdx) =>
                            row.map((cell, cIdx) => {
                                const key = `${rIdx}-${cIdx}`;
                                const isWinningCell =
                                    lastOutcome === "win" && winningCells.has(key);
                                const isIdleGlow =
                                    isIdle && !lastOutcome && idleHighlightCell === key;

                                return (
                                    <div
                                        key={key}
                                        className={cellClass(cell, isWinningCell, isIdleGlow)}
                                        style={{
                                            transitionDelay: `${(cIdx * rows + rIdx) * 8}ms`,
                                        }}
                                    >
                                        <div
                                            className={
                                                "relative w-full h-full flex items-center justify-center rounded-full overflow-hidden " +
                                                "bg-linear-to-br from-[#1D102F] via-[#25133E] to-[#422063] border border-white/5 " +
                                                (isWinningCell ? "" : "") +
                                                (!isWinningCell && spinning ? " opacity-90" : "")
                                            }
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

                    <canvas
                        ref={confettiCanvasRef}
                        className="pointer-events-none absolute inset-0 z-30"
                    />

                    {aberrationFlash && (
                        <div className="pointer-events-none absolute inset-0 z-40">
                            <div
                                className="w-full h-full"
                                style={{
                                    mixBlendMode: "screen",
                                    backgroundImage:
                                        "radial-gradient(circle at 20% 20%, rgba(255,0,128,0.35) 0, transparent 55%), radial-gradient(circle at 80% 80%, rgba(0,255,255,0.35) 0, transparent 55%)",
                                    filter: "blur(1px)",
                                }}
                            />
                        </div>
                    )}

                    <Image
                        draggable={false}
                        src="/images/game-bg.png"
                        alt="background Box"
                        fill
                        sizes="100%"
                        className={
                            "absolute top-0 left-0 w-full h-full z-0 pointer-events-none " +
                            "transition-transform duration-500 " +
                            (spinning ? "scale-[1.03]" : "scale-100")
                        }
                    />

                    {showResultBanner && lastOutcome && (
                        <div className="absolute inset-x-4.5 md:inset-x-5 lg:inset-x-8 bottom-1/2 translate-y-1/2 z-50 pointer-events-none">
                            <div
                                className={
                                    "px-6 py-4 min-h-20 bg-[#340F72] text-[#D58EFF] justify-center shadow-[0_0_40px_rgba(213,142,255,0.25)] " +
                                    "flex flex-col items-center animate-win-banner "
                                }
                            >
                                <div className="font-montserrat font-bold tracking-widest text-lg md:text-xl lg:text-2xl">
                                    {resultMainText()}
                                </div>

                                {resultSubText() && (
                                    <div className="mt-1 text-sm md:text-base opacity-90">
                                        {resultSubText()}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap justify-center md:flex-col gap-5 items-center w-full md:w-auto">
                    <CircularButton
                        text={
                            isReal && isLoggedIn
                                ? autoSpinning
                                    ? "STOP"
                                    : "AUTOSPIN"
                                : isReal && !isLoggedIn
                                    ? "AUTOSPIN"
                                    : autoSpinning
                                        ? "STOP"
                                        : "AUTOSPIN"
                        }
                        onClick={handleAutoSpin}
                        disabled={spinning && !autoSpinning}
                        spinning={spinning}
                    />

                    <SpinButton
                        onClick={spin}
                        disabled={spinning || autoSpinning}
                        spinning={autoSpinning ? false : spinning}
                    />

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

            <div className="mt-4 ">
                <ProgressSlider progress={progress} />
            </div>

            <div className="mt-3 text-xs text-gray-400 gap-4 hidden justify-center">
                <div>RTP: 96.3%</div>
                <div>
                    {lastWinCredits !== null
                        ? `Last win: ${lastWinCredits} credits (${creditsToUSD(lastWinCredits)})`
                        : "No recent win"}
                </div>
                <div>{winPatternUsed ? `Pattern: ${winPatternUsed}` : ""}</div>
            </div>

            <div className="hidden">
                {lastWinSymbol}
                {lastWinningPower}
            </div>
        </div>
    );
}
