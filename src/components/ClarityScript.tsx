"use client";

import { useEffect } from "react";


type ClarityArgs = unknown[]; 

interface ClarityFunction {
  (...args: ClarityArgs): void;
  q?: ClarityArgs[];
}

declare global {
  interface Window {
    clarity?: ClarityFunction;
  }
}

export default function ClarityScript() {
  useEffect(() => {
    // No ejecutar en servidor ni si Clarity ya está cargado
    if (typeof window === "undefined" || window.clarity) return;

    // Opcional: evitar ejecución en desarrollo
    if (process.env.NODE_ENV !== "production") return;

    (function (c: Window, l: Document, i: string) {
      const clarityKey = "clarity" as const;

      const clarityFn: ClarityFunction = (...args: ClarityArgs) => {
        (clarityFn.q = clarityFn.q ?? []).push(args);
      };

      c[clarityKey] = c[clarityKey] ?? clarityFn;

      const script = l.createElement("script");
      script.async = true;
      script.src = `https://www.clarity.ms/tag/${i}`;

      const firstScript = l.getElementsByTagName("script")[0];
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        l.head.appendChild(script);
      }
    })(window, document, "tqtz5ko60k");
  }, []);

  return null;
}
