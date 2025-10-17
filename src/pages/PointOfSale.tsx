import Layout from "@/components/Layout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useBilling } from "@/contexts/BillingContext";
import { auth, database } from "@/firebase/firebaseConfig";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/lib/utils";
import { get, onValue, ref, set } from "firebase/database";
import { Calculator, CreditCard, IndianRupee, Minus, Package, Plus, Search, ShoppingCart, X, Users, UserCheck, UserCog, User } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import CalculatorPopup from "./Calculator";
import CryptoJS from "crypto-js";
import CustomerInfoModal from "@/components/CustomerInfoModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight?: string;
  imageUrl?: string;
  code?: string;
}

interface SaleTab {
  id: string;
  name: string;
  cart: CartItem[];
  discountType: 'flat' | 'percentage';
  discountValue: number;
  paymentMethod: string;
  priceType: string;
  status: 'active' | 'completed';
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
}

interface SaleData {
  id: string;
  date: string;
  customer: CustomerInfo;
  customerName: string;
  customerPhone: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  weight?: string;
    code?: string;
  }[];
  subtotal: number;
  tax: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: string;
  priceType: string;
  businessName: string;
  tabName?: string;
  userId: string;
  status: 'active' | 'completed';
}

const STORAGE_KEYS = {
  TABS: 'pos_tabs',
  ACTIVE_TAB: 'pos_active_tab',
  CUSTOMER_INFO: 'pos_customer_info',
  PRICE_TYPE: 'pos_price_type',
  PAYMENT_METHOD: 'pos_payment_method'
};

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "your-very-secure-secret-key";

const encryptField = (value: string): string => {
  if (!value) return value;
  return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
};

const decryptField = (encrypted: string): string => {
  if (!encrypted || typeof encrypted !== 'string') {
    return encrypted || '';
  }

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encrypted;
  } catch (err) {
    console.warn("Decryption error for field:", encrypted);
    return encrypted;
  }
};

const decryptNumberField = (encrypted: string, defaultValue = 0): number => {
  const decrypted = decryptField(encrypted);
  const num = parseFloat(decrypted);
  return isNaN(num) ? defaultValue : num;
};

const printBill = (billContent: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Receipt</title>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Courier New', monospace;
          }
          body {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 0;
            padding: 20px;
            font-size: 14px;
            line-height: 1.4;
            background-color: white;
          }
          .receipt-container {
            width: 100%;
            max-width: 600px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px dashed #000;
            width: 100%;
          }
          .receipt-header h1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .receipt-info {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 2px dashed #000;
            width: 100%;
          }
          .receipt-info div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          .receipt-items {
            margin-bottom: 15px;
            width: 100%;
          }
          .receipt-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ccc;
            width: 100%;
          }
          .item-name {
            flex: 2;
            font-weight: bold;
          }
          .item-details {
            flex: 1;
            text-align: right;
            font-size: 14px;
          }
          .receipt-totals {
            margin-bottom: 15px;
            padding-top: 15px;
            border-top: 3px solid #000;
            width: 100%;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 16px;
          }
          .grand-total {
            font-weight: bold;
            font-size: 20px;
            border-top: 2px dashed #000;
            padding-top: 12px;
            margin-top: 12px;
          }
          .receipt-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 2px dashed #000;
            font-size: 14px;
            width: 100%;
          }
          .text-center {
            text-align: center;
          }
          .text-right {
            text-align: right;
            width: 100%;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .barcode {
            margin: 15px 0;
            text-align: center;
          }
          .thank-you {
            font-weight: bold;
            margin-top: 15px;
            font-size: 18px;
          }
          .divider {
            width: 100%;
            height: 1px;
            background: #000;
            margin: 10px 0;
          }
          .double-divider {
            width: 100%;
            height: 3px;
            background: #000;
            margin: 15px 0;
          }
          @media print {
            body {
              width: 100vw !important;
              height: 100vh !important;
              margin: 0 !important;
              padding: 20px !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: center !important;
              align-items: center !important;
            }
            .receipt-container {
              width: 100% !important;
              max-width: 100% !important;
            }
            .no-print {
              display: none !important;
            }
          }
        </style>
      </head>
      <body onload="window.print(); setTimeout(() => window.close(), 1000)">
        <div class="receipt-container">
          ${billContent}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  } else {
    console.error("Could not open print window");
  }
};

const PointOfSale = ({ standalone = false }) => {
  const { t } = useTranslation(['pos', 'common', 'paymentMethods']);
  const { products, categories, businessConfig } = useBilling();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [initialized, setInitialized] = useState(false);
  const [tabs, setTabs] = useState<SaleTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: "", phone: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [paymentMethodSelected, setPaymentMethodSelected] = useState(false);
  const [priceTypeSelected, setPriceTypeSelected] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [selectedPriceType, setSelectedPriceType] = useState<string>("");
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [currentSaleCustomerInfo, setCurrentSaleCustomerInfo] = useState<CustomerInfo>({ name: "", phone: "" });

  const decryptedBusinessConfig = businessConfig ? {
    name: decryptField(businessConfig.name || ''),
    type: decryptField(businessConfig.type || 'cafe'),
    address: decryptField(businessConfig.address || ''),
    phone: decryptField(businessConfig.phone || ''),
    email: decryptField(businessConfig.email || ''),
    taxRate: decryptNumberField(businessConfig.taxRate || '10', 10),
    logo: decryptField(businessConfig.logo || ''),
    gstNumber: decryptField(businessConfig.gstNumber || ''),
    upiId: decryptField(businessConfig.upiId || ''),
    active: businessConfig.active || false
  } : null;

  const decryptedProducts = useMemo(() => {
    return products.map(product => ({
      ...product,
      id: decryptField(product.id),
      name: decryptField(product.name),
      code: product.code ? decryptField(product.code) : '',
      category: decryptField(product.category),
      description: decryptField(product.description || ''),
      price: decryptNumberField(product.price?.toString() || '0'),
      regularPrice: decryptNumberField(product.regularPrice || product.price?.toString() || '0'),
      wholesalerPrice: decryptNumberField(product.wholesalerPrice || product.price?.toString() || '0'),
      agentPrice: decryptNumberField(product.agentPrice || product.price?.toString() || '0'),
      agent1Price: decryptNumberField(product.agent1Price || product.price?.toString() || '0'),
      quantity: product.quantity ? decryptNumberField(product.quantity.toString()) : 0,
      weight: product.weight ? decryptField(product.weight) : undefined,
      imageUrl: decryptField(product.imageUrl || ''),
      useSamePrice: product.useSamePrice !== undefined ? product.useSamePrice : true
    }));
  }, [products]);

  const decryptedCategories = useMemo(() => {
    return (categories || []).map(category => ({
      ...category,
      id: decryptField(category.id),
      name: decryptField(category.name),
      description: decryptField(category.description || '')
    }));
  }, [categories]);

  const loadInitialState = useCallback(() => {
    try {
      const savedTabs = localStorage.getItem(STORAGE_KEYS.TABS);
      const savedActiveTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
      const savedCustomerInfo = localStorage.getItem(STORAGE_KEYS.CUSTOMER_INFO);

      if (!savedTabs) {
        const defaultTab = { 
          id: uuidv4(), 
          name: `${t('pos:sale')} 1`, 
          cart: [], 
          discountType: 'flat', 
          discountValue: 0, 
          paymentMethod: "cash",
          priceType: "regular",
          status: 'active'
        };
        return {
          tabs: [defaultTab],
          activeTabId: defaultTab.id,
          customerInfo: savedCustomerInfo ? JSON.parse(savedCustomerInfo) : { name: "", phone: "" },
          priceType: "",
          paymentMethod: ""
        };
      }

      const parsedTabs = JSON.parse(savedTabs).map((tab: any) => ({
        ...tab,
        cart: tab.cart.map((item: any) => ({
          ...item,
          name: decryptField(item.name),
          code: item.code ? decryptField(item.code) : '',
          weight: item.weight ? decryptField(item.weight) : undefined,
          imageUrl: item.imageUrl ? decryptField(item.imageUrl) : undefined
        }))
      }));

      return {
        tabs: parsedTabs,
        activeTabId: savedActiveTab || JSON.parse(savedTabs)[0].id,
        customerInfo: savedCustomerInfo ? {
          name: decryptField(JSON.parse(savedCustomerInfo).name),
          phone: decryptField(JSON.parse(savedCustomerInfo).phone),
          email: JSON.parse(savedCustomerInfo).email ? decryptField(JSON.parse(savedCustomerInfo).email) : undefined
        } : { name: "", phone: "" },
        priceType: "",
        paymentMethod: ""
      };
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
      const defaultTab = { 
        id: uuidv4(), 
        name: `${t('pos:sale')} 1`, 
        cart: [], 
        discountType: 'flat', 
        discountValue: 0, 
          paymentMethod: "cash",
          priceType: "regular",
          status: 'active'
        };
        return {
          tabs: [defaultTab],
          activeTabId: defaultTab.id,
          customerInfo: { name: "", phone: "" },
          priceType: "",
          paymentMethod: ""
        };
      }
    }, [t]);

    useEffect(() => {
      if (!initialized) {
        const initialState = loadInitialState();
        setTabs(initialState.tabs);
        setActiveTabId(initialState.activeTabId);
        setCustomerInfo(initialState.customerInfo);
        
        // Always reset payment method and price type selection
        setSelectedPriceType("");
        setSelectedPaymentMethod("");
        setPriceTypeSelected(false);
        setPaymentMethodSelected(false);
        
        setInitialized(true);
      }
    }, [initialized, loadInitialState]);

    const activeTab = useMemo(() => tabs.find(tab => tab.id === activeTabId), [tabs, activeTabId]);
    const activeCart = activeTab?.cart || [];

    useEffect(() => {
      if (!initialized) return;
      
      const encryptedTabs = tabs.map(tab => ({
        ...tab,
        cart: tab.cart.map(item => ({
          ...item,
          name: encryptField(item.name),
          code: item.code ? encryptField(item.code) : '',
          weight: item.weight ? encryptField(item.weight) : undefined,
          imageUrl: item.imageUrl ? encryptField(item.imageUrl) : undefined
        }))
      }));
      
      localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(encryptedTabs));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTabId);
      
      // Don't save price type and payment method to localStorage
      // so they'll be asked again next time
      
      const encryptedCustomerInfo = {
        name: encryptField(customerInfo.name),
        phone: encryptField(customerInfo.phone),
        email: customerInfo.email ? encryptField(customerInfo.email) : undefined
      };
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_INFO, JSON.stringify(encryptedCustomerInfo));
    }, [tabs, activeTabId, customerInfo, initialized]);

    useEffect(() => {
      if (!initialized || !activeTab) return;
      const user = auth.currentUser;
      if (!user) return;

      const saveActiveTabToFirebase = async () => {
        try {
          const activeTabRef = ref(database, `users/${user.uid}/activeTabs/${activeTab.id}`);
          
          const encryptedTab = {
            ...activeTab,
            cart: activeTab.cart.map(item => ({
              ...item,
              name: encryptField(item.name),
              code: item.code ? encryptField(item.code) : '',
              weight: item.weight ? encryptField(item.weight) : undefined,
              imageUrl: item.imageUrl ? encryptField(item.imageUrl) : undefined
            })),
            lastUpdated: new Date().toISOString()
          };
          
          await set(activeTabRef, encryptedTab);
        } catch (error) {
          console.error("Error saving active tab to Firebase:", error);
        }
      };

      saveActiveTabToFirebase();
    }, [activeTab, initialized]);

    useEffect(() => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = ref(database, `users/${user.uid}/business/active`);
      
      const unsubscribe = onValue(userRef, (snapshot) => {
        const isActive = snapshot.exists() ? snapshot.val() : false;
        
        if (!isActive) {
          auth.signOut().then(() => {
            navigate("/login", {
              state: { accountDisabled: true },
              replace: true
            });
            toast({
              title: t('common:accountDisabled'),
              description: t('common:accountDisabledDescription'),
              variant: "destructive",
            });
          });
        }
      });

      return () => unsubscribe();
    }, [navigate, t]);

    const getProductPrice = useCallback((product: any) => {
      switch (selectedPriceType) {
        case 'wholesaler':
          return product.wholesalerPrice || product.price;
        case 'agent':
          return product.agentPrice || product.price;
        case 'agent1':
          return product.agent1Price || product.price;
        case 'regular':
        default:
          return product.regularPrice || product.price;
      }
    }, [selectedPriceType]);

    const filteredProducts = useMemo(() => {
      return decryptedProducts.filter(product => {
        const matchesCategory = activeCategory === "all" || product.category === activeCategory;
        
        // If search query is empty, show all products in category
        if (!searchQuery.trim()) return matchesCategory;
        
        // Check for exact code match first
        if (product.code && product.code.toLowerCase() === searchQuery.toLowerCase()) {
          return matchesCategory;
        }
        
        // If no exact code match, check for name match
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    }, [decryptedProducts, activeCategory, searchQuery]);

    const updateTabState = useCallback((tabId: string, newState: Partial<SaleTab>) => {
      setTabs(prevTabs => {
        return prevTabs.map(tab => {
          if (tab.id !== tabId) return tab;
          const updatedTab = { ...tab, ...newState };
          if (JSON.stringify(tab) === JSON.stringify(updatedTab)) return tab;
          return updatedTab;
        });
      });
    }, []);

    const updateProductQuantity = useCallback(async (productId: string, quantityChange: number) => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const productRef = ref(database, `users/${user.uid}/products/${productId}`);
        const snapshot = await get(productRef);
        
        if (snapshot.exists()) {
          const productData = snapshot.val();
          const currentQuantity = decryptNumberField(productData.quantity || '0');
          const newQuantity = Math.max(0, currentQuantity - quantityChange);
          
          await set(productRef, {
            ...productData,
            quantity: encryptField(newQuantity.toString())
          });
        }
      } catch (error) {
        console.error("Error updating product quantities:", error);
      }
    }, []);

    const addToCart = useCallback((product: any, quantity: number) => {
      if (!activeTab) return;

      if (product.quantity !== undefined && product.quantity <= 0) {
        toast({
          title: t('pos:outOfStock'),
          description: t('pos:outOfStockDescription', { productName: product.name }),
          variant: "destructive",
        });
        return;
      }

      const currentCart = activeTab.cart || [];
      const existingItem = currentCart.find(item => item.id === product.id);
      
      if (product.quantity !== undefined) {
        const currentQuantityInCart = existingItem?.quantity || 0;
        if (currentQuantityInCart + quantity > product.quantity) {
          toast({
            title: t('pos:insufficientStock'),
            description: t('pos:insufficientStockDescription', { 
              productName: product.name,
              available: product.quantity
            }),
            variant: "destructive",
          });
          return;
        }
      }
      
      const productPrice = getProductPrice(product);
      
      const updatedCart = existingItem
        ? currentCart.map(item =>
            item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          )
        : [...currentCart, { 
            ...product, 
            price: productPrice,
            quantity: quantity,
            weight: product.weight,
            code: product.code
          }];

      updateTabState(activeTab.id, { cart: updatedCart });

      toast({
        title: t('pos:productAdded'),
        description: t('pos:productAddedDescription', { 
          productName: product.name, 
          quantity: quantity,
          tabName: activeTab.name 
        }),
        variant: "success",
      });

      // Reset quantity for this product
      setProductQuantities(prev => ({
        ...prev,
        [product.id]: 1
      }));
    }, [activeTab, updateTabState, t, getProductPrice]);

    const updateCartItem = useCallback((productId: string, quantity: number) => {
      if (!activeTab) return;

      const updatedCart = quantity <= 0
        ? activeTab.cart.filter(item => item.id !== productId)
        : activeTab.cart.map(item =>
            item.id === productId ? { ...item, quantity } : item
          );

      updateTabState(activeTab.id, { cart: updatedCart });
    }, [activeTab, updateTabState]);

    const removeFromCart = useCallback((productId: string) => {
      if (!activeTab) return;
      const updatedCart = activeTab.cart.filter(item => item.id !== productId);
      updateTabState(activeTab.id, { cart: updatedCart });
    }, [activeTab, updateTabState]);

    const clearCart = useCallback(() => {
      if (!activeTab) return;
      updateTabState(activeTab.id, { 
        cart: [], 
        discountType: 'flat', 
        discountValue: 0, 
        paymentMethod: selectedPaymentMethod || 'cash',
        priceType: selectedPriceType || 'regular',
        status: 'active'
      });
      toast({
        title: t('pos:cartCleared'),
        description: t('pos:cartClearedDescription', { tabName: activeTab.name }),
      });
    }, [activeTab, updateTabState, t, selectedPaymentMethod, selectedPriceType]);

    const { subtotal, tax, discountAmount, total } = useMemo(() => {
      const subtotal = activeCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const taxRate = decryptedBusinessConfig?.taxRate || 0;
      const tax = subtotal * (taxRate / 100);
      const discountAmount = activeTab?.discountType === "percentage"
        ? subtotal * (activeTab.discountValue / 100)
        : activeTab?.discountValue || 0;
      const total = (subtotal + tax) - discountAmount;

      return { subtotal, tax, discountAmount, total };
    }, [activeCart, activeTab, decryptedBusinessConfig]);

    const generateBillDetails = useCallback(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString();
      const timeStr = now.toLocaleTimeString();
      const invoiceNo = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      
      let billHTML = `
        <div class="receipt-header">
          <h1>${decryptedBusinessConfig?.name || t('pos:ourStore')}</h1>
          <div>${decryptedBusinessConfig?.address || ''}</div>
          <div>Tel: ${decryptedBusinessConfig?.phone || ''}</div>
          ${decryptedBusinessConfig?.gstNumber ? `<div>GST: ${decryptedBusinessConfig.gstNumber}</div>` : ''}
        </div>
        
        <div class="double-divider"></div>
        
        <div class="receipt-info">
          <div><span>Invoice:</span> <span>${invoiceNo}</span></div>
          <div><span>Date:</span> <span>${dateStr}</span></div>
          <div><span>Time:</span> <span>${timeStr}</span></div>
          <div><span>Cashier:</span> <span>${auth.currentUser?.displayName || 'POS System'}</span></div>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="receipt-items">
      `;
      
      activeCart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        billHTML += `
          <div class="receipt-item">
            <div class="item-name">${item.name}${item.code ? ` (${item.code})` : ''}${item.weight ? ` [${item.weight}]` : ''}</div>
            <div class="item-details">${item.quantity} x ${formatCurrency(item.price)}</div>
          </div>
          <div class="text-right">${formatCurrency(itemTotal)}</div>
          <div class="divider"></div>
        `;
      });
      
      billHTML += `</div>`;
      
      billHTML += `
        <div class="receipt-totals">
          <div class="total-row"><span>Subtotal:</span> <span>${formatCurrency(subtotal)}</span></div>
          <div class="total-row"><span>Tax (${decryptedBusinessConfig?.taxRate || 0}%):</span> <span>${formatCurrency(tax)}</span></div>
          <div class="total-row"><span>Discount:</span> <span>-${formatCurrency(discountAmount)}</span></div>
          <div class="total-row grand-total"><span>TOTAL:</span> <span>${formatCurrency(total)}</span></div>
        </div>
        
        <div class="double-divider"></div>
        
        <div class="receipt-info">
          <div><span>Payment Method:</span> <span>${selectedPaymentMethod?.toUpperCase() || t('paymentMethods:cash')}</span></div>
          <div><span>Price Type:</span> <span>${selectedPriceType.toUpperCase()}</span></div>
        </div>
      `;
      
      // Only show customer info if it was provided for this specific sale
      if (currentSaleCustomerInfo.name || currentSaleCustomerInfo.phone) {
        billHTML += `
          <div class="double-divider"></div>
          <div class="receipt-info">
            <div><span>Customer:</span> <span>${currentSaleCustomerInfo.name || ''}</span></div>
            <div><span>Phone:</span> <span>${currentSaleCustomerInfo.phone || ''}</span></div>
          </div>
        `;
      }
      
      billHTML += `
        <div class="double-divider"></div>
        <div class="receipt-footer">
          <div class="thank-you">${t('pos:thankYou')}</div>
          <div>Please retain this receipt for your records</div>
          <div>${now.getFullYear()} © ${decryptedBusinessConfig?.name || t('pos:ourStore')}</div>
        </div>
      `;
      
      return billHTML;
    }, [activeCart, decryptedBusinessConfig, subtotal, tax, discountAmount, total, currentSaleCustomerInfo, t, selectedPaymentMethod, selectedPriceType]);

    const handleCheckout = useCallback(() => {
      if (!activeTab || activeCart.length === 0) {
        toast({
          title: t('pos:emptyCartTitle'),
          description: t('pos:emptyCartDescription'),
          variant: "destructive",
        });
        return;
      }
      setShowConfirmation(true);
    }, [activeTab, activeCart, t]);

    const processSale = useCallback(async (customerData: CustomerInfo) => {
      if (!activeTab) return;

      const transactionId = uuidv4();
      const user = auth.currentUser;

      if (!user) {
        console.error("No authenticated user found");
        toast({
          title: t('pos:saleFailed'),
          description: t('pos:noUserFound'),
          variant: "destructive",
        });
        return;
      }

      try {
        await Promise.all(activeCart.map(item => 
          updateProductQuantity(item.id, item.quantity)
        ));
      } catch (error) {
        console.error("Error updating product quantities:", error);
        toast({
          title: t('pos:saleFailed'),
          description: t('pos:quantityUpdateFailed'),
          variant: "destructive",
        });
        return;
      }

      const encryptedCustomerData = {
        name: customerData.name ? encryptField(customerData.name) : "",
        phone: customerData.phone ? encryptField(customerData.phone) : "",
        email: customerData.email ? encryptField(customerData.email) : ""
      };

      const saleData: SaleData = {
        id: transactionId,
        date: new Date().toISOString(),
        customer: encryptedCustomerData,
        customerName: encryptedCustomerData.name,
        customerPhone: encryptedCustomerData.phone,
        items: activeCart.map(item => ({
          id: item.id,
          name: encryptField(item.name),
          price: item.price,
          quantity: item.quantity,
          weight: item.weight ? encryptField(item.weight) : undefined,
          code: item.code ? encryptField(item.code) : undefined
        })),
        subtotal,
        tax,
        discountAmount,
        grandTotal: total,
        paymentMethod: selectedPaymentMethod || 'cash',
        priceType: selectedPriceType || 'regular',
        businessName: encryptField(decryptedBusinessConfig?.name || ""),
        tabName: encryptField(activeTab.name),
        userId: user.uid,
        status: 'completed'
      };

      try {
        const salesRef = ref(database, `sales/${transactionId}`);
        await set(salesRef, saleData);

        const userSalesRef = ref(database, `users/${user.uid}/sales/${transactionId}`);
        await set(userSalesRef, saleData);

        const userSalesByDateRef = ref(database, `users/${user.uid}/salesByDate/${new Date().toISOString().split('T')[0]}/${transactionId}`);
        await set(userSalesByDateRef, saleData);

        await Promise.all(activeCart.map(async (item) => {
          const productSalesRef = ref(database, `products/${item.id}/sales`);
          const snapshot = await get(productSalesRef);
          const currentSales = snapshot.exists() ? snapshot.val() : 0;
          await set(productSalesRef, currentSales + item.quantity);
        }));

        const activeTabRef = ref(database, `users/${user.uid}/activeTabs/${activeTab.id}`);
        await set(activeTabRef, null);

        setTabs(prevTabs => prevTabs.map(tab => 
          tab.id === activeTab.id 
            ? { ...tab, cart: [], discountValue: 0, status: 'completed' } 
            : tab
        ));

        toast({
          title: t('pos:paymentSuccess'),
          description: t('pos:saleCompleted', { tabName: activeTab.name }),
          variant: "success",
        });
        
        if (isMobile) setShowCart(false);
        
        const billContent = generateBillDetails();
        printBill(billContent);
      } catch (error) {
        console.error("Error saving sale:", error);
        toast({
          title: t('pos:saleFailed'),
          description: t('pos:saveFailed'),
          variant: "destructive",
        });
      } finally {
        setShowConfirmation(false);
        setShowCustomerModal(false);
        // Reset current sale customer info after processing
        setCurrentSaleCustomerInfo({ name: "", phone: "" });
      }
    }, [activeTab, activeCart, subtotal, tax, discountAmount, total, decryptedBusinessConfig, isMobile, t, generateBillDetails, updateProductQuantity, selectedPaymentMethod, selectedPriceType]);

    const handleCompleteSale = useCallback(async (collectCustomerInfo: boolean) => {
      if (!activeTab) return;

      if (collectCustomerInfo) {
        setShowCustomerModal(true);
      } else {
        // Reset customer info for this sale if not collecting
        setCurrentSaleCustomerInfo({ name: "", phone: "" });
        await processSale({ name: "", phone: "", email: "" });
      }
    }, [activeTab, processSale]);

    const handleCustomerInfoSubmit = useCallback(async (info: CustomerInfo) => {
      // Set the customer info for this specific sale
      setCurrentSaleCustomerInfo(info);
      await processSale(info);
    }, [processSale]);

    const toggleCart = useCallback(() => {
      setShowCart(prev => !prev);
    }, []);
    
    const handleCalculatorToggle = useCallback(() => {
      setShowCalculator(prev => !prev);
    }, []);

    const addTab = useCallback(() => {
      const newTabId = uuidv4();
      const newTabName = `${t('pos:sale')} ${tabs.length + 1}`;
      setTabs(prevTabs => [
        ...prevTabs,
        { 
          id: newTabId, 
          name: newTabName, 
          cart: [], 
          discountType: 'flat', 
          discountValue: 0, 
          paymentMethod: selectedPaymentMethod || "cash",
          priceType: selectedPriceType || "regular",
          status: 'active'
        }
      ]);
      setActiveTabId(newTabId);
    }, [tabs.length, t, selectedPaymentMethod, selectedPriceType]);

    const removeTab = useCallback(async (tabIdToRemove: string) => {
      if (tabs.length === 1) {
        clearCart();
        return;
      }

      const tabToRemove = tabs.find(tab => tab.id === tabIdToRemove);
      const user = auth.currentUser;

      if (user && tabToRemove) {
        try {
          const activeTabRef = ref(database, `users/${user.uid}/activeTabs/${tabToRemove.id}`);
          await set(activeTabRef, null);
        } catch (error) {
          console.error("Error removing tab from Firebase:", error);
        }
      }

      setTabs(prevTabs => {
        const remainingTabs = prevTabs.filter(tab => tab.id !== tabIdToRemove);
        if (activeTabId === tabIdToRemove) {
          setActiveTabId(remainingTabs[0]?.id || "");
        }
        return remainingTabs;
      });

      toast({
        title: t('pos:tabClosed'),
        description: t('pos:tabClosedDescription'),
      });
    }, [tabs.length, activeTabId, clearCart, t]);

    useEffect(() => {
      if (!initialized) return;
      const user = auth.currentUser;
      if (!user) return;

      const activeTabsRef = ref(database, `users/${user.uid}/activeTabs`);
      
      const unsubscribe = onValue(activeTabsRef, (snapshot) => {
        if (snapshot.exists()) {
          const firebaseTabs = snapshot.val();
          const loadedTabs = Object.values(firebaseTabs) as SaleTab[];
          
          const decryptedTabs = loadedTabs.map(tab => ({
            ...tab,
            cart: tab.cart.map(item => ({
              ...item,
              name: decryptField(item.name),
              code: item.code ? decryptField(item.code) : '',
              weight: item.weight ? decryptField(item.weight) : undefined,
              imageUrl: item.imageUrl ? decryptField(item.imageUrl) : undefined
            }))
          }));
          
          setTabs(prevTabs => {
            const firebaseTabIds = loadedTabs.map(t => t.id);
            const localTabIds = prevTabs.map(t => t.id);
            
            if (firebaseTabIds.length === localTabIds.length && 
              firebaseTabIds.every(id => localTabIds.includes(id))) {
              return prevTabs;
            }
            
            return decryptedTabs;
          });
        }
      });

      return () => unsubscribe();
    }, [initialized]);

    const handlePaymentMethodSelect = (method: string) => {
      setSelectedPaymentMethod(method);
      setPaymentMethodSelected(true);
      updateTabState(activeTabId, { paymentMethod: method });
    };

    const handlePriceTypeSelect = (priceType: string) => {
      setSelectedPriceType(priceType);
      setPriceTypeSelected(true);
      updateTabState(activeTabId, { priceType });
    };

    const handleQuantityInputChange = (productId: string, value: string) => {
      // Handle empty string (when user deletes all characters)
      if (value === '') {
        setProductQuantities(prev => ({
          ...prev,
          [productId]: 0
        }));
        return;
      }
      
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        setProductQuantities(prev => ({
          ...prev,
          [productId]: numValue
        }));
      }
    };

    const handleCartQuantityChange = (productId: string, value: string) => {
      // Handle empty string (when user deletes all characters)
      if (value === '') {
        updateCartItem(productId, 0);
        return;
      }
      
      const numValue = parseInt(value);
      if (!isNaN(numValue) && numValue > 0) {
        updateCartItem(productId, numValue);
      }
    };

    if (!paymentMethodSelected) {
      return (
        <Layout>
          <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
                {t('pos:SelectPaymentMethod')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t('pos:SelectPaymentMethodDescription')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
              <Button 
                variant="outline" 
                className="h-40 flex flex-col items-center justify-center gap-4 p-6 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                onClick={() => handlePaymentMethodSelect('cash')}
              >
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                  <IndianRupee className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-lg font-medium text-gray-800 dark:text-white">
                  {t('paymentMethods:cash')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('paymentMethods:cashDescription')}
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-40 flex flex-col items-center justify-center gap-4 p-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => handlePaymentMethodSelect('card')}
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                  <CreditCard className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-lg font-medium text-gray-800 dark:text-white">
                  {t('paymentMethods:card')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('paymentMethods:cardDescription')}
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-40 flex flex-col items-center justify-center gap-4 p-6 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                onClick={() => handlePaymentMethodSelect('upi')}
              >
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full">
                  <QRCodeSVG 
                    value="upi" 
                    size={40} 
                    className="text-purple-600 dark:text-purple-400"
                    bgColor="transparent"
                    fgColor="currentColor"
                  />
                </div>
                <span className="text-lg font-medium text-gray-800 dark:text-white">
                  {t('paymentMethods:upi')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('paymentMethods:upiDescription')}
                </span>
              </Button>
            </div>
            
            <div className="mt-8 text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate(-1)}
                className="text-gray-600 dark:text-gray-300"
              >
                {t('common:goBack')}
              </Button>
            </div>
          </div>
        </Layout>
      );
    }

    if (!priceTypeSelected) {
      return (
        <Layout>
          <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
                {t('pos:SelectPriceType')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {t('pos:SelectPriceTypeDescription')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-6xl">
              <Button 
                variant="outline" 
                className="h-40 flex flex-col items-center justify-center gap-4 p-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                onClick={() => handlePriceTypeSelect('regular')}
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                  <User className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-lg font-medium text-gray-800 dark:text-white">
                  {t('pos:regularPrice')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('pos:regularPriceDescription')}
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-40 flex flex-col items-center justify-center gap-4 p-6 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                onClick={() => handlePriceTypeSelect('wholesaler')}
              >
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                  <Users className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-lg font-medium text-gray-800 dark:text-white">
                  {t('pos:wholesalerPrice')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('pos:wholesalerPriceDescription')}
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-40 flex flex-col items-center justify-center gap-4 p-6 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                onClick={() => handlePriceTypeSelect('agent')}
              >
                <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full">
                  <UserCheck className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-lg font-medium text-gray-800 dark:text-white">
                  {t('pos:agentPrice')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('pos:agentPriceDescription')}
                </span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-40 flex flex-col items-center justify-center gap-4 p-6 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                onClick={() => handlePriceTypeSelect('agent1')}
              >
                <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full">
                  <UserCog className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="text-lg font-medium text-gray-800 dark:text-white">
                  {t('pos:agent1Price')}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('pos:agent1PriceDescription')}
                </span>
              </Button>
            </div>
            
            <div className="mt-8 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setPaymentMethodSelected(false)}
                className="text-gray-600 dark:text-gray-300"
              >
                {t('common:goBack')}
              </Button>
            </div>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className={standalone ? "standalone-pos" : "normal-view"}>
         
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-billing-dark dark:text-white">
            {t('pos:title')}
          </h1>
          
          <div className="flex gap-3 w-full lg:w-auto">
            <Button
              onClick={handleCalculatorToggle}
              className="bg-indigo-600 text-white hover:bg-indigo-700 flex-1 lg:flex-none"
              size={isMobile ? "sm" : "default"}
            >
              {showCalculator ? t('common:hideCalculator') : <Calculator size={18} />}
            </Button>
            
            {isMobile && (
              <Button 
                onClick={toggleCart} 
                className="bg-billing-primary text-white flex items-center gap-2 flex-1"
                size={isMobile ? "sm" : "default"}
              >
                <ShoppingCart size={18} />
                {activeCart.length > 0 ? `(${activeCart.length})` : t('common:cart')}
              </Button>
            )}
          </div>
          
          {showCalculator && <CalculatorPopup onClose={handleCalculatorToggle} />}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${(isMobile && showCart) ? "hidden" : ""} lg:col-span-2 space-y-6`}>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('pos:searchByNameOrCode')}
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="w-full overflow-x-auto flex flex-nowrap whitespace-nowrap">
                <TabsTrigger value="all">{t('pos:allProducts')}</TabsTrigger>
                {decryptedCategories.map(category => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeCategory} className="mt-6">
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {filteredProducts.map(product => {
                      const quantity = productQuantities[product.id] || 1;
                      const productPrice = getProductPrice(product);
                      
                      return (
                        <Card 
                          key={product.id}
                          className="cursor-pointer hover:shadow-md transition-all duration-200"
                        >
                          <CardContent className="p-3 md:p-4 flex flex-col items-center">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              {product.imageUrl ? (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <Package className="h-6 w-6 md:h-8 md:w-8 text-billing-secondary" />
                              )}
                            </div>
                            <h3 className="font-medium text-center truncate w-full text-sm md:text-base">{product.name}</h3>
                            {product.code && (
                              <p className="text-xs text-billing-secondary">{product.code}</p>
                            )}
                            {product.weight && (
                              <p className="text-xs text-billing-secondary">{product.weight}</p>
                            )}
                            <p className="text-billing-primary font-bold">{formatCurrency(productPrice)}</p>
                            {product.quantity !== undefined && (
                              <p className={`text-xs ${product.quantity <= 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {product.quantity <= 0 ? t('pos:outOfStock') : `${t('pos:inStock')}: ${product.quantity}`}
                              </p>
                            )}
                            
                            {/* Quantity input field */}
                            <div className="flex flex-col items-center gap-2 mt-2 w-full">
                              <label className="text-xs text-billing-secondary">
                                {t('pos:quantity')}
                              </label>
                              <Input
                                type="number"
                                min="1"
                                max={product.quantity || 999}
                                value={quantity}
                                onChange={(e) => {
                                  // Fix: Use the raw input value instead of parsed number
                                  const rawValue = e.target.value;
                                  // Only update if it's a valid number or empty string
                                  if (rawValue === '' || /^\d+$/.test(rawValue)) {
                                    setProductQuantities(prev => ({
                                      ...prev,
                                      [product.id]: rawValue === '' ? 0 : parseInt(rawValue)
                                    }));
                                  }
                                }}
                                className="w-full text-center h-8 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                              
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product, quantity);
                                }}
                                className="w-full h-8 text-xs"
                                disabled={product.quantity !== undefined && product.quantity <= 0}
                              >
                                {t('pos:addToCart')}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-billing-secondary">
                    {searchQuery ? t('pos:noProductsFound') : t('pos:noProductsInCategory')}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className={`${(isMobile && !showCart) ? "hidden" : ""} space-y-6`}>
            <Card className="animate-fade-in">
              <div className="bg-billing-dark text-white p-3 md:p-4 flex justify-between items-center">
                <h2 className="text-lg md:text-xl font-bold">{t('pos:currentSale')}</h2>
                {isMobile && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleCart} 
                    className="text-white hover:bg-billing-dark"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700">
                <Tabs value={activeTabId} onValueChange={setActiveTabId} className="w-full">
                  <TabsList className="w-full overflow-x-auto flex flex-nowrap whitespace-nowrap justify-start p-2">
                    {tabs.map(tab => (
                      <TabsTrigger key={tab.id} value={tab.id} className="group relative pr-8">
                        {tab.name}
                        {tabs.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTab(tab.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </TabsTrigger>
                    ))}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-8 w-8 text-billing-primary hover:bg-billing-primary/10"
                      onClick={addTab}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TabsList>
                </Tabs>
              </div>

              <div className="p-3 md:p-4 max-h-[calc(100vh-450px)] overflow-y-auto">
                {activeCart.length > 0 ? (
                  <div className="space-y-4">
                    {activeCart.map(item => (
                      <div key={item.id} className="flex justify-between items-center border-b pb-3 animate-fade-in">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm md:text-base">{item.name}</h3>
                          {item.code && (
                            <p className="text-xs text-billing-secondary">{item.code}</p>
                          )}
                          <p className="text-billing-secondary text-xs md:text-sm">
                            {formatCurrency(item.price)} x {item.quantity}
                            {item.weight && ` (${item.weight})`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              // Fix: Use the raw input value instead of parsed number
                              const rawValue = e.target.value;
                              // Only update if it's a valid number or empty string
                              if (rawValue === '' || /^\d+$/.test(rawValue)) {
                                updateCartItem(item.id, rawValue === '' ? 0 : parseInt(rawValue));
                              }
                            }}
                            className="w-16 text-center h-8 text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 md:h-7 md:w-7 text-billing-danger"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-billing-secondary">
                    {t('pos:emptyCart', { tabName: activeTab?.name || t('common:thisTab') })}
                  </div>
                )}
              </div>
              
              <div className="border-t p-3 md:p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('common:subtotal')}</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('pos:taxWithRate', { rate: decryptedBusinessConfig?.taxRate || 0 })}</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('common:discount')}</span>
                  <div className="flex gap-2">
                    <Select
                      value={activeTab?.discountType || "flat"}
                      onValueChange={(val) =>
                        activeTab && updateTabState(activeTab.id, { discountType: val as 'flat' | 'percentage' })
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder={t('common:type')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">{t('common:flat')}</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={activeTab?.discountValue ?? 0}
                      onChange={(e) =>
                        activeTab && updateTabState(activeTab.id, { discountValue: Number(e.target.value) })
                      }
                      className="w-20"
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('common:discountAmount')}</span>
                  <span>{formatCurrency(discountAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>{t('common:total')}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </Card>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-billing-secondary">
                <span>{t('pos:paymentMethod')}:</span>
                <span className="font-medium">
                  {selectedPaymentMethod === 'cash' && (
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {t('paymentMethods:cash')}
                    </span>
                  )}
                  {selectedPaymentMethod === 'card' && (
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {t('paymentMethods:card')}
                    </span>
                  )}
                  {selectedPaymentMethod === 'upi' && (
                    <span className="flex items-center gap-1">
                      <QRCodeSVG value="upi" size={16} />
                      {t('paymentMethods:upi')}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-billing-secondary">
                <span>{t('pos:priceType')}:</span>
                <span className="font-medium capitalize">
                  {selectedPriceType}
                </span>
              </div>
              {selectedPaymentMethod === 'upi' && (
                <div className="border rounded p-3 bg-gray-50 text-center">
                  <p className="text-sm font-semibold mb-2">{t('pos:scanUPI')}</p>
                  <QRCodeSVG
                    value={`upi://pay?pa=${decryptedBusinessConfig?.upiId || 'shantanusupekar26@okicici'}&pn=${decryptedBusinessConfig?.name || 'Business'}&am=${total.toFixed(2)}&cu=INR`}
                    size={160}
                  />
                  <p className="text-xs text-billing-secondary mt-2">
                    {t('pos:upiId')}: {decryptedBusinessConfig?.upiId || 'shantanusupekar26@okicici'}
                  </p>
                </div>
              )}
              <Button 
                onClick={handleCheckout} 
                disabled={activeCart.length === 0}
                className="w-full bg-billing-success hover:bg-green-600 transition-colors"
              >
                {t('pos:completeSale')}
              </Button>
            </div>
          </div>
        </div>
        
        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('pos:addCustomerInfo')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('pos:customerInfoDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common:cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleCompleteSale(false)}>
                {t('pos:completeSale')}
              </AlertDialogAction>
              <AlertDialogAction onClick={() => handleCompleteSale(true)} className="bg-billing-primary">
                {t('pos:addCustomerInfo')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <CustomerInfoModal
          open={showCustomerModal}
          onOpenChange={setShowCustomerModal}
          onSubmit={handleCustomerInfoSubmit}
          billDetails={generateBillDetails()}
        />
        </div>
      </Layout>
    );
  };

  export default PointOfSale;