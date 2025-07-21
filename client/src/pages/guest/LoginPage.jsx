import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { EyeIcon } from "lucide-react";
import { EyeOffIcon } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load Google Identity Services
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    console.log('Google Client ID:', clientId); // Debug log
    
    if (!clientId) {
      console.error('Google Client ID not found in environment variables');
      return;
    }

    // Load Google Identity Services script
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    loadGoogleScript()
      .then(() => {
        console.log('Google script loaded successfully');
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleLogin,
          auto_select: false,
          cancel_on_tap_outside: true,
          locale: 'en'
        });
        console.log('Google accounts initialized');
        
        // Render Google button as backup
        const googleButtonDiv = document.getElementById('google-signin-button');
        if (googleButtonDiv) {
          window.google.accounts.id.renderButton(googleButtonDiv, {
            theme: 'filled_white',
            size: 'large',
            width: 400,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            locale: 'en'
          });
          
          // Add custom styling to match the form design
          setTimeout(() => {
            const googleButton = googleButtonDiv.querySelector('div[role="button"]');
            if (googleButton) {
              googleButton.style.cssText += `
                border-radius: 8px !important;
                border: 1px solid #d1d5db !important;
                transition: all 0.3s ease !important;
                height: 50px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-family: inherit !important;
                font-weight: 500 !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
              `;
              
              // Add hover effects
              googleButton.addEventListener('mouseenter', () => {
                googleButton.style.cssText += `
                  background-color: #f9fafb !important;
                  border-color: #9ca3af !important;
                  transform: translateY(-1px) !important;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                `;
              });
              
              googleButton.addEventListener('mouseleave', () => {
                googleButton.style.cssText += `
                  background-color: white !important;
                  border-color: #d1d5db !important;
                  transform: translateY(0) !important;
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                `;
              });
            }
          }, 100);
        }
      })
      .catch((error) => {
        console.error('Failed to load Google script:', error);
      });

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Check if user is already logged in and redirect
  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const roleName = localStorage.getItem("roleName") || sessionStorage.getItem("roleName");

    if (token) {
      let redirectUrl = "/";
      if (roleName === "Manager") redirectUrl = "/dashboard";
      else if (roleName === "Staff") redirectUrl = "/view-booking";
      else if (roleName === "Consultant") redirectUrl = "/view-booked";
      else if (roleName === "Admin") redirectUrl = "/staff-management";
      else if (roleName === "Customer") redirectUrl = "/about";

      navigate(redirectUrl);
    }
  }, [navigate]);

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle Google Login response
  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);

      // Send Google token to backend for verification
      const backendResponse = await axios.post('/api/auth/google-login', {
        token: response.credential
      });

      const { token, message, user } = backendResponse.data;
      const { roleName, firstName, lastName, id } = user;
      // Xử lý trường hợp thiếu tên
      const displayName = firstName && firstName.trim() ? firstName : (user.email?.split('@')[0] || 'User');
      const fullName = `${displayName} ${lastName || ''}`.trim();

      // Show success toast
      toast.success(`✅ Welcome, ${displayName}! Google login successful!`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Store tokens
      if (rememberMe) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("roleName", roleName);
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("userId", id);
      } else {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("roleName", roleName);
        sessionStorage.setItem("fullName", fullName);
        sessionStorage.setItem("userId", id);
      }

      // Redirect based on role
      let redirectUrl = "/";
      if (roleName === "Manager") redirectUrl = "/dashboard";
      else if (roleName === "Staff") redirectUrl = "/view-booking";
      else if (roleName === "Consultant") redirectUrl = "/view-booked";
      else if (roleName === "Admin") redirectUrl = "/staff-management";
      else if (roleName === "Customer") redirectUrl = "/about";

      setTimeout(() => {
        navigate(redirectUrl);
      }, 2000);

    } catch (error) {
      toast.error(`❌ Google login failed: ${error.response?.data?.message || error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, message, user } = response.data;
      const { roleName } = user;
      const { firstName } = user;
      const { lastName } = user;
      const { id } = user;
      const fullName = `${firstName} ${lastName}`;

      // Show success toast notification
      toast.success(`✅ Welcome back, ${firstName}! Login successful!`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Store token based on Remember Me option
      if (rememberMe) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("roleName", roleName);
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("fullName", fullName);
        localStorage.setItem("userId", id);
      } else {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("roleName", roleName);
        sessionStorage.setItem("fullName", fullName);
        sessionStorage.setItem("userId", id);
        localStorage.removeItem("rememberedEmail");
      }

      // Redirect based on user roleName with slight delay to show toast
      let redirectUrl = "/";
      if (roleName === "Manager") redirectUrl = "/dashboard";
      else if (roleName === "Staff") redirectUrl = "/view-booking";
      else if (roleName === "Consultant") redirectUrl = "/view-booked";
      else if (roleName === "Admin") redirectUrl = "/staff-management";
      else if (roleName === "Customer") redirectUrl = "/about";

      // Delay redirect slightly to show toast
      setTimeout(() => {
        navigate(redirectUrl);
      }, 2000);
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.message || err.message || "Something went wrong. Please try again."}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container w-full h-screen bg-[#f9faef] relative mx-auto">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100%-121px)] relative">
        <div className="absolute h-screen inset-0 bg-[url(/images/login.png)] bg-cover bg-center bg-no-repeat opacity-50 z-0" />
        <div className="relative z-10 w-full max-w-[400px] bg-white bg-opacity-90 rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-center text-2xl font-bold text-[#c86c79] uppercase mb-6 md:mb-8">
            Login
          </h2>

          <form className="flex flex-col gap-4 md:gap-6" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-[50px] px-4 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c86c79]"
            />
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-[50px] px-4 pr-12 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c86c79]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                Remember Me
              </label>
              <a href="/forgot-password" className="text-[#c86c79] hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[50px] text-white font-bold rounded-lg shadow transition duration-300
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#c86c79] hover:bg-[#b25668]'}`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Official Button */}
          <div 
            id="google-signin-button" 
            className="w-full flex justify-center"
          ></div>

          <div className="text-center mt-8 text-gray-700">
            <span>Don't have an account?</span>{" "}
            <a href="/register" className="font-bold text-[#c86c79] hover:underline">
              Register
            </a>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
