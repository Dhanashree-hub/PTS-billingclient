// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { BillingProvider } from "@/contexts/BillingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useNavigationBlocker } from "@/hooks/useNavigationBlocker";

// Pages
import Dashboard from "@/pages/Dashboard";
import BusinessSetup from "@/pages/BusinessSetup";
import PointOfSale from "@/pages/PointOfSale";
import Products from "@/pages/Products";
import ProductForm from "@/pages/ProductForm";
import Categories from "@/pages/Categories";
import SalesHistory from "@/pages/SalesHistory";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminManagement from "./pages/AdminManagement";
import VerifyEmail from "./pages/VerifyEmail";
import DairyDashboard from "./dairy/DairyDashboard";

// ProtectedRoute
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  useNavigationBlocker(); // Add navigation blocker

  return (
    <Routes>
      {/* ✅ Root path redirects based on role */}
      <Route path="/" element={<Navigate to="/pos" replace />} />

      {/* Auth Pages - No protection needed */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Protected Pages for Regular Users */}
      <Route
        path="/setup"
        element={
          <ProtectedRoute requiredRole="user">
            <BusinessSetup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute requiredRole="user">
            <PointOfSale />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute requiredRole="user">
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/add"
        element={
          <ProtectedRoute requiredRole="user">
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/edit/:productId"
        element={
          <ProtectedRoute requiredRole="user">
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute requiredRole="user">
            <Categories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute requiredRole="user">
            <SalesHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredRole="user">
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/adminmanagement"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminManagement />
          </ProtectedRoute>
        }
      />

      {/* Dairy Administrator Only Routes */}
      <Route
        path="/dairy-dashboard"
        element={
          <ProtectedRoute requiredRole="dairyadministrator">
            <DairyDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BillingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" />
          <AppContent />
        </TooltipProvider>
      </BillingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;