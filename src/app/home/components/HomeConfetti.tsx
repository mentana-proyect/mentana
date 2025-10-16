import React from "react";
import Confetti from "react-confetti";
import { CONFETTI_PIECES, CONFETTI_GRAVITY } from "../hooks/constants";

const HomeConfetti = ({ show }: { show: boolean }) => {
  if (!show || typeof window === "undefined") return null;
  return (
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      recycle={false}
      numberOfPieces={CONFETTI_PIECES}
      gravity={CONFETTI_GRAVITY}
    />
  );
};

export default HomeConfetti;
