'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const isActive = (path: string) => {
    return pathname === path ? 'bg-primary-100 text-white' : 'text-gray-400 hover:bg-dark-300 hover:text-white';
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
        style={{ display: isCollapsed ? 'block' : 'none' }}
        onClick={() => setIsCollapsed(false)}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 
        w-64 bg-dark-200 border-r border-dark-400 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 flex flex-col
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-dark-400 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-100 to-accent-purple flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            {!isCollapsed && <span className="text-xl font-bold bg-gradient-to-r from-primary-100 to-accent-purple bg-clip-text text-transparent">AdminHub</span>}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-dark-300 hidden lg:block"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-2">Main Navigation</div>
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link 
                    href={item.path} 
                    className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)}`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span className="ml-3">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User section */}
        <div className="p-4 border-t border-dark-400">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center">
              <span className="text-accent-cyan font-semibold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@example.com</p>
            </div>
          </div>
          
          <button className="flex items-center w-full px-3 py-2 rounded-lg text-gray-400 hover:bg-dark-300 hover:text-white transition-colors duration-200">
            <LogOut size={18} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed bottom-4 left-4 z-40 p-3 rounded-full bg-primary-100 text-white shadow-lg lg:hidden"
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </>
  );
}