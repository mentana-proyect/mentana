"use client";

import { useEffect } from "react";

// 🔧 Extendemos la interfaz global de Window y clarity
declare global {
  interface ClarityFunction {
    (...args: any[]): void;
    q?: any[];
  }

  interface Window {
    clarity?: ClarityFunction;
  }
}

export default function ClarityScript() {
  useEffect(() => {
    if (typeof window === "undefined" || window.clarity) return;

    // Opcional: evita registrar sesiones locales
   // if (process.env.NODE_ENV !== "production") return;

    (function (c: Window, l: Document, i: string) {
      const clarityKey = "clarity" as const;

      // Asignamos la función Clarity y su cola
      const clarityFn: ClarityFunction = (...args: any[]) => {
        (clarityFn.q = clarityFn.q || []).push(args);
      };

      c[clarityKey] = c[clarityKey] || clarityFn;

      const script = l.createElement("script");
      script.async = true;
      script.src = "https://www.clarity.ms/tag/" + i;

      const firstScript = l.getElementsByTagName("script")[0];
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        l.head.appendChild(script);
      }
    })(window, document, "tqtz5ko60k"); // 👈 tu ID de Clarity
  }, []);

  return null;
}
