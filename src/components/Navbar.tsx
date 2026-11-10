/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { Notification } from '../types.js';
import { Logo } from './Logo.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Menu,
  X,
  Bell,
  User as UserIcon,
  Music,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Compass,
  CheckCircle2,
  Mail,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, logout, notifications, unreadCount, markAsRead, markAllAsRead } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Listen', path: '/listen' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'Track Order', path: '/track' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xs">
      {/* Top trust bar */}
      <div className="bg-[#421078] text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#08BFE8] animate-pulse"></span>
            <span>Aotearoa New Zealand · Handcrafted Original Personalised Songs</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-purple-200">
            <span>From $34.99 NZD</span>
            <span>•</span>
            <span>You approve lyrics first</span>
            <span>•</span>
            <span>100% Digital Delivery</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            onClick={() => handleNavClick('/')}
            className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Logo variant="full" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-[#421078] bg-purple-50'
                      : 'text-slate-700 hover:text-[#421078] hover:bg-purple-50/50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setUserDropdownOpen(false);
                  }}
                  className="relative p-2.5 rounded-full text-slate-600 hover:text-[#421078] hover:bg-purple-50 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F51B91] text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popup */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-purple-100 py-3 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-sm text-[#421078]">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-[#F51B91] hover:underline font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.orderId) {
                                handleNavClick(user.role === 'admin' ? '/admin' : '/dashboard');
                              }
                            }}
                            className={`p-3 text-left hover:bg-purple-50/50 transition-colors cursor-pointer ${
                              !n.isRead ? 'bg-purple-50/30' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-[#F51B91] mt-1 shrink-0"></span>
                              )}
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-900">{n.title}</p>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 inline-block">
                                  {new Date(n.createdAt).toLocaleDateString('en-NZ', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-purple-200 hover:border-purple-300 bg-purple-50/50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#421078] text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight hidden xl:block">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                      {user.name.split(' ')[0]}
                    </p>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-semibold ${
                        user.role === 'admin' ? 'text-[#F51B91]' : 'text-slate-500'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-purple-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    {user.role === 'customer' && (
                      <button
                        onClick={() => handleNavClick('/dashboard')}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-purple-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4 text-[#421078]" />
                        Customer Dashboard
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNavClick('/admin')}
                        className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-purple-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#F51B91]" />
                        Admin Portal
                      </button>
                    )}

                    <button
                      onClick={() => handleNavClick('/track')}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-purple-50 flex items-center gap-2"
                    >
                      <Compass className="w-4 h-4 text-[#08BFE8]" />
                      Track My Order
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={async () => {
                        await logout();
                        handleNavClick('/');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('/login')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#421078] hover:bg-purple-50 transition-colors"
              >
                Log In
              </button>
            )}

            {/* Create Your Song CTA */}
            <button
              onClick={() => handleNavClick('/create')}
              className="relative group px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #421078 0%, #F51B91 60%, #FF9B24 100%)',
              }}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5" />
                Create Your Song
              </span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-purple-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-purple-100 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => handleNavClick(link.path)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                currentPath === link.path
                  ? 'bg-purple-50 text-[#421078] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="border-t border-slate-100 pt-3 space-y-2">
            {user ? (
              <>
                {user.role === 'customer' && (
                  <button
                    onClick={() => handleNavClick('/dashboard')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-[#421078] bg-purple-50 flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    Customer Dashboard ({user.name.split(' ')[0]})
                  </button>
                )}
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('/admin')}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#421078] flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Portal
                  </button>
                )}
                <button
                  onClick={async () => {
                    await logout();
                    handleNavClick('/');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick('/login')}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-[#421078] border border-purple-200"
              >
                Log In / Register
              </button>
            )}

            <button
              onClick={() => handleNavClick('/create')}
              className="w-full mt-2 py-3 rounded-full font-bold text-xs uppercase tracking-wider text-white shadow-md text-center block"
              style={{
                background: 'linear-gradient(135deg, #421078 0%, #F51B91 60%, #FF9B24 100%)',
              }}
            >
              Create Your Song
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
