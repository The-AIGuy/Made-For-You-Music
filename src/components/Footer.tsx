/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Logo } from './Logo.js';
import { Heart, Sparkles, Shield, Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#1B0533] text-purple-100 border-t border-purple-900/50 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-purple-800/40">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div onClick={() => navigate('/')} className="cursor-pointer inline-block">
              <Logo variant="full" theme="dark" />
            </div>
            <p className="text-sm text-purple-200/80 max-w-sm leading-relaxed">
              Every story deserves its own song. Turn your memories, inside jokes, and favourite people into an unforgettable, high-fidelity personalised musical gift handcrafted with heart.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#08BFE8]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Featherston, Wairarapa · Aotearoa New Zealand</span>
            </div>
          </div>

          {/* Experience Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">Experience</h4>
            <ul className="space-y-2 text-sm text-purple-200/80">
              <li>
                <button onClick={() => navigate('/create')} className="hover:text-white transition-colors">
                  Create Your Song
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/how-it-works')} className="hover:text-white transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">
                  Packages & Pricing
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/listen')} className="hover:text-white transition-colors">
                  Approved Song Library
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Portal */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">Customer Care</h4>
            <ul className="space-y-2 text-sm text-purple-200/80">
              <li>
                <button onClick={() => navigate('/track')} className="hover:text-white transition-colors">
                  Track My Order
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">
                  Customer Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">
                  Contact Songwriters
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">
                  About M4UM & TMG®
                </button>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-white">Direct Contact</h4>
            <div className="space-y-2 text-sm text-purple-200/80">
              <div className="flex items-center gap-2 text-white font-medium">
                <Mail className="w-4 h-4 text-[#FF9B24]" />
                <a href="mailto:dannaix.homes@tekura.org.nz" className="hover:underline">
                  dannaix.homes@tekura.org.nz
                </a>
              </div>
              <div className="flex items-center gap-2 text-white font-medium">
                <Phone className="w-4 h-4 text-[#FFD52A]" />
                <a href="tel:0211873347" className="hover:underline">
                  0211873347
                </a>
              </div>
              <p className="text-xs text-purple-300">
                All prices quoted in New Zealand Dollars (NZD). One-time payments, no recurring subscriptions.
              </p>
              <div className="pt-2 flex flex-col gap-1 text-xs text-purple-300">
                <button onClick={() => navigate('/privacy')} className="hover:text-white text-left">
                  Privacy Policy
                </button>
                <button onClick={() => navigate('/terms')} className="hover:text-white text-left">
                  Terms & Conditions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-300/80 gap-4">
          <p className="text-center sm:text-left">
            © 2026 TMG Enterprises, LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[#FFD52A] font-semibold">Made For You Music · M4UM · By TMG®</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
