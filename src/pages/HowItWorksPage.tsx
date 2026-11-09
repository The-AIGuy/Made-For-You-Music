/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Music,
  Headphones,
  FileText,
  Heart,
  Gift,
  HelpCircle,
} from 'lucide-react';

interface HowItWorksPageProps {
  navigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ navigate }) => {
  const stages = [
    {
      num: 1,
      title: 'Choose your package.',
      desc: 'Select from our three straightforward NZD options: The Personal Song ($34.99), The Signature Song ($54.99), or The Ultimate Gift ($85.00). Each package is a one-time payment with clear, fixed inclusions.',
      badge: 'Step 1',
      color: 'from-[#421078] to-[#5a1b9a]',
    },
    {
      num: 2,
      title: 'Tell us about the recipient.',
      desc: 'Tell us their name, your relationship, their personality quirks, their passions, and what musical soundscape matches their personality best.',
      badge: 'Step 2',
      color: 'from-[#5a1b9a] to-[#7B1FA2]',
    },
    {
      num: 3,
      title: 'Share memories, stories and inside jokes.',
      desc: 'Provide the specific memories only you two share—the campervan mishap, the salty coffee morning, the shared dog, or the sayings only you understand.',
      badge: 'Step 3',
      color: 'from-[#7B1FA2] to-[#F51B91]',
    },
    {
      num: 4,
      title: 'We write your personalised lyrics.',
      desc: 'Our songwriting team carefully weaves your stories into structured verses, catchy choruses, and an emotional bridge tailored to your chosen genre.',
      badge: 'Step 4',
      color: 'from-[#F51B91] to-[#FF5252]',
    },
    {
      num: 5,
      title: 'You review and approve the lyrics.',
      desc: 'We share the lyrics directly in your customer dashboard before music production begins. You can approve them with a single click or request lyric refinements based on your package inclusions.',
      badge: 'Step 5 · Crucial',
      color: 'from-[#FF5252] to-[#FF9B24]',
    },
    {
      num: 6,
      title: 'We produce and quality-check your song.',
      desc: 'Once approved, we arrange, record, produce, and engineer your track to radio-ready clarity. Every track is quality checked for vocal clarity and audio balance.',
      badge: 'Step 6',
      color: 'from-[#FF9B24] to-[#FFD52A]',
    },
    {
      num: 7,
      title: 'Your finished digital gift is delivered.',
      desc: 'Download your high-definition MP3, custom digital cover artwork, printable lyric sheet, and celebration gift page directly from your customer portal.',
      badge: 'Step 7 · Complete',
      color: 'from-[#08BFE8] to-[#421078]',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#421078] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#F51B91]" />
          Clear & Transparent Process
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#421078] tracking-tight">
          How It Works
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          From your real story to an unforgettable musical gift in seven simple stages. You are always in control of the words before the music begins.
        </p>
      </div>

      {/* The 7 Stages */}
      <div className="space-y-6">
        {stages.map((stage) => (
          <div
            key={stage.num}
            className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start gap-6"
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stage.color} text-white font-heading text-2xl font-black flex items-center justify-center shrink-0 shadow-sm`}
            >
              {stage.num}
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  {stage.badge}
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
                  {stage.title}
                </h3>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-3xl">
                {stage.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Transparency & Creative Technology Note */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50/40 rounded-3xl p-8 sm:p-10 border border-purple-200/80 space-y-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#421078]" />
          <h2 className="font-heading text-2xl font-bold text-[#421078]">
            Our Songwriting & Production Philosophy
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          At Made For You Music, we believe transparency builds trust. We write original, personalized lyrics tailored to your real memories and creatively direct the song's production, utilizing advanced AI-assisted music generation, arrangement, and audio engineering tools where applicable.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          We do not claim that every song is performed by a human session vocalist or recorded in an analog studio. Instead, we combine thoughtful lyricism with cutting-edge sound synthesis to deliver heartfelt, radio-ready songs at an accessible price point (from $34.99 NZD).
        </p>
        <p className="text-xs sm:text-sm font-semibold text-[#421078]">
          Most importantly: you review and approve the lyrics before final audio production begins, ensuring every word honors your recipient.
        </p>
      </div>

      {/* Call to action */}
      <div className="text-center space-y-4 pt-4">
        <h3 className="font-heading text-2xl font-bold text-slate-900">
          Ready to write their song?
        </h3>
        <button
          onClick={() => navigate('/create')}
          className="px-8 py-4 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
          style={{
            background: 'linear-gradient(135deg, #421078 0%, #F51B91 100%)',
          }}
        >
          Create Your Song Now
        </button>
      </div>
    </div>
  );
};
