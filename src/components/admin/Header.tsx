'use client';

import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';

export default function AdminHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-dark-200 border-b border-dark-400 sticky top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold">User Management Dashboard</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search bar */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 bg-dark-300 border border-dark-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent text-sm w-64"
            />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 rounded-lg bg-dark-300 hover:bg-dark-400 transition-colors duration-200">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User profile dropdown */}
          <div className="relative">
            <button 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-300 transition-colors duration-200"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue flex items-center justify-center">
                <span className="text-white font-semibold text-sm">A</span>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            
            {/* Dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-dark-200 rounded-lg shadow-lg border border-dark-400 py-1 z-50">
                <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-300">Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-300">Settings</a>
                <div className="border-t border-dark-400 my-1"></div>
                <a href="#" className="block px-4 py-2 text-sm text-red-400 hover:bg-dark-300">Logout</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}