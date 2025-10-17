import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SanghMasterProps {
  onBack: () => void;
}

const SanghMaster: React.FC<SanghMasterProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-50 border-b px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
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

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          संघ मास्टर
        </h2>

        {/* Form Section */}
        <Card className="p-6 mb-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>संघाचे नाव</Label>
              <Input placeholder="संघाचे नाव लिहा" />
            </div>
            <div>
              <Label>पत्ता</Label>
              <Input placeholder="पत्ता लिहा" />
            </div>
            <div>
              <Label>मोबाईल नंबर</Label>
              <Input placeholder="मोबाईल नंबर लिहा" />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              सेव्ह
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              क्लिअर
            </Button>
          </div>
        </Card>

        {/* Table Section */}
        <Card className="p-4 shadow-sm border border-gray-200">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead>
              <tr className="bg-red-100 text-gray-800 border-b">
                <th className="p-2 border">क्रमांक</th>
                <th className="p-2 border">संघाचे नाव</th>
                <th className="p-2 border">पत्ता</th>
                <th className="p-2 border">मोबाईल</th>
                <th className="p-2 border">क्रिया</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center border">
                <td className="p-2 border">1</td>
                <td className="p-2 border">कृष्णा दूध संघ</td>
                <td className="p-2 border">सांगली</td>
                <td className="p-2 border">9876543210</td>
                <td className="p-2 border">
                  <Button variant="outline" size="sm">
                    ✏️ संपादित करा
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};

export default SanghMaster;
