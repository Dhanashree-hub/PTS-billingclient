import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsProps {
  onBack: () => void;
}

const SangliwadiSettings: React.FC<SettingsProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-100 to-blue-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-500 px-6 py-3 text-white shadow-md">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <span className="bg-yellow-400 p-2 rounded-lg text-black">📁</span>
          <span>.सांगलीवाडी</span>
        </div>
        <Button
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
          onClick={onBack} // ✅ Return to MemberForm
        >
          ⬅ मागे जा
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex justify-center items-center flex-1 py-8">
        <Card className="w-full max-w-6xl bg-white shadow-lg border border-gray-200 rounded-xl p-6">
          {/* Section 1: कपाठ सेटिंग्स */}
          <div className="border border-yellow-400 rounded-md p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-600 text-xl">➕</span>
              <h2 className="font-bold text-gray-800 text-lg">कपाठ सेटिंग</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "म्हैस ठेव / लिटर",
                "एडव्हान्स हप्ता/बिल",
                "ई कपात/लिटर",
                "म्हैस वाहतूक/लिटर",
                "म्हैस कमिशन / लिटर",
                "गाय ठेव / लिटर",
                ".....",
                "ई कपात/बिल",
                "गाय वाहतूक/लिटर",
                 // ✅ New field
                "गाय कमिशन / लिटर", // ✅ New field
              ].map((label, idx) => (
                <div key={idx}>
                  <Label className="text-gray-700 text-sm">{label}</Label>
                  <Input
                    placeholder="0"
                    className="bg-yellow-50 border border-yellow-300 text-center text-gray-800"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: इतर सेटिंग्स */}
          <div className="border border-green-400 rounded-md p-4 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-600 text-xl">✔</span>
              <h2 className="font-bold text-gray-800 text-lg">इतर सेटिंग्स</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                " खाती क्रमांक 2",
                "सभासद नाव (इंग्रजीत)",
                "दुहेरी चालू / बंद",
                "मेसेज चालू / बंद",
                "वर्ग",
              ].map((label, idx) => (
                <div key={idx}>
                  <Label className="text-gray-700 text-sm">{label}</Label>
                  <Input
                    placeholder="0"
                    className="bg-yellow-50 border border-yellow-300 text-center text-gray-800"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: मागील बाकी सेटिंग्स */}
          <div className="border border-blue-400 rounded-md p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-600 text-xl">✔</span>
              <h2 className="font-bold text-gray-800 text-lg">
                मागील बाकी सेटिंग्स
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "मागील ठेवी 1",
                "मागील ठेवी 2",
                "मागील ठेवी 3",
                "मा. रेतण/पशूवैद्यकीया",
                "मा.संग खरेदी ",
                "मागिल रतीब बाकी",
                "मागिल कर्ज बाकी",
                "कर्ज हप्ता ",
                "कर्ज व्याज दर",
                "मागिल व्याज",
              ].map((label, idx) => (
                <div key={idx}>
                  <Label className="text-gray-700 text-sm">{label}</Label>
                  <Input
                    placeholder="0"
                    className="bg-yellow-50 border border-yellow-300 text-center text-gray-800"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              अपडेट
            </Button>
            <Button className="bg-sky-600 hover:bg-sky-700 text-white px-6">
              सभासद यादी
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6">
              बँक अपलोड
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SangliwadiSettings;
