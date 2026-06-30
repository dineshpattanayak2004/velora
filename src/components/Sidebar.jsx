import { useState } from "react";
import {
  MessageSquare,
  LayoutDashboard,
  Brain,
  Settings,
  Database,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const menuItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/chat", icon: MessageSquare, label: "Chat" },
    { to: "/agents", icon: Brain, label: "AI Agents" },
    { to: "/settings", icon: Settings, label: "Settings" },
    { to: "/memory", icon: Database, label: "Memory Bank" },
  ];

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 glass p-3 rounded-xl border border-cyan-500/20 hover:border-cyan-400 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative
          top-0 left-0
          h-screen
          glass
          p-6
          z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          w-72
          flex flex-col
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X size={24} />
        </button>

        {/* User Profile Section */}
        {user && (
          <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/20">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                user.username?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{user.username || "User"}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-cyan-400 mt-6">
          VELORA
        </h1>

        <nav className="mt-10 space-y-3 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="flex gap-3 items-center p-3 rounded-lg hover:bg-cyan-400/10 transition-all"
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Actions */}
        {user ? (
          <div className="space-y-2 pt-4 border-t border-cyan-500/20">
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex gap-3 items-center p-3 rounded-lg hover:bg-cyan-400/10 transition-all"
            >
              <User size={20} />
              <span className="font-medium">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex gap-3 items-center p-3 rounded-lg hover:bg-red-400/10 transition-all text-red-400"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-4 border-t border-cyan-500/20">
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center p-3 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium transition-all"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center p-3 rounded-lg border border-cyan-500/20 hover:bg-cyan-400/10 transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
