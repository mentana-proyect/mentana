interface Props {
  activeView: "diario" | "perfil";
  setActiveView: (v: "diario" | "perfil") => void;
}

const ViewToggle = ({ activeView, setActiveView }: Props) => {
  return (
    <div className="view-toggle">
      <button
            className={`toggle-btn ${activeView === "diario" ? "active" : ""}`}
            onClick={() => setActiveView("diario")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22h11A2.5 2.5 0 0 0 20 19.5V5H4z" />
              <path d="M16 3V5" />
              <path d="M8 3V5" />
              <path d="M4 9h16" />
            </svg>{" "}
            <strong>DED</strong>
          </button>

      <button
            className={`toggle-btn ${activeView === "perfil" ? "active" : ""}`}
            onClick={() => setActiveView("perfil")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M4 21v-2a4 4 0 0 1 3-3.87" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <strong>PEP</strong>
          </button>
          
    </div>
  );
};

export default ViewToggle;
