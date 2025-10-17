// pages/DairyMain.tsx
import React, { useState } from "react";
import DairyDashboard from "./DairyDashboard";
import DairyOverview from "../dairy/DairyOverview";
import MilkCollection from "../dairy/MilkCollection";
import RateCalculator from "../dairy/RateCalculator";
import CollectionHistory from "../dairy/CollectionHistory";
import FarmersManagement from "../dairy/FarmersManagement";
import DairySettings from "../dairy/DairySettings";

const DairyMain: React.FC = () => {
  const [activePage, setActivePage] = useState("overview");

  const renderActivePage = () => {
    switch (activePage) {
      case "overview":
        return <DairyOverview />;
      case "milk-collection":
        return <MilkCollection />;
      case "calculations":
        return <RateCalculator />;
      case "history":
        return <CollectionHistory />;
      case "farmers":
        return <FarmersManagement />;
      case "dairy-settings":
        return <DairySettings />;
      default:
        return <DairyOverview />;
    }
  };

  return (
    <DairyDashboard activePage={activePage} onPageChange={setActivePage}>
      {renderActivePage()}
    </DairyDashboard>
  );
};

export default DairyMain;