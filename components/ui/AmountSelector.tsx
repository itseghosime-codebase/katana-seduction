"use client";

import React, { useState, useEffect } from "react";
import AdjustButton from "./AdjustButton";

interface AmountSelectorProps {
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    onChange?: (val: number) => void;
    disabled?: boolean
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

    // sync with external value changes if needed
    useEffect(() => {
        setAmount(value);
    }, [value]);

    const increase = () => {
        setAmount((prev) => {
            const next = Math.min(prev + step, max);
            onChange?.(next);
            return next;
        });
    };

    const decrease = () => {
        setAmount((prev) => {
            const next = Math.max(prev - step, min);
            onChange?.(next);
            return next;
        });
    };

    // disable states
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
