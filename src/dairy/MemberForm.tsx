import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import YadiPage from "./YadiPage"; // Import YadiPage

interface MemberFormProps {
  onBack: () => void;
}

const MemberForm: React.FC<MemberFormProps> = ({ onBack }) => {
  const [showYadi, setShowYadi] = useState(false);

  if (showYadi) {
    return <YadiPage onBack={() => setShowYadi(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-100 flex flex-col">
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
      <div className="flex-1 flex justify-center items-start mt-8">
        <Card className="w-full max-w-5xl bg-white shadow-md border border-gray-200 p-8 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <Label>सदस्य आयडी</Label>
              <Input placeholder="53" className="bg-gray-50" disabled />
            </div>
            <div>
              <Label>सदस्याचे नाव</Label>
              <Input placeholder="प्रकार निवडा" />
            </div>
            <div>
              <Label>मोबाईल क्रमांक</Label>
              <Input placeholder="मोबाईल क्रमांक लिहा" />
            </div>

            <div>
              <Label>पत्ता</Label>
              <Input placeholder="पत्ता लिहा" />
            </div>
            <div>
              <Label>बँक नाव</Label>
              <Input placeholder="Auto" />
            </div>
            <div>
              <Label>बँक खाते नाव</Label>
              <Input placeholder="खाते नाव लिहा" />
            </div>

            <div>
              <Label>आधार क्रमांक</Label>
              <Input placeholder="आधार क्रमांक लिहा" />
            </div>
            <div>
              <Label>दुरध्वनी क्रमांक</Label>
              <Input placeholder="दुरध्वनी क्रमांक लिहा" />
            </div>
            <div>
              <Label>दरपत्रक विभाग</Label>
              <Input placeholder="दरपत्रक विभाग १" />
            </div>

            <div>
              <Label>टॅग क्रमांक</Label>
              <Input placeholder="टॅग क्रमांक लिहा" />
            </div>
            <div>
              <Label>एजंटचे नाव</Label>
              <Input placeholder="एजंटचे नाव लिहा" />
            </div>
            <div>
              <Label>फार्म चे नाव</Label>
              <Input placeholder="फार्म चे नाव लिहा" />
            </div>
          </div>

          <div className="flex justify-start gap-4 mt-8">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              सेव्ह
            </Button>
            <Button
              className="bg-sky-600 hover:bg-sky-700 text-white"
              onClick={() => setShowYadi(true)}
            >
              सभासद माहिती
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              बँक अपलोड
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MemberForm;
