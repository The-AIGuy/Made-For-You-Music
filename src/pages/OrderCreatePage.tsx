/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  AlertCircle,
  Sparkles,
  Music,
  Heart,
  FileText,
  User,
  ShieldCheck,
  Image as ImageIcon,
  Mic,
} from 'lucide-react';
import type { OrderPackageId } from '../types.js';
import { VoiceTextarea } from '../components/VoiceTextarea.js';

interface OrderCreatePageProps {
  navigate: (path: string, state?: any) => void;
  initialPackage?: OrderPackageId;
}

const DRAFT_STORAGE_KEY = 'm4um_order_draft_v1';

export const OrderCreatePage: React.FC<OrderCreatePageProps> = ({ navigate, initialPackage }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    packageId: (initialPackage || 'signature') as OrderPackageId,
    occasion: 'Birthday',
    occasionCustom: '',
    recipientName: '',
    relationship: '',
    nickname: '',
    personality: '',
    interests: '',
    memories: '',
    funnyStories: '',
    insideJokes: '',
    specialPhrases: '',
    includedDetails: '',
    excludedDetails: '',
    genre: 'Acoustic / Folk',
    genreCustom: '',
    mood: 'Heartfelt',
    vocalPreference: 'No preference',
    energy: 'Warm and uplifting',
    length: 'Approximately 2–3 minutes',
    creativeDirection: '',
    photos: [] as string[],
    customerName: user?.name || '',
    customerEmail: user?.email || '',
    customerPhone: user?.phone || '',
    agreeTerms: false,
    agreeAccuracy: false,
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          ...parsed,
          packageId: initialPackage || parsed.packageId || prev.packageId,
          customerName: user?.name || parsed.customerName || '',
          customerEmail: user?.email || parsed.customerEmail || '',
        }));
      }
    } catch {
      // ignore
    }
  }, [initialPackage, user]);

  // Persist draft changes
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore
    }
  }, [formData]);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);
    if (step === 1) {
      if (!formData.packageId) {
        setErrorMessage('Please select a package to proceed.');
        return false;
      }
    } else if (step === 2) {
      if (!formData.occasion) {
        setErrorMessage('Please choose an occasion.');
        return false;
      }
      if (formData.occasion === 'Other' && !formData.occasionCustom.trim()) {
        setErrorMessage('Please specify the custom occasion.');
        return false;
      }
    } else if (step === 3) {
      if (!formData.recipientName.trim()) {
        setErrorMessage('Please enter the recipient’s name.');
        return false;
      }
      if (!formData.relationship.trim()) {
        setErrorMessage('Please tell us your relationship to the recipient.');
        return false;
      }
      if (!formData.personality.trim()) {
        setErrorMessage('Please describe their personality traits.');
        return false;
      }
      if (!formData.memories.trim()) {
        setErrorMessage('Please share at least one memory or story for the lyrics.');
        return false;
      }
    } else if (step === 4) {
      if (!formData.genre) {
        setErrorMessage('Please select a preferred musical genre.');
        return false;
      }
      if (formData.genre === 'Other' && !formData.genreCustom.trim()) {
        setErrorMessage('Please specify your custom genre.');
        return false;
      }
      if (!formData.mood) {
        setErrorMessage('Please select a mood.');
        return false;
      }
    } else if (step === 6) {
      if (!formData.customerName.trim()) {
        setErrorMessage('Please provide your full name.');
        return false;
      }
      if (!formData.customerEmail.trim() || !formData.customerEmail.includes('@')) {
        setErrorMessage('Please provide a valid email address.');
        return false;
      }
    } else if (step === 7) {
      if (!formData.agreeAccuracy) {
        setErrorMessage('Please confirm that your provided information is accurate.');
        return false;
      }
      if (!formData.agreeTerms) {
        setErrorMessage('Please accept the order terms and privacy policy.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Photo uploads for Ultimate Gift
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (formData.photos.length + files.length > 10) {
      setErrorMessage('The Ultimate Gift includes up to 10 photos in the lyric video.');
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please only upload image files (JPG, PNG, WebP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Each image must be under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            photos: [...prev.photos, event.target!.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Submit Order
  const handleSubmit = async () => {
    if (!validateStep(7)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.createOrder({
        packageId: formData.packageId,
        occasion: formData.occasion,
        occasionCustom: formData.occasion === 'Other' ? formData.occasionCustom : undefined,
        recipientName: formData.recipientName,
        relationship: formData.relationship,
        nickname: formData.nickname,
        personality: formData.personality,
        interests: formData.interests,
        memories: formData.memories,
        funnyStories: formData.funnyStories,
        insideJokes: formData.insideJokes,
        specialPhrases: formData.specialPhrases,
        includedDetails: formData.includedDetails,
        excludedDetails: formData.excludedDetails,
        genre: formData.genre,
        genreCustom: formData.genre === 'Other' ? formData.genreCustom : undefined,
        mood: formData.mood,
        vocalPreference: formData.vocalPreference,
        energy: formData.energy,
        length: formData.length,
        creativeDirection: formData.creativeDirection,
        photos: formData.photos,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
      });

      // Clear draft upon successful submission
      localStorage.removeItem(DRAFT_STORAGE_KEY);

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#421078', '#F51B91', '#FF9B24', '#FFD52A', '#08BFE8'],
      });

      // Navigate to Order Confirmation
      navigate('/order-confirmation', { order: res.order });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit order. Please check your answers and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const packagePrices: Record<OrderPackageId, { name: string; price: number }> = {
    personal: { name: 'The Personal Song', price: 34.99 },
    signature: { name: 'The Signature Song', price: 54.99 },
    ultimate: { name: 'The Ultimate Gift', price: 85.0 },
  };

  const stepTitles = [
    'Package',
    'Occasion',
    'Recipient',
    'Music',
    'Direction',
    'Your Details',
    'Review',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
      {/* Header & Progress Indicator */}
      <div className="space-y-6 text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#421078] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#F51B91]" />
          Custom Song Creation Wizard
        </div>
        <h1 className="font-heading text-3xl sm:text-5xl font-bold text-[#421078]">
          Create Your Song
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Step {currentStep} of 7: <span className="font-bold text-slate-900">{stepTitles[currentStep - 1]}</span>
        </p>

        {/* 7-Step Progress Dots & Bar */}
        <div className="relative pt-4">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-purple-100">
            <div
              style={{ width: `${(currentStep / 7) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-[#421078] via-[#F51B91] to-[#FF9B24] transition-all duration-300"
            ></div>
          </div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 hidden sm:flex">
            {stepTitles.map((title, idx) => (
              <span
                key={title}
                className={idx + 1 <= currentStep ? 'text-[#421078] font-bold' : 'text-slate-400'}
              >
                {idx + 1}. {title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Please check your answers:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP CONTAINER */}
      <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-10 shadow-sm space-y-8">
        {/* ========================================================= */}
        {/* STEP 1: PACKAGE */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl font-bold text-[#421078]">Step 1: Choose Your Package</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                All packages are one-time payments in NZD. You can change your package anytime before submission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Personal Song */}
              <div
                onClick={() => updateField('packageId', 'personal')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.packageId === 'personal'
                    ? 'border-[#421078] bg-purple-50/50 shadow-md ring-2 ring-[#421078]/20'
                    : 'border-slate-200 hover:border-purple-200 bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#421078]">The Personal Song</span>
                    {formData.packageId === 'personal' && (
                      <CheckCircle2 className="w-5 h-5 text-[#421078]" />
                    )}
                  </div>
                  <div className="text-3xl font-extrabold text-[#421078]">$34.99 <span className="text-xs font-normal text-slate-500">NZD</span></div>
                  <p className="text-xs text-slate-600">
                    One personalised song (~2–3 mins) with original lyrics, finished MP3 download, and digital cover art.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                    <li>• 1 round of lyric changes</li>
                    <li>• Choice of genre & mood</li>
                    <li>• High-res MP3 download</li>
                  </ul>
                </div>
              </div>

              {/* Signature Song (MOST POPULAR) */}
              <div
                onClick={() => updateField('packageId', 'signature')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                  formData.packageId === 'signature'
                    ? 'border-[#F51B91] bg-pink-50/40 shadow-md ring-2 ring-[#F51B91]/20'
                    : 'border-slate-200 hover:border-pink-200 bg-white'
                }`}
              >
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#F51B91] text-white text-[10px] font-bold uppercase tracking-widest shadow-xs">
                  MOST POPULAR
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#F51B91]">The Signature Song</span>
                    {formData.packageId === 'signature' && (
                      <CheckCircle2 className="w-5 h-5 text-[#F51B91]" />
                    )}
                  </div>
                  <div className="text-3xl font-extrabold text-[#421078]">$54.99 <span className="text-xs font-normal text-slate-500">NZD</span></div>
                  <p className="text-xs text-slate-600">
                    Deep storytelling, 2 rounds of lyric refinement, two musical versions to choose between, and printable lyric sheet.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                    <li>• Up to 2 rounds of lyric revisions</li>
                    <li>• 2 musical versions to pick from</li>
                    <li>• Printable lyrics sheet (PDF)</li>
                  </ul>
                </div>
              </div>

              {/* Ultimate Gift */}
              <div
                onClick={() => updateField('packageId', 'ultimate')}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  formData.packageId === 'ultimate'
                    ? 'border-[#FF9B24] bg-amber-50/50 shadow-md ring-2 ring-[#FF9B24]/20'
                    : 'border-slate-200 hover:border-amber-200 bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#FF9B24]">The Ultimate Gift</span>
                    {formData.packageId === 'ultimate' && (
                      <CheckCircle2 className="w-5 h-5 text-[#FF9B24]" />
                    )}
                  </div>
                  <div className="text-3xl font-extrabold text-[#421078]">$85.00 <span className="text-xs font-normal text-slate-500">NZD</span></div>
                  <p className="text-xs text-slate-600">
                    The complete visual keepsake with photo lyric video (up to 10 photos), digital gift card with QR code, and private celebration web page.
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                    <li>• Photo lyric video (up to 10 photos)</li>
                    <li>• Custom gift card & QR code link</li>
                    <li>• Priority production turnaround</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: OCCASION */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl font-bold text-[#421078]">Step 2: What's The Occasion?</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Select the primary celebration or milestone so we can tailor the opening tone.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                'Birthday',
                'Anniversary',
                'Wedding',
                'Friendship',
                'Family',
                'Graduation',
                'Thank You',
                'Christmas',
                "Valentine's Day",
                'Other',
              ].map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => updateField('occasion', occ)}
                  className={`p-4 rounded-2xl border text-xs font-bold transition-all text-center ${
                    formData.occasion === occ
                      ? 'border-[#421078] bg-[#421078] text-white shadow-sm'
                      : 'border-slate-200 text-slate-700 hover:border-purple-300 bg-white'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>

            {formData.occasion === 'Other' && (
              <div className="pt-2 space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  Please specify your custom occasion <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.occasionCustom}
                  onChange={(e) => updateField('occasionCustom', e.target.value)}
                  placeholder="e.g. Retirement party, Housewarming, Just Because"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: RECIPIENT */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl font-bold text-[#421078]">Step 3: Tell Us About The Recipient</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                The more authentic details you provide, the more unforgettable and emotional the lyrics will be.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Recipient's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => updateField('recipientName', e.target.value)}
                  placeholder="e.g. Liam, Chloe & David"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Relationship to You <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => updateField('relationship', e.target.value)}
                  placeholder="e.g. Husband, Sister, Best Friend, Dad"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  Nicknames or Pet Names (Optional)
                </label>
                <input
                  type="text"
                  value={formData.nickname}
                  onChange={(e) => updateField('nickname', e.target.value)}
                  placeholder="e.g. Davey Bear, Sparky, Bubba"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  Personality Traits <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.personality}
                  onChange={(e) => updateField('personality', e.target.value)}
                  placeholder="e.g. Generous, hilarious dad jokes, determined, sensitive, coffee addict"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  Interests, Hobbies & Passions
                </label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => updateField('interests', e.target.value)}
                  placeholder="e.g. Tramping in the Southern Alps, gardening, playing guitar, golden retrievers"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
                />
              </div>

              {/* Voice Typing Highlight Banner */}
              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#421078] to-[#F51B91] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <Mic className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-[#421078] flex items-center gap-1.5">
                    <span>Voice Typing Enabled</span>
                    <span className="text-[10px] font-semibold bg-white text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
                      New
                    </span>
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    Don't want to type long stories? Just tap <strong>"Voice Type"</strong> on any section below and say what's on your mind—we'll automatically transcribe it into the box!
                  </p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <VoiceTextarea
                  id="memories"
                  label="Important Memories & Stories"
                  required
                  rows={4}
                  value={formData.memories}
                  onChange={(val) => updateField('memories', val)}
                  placeholder="Tell us about a meaningful moment, a trip together, or a defining shared memory... (Click Voice Type above to speak instead of typing!)"
                  helperText="The heart of your song. Mention defining trips, challenges overcome, how you met, or everyday moments you cherish."
                  badgeText="🎤 Voice Typing"
                />
              </div>

              <div>
                <VoiceTextarea
                  id="funnyStories"
                  label="Funny Stories or Quirks"
                  rows={3}
                  value={formData.funnyStories}
                  onChange={(val) => updateField('funnyStories', val)}
                  placeholder="That time they burnt the BBQ, put salt in the coffee, got lost on the trail... (or tap Voice Type to speak)"
                  badgeText="🎤 Voice Typing"
                />
              </div>

              <div>
                <VoiceTextarea
                  id="insideJokes"
                  label="Inside Jokes & Special Sayings"
                  rows={3}
                  value={formData.insideJokes}
                  onChange={(val) => updateField('insideJokes', val)}
                  placeholder="Phrases only the two of you understand, nicknames, running gags... (or tap Voice Type to speak)"
                  badgeText="🎤 Voice Typing"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-800">
                  Details that MUST be included
                </label>
                <input
                  type="text"
                  value={formData.includedDetails}
                  onChange={(e) => updateField('includedDetails', e.target.value)}
                  placeholder="e.g. Mention their dog Buster, our campervan trip"
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-emerald-50/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-red-800">
                  Anything to AVOID mentioning
                </label>
                <input
                  type="text"
                  value={formData.excludedDetails}
                  onChange={(e) => updateField('excludedDetails', e.target.value)}
                  placeholder="e.g. Do not mention their ex, work stress, old car"
                  className="w-full px-4 py-2.5 rounded-xl border border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-red-50/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 4: MUSIC PREFERENCES */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl font-bold text-[#421078]">Step 4: Musical Sound & Vibe</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Choose the musical style that matches their personality and listening habits.
              </p>
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Music Genre <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  'Pop',
                  'Acoustic / Folk',
                  'Rock',
                  'Country',
                  'R&B / Soul',
                  'Electronic',
                  'Indie',
                  'Hip-Hop',
                  'Musical Theatre',
                  'Other',
                ].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => updateField('genre', g)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      formData.genre === g
                        ? 'border-[#421078] bg-[#421078] text-white shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:border-purple-300 bg-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              {formData.genre === 'Other' && (
                <input
                  type="text"
                  value={formData.genreCustom}
                  onChange={(e) => updateField('genreCustom', e.target.value)}
                  placeholder="Specify custom genre (e.g. Reggae, Jazz, Synthwave)"
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm"
                />
              )}
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">
                Emotional Mood <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'Heartfelt',
                  'Happy',
                  'Funny',
                  'Romantic',
                  'Triumphant',
                  'Nostalgic',
                  'Emotional',
                  'Inspirational',
                ].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateField('mood', m)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      formData.mood === m
                        ? 'border-[#F51B91] bg-[#F51B91] text-white shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:border-pink-300 bg-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Vocal Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">Vocal Preference</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Male vocal', 'Female vocal', 'Duet', 'No preference'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => updateField('vocalPreference', v)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium ${
                      formData.vocalPreference === v
                        ? 'border-[#08BFE8] bg-[#08BFE8]/15 text-[#00708A] font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">Energy & Tempo</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  'Gentle and intimate',
                  'Warm and uplifting',
                  'Energetic and exciting',
                  'Dramatic and powerful',
                  'Relaxed and mellow',
                ].map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => updateField('energy', e)}
                    className={`py-2 px-3 rounded-xl border text-xs text-left ${
                      formData.energy === e
                        ? 'border-[#FF9B24] bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Approximate Length */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">Song Length</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  'Approximately 2–3 minutes',
                  'Approximately 3–4 minutes',
                  'Approximately 4–5 minutes',
                ].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => updateField('length', l)}
                    className={`py-2 px-3 rounded-xl border text-xs text-left ${
                      formData.length === l
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 5: CREATIVE DIRECTION & PHOTO UPLOADS */}
        {/* ========================================================= */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl font-bold text-[#421078]">Step 5: Creative Direction</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Guide our songwriters on the overall feel, message, and emotional core of the piece.
              </p>
            </div>

            <VoiceTextarea
              id="creativeDirection"
              label="What core message or feeling should the chorus deliver?"
              rows={4}
              value={formData.creativeDirection}
              onChange={(val) => updateField('creativeDirection', val)}
              placeholder="e.g. We want them to know how deeply loved they are, even when living across the ditch in Melbourne. The chorus should feel triumphant and tearful with acoustic build-up... (Voice typing supported)"
              helperText="Share the emotional climax, memorable moments to highlight in the chorus, or specific lyrical themes."
              badgeText="🎤 Voice Typing"
            />

            {/* Photo Uploads: ONLY FOR ULTIMATE GIFT */}
            {formData.packageId === 'ultimate' ? (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-purple-50/50 border border-amber-200 space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#FF9B24]" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Ultimate Gift: Photo Lyric Video Uploads (Up to 10 photos)
                  </h3>
                </div>
                <p className="text-xs text-slate-600">
                  Upload up to 10 photos of you and the recipient. These will be beautifully sequenced into your custom photo lyric video.
                </p>

                <div className="flex items-center gap-4">
                  <label className="cursor-pointer px-4 py-2.5 rounded-full bg-[#421078] text-white text-xs font-bold uppercase tracking-wider hover:bg-purple-900 transition-colors flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photos</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-xs text-slate-500 font-semibold">
                    {formData.photos.length} / 10 photos added
                  </span>
                </div>

                {formData.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                    {formData.photos.map((photo, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden aspect-square border border-slate-200 group">
                        <img src={photo} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F51B91] shrink-0" />
                <span>
                  Want a custom Photo Lyric Video? Upgrade to <strong>The Ultimate Gift</strong> package in Step 1.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 6: YOUR DETAILS */}
        {/* ========================================================= */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl font-bold text-[#421078]">Step 6: Your Contact Details</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Where should we send lyric drafts, notifications, and your finished song files?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => updateField('customerName', e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => updateField('customerEmail', e.target.value)}
                  placeholder="e.g. sarah.jenkins@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-800">
                  Mobile / Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => updateField('customerPhone', e.target.value)}
                  placeholder="e.g. +64 21 000 0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  We only use your phone number if urgent clarification on lyric pronunciations is needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 7: REVIEW & CONFIRM */}
        {/* ========================================================= */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-heading text-2xl font-bold text-[#421078]">Step 7: Review Your Order</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Please double-check all details before submitting. You will review and approve the lyrics before final production begins.
              </p>
            </div>

            <div className="bg-purple-50/40 rounded-2xl p-6 border border-purple-100 space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between border-b border-purple-200/60 pb-3">
                <span className="font-bold text-[#421078] text-base">{packagePrices[formData.packageId].name}</span>
                <span className="font-extrabold text-[#421078] text-lg">${packagePrices[formData.packageId].price.toFixed(2)} NZD</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 text-xs block">Recipient:</span>
                  <p className="font-bold text-slate-900">{formData.recipientName} ({formData.relationship})</p>
                  {formData.nickname && <p className="text-slate-600 text-xs">Nickname: {formData.nickname}</p>}
                </div>

                <div>
                  <span className="text-slate-500 text-xs block">Occasion:</span>
                  <p className="font-bold text-slate-900">{formData.occasion === 'Other' ? formData.occasionCustom : formData.occasion}</p>
                </div>

                <div>
                  <span className="text-slate-500 text-xs block">Style & Vibe:</span>
                  <p className="font-bold text-slate-900">
                    {formData.genre === 'Other' ? formData.genreCustom : formData.genre} · {formData.mood}
                  </p>
                  <p className="text-slate-600 text-xs">{formData.energy} · {formData.length}</p>
                </div>

                <div>
                  <span className="text-slate-500 text-xs block">Ordered By:</span>
                  <p className="font-bold text-slate-900">{formData.customerName}</p>
                  <p className="text-slate-600 text-xs">{formData.customerEmail}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-200/60">
                <span className="text-slate-500 text-xs block">Story Summary:</span>
                <p className="text-slate-700 mt-1 italic text-xs leading-relaxed">
                  "{formData.memories}"
                </p>
              </div>

              {formData.photos.length > 0 && (
                <div className="pt-2 border-t border-purple-200/60">
                  <span className="text-slate-500 text-xs block">Uploaded Photos for Video:</span>
                  <p className="font-semibold text-slate-800 text-xs">{formData.photos.length} photos ready</p>
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeAccuracy}
                  onChange={(e) => updateField('agreeAccuracy', e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#421078] focus:ring-[#421078]"
                />
                <span>
                  I confirm that all names, memories, and personal details provided are accurate.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => updateField('agreeTerms', e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#421078] focus:ring-[#421078]"
                />
                <span>
                  I agree to the <span className="underline font-bold text-[#421078]">Terms & Conditions</span> and <span className="underline font-bold text-[#421078]">Privacy Policy</span>. I understand that no payment has been taken at this stage until payment processing is configured.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* BOTTOM NAVIGATION CONTROLS */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #421078 0%, #F51B91 100%)',
              }}
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #421078 0%, #F51B91 50%, #FF9B24 100%)',
              }}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Order (${packagePrices[formData.packageId].price.toFixed(2)} NZD)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
