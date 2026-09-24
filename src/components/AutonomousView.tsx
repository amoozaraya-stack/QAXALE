import React from "react";
import { AutonomousAgentTool } from "./tools/AutonomousAgentTool";

export const AutonomousView: React.FC = () => {
  return (
    <div className="space-y-4 pb-6">
      <AutonomousAgentTool />
    </div>
  );
};
