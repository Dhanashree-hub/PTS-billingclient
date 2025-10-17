// pages/Login.tsx
import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, database } from "../firebase/firebaseConfig";
import { ref, get } from "firebase/database";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [animate, setAnimate] = useState(false);
  const [isDisabledDialogOpen, setIsDisabledDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  // Get the redirect path from location state or default to POS
  const from = (location.state as any)?.from || "/pos";

  useEffect(() => {
    setAnimate(true);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If user is already authenticated and verified, redirect immediately
        if (user.emailVerified) {
          setIsCheckingStatus(true);
          try {
            const isActive = await checkUserActiveStatus(user.uid);
            if (!isActive) {
              await signOut(auth);
              setIsDisabledDialogOpen(true);
              setShowLogin(true);
            } else {
              // Get user role and redirect accordingly
              const userRoleRef = ref(database, `users/${user.uid}/role`);
              const roleSnapshot = await get(userRoleRef);
              const userRole = roleSnapshot.exists() ? roleSnapshot.val() : 'user';

              if (userRole === 'dairyadministrator') {
                navigate("/dairy-dashboard", { replace: true });
              } else {
                const businessRef = ref(database, `users/${user.uid}/business`);
                const snapshot = await get(businessRef);
                // Use the redirect path from location state or default
                const targetRoute = snapshot.exists() ? from : "/setup";
                navigate(targetRoute, { replace: true });
              }
            }
          } catch (error) {
            console.error("Error checking user status:", error);
            setShowLogin(true);
          } finally {
            setIsCheckingStatus(false);
            setIsCheckingAuth(false);
          }
        } else {
          // User not verified, show login form
          setShowLogin(true);
          setIsCheckingAuth(false);
        }
      } else {
        // No user, show login form
        setIsCheckingAuth(false);
        setShowLogin(true);
      }
    });

    return () => unsubscribe();
  }, [navigate, from]);

  const checkUserActiveStatus = async (userId: string) => {
    try {
      const userRef = ref(database, `users/${userId}/business/active`);
      const snapshot = await get(userRef);
      return snapshot.exists() ? snapshot.val() : false;
    } catch (error) {
      console.error("Error checking user status:", error);
      return false;
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        toast({
          title: "Email Not Verified",
          description: "Please verify your email before logging in.",
          variant: "destructive",
        });
        await signOut(auth);
        setIsLoading(false);
        return;
      }

      setIsCheckingStatus(true);
      const isActive = await checkUserActiveStatus(user.uid);
      setIsCheckingStatus(false);

      if (!isActive) {
        await signOut(auth);
        setIsDisabledDialogOpen(true);
        setIsLoading(false);
        return;
      }

      // Get user role and redirect accordingly
      const userRoleRef = ref(database, `users/${user.uid}/role`);
      const roleSnapshot = await get(userRoleRef);
      const userRole = roleSnapshot.exists() ? roleSnapshot.val() : 'user';

      if (userRole === 'dairyadministrator') {
        navigate("/dairy-dashboard", { replace: true });
      } else {
        const businessRef = ref(database, `users/${user.uid}/business`);
        const snapshot = await get(businessRef);
        // Use the redirect path from location state
        const targetRoute = snapshot.exists() ? from : "/setup";
        navigate(targetRoute, { replace: true });
        
        // Clear history to prevent back navigation to login
        window.history.replaceState(null, '', window.location.href);
      }
    } catch (error: any) {
      setIsCheckingStatus(false);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email to receive a reset link.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Email Sent",
        description: "Password reset email sent! Check your inbox.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  if (isCheckingAuth || isCheckingStatus) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  if (!showLogin) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans relative">
      <div className="flex bg-gray-800 rounded-lg overflow-hidden max-w-4xl w-full border border-white">
        {/* Left Section: Login Form */}
        <div className="flex-1 p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Sign in
            </h2>

            <input
              type="email"
              placeholder="Email address or mobile number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full text-white p-3 mb-4 bg-black border border-white rounded-md focus:outline-none focus:ring-1 focus:ring-white placeholder-gray-400"
              disabled={isLoading}
            />

            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full text-white p-3 pr-10 bg-black border border-white rounded-md focus:outline-none focus:ring-1 focus:ring-white placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-3 rounded-md bg-white text-black font-semibold text-lg transition duration-300 ${
                isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-200"
              }`}
            >
              {isLoading ? "Signing in..." : "Next"}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50"
              >
                Forgot your password?
              </button>
            </div>

            <div className="mt-8 text-gray-400">
              <p className="mb-4">Sign in using</p>
              <div className="flex justify-center space-x-4">
                <button className="flex items-center justify-center w-10 h-10 border border-white rounded-full hover:bg-gray-900">
                  <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Google" className="h-6 w-6 filter brightness-0 invert" />
                </button>
                <button className="flex items-center justify-center w-10 h-10 border border-white rounded-full hover:bg-gray-900">
                  <img src="https://img.icons8.com/ios-filled/50/000000/facebook-new.png" alt="Facebook" className="h-6 w-6 filter brightness-0 invert" />
                </button>
                <button className="flex items-center justify-center w-10 h-10 border border-white rounded-full hover:bg-gray-900">
                  <img src="https://img.icons8.com/ios-filled/50/000000/linkedin.png" alt="LinkedIn" className="h-6 w-6 filter brightness-0 invert" />
                </button>
                <button className="flex items-center justify-center w-10 h-10 border border-white rounded-full hover:bg-gray-900">
                  <img src="https://img.icons8.com/ios-filled/50/000000/twitter.png" alt="Twitter" className="h-6 w-6 filter brightness-0 invert" />
                </button>
                <button className="flex items-center justify-center w-10 h-10 border border-white rounded-full hover:bg-gray-900">
                  <img src="https://img.icons8.com/ios-filled/50/000000/mac-os.png" alt="Apple" className="h-6 w-6 filter brightness-0 invert" />
                </button>
                <button className="flex items-center justify-center w-10 h-10 border border-white rounded-full hover:bg-gray-900">
                  <img src="https://img.icons8.com/ios-filled/50/000000/github.png" alt="Github" className="h-6 w-6 filter brightness-0 invert" />
                </button>
              </div>
            </div>

            <p className="text-center mt-8 text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-white hover:underline"
                onClick={(e) => isLoading && e.preventDefault()}
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section: Passwordless Sign-in */}
        <div className="flex-1 bg-black p-10 flex flex-col items-center justify-center text-white text-center border-l border-white">
          <img
            src="https://res.cloudinary.com/defxobnc3/image/upload/v1752132668/log_jiy9id.png"
            alt="Passwordless Sign-in"
            className="w-32 md:w-40 mb-6 filter brightness-0 invert"
          />

          <h3 className="text-xl font-bold mb-3">Billing Software</h3>
          <p className="mb-6 text-gray-400">
            Create professional invoices in seconds—get paid faster with automated reminders and online payments
          </p>
        </div>
      </div>

      {/* Disabled Account Dialog */}
      <AlertDialog open={isDisabledDialogOpen} onOpenChange={setIsDisabledDialogOpen}>
        <AlertDialogContent className="bg-black border-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Account Disabled</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Your account has been deactivated by the administrator. Please contact support to reactivate your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-white text-black hover:bg-gray-200">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Login;