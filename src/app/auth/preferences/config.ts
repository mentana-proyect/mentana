import React from "react";

/* =========================================
   1. CONFIGURACIÓN DE PREGUNTAS
========================================= */

export const questionConfig = [
  {
    field: "estilo_comunicacion",
    question: "¿Cuál es tu estilo de comunicación?",
    options: [
      { value: "directo", label: "Directo" },
      { value: "diplomatico", label: "Diplomático" },
      { value: "emocional", label: "Emocional" },
      { value: "racional", label: "Racional" },
      { value: "humoristico", label: "Humorístico" },
      { value: "reservado", label: "Reservado" },
      { value: "extrovertido", label: "Extrovertido" },
      { value: "introvertido", label: "Introvertido" },
    ],
  },
  {
    field: "valores_personales",
    question: "¿Qué valores personales son más importantes para ti?",
    options: [
      { value: "honestidad", label: "Honestidad" },
      { value: "lealtad", label: "Lealtad" },
      { value: "responsabilidad", label: "Responsabilidad" },
      { value: "libertad", label: "Libertad" },
      { value: "creatividad", label: "Creatividad" },
      { value: "justicia", label: "Justicia" },
      { value: "familia", label: "Familia" },
      { value: "crecimiento", label: "Crecimiento personal" },
      { value: "tranquilidad", label: "Tranquilidad" },
      { value: "espiritualidad", label: "Espiritualidad" },
    ],
  },
  {
    field: "relacion_interpersonal",
    question: "¿Cómo te relacionas con los demás?",
    options: [
      { value: "asertivo", label: "Asertivo" },
      { value: "empatico", label: "Empático" },
      { value: "limites", label: "Límites claros" },
      { value: "independiente", label: "Independiente" },
      { value: "colaborativo", label: "Le gusta colaborar" },
      { value: "espacio", label: "Prefiere espacio personal" },
      { value: "rutinas", label: "Prefiere rutinas" },
      { value: "espontaneo", label: "Prefiere espontaneidad" },
    ],
  },
  {
    field: "motivadores",
    question: "¿Qué te motiva principalmente?",
    options: [
      { value: "logro", label: "Logro" },
      { value: "seguridad", label: "Seguridad" },
      { value: "diversion", label: "Diversión" },
      { value: "reconocimiento", label: "Reconocimiento" },
      { value: "estabilidad", label: "Estabilidad" },
      { value: "competencia", label: "Competencia" },
      { value: "afecto", label: "Afecto" },
      { value: "curiosidad", label: "Curiosidad" },
    ],
  },
  {
    field: "resolucion_conflictos",
    question: "¿Cómo resuelves los conflictos?",
    options: [
      { value: "evita", label: "Evita conflictos" },
      { value: "directo", label: "Enfrenta directamente" },
      { value: "conciliador", label: "Busca conciliación" },
      { value: "tiempo", label: "Necesita tiempo para pensar" },
      { value: "instante", label: "Prefiere hablar al instante" },
      { value: "sensible", label: "Sensible al tono" },
    ],
  },
  {
    field: "sensibilidades",
    question: "¿Qué cosas te afectan o te sensibilizan?",
    options: [
      { value: "gritos", label: "Gritos" },
      { value: "criticas", label: "Críticas" },
      { value: "sarcasmo", label: "Sarcasmo" },
      { value: "silencio", label: "Falta de comunicación" },
      { value: "caos", label: "Caos / Desorden" },
      { value: "cambios", label: "Cambios bruscos" },
      { value: "hostilidad", label: "Hostilidad" },
    ],
  },
  {
    field: "necesidades_emocionales",
    question: "¿Qué necesitas emocionalmente?",
    options: [
      { value: "reafirmacion", label: "Reafirmación" },
      { value: "estabilidad", label: "Estabilidad" },
      { value: "afecto_fisico", label: "Afecto físico" },
      { value: "espacio", label: "Espacio personal" },
      { value: "transparencia", label: "Transparencia" },
      { value: "apoyo", label: "Apoyo emocional" },
      { value: "validacion", label: "Validación" },
      { value: "aventura", label: "Aventura" },
    ],
  },
];

/* =========================================
   2. ESTILOS SIN ERRORES TYPESCRIPT
========================================= */

export const styles: Record<string, React.CSSProperties> = {
  container: {
    
    maxWidth: "700px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  title: {
    
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#56dbc4",
  },
  subtitle: {
    
    textAlign: "center",
    marginBottom: "20px",
    color: "#fff",
  },
  card: {
  padding: "20px",
  background: "rgba(255, 255, 255, 0.1)",
  borderRadius: "16px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginBottom: "20px",
},

  question: {
    fontSize: "20px",
    marginBottom: "14px",
    
  },
  tagContainer: {
    paddingTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  tag: {
    padding: "6px 16px",
    borderRadius: "30px",
    background: "#ccc",
    cursor: "pointer",
    transition: "0.2s",
    color: "#666",
    fontWeight: "bold",
  },
  tagSelected: {
    background: "#79e7d3",
    color: "white",
    fontWeight: "bold",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginTop: "20px",
  },
};

/* =========================================
   3. ESTILOS DE BOTONES
========================================= */

const baseButtonStyles: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: "30px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "background 0.3s ease",
};

export const ButtonStyle = {
  next: {
    ...baseButtonStyles,
    background: "#79e7d3",
    color: "white",
  },
  back: {
    ...baseButtonStyles,
    background: "#ff8cd3",
    color: "white",
  },
  submit: {
    ...baseButtonStyles,
    background: "#79e7d3",
    color: "white",
  },
  disabled: {
    ...baseButtonStyles,
    background: "#ccc",
    color: "#666",
    cursor: "not-allowed",
  },
};
