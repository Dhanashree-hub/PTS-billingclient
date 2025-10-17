// contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, database } from "@/firebase/firebaseConfig";

export type UserRole = 'admin' | 'user' | 'dairyadministrator';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Fetch user role from database
        try {
          const userRef = ref(database, `users/${user.uid}/role`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            setUserRole(snapshot.val() as UserRole);
          } else {
            setUserRole('user'); // Default role
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('user');
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);