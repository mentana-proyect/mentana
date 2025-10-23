"use client";
import { useEffect, useRef, useCallback } from "react";

export const useInactivityTimer = (
  onTimeout: () => void,
  limitMs = 10 * 60 * 1000
) => {
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      console.warn("Sesión cerrada por inactividad");
      onTimeout();
    }, limitMs);
  }, [onTimeout, limitMs]); // ✅ dependencias correctas

  useEffect(() => {
    const handleClick = () => resetInactivityTimer();
    window.addEventListener("click", handleClick);
    resetInactivityTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      window.removeEventListener("click", handleClick);
    };
  }, [resetInactivityTimer]); // ✅ warning desaparece

  return { resetInactivityTimer };
};
