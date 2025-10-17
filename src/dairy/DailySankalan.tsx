import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DailySankalanProps {
  onBack: () => void;
}

const DailySankalan: React.FC<DailySankalanProps> = ({ onBack }) => {
  const [date, setDate] = useState("2025-10-16");
  const members = ["Shivaji Mahadev Sawant", "Ganesh Patil", "Vishal Jadhav"];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center bg-blue-50 border-b px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-700">
          <span className="text-yellow-600 text-xl">🥛</span>
          <span>.संकलन केंद्र</span>
        </div>
        <Button
          onClick={onBack}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          ⬅ मागे जा
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Date + Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Label className="text-gray-700">दिनांक</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-44 border-gray-300"
            />
          </div>
          <div className="flex gap-3">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              नवीन नोंदणी
            </Button>
            <Button className="bg-green-700 hover:bg-green-800 text-white">
              संकलन जतन करा
            </Button>
          </div>
        </div>

        {/* Entry Form */}
        <Card className="p-4 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 items-end">
            <div>
              <Label>सदस्याचे नाव</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="सदस्य निवडा" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m, i) => (
                    <SelectItem key={i} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fat</Label>
              <Input type="number" placeholder="%" className="border-gray-300" />
            </div>
            <div>
              <Label>SNF</Label>
              <Input type="number" placeholder="%" className="border-gray-300" />
            </div>
            <div>
              <Label>दर</Label>
              <Input type="number" placeholder="₹" className="border-gray-300" />
            </div>
            <div>
              <Label>वजन (Ltr)</Label>
              <Input type="number" placeholder="0.0" className="border-gray-300" />
            </div>
            <div>
              <Label>रक्कम (₹)</Label>
              <Input type="number" placeholder="0.00" className="border-gray-300" />
            </div>
            <div className="flex gap-2 mt-5 md:mt-0">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                Save
              </Button>
              <Button variant="outline" className="w-full">
                Clear
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="p-4 border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-gray-700 border-collapse">
            <thead>
              <tr className="bg-red-100 text-gray-800 border">
                <th className="p-2 border">क्रमांक</th>
                <th className="p-2 border">सदस्याचे नाव</th>
                <th className="p-2 border">Fat</th>
                <th className="p-2 border">SNF</th>
                <th className="p-2 border">दर</th>
                <th className="p-2 border">वजन</th>
                <th className="p-2 border">रक्कम</th>
                <th className="p-2 border">क्रिया</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center border">
                <td className="p-2 border">1</td>
                <td className="p-2 border">Shivaji Mahadev Sawant</td>
                <td className="p-2 border">4.2</td>
                <td className="p-2 border">8.5</td>
                <td className="p-2 border">32.5</td>
                <td className="p-2 border">10</td>
                <td className="p-2 border">325.00</td>
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

export default DailySankalan;
