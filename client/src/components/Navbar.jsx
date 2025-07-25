import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';
import axios from '../utils/axiosInstance';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("authToken") || sessionStorage.getItem("authToken"));
  const fullName = localStorage.getItem("fullName") || sessionStorage.getItem("fullName");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("authToken")) || sessionStorage.getItem("authToken");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfilePopupOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfilePopupOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfilePopupOpen]);


  const isLoginPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/customer-profile" || location.pathname === "/forgot-password";

  const handleLogout = () => {
    if (!showModal) return;
    axios.post("/api/auth/logout")
      .then(() => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("roleName");
        localStorage.removeItem("fullName");
        localStorage.removeItem("userId");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("roleName");
        sessionStorage.removeItem("fullName");
        sessionStorage.removeItem("userId");
        navigate("/login");
      })
      .catch(error => {
        console.error("Logout failed:", error.response?.data?.message || error.message);
      });
  };

  return (
    <div className="w-full h-[80px] bg-[#F9FAEF] flex items-center justify-between px-6 md:px-12 lg:px-10 shadow-md relative z-10">
      <NavLink to="/" className="w-[150px] h-[50px]">
        <div className="w-full h-full bg-[url(/images/logo.png)] bg-cover bg-no-repeat"></div>
      </NavLink>

      <button
        className="md:hidden text-[#E27585] text-[30px] z-20"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        ☰
      </button>

      <nav
        className={`absolute top-[80px] left-0 w-full bg-[#F9FAEF] flex flex-col items-center pacifico-regular gap-4 p-6 shadow-lg rounded-md transition-transform duration-300 md:static md:w-auto md:p-0 md:flex-row md:shadow-none md:gap-20 ${isMobileMenuOpen ? "flex" : "hidden md:flex"}`}
      >
        {["About", "Services", "Blog", "Consultant", "Quiz"].map((item) => (
          <NavLink
            key={item}
            to={`/${item.toLowerCase()}`}
            className={({ isActive }) =>
              `text-center text-[20px] font-semibold transition-all text-[#E27585] hover:text-[#fadade] ${isActive

              }`
            }
          >
            {item}
          </NavLink>
        ))}
      </nav>

      {!isLoginPage && (
        <div className="relative">
          {token ? (
            <div className="relative profile-dropdown">
              <button 
                onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
                className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-full px-3 py-2 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#E27585] to-[#c86c79] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:block text-gray-700 font-medium text-sm max-w-[100px] truncate">
                  {fullName || 'User'}
                </span>
                <i className={`fas fa-chevron-down text-gray-400 text-xs transition-transform duration-200 ${isProfilePopupOpen ? 'rotate-180' : ''}`}></i>
              </button>

              {isProfilePopupOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-20 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#E27585] to-[#c86c79] px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                        {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm truncate max-w-[120px]">
                          {fullName || 'User'}
                        </p>
                        <p className="text-white/80 text-xs">Customer</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <NavLink 
                      to="/customer-profile" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setIsProfilePopupOpen(false)}
                    >
                      <i className="fas fa-user-circle text-[#E27585] w-5 text-center mr-3"></i>
                      <span className="font-medium">Profile</span>
                    </NavLink>
                    
                    <NavLink 
                      to="/booking-history" 
                      className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setIsProfilePopupOpen(false)}
                    >
                      <i className="fas fa-history text-[#E27585] w-5 text-center mr-3"></i>
                      <span className="font-medium">Booking History</span>
                    </NavLink>

                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button 
                      onClick={() => {
                        setIsProfilePopupOpen(false);
                        setShowModal(true);
                      }} 
                      className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
                    >
                      <i className="fas fa-sign-out-alt text-red-500 w-5 text-center mr-3"></i>
                      <span className="font-medium">Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="hidden md:block bg-[#e78999] text-white text-[18px] px-6 py-2 rounded-full shadow-sm hover:opacity-80 transition-opacity duration-200">
              Login
            </NavLink>
          )}
        </div>
      )}
      {/* Custom Logout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Log out Confirmation</h3>
            <p className="text-gray-600">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="py-2 px-6 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="py-2 px-6 bg-[#f1baba] text-white rounded-lg hover:bg-[#e78999] transition"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
