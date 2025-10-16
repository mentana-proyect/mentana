"use client";
import React from "react";

interface Props {
  completed: number;
  total: number;
}

const ProgressHeader: React.FC<Props> = ({ completed, total }) => {
  return (
    <header>
      <article className="card">
        <div style={{ textAlign: "center" }}>
          <img src="../logo.png" className="logo" alt="Logo" />
          <h3>Perfil Emocional Preliminar</h3>
        </div>
        <p style={{ textAlign: "center" }}>
          Al completar tu PEP estarás dando un paso importante hacia conocerte mejor.
          Poco a poco, irás desbloqueando aspectos clave de ti mismo: cómo manejas la
          ansiedad, el estrés, la soledad o la tristeza.
          <br />
          <br />
          <strong>👉 Es tu espacio seguro, pensado para ti 🌱</strong>
        </p>
        <div className="topbar">
          <div className="progress-wrap" aria-label="Progreso total">
            <div className="progress-label">
              <span>Progreso</span>
              <span id="progressText">
                {completed} / {total} completados
              </span>
            </div>
            <div className="progress">
              <div id="progressBar" style={{ width: `${(completed / total) * 100}%` }}></div>
            </div>
          </div>
        </div>
      </article>
    </header>
  );
};

export default ProgressHeader;
