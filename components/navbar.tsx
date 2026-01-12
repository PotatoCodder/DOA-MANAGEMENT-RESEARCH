"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import departmentOfAgricultureLogo from "@/assets/images/Department_of_Agriculture_of_the_Philippines.svg.png";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
   const pathname = usePathname();
   const [accountDropdown, setAccountDropdown] = useState(false);
   const [mobileMenu, setMobileMenu] = useState(false);
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [userRole, setUserRole] = useState<string | null>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Check token on mount
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
          if (res.ok) {
            const data = await res.json();
            setIsLoggedIn(true);
            setUserRole(data.user.role);
            localStorage.setItem('role', data.user.role);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      }
    };

    checkToken();
  }, []);

  const tabs = [
    { name: "Home", href: "/" },
    { name: "Organizational Chart", href: "/organizational-chart" },
    { name: "Mission & Vision", href: "/mission-vision" },
    { name: "Stational Map", href: "/stational-map" },
    { name: "Infographics", href: "/infographics" },
    { name: "Completed Research", href: "/completed-research" },
    { name: "Projects", href: "/projects" },
  ];

  return (
    <nav className="fixed w-full top-0 z-50">
      <div className="backdrop-blur-xl bg-white/80 border-b border-gray-200 shadow-sm transition duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img
                src={departmentOfAgricultureLogo.src}
                alt="department of agriculture"
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-bold text-green-700 text-sm sm:text-base truncate">
                  Research & Knowledge Management
                </span>
                <span className="text-gray-500 text-xs sm:text-sm truncate">
                  Department of Agriculture - RFO IX | Research Division
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
              {!isLoggedIn ? (
                tabs.map((tab) => (
                  <a
                    key={tab.name}
                    href={tab.href}
                    className={`text-sm font-medium transition-colors duration-300 whitespace-nowrap relative ${
                      pathname === tab.href
                        ? 'text-green-600 after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-green-600'
                        : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    {tab.name}
                  </a>
                ))
              ) : (
                <>
                  <a
                    href="/dashboard"
                    className={`flex items-center gap-1 font-medium transition-colors duration-300 relative ${
                      pathname === '/dashboard'
                        ? 'text-green-600 after:absolute after:bottom-[-8px] after:left-0 after:w-full after:h-0.5 after:bg-green-600'
                        : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </a>

                  {/* Account Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAccountDropdown(!accountDropdown);
                      }}
                      className="flex items-center gap-1 text-gray-700 font-medium hover:text-green-600 transition-colors duration-300 focus:outline-none"
                    >
                      <User className="w-4 h-4" /> Account
                    </button>

                    <AnimatePresence>
                      {accountDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-44 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                        >
                          <a
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 rounded-md text-gray-700 transition-colors duration-200"
                          >
                            <User className="w-4 h-4" /> Profile
                          </a>
                          <button
                            onClick={async () => {
                              try {
                                await fetch('/api/auth/logout', { method: 'POST' });
                              } catch (error) {
                                console.error('Logout error:', error);
                              }
                              localStorage.removeItem('token');
                              localStorage.removeItem('role');
                              setIsLoggedIn(false);
                              setUserRole(null);
                              window.location.href = '/';
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 rounded-md text-gray-700 transition-colors duration-200 w-full text-left"
                          >
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden flex items-center justify-center p-2 text-gray-700 hover:text-green-600 focus:outline-none"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden px-4 pb-4 flex flex-col gap-3 bg-white/90 backdrop-blur-xl border-b border-gray-200"
            >
              {!isLoggedIn ? (
                tabs.map((tab) => (
                  <a
                    key={tab.name}
                    href={tab.href}
                    className={`font-medium transition-colors duration-300 whitespace-nowrap relative ${
                      pathname === tab.href
                        ? 'text-green-600 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-green-600'
                        : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    {tab.name}
                  </a>
                ))
              ) : (
                <>
                  <a
                    href="/dashboard"
                    className={`flex items-center gap-1 font-medium transition-colors duration-300 relative ${
                      pathname === '/dashboard'
                        ? 'text-green-600 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-green-600'
                        : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </a>
                  <a
                    href="/profile"
                    className={`flex items-center gap-1 font-medium transition-colors duration-300 relative ${
                      pathname === '/profile'
                        ? 'text-green-600 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-green-600'
                        : 'text-gray-700 hover:text-green-600'
                    }`}
                  >
                    <User className="w-4 h-4" /> Profile
                  </a>
                  <button
                    onClick={async () => {
                      try {
                        await fetch('/api/auth/logout', { method: 'POST' });
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                      localStorage.removeItem('token');
                      localStorage.removeItem('role');
                      setIsLoggedIn(false);
                      setUserRole(null);
                      window.location.href = '/';
                    }}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-yellow-50 rounded-md text-gray-700 transition-colors duration-200 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}