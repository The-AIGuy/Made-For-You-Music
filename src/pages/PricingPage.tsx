/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle2,
  X,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Music,
  ArrowRight,
} from 'lucide-react';

interface PricingPageProps {
  navigate: (path: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ navigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-20">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9B24]" />
          Clear, Honest NZD Pricing
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#421078]">
          Simple Packages For Every Occasion
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          All prices are quoted in New Zealand Dollars (NZD). Payments are strictly one-time payments with zero hidden fees or recurring subscriptions.
        </p>
      </div>

      {/* 3 Packages Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Package 1: The Personal Song */}
        <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#421078]">Starter Gift</span>
              <h3 className="font-heading text-2xl font-bold text-slate-900 mt-1">The Personal Song</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-extrabold text-[#421078]">$34.99</span>
                <span className="text-xs font-bold text-slate-500 uppercase">NZD</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                One personalised song, approximately 2–3 minutes. Original lyrics based on the customer's submitted story.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Inclusions:</p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>One personalised song (~2–3 minutes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Original bespoke lyrics from your story</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Choice of musical genre and mood</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>1 round of lyric changes before production</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Finished high-quality MP3 download</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Custom digital cover artwork</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => navigate('/create?package=personal')}
            className="mt-8 w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider border-2 border-[#421078] text-[#421078] hover:bg-purple-50 transition-colors"
          >
            Choose The Personal Song
          </button>
        </div>

        {/* Package 2: The Signature Song (MOST POPULAR) */}
        <div className="bg-gradient-to-b from-white to-purple-50/40 rounded-3xl border-2 border-[#F51B91] p-8 shadow-xl relative flex flex-col justify-between transform lg:-translate-y-2">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#F51B91] text-white text-[11px] font-extrabold uppercase tracking-widest shadow-md">
            MOST POPULAR
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F51B91]">Recommended</span>
              <h3 className="font-heading text-2xl font-bold text-slate-900 mt-1">The Signature Song</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-extrabold text-[#421078]">$54.99</span>
                <span className="text-xs font-bold text-slate-500 uppercase">NZD</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                More detailed story personalisation, two musical versions to pick from, and a printable lyrics sheet.
              </p>
            </div>

            <div className="border-t border-purple-100 pt-6 space-y-3">
              <p className="text-xs font-bold text-[#421078] uppercase tracking-wider">Everything in Personal, plus:</p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">More detailed personalisation & deep storytelling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">Up to 2 rounds of lyric changes before production</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">Two musical versions for you to choose between</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">Printable lyrics sheet (PDF)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0 mt-0.5" />
                  <span>Finished MP3 download & custom cover art</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => navigate('/create?package=signature')}
            className="mt-8 w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, #421078 0%, #F51B91 100%)',
            }}
          >
            Choose The Signature Song
          </button>
        </div>

        {/* Package 3: The Ultimate Gift */}
        <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF9B24]">Deluxe Keepsake</span>
              <h3 className="font-heading text-2xl font-bold text-slate-900 mt-1">The Ultimate Gift</h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-extrabold text-[#421078]">$85.00</span>
                <span className="text-xs font-bold text-slate-500 uppercase">NZD</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Includes custom photo lyric video, up to 10 customer-supplied photos, custom gift card with QR code, and priority turnaround.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Everything in Signature, plus:</p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF9B24] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">Personalised photo lyric video</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF9B24] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">Up to 10 customer-supplied photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF9B24] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">Custom digital gift card & QR code link</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF9B24] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">Private digital gift celebration page</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FF9B24] shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">Priority production turnaround</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => navigate('/create?package=ultimate')}
            className="mt-8 w-full py-3.5 rounded-full font-bold text-xs uppercase tracking-wider border-2 border-[#FF9B24] text-[#FF9B24] hover:bg-amber-50 transition-colors"
          >
            Choose The Ultimate Gift
          </button>
        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-10 shadow-xs space-y-6">
        <h3 className="font-heading text-2xl font-bold text-[#421078]">Package Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-purple-50/50 uppercase text-[10px] font-bold text-slate-600 border-b border-purple-100">
              <tr>
                <th className="py-3 px-4">Feature</th>
                <th className="py-3 px-4 text-center">Personal ($34.99)</th>
                <th className="py-3 px-4 text-center text-[#F51B91]">Signature ($54.99)</th>
                <th className="py-3 px-4 text-center text-[#FF9B24]">Ultimate ($85.00)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Original Bespoke Lyrics</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 px-4 text-center">✓ (Deep story)</td>
                <td className="py-3 px-4 text-center">✓ (Deep story)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Lyric Revision Rounds</td>
                <td className="py-3 px-4 text-center">1 Round</td>
                <td className="py-3 px-4 text-center font-bold text-[#F51B91]">2 Rounds</td>
                <td className="py-3 px-4 text-center font-bold text-[#FF9B24]">2 Rounds</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Musical Choices</td>
                <td className="py-3 px-4 text-center">1 Version</td>
                <td className="py-3 px-4 text-center font-bold text-[#F51B91]">2 Musical Versions</td>
                <td className="py-3 px-4 text-center font-bold text-[#FF9B24]">2 Musical Versions</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Printable Lyrics Sheet (PDF)</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center">✓</td>
                <td className="py-3 px-4 text-center">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Photo Lyric Video</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center font-bold text-[#FF9B24]">✓ (Up to 10 photos)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Custom Gift Card & QR Code</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center font-bold text-[#FF9B24]">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Turnaround Speed</td>
                <td className="py-3 px-4 text-center">3–5 Business Days</td>
                <td className="py-3 px-4 text-center">3–5 Business Days</td>
                <td className="py-3 px-4 text-center font-bold text-amber-700">Priority (2–3 Days)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200/80 space-y-8">
        <div className="text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-[#421078] mx-auto" />
          <h3 className="font-heading text-2xl font-bold text-[#421078]">Frequently Asked Questions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-700">
          <div className="space-y-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm">Do I get to approve the lyrics first?</h4>
            <p className="text-slate-600 leading-relaxed">
              Yes, absolutely. Music production never begins until you have reviewed and formally approved your lyrics in your dashboard.
            </p>
          </div>

          <div className="space-y-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm">Are there recurring monthly charges?</h4>
            <p className="text-slate-600 leading-relaxed">
              Never. M4UM operates strictly on one-time payments. You pay once for your song gift and you own the finished digital files for personal use forever.
            </p>
          </div>

          <div className="space-y-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm">How many revisions can I request?</h4>
            <p className="text-slate-600 leading-relaxed">
              The Personal Song includes 1 round of lyric adjustments. The Signature Song and Ultimate Gift include up to 2 rounds of lyric refinement.
            </p>
          </div>

          <div className="space-y-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="font-bold text-slate-900 text-sm">Can I use the song for commercial advertising?</h4>
            <p className="text-slate-600 leading-relaxed">
              Our packages are priced for private, non-commercial gifts (parties, weddings, anniversaries, social sharing). Commercial synchronization rights require special licensing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
