import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface YadiPageProps {
  onBack: () => void;
}

const YadiPage: React.FC<YadiPageProps> = ({ onBack }) => {
  const data = [
    { id: 1, name: "कार्तिक सुरेश पाटील", cows: 2, buffaloes: 3, total: 5, milk: "४५ लिटर", amount: "₹०" },
    { id: 2, name: "गणेश रमेश गोकुळ", cows: 1, buffaloes: 2, total: 3, milk: "२२ लिटर", amount: "₹०" },
    { id: 3, name: "शैला महेश पाटील", cows: 3, buffaloes: 2, total: 5, milk: "४० लिटर", amount: "₹०" },
    { id: 4, name: "विशाल विलास जाधव", cows: 4, buffaloes: 0, total: 4, milk: "३० लिटर", amount: "₹०" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col">
      {/* शीर्षक भाग */}
      <div className="flex justify-between items-center bg-blue-100 px-6 py-3 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <span className="text-yellow-600 text-xl">📁</span>
          <span>.सांगलीवाडी यादी</span>
        </div>
        <Button
          onClick={onBack}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          ⬅ मागे जा
        </Button>
      </div>

      {/* शोध विभाग */}
      <div className="p-4 flex flex-wrap gap-3 items-center bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">शोधा:</label>
          <Input placeholder="सदस्याचे नाव टाइप करा" className="w-48" />
        </div>
        <select className="border rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option>सर्व</option>
          <option>गाय</option>
          <option>म्हैस</option>
        </select>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          शोधा
        </Button>
      </div>

      {/* यादी तक्ता */}
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-rose-100 text-gray-800">
            <tr>
              <th className="px-4 py-2 text-left border">क्र.</th>
              <th className="px-4 py-2 text-left border">सदस्याचे नाव</th>
              <th className="px-4 py-2 text-center border">गाय संख्या</th>
              <th className="px-4 py-2 text-center border">म्हैस संख्या</th>
              <th className="px-4 py-2 text-center border">एकूण संख्या</th>
              <th className="px-4 py-2 text-center border">दूध (लिटर)</th>
              <th className="px-4 py-2 text-center border">रक्कम</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id}
                className={`text-sm hover:bg-blue-50 transition ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-4 py-2 border text-center">{index + 1}</td>
                <td className="px-4 py-2 border">{item.name}</td>
                <td className="px-4 py-2 border text-center">{item.cows}</td>
                <td className="px-4 py-2 border text-center">{item.buffaloes}</td>
                <td className="px-4 py-2 border text-center">{item.total}</td>
                <td className="px-4 py-2 border text-center">{item.milk}</td>
                <td className="px-4 py-2 border text-center font-semibold text-gray-700">
                  {item.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default YadiPage;
