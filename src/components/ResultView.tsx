"use client";
import React from "react";

interface Props {
  score?: number;
  interpretation?: string;
}

const ResultView: React.FC<Props> = ({ score, interpretation }) => (
  <div className="message mt-6">
    <p><strong>Puntaje total:</strong> {score ?? 0}</p>
    <p><strong>{interpretation ?? "Sin interpretación"}</strong></p>
  </div>
);

export default ResultView;
