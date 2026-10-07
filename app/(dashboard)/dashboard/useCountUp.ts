/**
 * File: useCountUp.ts
 * Author: GreenStep Team
 * Created: 2026-05-20
 * Description: React hook that animates a number from its previous value to a
 *   new target using requestAnimationFrame, respecting reduced-motion.
 * Contact: gurm1658@stthomas.edu
 */

import { useEffect, useState } from "react";

/**
 * Animates a numeric value toward a target over a fixed duration.
 * @param value The target value to count toward.
 * @param duration Animation length in milliseconds (default 900).
 * @returns The current animated value to render.
 */
export function useCountUp(value: number, duration = 900) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (typeof window === "undefined") {
      setDisplayValue(value);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const startValue = displayValue;
    const change = value - startValue;

    if (change === 0) {
      return;
    }

    let frameId = 0;
    const startTime = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + change * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [duration, value]); // eslint-disable-line react-hooks/exhaustive-deps

  return displayValue;
}
