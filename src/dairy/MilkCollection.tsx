import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DailySankalan from "./DailySankalan";
import Sanghvikri from "./Sanghvikri";
import RatibPage from "./RatibPage";
import AdvancePage from "./AdvancePage"; // ✅ added

interface SanklanProps {
  onBack: () => void;
}

const MilkCollection: React.FC<SanklanProps> = ({ onBack }) => {
  const [showDailySankalan, setShowDailySankalan] = useState(false);
  const [showSanghvikri, setShowSanghvikri] = useState(false);
  const [showRatibVikri, setShowRatibVikri] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false); // ✅ added

  if (showDailySankalan) {
    return <DailySankalan onBack={() => setShowDailySankalan(false)} />;
  }

  if (showSanghvikri) {
    return <Sanghvikri onBack={() => setShowSanghvikri(false)} />;
  }

  if (showRatibVikri) {
    return <RatibPage onBack={() => setShowRatibVikri(false)} />;
  }

  if (showAdvance) {
    return <AdvancePage onBack={() => setShowAdvance(false)} />; // ✅ added
  }

  const items = [
    {
      label: "संकलन",
      img: "https://cdn-icons-png.flaticon.com/512/1998/1998610.png",
      bg: "bg-yellow-100",
      onClick: () => setShowDailySankalan(true),
    },
    {
      label: "संघ विक्री",
      img: "https://cdn-icons-png.flaticon.com/512/7436/7436776.png",
      bg: "bg-blue-100",
      onClick: () => setShowSanghvikri(true),
    },
    {
      label: "रतिब विक्री",
      img: "https://cdn-icons-png.flaticon.com/512/3791/3791442.png",
      bg: "bg-purple-100",
      onClick: () => setShowRatibVikri(true),
    },
    {
      label: "खाद्य खरेदी",
      img: "https://cdn-icons-png.flaticon.com/512/4151/4151022.png",
      bg: "bg-amber-100",
    },
    {
      label: "खाद्य विक्री",
      img: "https://cdn-icons-png.flaticon.com/512/3082/3082031.png",
      bg: "bg-green-100",
    },
    {
      label: "अॅडव्हान्स / उचल",
      img: "https://cdn-icons-png.flaticon.com/512/3135/3135789.png",
      bg: "bg-pink-100",
      onClick: () => setShowAdvance(true), // ✅ added
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
          दैनंदिन व्यवहार
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {items.map((item, i) => (
            <Card
              key={i}
              onClick={item.onClick}
              className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-all ${item.bg} ${
                !item.onClick ? "opacity-50 cursor-not-allowed" : ""
              }`}
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

        {/* Marathi Instructions */}
        <div className="mt-8 text-gray-700 text-base leading-relaxed">
          <p>१. इथे आपण आपल्या दैनंदिन व्यवहाराच्या (ॲक्टिव्हिटीज) नोंदी करू शकतो.</p>
          <p>
            २. उदाहरणार्थ — खाद्यपदार्थ विक्री/खरेदी किंवा उचल देणे यांसारख्या गोष्टींची
            नोंद ठेवू शकतो.
          </p>
          <p>३. सॉफ्टवेअरमधील हा महत्त्वाचा भाग आहे.</p>
        </div>
      </div>
    </div>
  );
};

export default MilkCollection;