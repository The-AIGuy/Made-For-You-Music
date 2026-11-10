/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { Order } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { sendGmailEmail, createOrderConfirmationHtml } from '../lib/gmail.js';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Music,
  Compass,
  Mail,
  Copy,
  Check,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface OrderConfirmationPageProps {
  order?: Order;
  navigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order, navigate }) => {
  const { user, isGmailConnected, connectGmail } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState(false);

  // Fallback demo order if visited directly
  const displayOrder: Partial<Order> = order || {
    reference: 'M4UM-2026-1042',
    recipientName: 'David & Sarah',
    packageName: 'The Signature Song',
    price: 54.99,
    occasion: 'Anniversary',
    genre: 'Acoustic / Folk',
    mood: 'Heartfelt',
    customerEmail: user?.email || 'sarah.jenkins@example.com',
    createdAt: new Date().toISOString(),
  };

  const copyReference = () => {
    if (displayOrder.reference) {
      navigator.clipboard.writeText(displayOrder.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendGmailNotification = async () => {
    setShowEmailConfirmModal(false);
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      if (!isGmailConnected) {
        await connectGmail();
      }
      const html = createOrderConfirmationHtml(
        displayOrder.reference || 'M4UM-2026-XXXX',
        displayOrder.recipientName || 'Your Recipient',
        displayOrder.packageName || 'Personal Song',
        displayOrder.price || 34.99
      );
      await sendGmailEmail({
        to: displayOrder.customerEmail || 'customer@example.com',
        subject: `M4UM Order Confirmation – ${displayOrder.reference}`,
        htmlBody: html,
        type: 'ORDER_CONFIRMATION',
        orderReference: displayOrder.reference,
      });
      setEmailStatus('Confirmation email sent successfully via connected Gmail!');
    } catch (err: any) {
      setEmailStatus(`Gmail notification note: ${err.message || 'Could not send via Gmail'}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
      <div className="bg-white rounded-3xl border border-purple-100 p-8 sm:p-12 shadow-md text-center space-y-8">
        {/* Celebration icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#F51B91]">Order Confirmed</span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#421078]">
            Your Story Is In Good Hands.
          </h1>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            We have received your custom song details and our songwriting team is preparing your original lyrics.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-pink-50/30 border border-purple-200/80 max-w-md mx-auto space-y-3">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
            Your Unique Order Reference
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="font-heading text-2xl sm:text-3xl font-extrabold text-[#421078] tracking-tight">
              {displayOrder.reference}
            </span>
            <button
              onClick={copyReference}
              className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-100 transition-colors"
              title="Copy reference"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            Keep this reference safe. You can use it anytime to track progress without logging in.
          </p>
        </div>

        {/* Order Summary Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Recipient</span>
            <p className="font-bold text-slate-800">{displayOrder.recipientName}</p>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Package</span>
            <p className="font-bold text-slate-800">{displayOrder.packageName}</p>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Occasion</span>
            <p className="font-bold text-slate-800">{displayOrder.occasion}</p>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Total</span>
            <p className="font-bold text-[#421078]">${displayOrder.price?.toFixed(2)} NZD</p>
          </div>
        </div>

        {/* Next Steps Timeline */}
        <div className="text-left space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm">What happens next?</h3>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 text-[#421078] font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <p className="font-bold text-slate-800">Lyric Crafting & Sharing</p>
                <p>Our team crafts original lyrics incorporating your submitted memories and inside jokes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-pink-100 text-[#F51B91] font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <p className="font-bold text-slate-800">You Review & Approve The Lyrics</p>
                <p>You review the lyrics in your customer portal. Music production will only begin once you approve!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-[#FF9B24] font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <p className="font-bold text-slate-800">Audio Production & Delivery</p>
                <p>We produce, engineer, and quality-check your finished MP3, cover art, and printable lyric sheets.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gmail Notification Option */}
        <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#421078]" />
              <span className="font-bold text-xs text-slate-900">Email Notification</span>
            </div>
            <button
              onClick={() => setShowEmailConfirmModal(true)}
              disabled={isSendingEmail}
              className="text-xs font-bold text-[#421078] hover:text-[#F51B91] underline"
            >
              {isSendingEmail ? 'Dispatching...' : 'Send confirmation to my email'}
            </button>
          </div>
          {emailStatus && (
            <p className="text-[11px] font-semibold text-emerald-700">{emailStatus}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
            className="w-full sm:w-auto px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #421078 0%, #F51B91 100%)',
            }}
          >
            <span>Go to Customer Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/track')}
            className="w-full sm:w-auto px-6 py-3 rounded-full text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Compass className="w-4 h-4 text-[#08BFE8]" />
            <span>Track Order Status</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for sending email via Gmail */}
      {showEmailConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-purple-100">
            <h3 className="font-bold text-lg text-slate-900">Send Email via Gmail?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will send an official order confirmation receipt to <strong>{displayOrder.customerEmail}</strong> with order reference <strong>{displayOrder.reference}</strong> using your connected Gmail account.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowEmailConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendGmailNotification}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#421078] hover:bg-purple-900 shadow-sm"
              >
                Confirm & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
