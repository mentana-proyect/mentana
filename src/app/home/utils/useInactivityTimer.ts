"use client";
import { useEffect, useRef } from "react";

export const useInactivityTimer = (onTimeout: () => void, limitMs = 5 * 60 * 1000) => {
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      console.warn("Sesión cerrada por inactividad");
      onTimeout();
    }, limitMs);
  };

  useEffect(() => {
    const handleClick = () => resetInactivityTimer();
    window.addEventListener("click", handleClick);
    resetInactivityTimer();

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return { resetInactivityTimer };
};