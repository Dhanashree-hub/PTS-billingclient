import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DailySankalan from "./DailySankalan"; // ✅ Import your next page

interface SanklanProps {
  onBack: () => void;
}

const MilkCollection: React.FC<SanklanProps> = ({ onBack }) => {
  const [showDailySankalan, setShowDailySankalan] = useState(false);

  if (showDailySankalan) {
    return <DailySankalan onBack={() => setShowDailySankalan(false)} />;
  }

  const items = [
    {
      label: "संकलन",
      img: "https://cdn-icons-png.flaticon.com/512/1998/1998610.png",
      bg: "bg-yellow-100",
      onClick: () => setShowDailySankalan(true),
    },
    {
      label: "वाहन खर्च",
      img: "https://cdn-icons-png.flaticon.com/512/1995/1995526.png",
      bg: "bg-blue-100",
    },
    {
      label: "संकलन खर्च",
      img: "https://cdn-icons-png.flaticon.com/512/2921/2921822.png",
      bg: "bg-purple-100",
    },
    {
      label: "चराऊ खर्च",
      img: "https://cdn-icons-png.flaticon.com/512/1046/1046857.png",
      bg: "bg-amber-100",
    },
    {
      label: "रक्कम जमा",
      img: "https://cdn-icons-png.flaticon.com/512/3135/3135789.png",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-50 border-b px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
          <span className="text-yellow-600 text-xl">🧀</span>
          <span>.संकलन केंद्र</span>
        </div>
        <Button
          onClick={onBack}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          ⬅ मागे जा
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          संकलन माहिती
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {items.map((item, i) => (
            <Card
              key={i}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all ${item.bg}`}
            >
              <img
                src={item.img}
                alt={item.label}
                className="w-14 h-14 object-contain mb-2"
              />
              <p className="font-medium text-gray-700 text-sm sm:text-base">
                {item.label}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MilkCollection;
