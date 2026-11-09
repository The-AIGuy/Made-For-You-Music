/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Logo } from '../components/Logo.js';
import { Heart, Sparkles, MapPin, ShieldCheck, Music2, ArrowRight } from 'lucide-react';

interface AboutUsPageProps {
  navigate: (path: string) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#421078] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#F51B91]" />
          Our Mission & Heritage
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#421078]">
          About Made For You Music
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Made For You Music (brand shorthand: M4UM) was founded under TMG® in Aotearoa New Zealand with one guiding belief: every human relationship contains memories worth singing about.
        </p>
      </div>

      {/* Main Narrative */}
      <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-12 shadow-xs space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <Logo variant="full" />
          <div className="text-xs text-slate-500 sm:border-l sm:border-slate-200 sm:pl-6 space-y-1">
            <p className="font-bold text-[#421078]">Official Brand: Made For You Music</p>
            <p>Brand Shorthand: M4UM</p>
            <p>Attribution: By TMG®</p>
            <p>Origin: Aotearoa New Zealand</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-2xl font-bold text-[#421078]">
            Why We Started Made For You Music
          </h2>
          <p>
            Traditional greeting cards are forgotten in a drawer, flowers fade within a week, and generic gift baskets lack soul. But a song—with lyrics mentioning the campervan breakdown at Lake Tekapo, the golden retriever Buster, or that inside joke that makes you both erupt in laughter—is listened to hundreds of times.
          </p>
          <p>
            It becomes a soundtrack to your most cherished relationships. A song makes the recipient feel seen, appreciated, and loved in a way no ordinary present ever could.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
            <Heart className="w-6 h-6 text-[#F51B91]" />
            <h4 className="font-bold text-slate-900 text-sm">Heartfelt Authenticity</h4>
            <p className="text-xs text-slate-600">
              We never use canned templates. Your unique stories dictate the rhyme scheme, verses, and chorus emotion.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
            <ShieldCheck className="w-6 h-6 text-[#421078]" />
            <h4 className="font-bold text-slate-900 text-sm">Creative Control</h4>
            <p className="text-xs text-slate-600">
              You approve the lyrics first. We value your feedback and respect package revision rounds before audio mastering begins.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
            <MapPin className="w-6 h-6 text-[#08BFE8]" />
            <h4 className="font-bold text-slate-900 text-sm">Aotearoa NZ Roots</h4>
            <p className="text-xs text-slate-600">
              Grounded in Kiwi dedication, integrity, and warmth. Honest NZD pricing without hidden subscription charges.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-slate-900 text-sm">Have a special custom project?</p>
            <p className="text-xs text-slate-500">Our songwriters are always happy to discuss unique occasions.</p>
          </div>
          <button
            onClick={() => navigate('/contact')}
            className="px-6 py-2.5 rounded-full text-xs font-bold text-[#421078] border border-[#421078] hover:bg-purple-50 transition-colors"
          >
            Get In Touch With Us
          </button>
        </div>
      </div>
    </div>
  );
};
