// pages/Register.tsx
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "../firebase/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { UserRole } from "@/contexts/AuthContext";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [businessName, setBusinessName] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      // Validate business name for dairy administrator
      if (userRole === "dairyadministrator" && !businessName.trim()) {
        alert("Business name is required for Dairy Administrator");
        return;
      }

      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Prepare user data
      const userData: any = {
        uid: user.uid,
        email: user.email,
        role: userRole,
        createdAt: new Date().toISOString(),
        emailVerified: false,
        isActive: true,
      };

      // Add business name for dairy administrator
      if (userRole === "dairyadministrator") {
        userData.businessName = businessName.trim();
        userData.business = {
          active: true,
          name: businessName.trim(),
          type: "dairy",
          createdAt: new Date().toISOString()
        };
      }

      // Save user to database
      await set(ref(database, `users/${user.uid}`), userData);

      alert("Verification link sent to your email. Please check and verify.");
      
      // Redirect based on role
       if (userRole === "dairyadministrator") {
      navigate("/dairy-dashboard", { replace: true });
    } else {
      navigate("/verify-email", { replace: true });
    }
  } catch (error: any) {
    alert("Registration failed: " + error.message);
  }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans relative">
      <div className="flex bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full">
        {/* Left Section: Registration Form */}
        <div className="flex-1 p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600 mb-8">Sign up to get started</p>

            {/* Role Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserRole("user")}
                  className={`p-3 border rounded-md text-center transition-colors ${
                    userRole === "user"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  Standard User
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole("dairyadministrator")}
                  className={`p-3 border rounded-md text-center transition-colors ${
                    userRole === "dairyadministrator"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  Dairy Administrator
                </button>
              </div>
            </div>

            {/* Business Name for Dairy Administrator */}
            {userRole === "dairyadministrator" && (
              <input
                type="text"
                placeholder="Dairy Business Name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full text-black p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{ color: 'black' }}
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-black p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{ color: 'black' }}
            />
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-black p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              style={{ color: 'black' }}
            />

            <button
              onClick={handleRegister}
              className="w-full py-3 rounded-md bg-blue-600 text-white font-semibold text-lg transition duration-300 hover:bg-blue-700"
            >
              Register
            </button>

            <p className="text-center mt-8 text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Section: Billing Software Image */}
        <div className="flex-1 bg-gradient-to-br from-blue-500 to-indigo-700 p-10 flex flex-col items-center justify-center text-white text-center">
          <img
            src="https://res.cloudinary.com/defxobnc3/image/upload/v1752132668/log_jiy9id.png"
            alt="Billing Software"
            className="w-full max-w-sm mb-6 object-contain"
          />
          <h3 className="text-xl font-bold mb-3">
            {userRole === "dairyadministrator" ? "Dairy Management System" : "Billing Software"}
          </h3>
          <p className="text-sm opacity-90">
            {userRole === "dairyadministrator" 
              ? "Manage your dairy operations efficiently with real-time calculations and analytics"
              : "Create professional invoices in seconds"
            }
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-sm">
        &copy; 2025. Your Company Name. All Rights Reserved.
      </div>
    </div>
  );
};

export default Register;