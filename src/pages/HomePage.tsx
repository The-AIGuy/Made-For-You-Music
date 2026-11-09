/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import type { SongLibraryItem, PackageInfo } from '../types.js';
import {
  Sparkles,
  Music,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  ArrowRight,
  Heart,
  Play,
  Pause,
  Volume2,
  Gift,
  FileText,
  Star,
  Clock,
} from 'lucide-react';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [showcaseSongs, setShowcaseSongs] = useState<SongLibraryItem[]>([]);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    api.getPackages().then((res) => setPackages(res.packages)).catch(() => {});
    api.getSongLibrary().then((res) => setShowcaseSongs(res.songs)).catch(() => {});
  }, []);

  const togglePlay = (song: SongLibraryItem) => {
    if (playingSongId === song.id) {
      audioElement?.pause();
      setPlayingSongId(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const audio = new Audio(song.audioUrl);
      audio.play().catch(() => {
        console.log('Audio playback prevented or unsupported');
      });
      audio.onended = () => setPlayingSongId(null);
      setAudioElement(audio);
      setPlayingSongId(song.id);
    }
  };

  useEffect(() => {
    return () => {
      audioElement?.pause();
    };
  }, [audioElement]);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 bg-gradient-to-b from-purple-50/70 via-white to-transparent">
        {/* Decorative background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-purple-300/30 via-pink-300/20 to-amber-200/20 blur-3xl -z-10 rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-[#421078] text-xs font-bold tracking-wide uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#F51B91]" />
            <span>Made For You Music · M4UM · By TMG®</span>
          </div>

          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-bold text-[#421078] tracking-tight max-w-4xl mx-auto leading-[1.08]">
            Every Story Deserves Its Own Song.
          </h1>

          <p className="font-sans text-lg sm:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Turn your memories, inside jokes and favourite people into a personalised song they'll never forget.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/create')}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #421078 0%, #F51B91 50%, #FF9B24 100%)',
              }}
            >
              <Music className="w-4 h-4" />
              Create Your Song
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm text-[#421078] bg-white border-2 border-[#421078]/20 hover:border-[#421078] hover:bg-purple-50 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              Explore Packages
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Three Trust Points */}
          <div className="pt-8 border-t border-purple-100 max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-800 font-semibold text-sm">
              <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span>From $34.99 NZD.</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-800 font-semibold text-sm">
              <span className="w-7 h-7 rounded-full bg-purple-100 text-[#421078] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span>You approve the lyrics first.</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-800 font-semibold text-sm">
              <span className="w-7 h-7 rounded-full bg-cyan-100 text-[#08BFE8] flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </span>
              <span>Delivered digitally.</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Quick Tour */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-[#F51B91]">Simple 7-Stage Process</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#421078]">
            How We Bring Your Story To Life
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Transparent, heartfelt songwriting where you maintain creative control from opening verse to final master.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-3 relative hover:-translate-y-1 transition-transform">
            <span className="w-10 h-10 rounded-xl bg-purple-100 text-[#421078] font-bold text-sm flex items-center justify-center">1</span>
            <h3 className="font-bold text-slate-900 text-base">Select Your Package</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose between The Personal Song, Signature Song, or Ultimate Gift based on your desired inclusions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-3 relative hover:-translate-y-1 transition-transform">
            <span className="w-10 h-10 rounded-xl bg-pink-100 text-[#F51B91] font-bold text-sm flex items-center justify-center">2</span>
            <h3 className="font-bold text-slate-900 text-base">Tell Us Their Story</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Share their funny quirks, inside jokes, milestones, and what musical genre feels most true to them.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-3 relative hover:-translate-y-1 transition-transform">
            <span className="w-10 h-10 rounded-xl bg-amber-100 text-[#FF9B24] font-bold text-sm flex items-center justify-center">3</span>
            <h3 className="font-bold text-slate-900 text-base">Approve The Lyrics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We write custom lyrics. You review them in your dashboard and request refinements before audio production begins.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-xs space-y-3 relative hover:-translate-y-1 transition-transform">
            <span className="w-10 h-10 rounded-xl bg-cyan-100 text-[#08BFE8] font-bold text-sm flex items-center justify-center">4</span>
            <h3 className="font-bold text-slate-900 text-base">Digital Delivery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download your radio-ready MP3, custom artwork, printable lyric sheet, and gift page to share immediately.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/how-it-works')}
            className="text-xs font-bold text-[#421078] hover:text-[#F51B91] inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Read full 7-step songwriting guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Packages Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-[#FF9B24]">Personalised Song Packages</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#421078]">
            One-Time NZD Pricing. No Subscriptions.
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Every package includes genuine bespoke lyrics written exclusively around your submitted memories.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Package 1: The Personal Song */}
          <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#421078]">Essential Gift</span>
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
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">What's Included:</p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Personalised song (approx. 2–3 minutes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Original lyrics based on your story</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Choice of music genre & mood</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>1 round of lyric changes before production</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Finished MP3 download</span>
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
              Select The Personal Song
            </button>
          </div>

          {/* Package 2: The Signature Song (MOST POPULAR) */}
          <div className="bg-gradient-to-b from-white to-purple-50/40 rounded-3xl border-2 border-[#F51B91] p-8 shadow-xl relative flex flex-col justify-between transform lg:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#F51B91] text-white text-[11px] font-extrabold uppercase tracking-widest shadow-md">
              MOST POPULAR
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F51B91]">Complete Keepsake</span>
                <h3 className="font-heading text-2xl font-bold text-slate-900 mt-1">The Signature Song</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-extrabold text-[#421078]">$54.99</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">NZD</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  More detailed personalisation, 2 musical choices to compare, and printable lyrics sheet.
                </p>
              </div>

              <div className="border-t border-purple-100 pt-6 space-y-3">
                <p className="text-xs font-bold text-[#421078] uppercase tracking-wider">Everything in Personal, plus:</p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900">More detailed personalisation & storytelling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900">Up to 2 rounds of lyric changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900">Two musical versions to choose between</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-900">Printable lyrics sheet (PDF)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0 mt-0.5" />
                    <span>Finished MP3 download & custom artwork</span>
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
              Select The Signature Song
            </button>
          </div>

          {/* Package 3: The Ultimate Gift */}
          <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF9B24]">Deluxe Experience</span>
                <h3 className="font-heading text-2xl font-bold text-slate-900 mt-1">The Ultimate Gift</h3>
                <div className="flex items-baseline gap-1 mt-4">
                  <span className="text-4xl font-extrabold text-[#421078]">$85.00</span>
                  <span className="text-xs font-bold text-slate-500 uppercase">NZD</span>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Personalised photo lyric video with your photos, digital gift card, QR code, and private celebration page.
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
                    <span className="font-semibold text-slate-900">Private digital gift web page</span>
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
              Select The Ultimate Gift
            </button>
          </div>
        </div>
      </section>

      {/* Music Styles & Genres Showcase */}
      <section className="bg-purple-900 text-white py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#FFD52A]">Versatile Soundscapes</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              Whatever Their Musical Taste, We Have The Sound
            </h2>
            <p className="text-purple-200 max-w-xl mx-auto text-sm">
              From gentle acoustic fingerpicking to upbeat pop, indie anthems, or 90s-inspired rock, each song is composed to match their personality.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {[
              { genre: 'Pop', desc: 'Upbeat, catchy hooks' },
              { genre: 'Acoustic / Folk', desc: 'Intimate, warm strings' },
              { genre: 'Rock', desc: 'Driven guitars, anthemic' },
              { genre: 'Country', desc: 'Heartfelt storytelling' },
              { genre: 'R&B / Soul', desc: 'Smooth, emotional grooves' },
              { genre: 'Indie', desc: 'Modern, nuanced melody' },
            ].map((item) => (
              <div
                key={item.genre}
                className="bg-purple-800/60 border border-purple-700/50 rounded-2xl p-4 space-y-1 hover:border-[#F51B91] transition-colors"
              >
                <p className="font-bold text-white text-sm">{item.genre}</p>
                <p className="text-[11px] text-purple-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why M4UM Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase font-bold tracking-widest text-[#F51B91]">The M4UM Difference</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#421078] leading-tight">
              Real Personal Stories, Not Generic Template Songs.
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              Anyone can type a prompt into an automated generator. At Made For You Music, our creative direction is anchored in your submitted memories—the road trips, the inside jokes, the nickname only you two understand, and the exact sentiments you want to express.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-[#F51B91] flex items-center justify-center shrink-0 font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Transparent Creative Process</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    We write original lyrics and creatively direct music production, utilizing state-of-the-art AI-assisted audio mastering and editing where applicable.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-[#421078] flex items-center justify-center shrink-0 font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">You Hold The Green Light</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Audio production never begins without your explicit lyric approval. You review the wording first, ensuring every line rings true.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-[#FF9B24] flex items-center justify-center shrink-0 font-bold text-sm">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Aotearoa New Zealand Based</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Grounded in local Kiwi warmth, friendly customer support, and genuine dedication to every gift.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50 rounded-3xl p-8 border border-purple-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-purple-200/60 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F51B91]" />
                <span className="font-heading font-bold text-[#421078] text-lg">Real Gift Moments</span>
              </div>
              <span className="text-xs text-purple-700 font-semibold bg-white/80 px-2.5 py-1 rounded-full border border-purple-200">
                Aotearoa NZ
              </span>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-4 bg-white/90 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-bold text-[#421078]">10th Wedding Anniversary</span>
                  <span>Acoustic / Folk</span>
                </div>
                <p className="italic text-slate-800">
                  "Ten years, ten thousand miles, and a golden dog named Buster... You're the quiet compass and the light that I can trust in."
                </p>
              </div>

              <div className="p-4 bg-white/90 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-bold text-[#F51B91]">30th Milestone Birthday</span>
                  <span>Rock</span>
                </div>
                <p className="italic text-slate-800">
                  "Back in Piha treehouse days, you were captain of the crew... Now you're turning level thirty with a brand new gaming rig!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Listen Section (Real Approved Songs) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#08BFE8]">Listen Before Ordering</span>
            <h2 className="font-heading text-3xl font-bold text-[#421078]">
              Genuine Approved Song Samples
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Listen to actual personalised tracks created for our customers (shared with public permission).
            </p>
          </div>
          <button
            onClick={() => navigate('/listen')}
            className="text-xs font-bold text-[#421078] hover:text-[#F51B91] flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>View Full Song Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {showcaseSongs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-purple-100 space-y-3">
            <Headphones className="w-10 h-10 text-purple-300 mx-auto" />
            <h3 className="font-bold text-slate-800">Showcase Samples Coming Soon</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We respect customer privacy and only share finished songs once customers have formally approved them for public listening.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {showcaseSongs.slice(0, 3).map((song) => {
              const isPlaying = playingSongId === song.id;
              return (
                <div
                  key={song.id}
                  className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-purple-900/10">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => togglePlay(song)}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#421078] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-bold text-[#421078]">{song.genre}</span>
                        <span>{song.duration}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base mt-1 truncate">{song.title}</h4>
                      {song.recipientName && (
                        <p className="text-xs text-slate-500">
                          For {song.recipientName} {song.occasion ? `· ${song.occasion}` : ''}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 italic bg-purple-50/50 p-3 rounded-xl border border-purple-100/50">
                      "{song.sampleLyricsSnippet}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-xl space-y-6"
          style={{
            background: 'linear-gradient(135deg, #421078 0%, #7B1FA2 50%, #F51B91 100%)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Heart className="w-3.5 h-3.5 text-[#FFD52A]" />
            Give A Gift They Will Cherish Forever
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
            Ready to Turn Your Story Into A Song?
          </h2>

          <p className="text-purple-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Choose your package, tell us who they are, and our creative team will craft an unforgettable musical memory starting from just $34.99 NZD.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/create')}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider bg-white text-[#421078] shadow-lg hover:bg-[#FFD52A] hover:text-[#421078] transition-colors"
            >
              Start Creating Now
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/30 text-white transition-colors"
            >
              Ask A Question
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
