"use client";

import React from "react";

interface ViewDescriptionProps {
  activeView: "diario" | "perfil";
}

const ViewDescription: React.FC<ViewDescriptionProps> = ({ activeView }) => {
  const description =
    activeView === "diario"
      ? "ℹ️ Diario Emocional Digital: Simple, cercano y confidencial, diseñado para ayudarte a reconocer tus estados de ánimo y ver tu evolución día a día"
      : "ℹ️ Perfil Emocional Preliminar: A través de cuatro formularios simples, te ayuda a conocerte mejor, mostrándote tu estado emocional actual.";

  return (
    <div className="view-description">
      <p><strong>{description}</strong></p>
    </div>
  );
};

export default ViewDescription;
