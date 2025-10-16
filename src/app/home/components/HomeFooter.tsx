import React from "react";
import DockFooter from "../../../components/DockFooter";

const HomeFooter = ({ logout }: { logout: () => void }) => (
  <footer>
    <strong>&copy; 2025 Mentana 🧠</strong>
    <DockFooter logout={logout} />
  </footer>
);

export default HomeFooter;
