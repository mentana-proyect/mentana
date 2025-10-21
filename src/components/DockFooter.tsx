"use client";
import React from "react";

interface Props {
  logout: () => void;
}

const DockFooter: React.FC<Props> = ({ logout }) => (
  <footer className="dock-footer">
    <nav className="dock">
      <a href="./setting" title="Configuración">
        <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        stroke="white"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-settings"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82 2 2 0 0 1-2.83 2.83 1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51v0a2 2 0 0 1-4 0v0a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33 2 2 0 0 1-2.83-2.83 1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h0a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82A2 2 0 0 1 7 4.6a1.65 1.65 0 0 0 1.82.33h0A1.65 1.65 0 0 0 10 3.42V3a2 2 0 0 1 4 0v0a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33A2 2 0 0 1 19.4 7a1.65 1.65 0 0 0-.33 1.82h0A1.65 1.65 0 0 0 20.58 10H21a2 2 0 0 1 0 4h0a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
      </a>
      <a href="./home" title="Inicio">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="white" fill="none"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="feather feather-user">
          <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </a>

      

      <a onClick={logout} title="Cerrar sesión" style={{ background: "none", border: "none", cursor: "pointer" }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="white" fill="none"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="feather feather-x">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </a>
    </nav>
    
  </footer>
);

export default DockFooter;
