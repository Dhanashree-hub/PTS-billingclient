import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Milk,
  Calculator,
  History,
  Settings,
  Users,
  LogOut,
  Home,
  HelpCircle,
  FileText,
  ClipboardCheck, // ✅ For Auditing
  BarChart3, // ✅ For Reports
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

// Import all dairy components
import DairyOverview from "../dairy/DairyOverview";
import MilkCollection from "../dairy/MilkCollection";
import RateCalculator from "../dairy/RateCalculator";
import CollectionHistory from "../dairy/CollectionHistory";
import FarmersManagement from "../dairy/FarmersManagement";
import DairySettings from "../dairy/DairySettings";
import ItarVoucher from "../dairy/ItarVoucher"; // ✅ New page
import AuditingVibhag from "../dairy/AuditingVibhag"; // ✅ New page (create this)
import ReportsPage from "../dairy/ReportsPage"; // ✅ New page (create this)

const DairyDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("overview");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ✅ Updated Menu Items
  const menuItems = [
    { id: "overview", label: "मास्टर माहिती", icon: Home },
    { id: "milk-collection", label: "दैनंदिन व्यवहार", icon: Milk },
    { id: "itar-voucher", label: "इतर व्हाउचर", icon: FileText },
    { id: "auditing-vibhag", label: "ऑडिटिंग विभाग", icon: ClipboardCheck }, // ✅ new
    { id: "reports", label: "रिपोर्ट्स", icon: BarChart3 }, // ✅ new
    { id: "calculations", label: "दरपत्रक", icon: Calculator },
    { id: "history", label: "इतिहास", icon: History },
    { id: "farmers", label: "सदस्य व्यवस्थापन", icon: Users },
    { id: "dairy-settings", label: "सेटिंग्स", icon: Settings },
    { id: "help", label: "मदत", icon: HelpCircle },
  ];

  // ✅ Updated Page Rendering
  const renderActivePage = () => {
    switch (activePage) {
      case "overview":
        return <DairyOverview />;
      case "milk-collection":
        return <MilkCollection />;
      case "itar-voucher":
        return <ItarVoucher />;
      case "auditing-vibhag":
        return <AuditingVibhag />; // ✅ New Page
      case "reports":
        return <ReportsPage />; // ✅ New Page
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
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#2b6cb0] via-[#5a4fcf] to-[#a56eff] text-white flex flex-col shadow-lg">
        {/* Logo Header */}
        <div className="p-6 border-b border-white/20 flex items-center justify-center">
          <div className="bg-white rounded-lg px-3 py-1 shadow-sm">
            <h1 className="text-blue-600 font-bold text-xl tracking-wide">
              iDAIRY
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      activePage === item.id
                        ? "bg-white/30 text-yellow-300 shadow-inner"
                        : "hover:bg-white/15 text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info Section */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 mb-4 p-3 bg-white/10 rounded-lg">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-blue-800 text-sm font-bold">
                {currentUser?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {currentUser?.email}
              </p>
              <p className="text-xs text-gray-200">डेअरी प्रशासक</p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <LogOut className="h-4 w-4" />
            लॉग आऊट
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{renderActivePage()}</div>
      </div>
    </div>
  );
};

export default DairyDashboard;
