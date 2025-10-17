// components/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { JSX, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "@/firebase/firebaseConfig";
import { Loader2 } from "lucide-react";

interface Props {
  children: JSX.Element;
  requiredRole?: 'admin' | 'user' | 'dairyadministrator';
}

const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'dairyadministrator' | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check email verification
        if (user.emailVerified) {
          setIsVerified(true);
          
          // Fetch user role from database
          try {
            const userRef = ref(database, `users/${user.uid}/role`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
              setUserRole(snapshot.val());
            } else {
              setUserRole('user'); // Default role
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
            setUserRole('user');
          }
        } else {
          setIsVerified(false);
          setUserRole(null);
        }
      } else {
        setIsVerified(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, redirect to login with return url
  if (!isVerified) {
    return (
      <Navigate 
        to="/login" 
        replace 
        state={{ 
          from: location.pathname !== "/register" && location.pathname !== "/login" ? location.pathname : "/pos" 
        }}
      />
    );
  }

  // Check role-based access
  if (requiredRole && userRole !== requiredRole) {
    // Redirect dairy administrators to their dashboard
    if (userRole === "dairyadministrator") {
      return <Navigate to="/dairy-dashboard" replace />;
    }
    
    // Redirect regular users to POS
    if (userRole === "user") {
      return <Navigate to="/pos" replace />;
    }
    
    // Redirect admins to admin management
    if (userRole === "admin") {
      return <Navigate to="/adminmanagement" replace />;
    }
    
    // Default fallback
    return <Navigate to="/pos" replace />;
  }

  // Redirect dairy administrators away from regular user routes
  if (userRole === "dairyadministrator" && !window.location.pathname.includes("dairy")) {
    return <Navigate to="/dairy-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;