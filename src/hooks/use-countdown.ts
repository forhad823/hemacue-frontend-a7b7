"use client";
import { useEffect, useState } from "react";

export function useCountdown(initial = 60) {
  const [seconds, setSeconds] = useState(initial);
  const [active, setActive] = useState(false);
  const start = () => {
    setSeconds(initial);
    setActive(true);
  };

  useEffect(() => {
    if (!active || seconds <= 0) {
      if (seconds <= 0) setActive(false);
      return;
    }
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [active, seconds]);

  return { seconds, active, start, isLocked: active && seconds > 0 };
}
