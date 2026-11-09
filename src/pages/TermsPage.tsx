/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

interface TermsPageProps {
  navigate: (path: string) => void;
}

export const TermsPage: React.FC<TermsPageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#421078] text-xs font-bold uppercase tracking-wider">
          <FileText className="w-3.5 h-3.5 text-[#F51B91]" />
          Order Conditions & Licensing
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#421078]">
          Terms & Conditions
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          Last updated: 2026 · Made For You Music (M4UM) By TMG®
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-12 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#421078]">1. General Scope & Pricing</h2>
          <p>
            Made For You Music (brand shorthand: M4UM, by TMG®) provides bespoke personalized songwriting and digital music gift services. All prices are listed and charged in New Zealand Dollars (NZD). Payments are strictly one-time payments; there are no recurring subscriptions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#421078]">2. Packages & Inclusions</h2>
          <p>
            M4UM offers three fixed packages:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>The Personal Song ($34.99 NZD):</strong> One personalized song (~2–3 minutes), original lyrics based on your story, choice of genre and mood, 1 round of lyric changes before production, finished MP3 download, and digital cover artwork.</li>
            <li><strong>The Signature Song ($54.99 NZD):</strong> More detailed personalisation, up to 2 rounds of lyric changes, two musical versions to choose between, and printable lyrics sheet (PDF).</li>
            <li><strong>The Ultimate Gift ($85.00 NZD):</strong> Everything in Signature, plus personalized photo lyric video (up to 10 photos), custom digital gift card with QR code, private celebration web page, and priority production.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#421078]">3. Lyric Approval & Revision Policy</h2>
          <p>
            Customers review and approve their lyrics prior to final musical production. Production will not begin until the customer formally approves the lyrics in the customer portal. Revisions are limited to the package purchased (1 round for Personal Song, 2 rounds for Signature Song and Ultimate Gift) to ensure sustainable production turnaround times.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#421078]">4. Personal Use License</h2>
          <p>
            All custom songs produced by M4UM are licensed strictly for personal, non-commercial gifting purposes (e.g. sharing with family, playing at weddings, parties, or personal social media). Commercial synchronization rights (e.g. film, television, national advertising, or resale) are not included.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#421078]">5. Production Methodology</h2>
          <p>
            M4UM creates original personalized lyrics and creatively directs music production, using AI-assisted music generation and audio mastering where applicable. We do not represent that each song is performed by a human session vocalist or recorded in an analog studio.
          </p>
        </section>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
          <p>© 2026 TMG Enterprises, LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
