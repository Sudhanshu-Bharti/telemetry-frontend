import React from "react";
import { MoreHorizontal, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="w-full border-b border-gray-100 bg-white px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            <span className="font-semibold text-lg text-black tracking-tight">
              umami
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-gray-900 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors"
            >
              Realtime
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-3 mr-4">
              <span className="text-sm text-gray-700">Welcome, {user.name}</span>
            </div>
          )}
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-md transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-md transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-md transition-colors">
            <User className="w-4 h-4" />
          </button>
          <button 
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-600 p-2 rounded-md transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>
      <main className="bg-white">{children}</main>
    </div>
  );
};
