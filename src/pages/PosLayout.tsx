// src/pages/PosLayout.tsx
import { Outlet } from "react-router-dom";
import React from "react";

const PosLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Outlet />
    </div>
  );
};

export default PosLayout;
