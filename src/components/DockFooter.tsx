"use client";
import React from "react";

interface Props {
  logout: () => void;
}

const FloatingLogoutButton: React.FC<Props> = ({ logout }) => {
  return (
    <button
      onClick={logout}
      title="Cerrar sesión"
      className="floating-logout-btn"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        stroke="white"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  );
};

export default FloatingLogoutButton;
