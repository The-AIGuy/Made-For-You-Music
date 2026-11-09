/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { sendGmailEmail } from '../lib/gmail.js';
import {
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface ContactPageProps {
  navigate: (path: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ navigate }) => {
  const { user, isGoogleConnected, connectGoogle } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Send via Gmail modal confirmation
  const [showGmailConfirm, setShowGmailConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all contact fields.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.submitEnquiry({
        name,
        email,
        subject,
        message,
      });
      setSuccess(res.message);
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendViaGmailDirectly = async () => {
    setShowGmailConfirm(false);
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!isGoogleConnected) {
        await connectGoogle();
      }

      // Send to hello@madeforyoumusic.co.nz via Gmail API
      await sendGmailEmail({
        to: 'hello@madeforyoumusic.co.nz',
        subject: `[Customer Contact] ${subject}`,
        htmlBody: `
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr/>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `,
        type: 'CONTACT_ENQUIRY',
      });

      // Also record in database
      await api.submitEnquiry({ name, email, subject, message });

      setSuccess('Your message has been sent directly to hello@madeforyoumusic.co.nz via Gmail and recorded in our database!');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(`Gmail dispatch note: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#421078] text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5 text-[#F51B91]" />
          Direct Songwriter Contact
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#421078]">
          Contact Us
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Have a question about packages, turnaround times, or custom musical requests? Send a message directly to our production team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#421078] to-[#1B0533] text-white p-8 rounded-3xl shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFD52A]">M4UM Studio</span>
            <h3 className="font-heading text-2xl font-bold">Made For You Music</h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              We personally review every enquiry and reply promptly with creative suggestions.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-purple-100">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#FF9B24] shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300 text-[11px]">Email Address</p>
                <a href="mailto:hello@madeforyoumusic.co.nz" className="font-bold text-white hover:underline text-sm">
                  hello@madeforyoumusic.co.nz
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#08BFE8] shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-300 text-[11px]">Headquarters & Location</p>
                <p className="font-bold text-white text-sm">Aotearoa New Zealand</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-xs text-purple-200 space-y-1">
            <p className="font-bold text-white">Turnaround Times:</p>
            <p>• Standard Packages: 3–5 business days</p>
            <p>• The Ultimate Gift: 2–3 business days (Priority)</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-purple-100 p-8 shadow-xs space-y-6">
          <h3 className="font-heading font-bold text-2xl text-[#421078]">Send A Message</h3>

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Your Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#421078]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sarah.jenkins@example.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#421078]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Subject <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Inquiry regarding 50th golden wedding anniversary"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#421078]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Message <span className="text-red-500">*</span></label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you have in mind..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#421078]"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider bg-[#421078] hover:bg-purple-900 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
                    setError('Please fill in all contact fields before sending via Gmail.');
                    return;
                  }
                  setShowGmailConfirm(true);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-full text-slate-700 text-xs font-bold border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#F51B91]" />
                <span>Send via Connected Gmail</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Gmail Confirm Modal */}
      {showGmailConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl border border-purple-100">
            <h3 className="font-bold text-lg text-slate-900">Send Enquiry from Gmail?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will send your message directly to <strong>hello@madeforyoumusic.co.nz</strong> from your authorized Gmail account with subject <strong>"{subject}"</strong>.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowGmailConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendViaGmailDirectly}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#421078] hover:bg-purple-900 shadow-sm"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
