/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

interface PrivacyPolicyPageProps {
  navigate: (path: string) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#421078] text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-[#F51B91]" />
          Trust & Confidentiality
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#421078]">
          Privacy Policy
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          Last updated: 2026 · Made For You Music (M4UM) By TMG®
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-12 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#421078]">1. Information We Collect</h2>
          <p>
            When you create an account, submit a song order, or send an enquiry through Made For You Music, we collect personal information you explicitly provide to us:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li><strong>Customer Details:</strong> Your full name, email address, optional phone number, and account credentials (passwords are cryptographically salted and hashed).</li>
            <li><strong>Creative Brief Data:</strong> Recipient names, relationship to you, personality quirks, milestone occasions, inside jokes, and submitted memories.</li>
            <li><strong>Media Assets:</strong> Photographs uploaded for Ultimate Gift photo lyric videos.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#421078]">2. Why We Collect This Information</h2>
          <p>
            Your information is collected solely to create, produce, and deliver your personalized musical gift:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>To write original lyrics centered around your submitted stories and memories.</li>
            <li>To communicate lyric drafts, revision updates, and production milestones with you.</li>
            <li>To compile digital video assets (for The Ultimate Gift orders).</li>
            <li>To provide secure access to your downloadable finished song files in your customer portal.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#421078]">3. Strict Privacy of Your Music & Photos</h2>
          <p>
            Your personal song and uploaded photos remain <strong>100% private by default</strong>. We never publish, broadcast, or share your custom tracks, lyrics, or personal photos in our public showcase or promotional channels without your explicit, formal consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#421078]">4. Storage and Data Security</h2>
          <p>
            Data is stored in persistent, secure database environments. We enforce strict role-based access controls to ensure customers can only access their own orders and deliverables. Internal songwriter notes are completely isolated and never exposed to customer-facing views.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-heading text-xl font-bold text-[#421078]">5. Your Rights and Assistance</h2>
          <p>
            You may request an update, copy, or deletion of your stored information at any time by contacting our team at <strong>dannaix.homes@tekura.org.nz</strong> or calling <strong>0211873347</strong> (Featherston, New Zealand).
          </p>
        </section>
      </div>
    </div>
  );
};
