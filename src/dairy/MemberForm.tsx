import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import YadiPage from "./YadiPage";
import SangliwadiSettings from "./SangliwadiSettings"; // ✅ Import

interface MemberFormProps {
  onBack: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ onBack }) => {
  const [showYadi, setShowYadi] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ✅ Navigate to Settings Page
  if (showSettings) {
    return <SangliwadiSettings onBack={() => setShowSettings(false)} />;
  }

  // ✅ Navigate to Yadi Page
  if (showYadi) {
    return <YadiPage onBack={() => setShowYadi(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-100 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-100 px-6 py-3 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <span className="text-yellow-600 text-xl">📁</span>
          <span>.सांगलीवाडी</span>
        </div>

        <Button
          onClick={onBack}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          ⬅ मागे जा
        </Button>
      </div>

      {/* Form */}
      <div className="flex-1 flex justify-center items-center p-6">
        <Card className="w-full max-w-5xl bg-white shadow-md border border-gray-200 p-8 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
            {/* खाते क्रमांक + Setting button */}
            <div>
              <Label className="text-black">खाते क्रमांक</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="53"
                  className="bg-white border border-gray-300 rounded-md w-28 text-black"
                  disabled
                />
                <Button
                  onClick={() => setShowSettings(true)} // ✅ Opens settings page
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded-md text-sm flex items-center gap-1"
                >
                  ⚙ <span>सेटिंग</span>
                </Button>
              </div>
            </div>

            {/* Other inputs */}
            {[
              "सभासदाचे नाव",
              "दूध प्रकार",
              "मोबाईल क्रमांक",
              "पत्ता",
              "पासवर्ड",
              "मोबाइल युजरचे नाव",
              "बँक नाव",
              "बँक शाखा",
              "बँक खाते क्रमांक",
              "आधार क्रमांक",
              "शेतकरी आयडी",
              "टॅग नंबर",
              "दरपत्रक विभाग",
              "खाद्य येणे बाकी",
              "अ‍ॅडव्हान्स येणे बाकी",
              "मागित ठेवा",
            ].map((label, idx) => (
              <div key={idx}>
                <Label className="text-black">{label}</Label>
                <Input
                  placeholder={`${label} लिहा`}
                  className="bg-white border border-gray-300 rounded-md text-black"
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">
              सेव्ह
            </Button>
            <Button
              className="bg-sky-600 hover:bg-sky-700 text-white px-6"
              onClick={() => setShowYadi(true)}
            >
              सभासद माहिती
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

export default MemberForm;
