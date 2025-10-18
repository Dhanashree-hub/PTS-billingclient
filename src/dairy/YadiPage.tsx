import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface YadiPageProps {
  onBack: () => void;
}

const YadiPage: React.FC<YadiPageProps> = ({ onBack }) => {
  const data = [
    {
      id: 1,
      name: "कार्तिक सुरेश पाटील",
      khate: "K001",
      suruAdvance: "₹500",
      suruKhadya: "₹200",
      suruThev: "₹100",
      password: "1234",
      varga: "A",
    },
    {
      id: 2,
      name: "गणेश रमेश गोकुळ",
      khate: "K002",
      suruAdvance: "₹300",
      suruKhadya: "₹150",
      suruThev: "₹80",
      password: "2345",
      varga: "B",
    },
    {
      id: 3,
      name: "शैला महेश पाटील",
      khate: "K003",
      suruAdvance: "₹400",
      suruKhadya: "₹180",
      suruThev: "₹90",
      password: "3456",
      varga: "A",
    },
    {
      id: 4,
      name: "विशाल विलास जाधव",
      khate: "K004",
      suruAdvance: "₹600",
      suruKhadya: "₹250",
      suruThev: "₹120",
      password: "4567",
      varga: "C",
    },
  ];

  const tableRef = useRef<HTMLDivElement>(null);

  const handleDelete = (id: number) => {
    console.log("Delete item with id:", id);
  };

  const handlePrint = () => {
    if (tableRef.current) {
      const printContents = tableRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // reload to restore React bindings
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col">
      {/* शीर्षक भाग */}
      <div className="flex justify-between items-center bg-blue-100 px-6 py-3 border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <span className="text-yellow-600 text-xl">📁</span>
          <span>.सांगलीवाडी यादी</span>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handlePrint}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            🖨 Print
          </Button>
          <Button
            onClick={onBack}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            ⬅ मागे जा
          </Button>
        </div>
      </div>

      {/* शोध विभाग */}
      <div className="p-4 flex flex-wrap gap-3 items-center bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <label className="font-medium text-gray-700">यादी:</label>
          <Input placeholder="खाते क्रमांक टाइप करा" className="w-48" />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          शोधा
        </Button>
      </div>

      {/* यादी तक्ता */}
      <div className="p-4 overflow-x-auto" ref={tableRef}>
        <table className="min-w-full border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-rose-100 text-gray-800">
            <tr>
              <th className="px-4 py-2 text-left border">सदस्याचे नाव</th>
              <th className="px-4 py-2 text-center border">खाते</th>
              <th className="px-4 py-2 text-center border">सुरु अ‍ॅडव्हान्स</th>
              <th className="px-4 py-2 text-center border">सुरु खाद्य</th>
              <th className="px-4 py-2 text-center border">सुरु ठेव</th>
              <th className="px-4 py-2 text-center border">पासवर्ड</th>
              <th className="px-4 py-2 text-center border">वर्ग</th>
              <th className="px-4 py-2 text-center border">क्रिया</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="text-sm hover:bg-blue-50 transition bg-white"
              >
                <td className="px-4 py-2 border text-black">{item.name}</td>
                <td className="px-4 py-2 border text-center text-black">{item.khate}</td>
                <td className="px-4 py-2 border text-center text-black">{item.suruAdvance}</td>
                <td className="px-4 py-2 border text-center text-black">{item.suruKhadya}</td>
                <td className="px-4 py-2 border text-center text-black">{item.suruThev}</td>
                <td className="px-4 py-2 border text-center text-black">{item.password}</td>
                <td className="px-4 py-2 border text-center text-black">{item.varga}</td>
                <td className="px-4 py-2 border text-center flex justify-center gap-2">
                  <Button className="bg-green-500 hover:bg-green-600 text-white text-sm px-2 py-1">
                    Edit
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
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
