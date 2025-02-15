// components/Navbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiMessageSquare, FiUser } from 'react-icons/fi';
import { IoNotificationsOutline } from 'react-icons/io5';

function Navbar({ searchTerm, setSearchTerm, handleLogout }) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/sandbox-headstart/dashboard" className="text-xl font-bold text-black">
              Sandbox Headstart
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  to="/sandbox-headstart/dashboard"
                  className="text-black px-3 py-2 rounded-md text-sm font-medium"
                >
                  Discover
                </Link>
                <Link
                  to="/sandbox-headstart/dashboard"
                  className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
                >
                  Saved Profiles
                </Link>
                <Link
                  to="/sandbox-headstart/profile/me"
                  className="text-gray-600 hover:text-black px-3 py-2 rounded-md text-sm font-medium"
                >
                  My Profile
                </Link>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Desktop search bar */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search teammates, skills, or keywords..."
                className="w-96 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Mobile search toggle */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <FiSearch className="h-6 w-6" />
            </button>
            
            <button className="p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100">
              <FiMessageSquare className="h-6 w-6" />
            </button>
            
            <button className="p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100">
              <IoNotificationsOutline className="h-6 w-6" />
            </button>
            
            {/* User menu dropdown */}
            <div className="relative">
              <button 
                className="p-2 text-gray-600 hover:text-black rounded-full hover:bg-gray-100"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FiUser className="h-6 w-6" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                  <Link
                    to="/sandbox-headstart/profile/me"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/sandbox-headstart/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {showMobileSearch && (
          <div className="md:hidden px-4 py-3 border-t border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search teammates, skills, or keywords..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;