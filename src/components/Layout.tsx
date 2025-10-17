import { useBilling } from "@/contexts/BillingContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";
import i18n from "@/i18n/config";
import CryptoJS from "crypto-js";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart2,
  Briefcase,
  Coffee,
  CreditCard,
  FileText,
  Languages,
  LayoutDashboard,
  List,
  Menu,
  Moon,
  Package,
  Palette,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Sun,
  Users,
  Utensils,
  X,
  Zap
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "your-very-secure-secret-key";

// Improved decryption function with better error handling
const decryptField = (encrypted: string): string => {
  if (!encrypted || typeof encrypted !== 'string') {
    return encrypted || '';
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encrypted; // fallback to original if empty after decryption
  } catch {
    console.warn("Decryption error for field:", encrypted);
    return encrypted;
  }
};

// Safe number decryption
const decryptNumberField = (encrypted: string, defaultValue = 0): number => {
  const decrypted = decryptField(encrypted);
  const num = parseFloat(decrypted);
  return isNaN(num) ? defaultValue : num;
};

const featureCards = [
  {
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    title: "3-Tap Billing",
    description: "Create invoices in just three taps with our optimized workflow"
  },
  {
    icon: <BarChart2 className="w-8 h-8 text-blue-500" />,
    title: "Real-time Analytics",
    description: "Get insights into your sales and business performance instantly"
  },
  {
    icon: <CreditCard className="w-8 h-8 text-green-500" />,
    title: "Multiple Payment Options",
    description: "Accept cash, cards, UPI and more with integrated payment tracking"
  },
  {
    icon: <Users className="w-8 h-8 text-purple-500" />,
    title: "Customer Management",
    description: "Track customer purchases and offer loyalty rewards"
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-red-500" />,
    title: "Secure Cloud Backup",
    description: "Your data is automatically backed up and protected"
  },
  {
    icon: <Smartphone className="w-8 h-8 text-indigo-500" />,
    title: "Mobile Friendly",
    description: "Works perfectly on all devices from desktop to mobile"
  }
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isConfigured, businessConfig } = useBilling();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const hideSidebar = location.pathname === "/pos";

  // decrypt config
  const decryptedBusinessConfig = businessConfig ? {
    name: decryptField(businessConfig.name || ''),
    type: decryptField(businessConfig.type || 'cafe'),
    address: decryptField(businessConfig.address || ''),
    phone: decryptField(businessConfig.phone || ''),
    email: decryptField(businessConfig.email || ''),
    taxRate: decryptNumberField(businessConfig.taxRate || '10', 10),
    logo: decryptField(businessConfig.logo || ''),
    gstNumber: decryptField(businessConfig.gstNumber || ''),
    active: businessConfig.active || false
  } : null;

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate("/login");
    });
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % featureCards.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Onboarding UI
  if (!isConfigured && location.pathname !== "/setup") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 overflow-auto py-8">
        <div className="w-full max-w-6xl px-4 py-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-3 md:mb-4">
              {t('welcome_to')} <span className="text-blue-600 dark:text-blue-400">QuickBill</span>
            </h1>
            <h2 className="mb-5 mt-5 font-bold text-xl">by PTS</h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-2">
              {t('welcome_description')}
            </p>
          </motion.div>
         
        </div>
      </div>
    );
  }

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case "cafe":
        return <Coffee size={24} className="text-amber-500" />;
      case "grocery":
        return <Store size={24} className="text-green-500" />;
      case "retail":
        return <ShoppingBag size={24} className="text-indigo-500" />;
      case "restaurant":
        return <Utensils size={24} className="text-red-500" />;
      default:
        return <Briefcase size={24} className="text-blue-500" />;
    }
  };

  const navItems = [
    { name: t('Dashboard'), path: "/dashboard", icon: <LayoutDashboard size={20} />, showWhen: isConfigured },
    { name: t('Point Of Sale'), path: "/pos", icon: <ShoppingCart size={20} />, showWhen: isConfigured },
    { name: t('Products'), path: "/products", icon: <Package size={20} />, showWhen: isConfigured },
    { name: t('Add Product'), path: "/products/add", icon: <Plus size={20} />, showWhen: isConfigured },
    { name: t('Categories'), path: "/categories", icon: <List size={20} />, showWhen: isConfigured },
    { name: t('Sales History'), path: "/sales", icon: <FileText size={20} />, showWhen: isConfigured },
    { name: t('Settings'), path: "/settings", icon: <Settings size={20} />, showWhen: true }
  ];

  const filteredNavItems = navItems.filter(item => item.showWhen);

  const SidebarContent = () => (
    <>
      {decryptedBusinessConfig?.name && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          {getBusinessIcon(decryptedBusinessConfig.type)}
          <div>
            <h2 className="text-base font-medium dark:text-white">{decryptedBusinessConfig.name}</h2>
            <p className="text-xs text-billing-secondary dark:text-gray-400 capitalize">
              {decryptedBusinessConfig.type || t('business')}
            </p>
          </div>
        </div>
      )}

      <div className={`${isMobile ? "mt-4" : ""} h-full overflow-y-auto`}>
        <ul className="space-y-1 px-3 py-4">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? "bg-billing-primary text-white dark:bg-blue-600"
                      : "text-billing-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {/* Appearance toggle */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full justify-start dark:border-gray-700 dark:text-gray-200">
                <Palette size={20} />
                <span>{t('Appearance')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" />
                    {t('Light')}
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    {t('Dark')}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Language toggle */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 w-full justify-start dark:border-gray-700 dark:text-gray-200 mt-2">
                <Languages size={20} />
                <span>{t('Language')}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="grid gap-2">
                <Button variant={i18n.language === 'en' ? "default" : "outline"} size="sm" className="justify-start" onClick={() => changeLanguage('en')}>
                  {t('English')}
                </Button>
                <Button variant={i18n.language === 'hi' ? "default" : "outline"} size="sm" className="justify-start" onClick={() => changeLanguage('hi')}>
                  {t('Hindi')}
                </Button>
                <Button variant={i18n.language === 'mr' ? "default" : "outline"} size="sm" className="justify-start" onClick={() => changeLanguage('mr')}>
                  {t('Marathi')}
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <div className="mt-4 flex justify-center">
            <Button onClick={handleLogout} className="bg-red-600 text-white px-6 py-1 text-sm rounded shadow hover:bg-red-700 transition duration-200">
              {t('Logout')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-billing-background dark:bg-gray-900 overflow-hidden">
      {/* Mobile Header with Sidebar Toggle */}
      {isMobile && !hideSidebar && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 z-50 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="mr-3 p-2 rounded-md dark:text-white">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-white dark:bg-gray-800">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h1 className="text-xl font-bold text-billing-dark dark:text-white">QuickBill</h1>
                  <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
                    <X size={16} />
                  </Button>
                </div>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold text-billing-dark dark:text-white">QuickBill</h1>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && !hideSidebar && (
        <aside className="w-64 relative bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm h-screen">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-billing-dark dark:text-white">QuickBill</h1>
          </div>
          <SidebarContent />
        </aside>
      )}

      {/* Main content */}
      <main className={`flex-1 overflow-auto ${isMobile && !hideSidebar ? "pt-16" : ""} dark:text-white`}>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
