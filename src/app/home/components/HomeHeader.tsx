import React from "react";
import ProgressHeader from "../../../components/ProgressHeader";

const HomeHeader = ({ completed, total }: { completed: number; total: number }) => (
  <ProgressHeader completed={completed} total={total} />
);

export default HomeHeader;
