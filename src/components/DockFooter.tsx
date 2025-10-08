"use client";
import React from "react";

interface Props {
  logout: () => void;
}

const DockFooter: React.FC<Props> = ({ logout }) => (
  <footer className="dock-footer">
    <nav className="dock">
      <a href="./home" title="Inicio">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="white" fill="none"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="feather feather-user">
          <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </a>

      <a href="./setting" title="Configuración">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="white" fill="none"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className="feather feather-settings">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82..." />
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
