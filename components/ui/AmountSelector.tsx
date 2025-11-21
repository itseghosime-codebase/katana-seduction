"use client";

import React, { useState, useEffect } from "react";
import AdjustButton from "./AdjustButton";

interface AmountSelectorProps {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    onChange?: (val: number) => void;
    disabled?: boolean;
}

export default function AmountSelector({
    min = 1,
    max = 100,
    step = 1,
    value = 1,
    onChange,
    disabled,
}: AmountSelectorProps) {
    const [amount, setAmount] = useState(value);

    // Sync from parent → child (safe)
    useEffect(() => {
        if (value !== amount) setAmount(value);
    }, [value, amount]);

    const increase = () => {
        const next = Math.min(amount + step, max);
        setAmount(next);        // local state update only
        onChange?.(next);       // parent update separated
    };

    const decrease = () => {
        const next = Math.max(amount - step, min);
        setAmount(next);        // local state update only
        onChange?.(next);       // parent update separated
    };

    const isMin = amount <= min;
    const isMax = amount >= max;

    return (
        <div className="flex items-center -space-x-10">
            <AdjustButton
                onClick={decrease}
                text="/images/icons/subtract.svg"
                disabled={isMin || disabled}
            />

            <div className="w-40 h-16 bg-text text-center flex items-center justify-center text-2xl md:text-3xl font-bold">
                {amount}
            </div>

            <AdjustButton
                onClick={increase}
                text="/images/icons/add.svg"
                disabled={isMax || disabled}
            />
        </div>
    );
}
