/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { HowItWorksPage } from './pages/HowItWorksPage.js';
import { ListenPage } from './pages/ListenPage.js';
import { PricingPage } from './pages/PricingPage.js';
import { AboutUsPage } from './pages/AboutUsPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { OrderCreatePage } from './pages/OrderCreatePage.js';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.js';
import { TermsPage } from './pages/TermsPage.js';
import type { OrderPackageId, Order } from './types.js';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [navState, setNavState] = useState<any>(null);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string, state?: any) => {
    setNavState(state || null);
    const [cleanPath] = path.split('?');
    setCurrentPath(cleanPath);
    window.history.pushState(state, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to extract query parameter
  const getQueryParam = (name: string): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  };

  const renderPage = () => {
    const cleanPath = currentPath.toLowerCase();

    if (cleanPath === '/' || cleanPath === '') {
      return <HomePage navigate={navigate} />;
    }
    if (cleanPath === '/how-it-works') {
      return <HowItWorksPage navigate={navigate} />;
    }
    if (cleanPath === '/listen') {
      return <ListenPage navigate={navigate} />;
    }
    if (cleanPath === '/pricing') {
      return <PricingPage navigate={navigate} />;
    }
    if (cleanPath === '/about') {
      return <AboutUsPage navigate={navigate} />;
    }
    if (cleanPath === '/contact') {
      return <ContactPage navigate={navigate} />;
    }
    if (cleanPath === '/create') {
      const packageParam = (getQueryParam('package') as OrderPackageId) || undefined;
      return <OrderCreatePage navigate={navigate} initialPackage={packageParam} />;
    }
    if (cleanPath === '/order-confirmation') {
      const orderData = (navState?.order as Order) || undefined;
      return <OrderConfirmationPage order={orderData} navigate={navigate} />;
    }
    if (cleanPath === '/track') {
      return <OrderTrackingPage navigate={navigate} />;
    }
    if (cleanPath === '/dashboard') {
      if (!isLoading && !user) {
        return <LoginPage navigate={navigate} />;
      }
      return <CustomerDashboardPage navigate={navigate} />;
    }
    if (cleanPath === '/admin') {
      if (!isLoading && (!user || user.role !== 'admin')) {
        return (
          <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
            <div className="p-8 bg-white rounded-3xl border border-red-200 shadow-sm space-y-4">
              <span className="w-12 h-12 rounded-full bg-red-100 text-red-600 font-bold text-xl flex items-center justify-center mx-auto">
                ✕
              </span>
              <h2 className="font-heading text-2xl font-bold text-slate-900">Admin Privileges Required</h2>
              <p className="text-xs text-slate-600">
                You must be logged in as an authorized producer or administrator to access the admin portal.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 rounded-full text-white text-xs font-bold uppercase bg-[#421078]"
              >
                Log In As Administrator
              </button>
            </div>
          </div>
        );
      }
      return <AdminDashboardPage navigate={navigate} />;
    }
    if (cleanPath === '/login') {
      return <LoginPage navigate={navigate} />;
    }
    if (cleanPath === '/register') {
      return <RegisterPage navigate={navigate} />;
    }
    if (cleanPath === '/forgot-password') {
      return <ForgotPasswordPage navigate={navigate} />;
    }
    if (cleanPath === '/privacy') {
      return <PrivacyPolicyPage navigate={navigate} />;
    }
    if (cleanPath === '/terms') {
      return <TermsPage navigate={navigate} />;
    }

    // Default fallback to HomePage
    return <HomePage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800 bg-[#FAF8FF]">
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="flex-1">{renderPage()}</main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
