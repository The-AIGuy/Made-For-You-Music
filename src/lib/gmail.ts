/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAccessToken } from './firebase.js';
import { api } from './api.js';

/**
 * Encodes string to RFC 4648 Base64URL
 */
function toBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Builds standard MIME RFC 2822 email payload
 */
export function buildMimeMessage({
  to,
  subject,
  htmlBody,
  senderName = 'Made For You Music (M4UM)',
}: {
  to: string;
  subject: string;
  htmlBody: string;
  senderName?: string;
}): string {
  const boundary = `----=_Part_${Date.now()}`;
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const lines = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody.replace(/<[^>]*>?/gm, ''), // plain text fallback
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ];

  return toBase64Url(lines.join('\r\n'));
}

/**
 * Sends email directly through Gmail API using the client's cached OAuth token
 */
export async function sendGmailEmail({
  to,
  subject,
  htmlBody,
  type,
  orderReference,
}: {
  to: string;
  subject: string;
  htmlBody: string;
  type: string;
  orderReference?: string;
}): Promise<{ success: boolean; messageId?: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Gmail is not connected. Please sign in with your Google account.');
  }

  const rawMessage = buildMimeMessage({ to, subject, htmlBody });

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawMessage }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gmail API error (${res.status})`);
  }

  const data = await res.json();

  // Log in application audit trail
  await api.logGmailDispatch({
    toEmail: to,
    subject,
    type,
    orderReference,
  }).catch(() => {});

  return { success: true, messageId: data.id };
}

// Branded email templates
export function createOrderConfirmationHtml(orderRef: string, recipientName: string, packageName: string, price: number): string {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: #421078; padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">M4UM</h1>
        <p style="color: #FFD52A; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Made For You Music · By TMG®</p>
      </div>
      <div style="padding: 32px 24px; color: #1e1b4b;">
        <h2 style="font-size: 20px; color: #421078; margin-top: 0;">Order Received! Reference: ${orderRef}</h2>
        <p style="font-size: 15px; line-height: 1.6;">Kia ora! Thank you for choosing Made For You Music to create a one-of-a-kind musical gift for <strong>${recipientName}</strong>.</p>
        
        <div style="background: #fbfaff; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #e0dcf2;">
          <h3 style="margin-top: 0; font-size: 16px; color: #421078;">Order Summary</h3>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Package:</strong> ${packageName}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Recipient:</strong> ${recipientName}</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Total:</strong> $${price.toFixed(2)} NZD</p>
          <p style="margin: 6px 0; font-size: 14px;"><strong>Status:</strong> New Order · In Creative Queue</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;"><strong>Next step:</strong> Our songwriters will craft original personalised lyrics based on your story. We will notify you when lyrics are ready for your review and approval before any audio production begins.</p>
        
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
          <p style="margin: 0;">Made For You Music · Aotearoa New Zealand · hello@madeforyoumusic.co.nz</p>
          <p style="margin: 4px 0 0 0;">© 2026 TMG Enterprises, LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}

export function createLyricsReadyHtml(orderRef: string, recipientName: string, versionNumber: number): string {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: #421078; padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">M4UM</h1>
        <p style="color: #FF9B24; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase;">Made For You Music · By TMG®</p>
      </div>
      <div style="padding: 32px 24px; color: #1e1b4b;">
        <h2 style="font-size: 20px; color: #F51B91; margin-top: 0;">Lyrics Ready for Your Review!</h2>
        <p style="font-size: 15px; line-height: 1.6;">Kia ora! Our songwriting team has finished <strong>Version ${versionNumber}</strong> of your personalised lyrics for <strong>${recipientName}</strong> (Order ${orderRef}).</p>
        
        <p style="font-size: 15px; line-height: 1.6;">Please log into your customer dashboard to review the lyrics. You can approve them with a single click or request refinements based on your package inclusions.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="/login" style="background: #421078; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: bold; font-size: 15px; display: inline-block;">Review Lyrics in Dashboard</a>
        </div>

        <p style="font-size: 13px; color: #6b7280; line-height: 1.5;">Remember: Audio production and sound engineering only begin once you give your final lyric approval.</p>

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
          <p style="margin: 0;">© 2026 TMG Enterprises, LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}

export function createSongDeliveredHtml(orderRef: string, recipientName: string, songTitle: string): string {
  return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: #421078; padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">M4UM</h1>
        <p style="color: #08BFE8; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase;">Digital Gift Delivery</p>
      </div>
      <div style="padding: 32px 24px; color: #1e1b4b;">
        <h2 style="font-size: 20px; color: #421078; margin-top: 0;">Your Personalised Song is Ready! 🎵</h2>
        <p style="font-size: 15px; line-height: 1.6;">Kia ora! <strong>"${songTitle}"</strong> created for <strong>${recipientName}</strong> (Order ${orderRef}) has completed final quality check and mastering.</p>
        
        <p style="font-size: 15px; line-height: 1.6;">Your high-definition MP3, custom cover artwork, and printable lyrics sheet are ready to stream and download right now in your customer portal.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="/login" style="background: #F51B91; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: bold; font-size: 15px; display: inline-block;">Listen & Download Files</a>
        </div>

        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
          <p style="margin: 0;">© 2026 TMG Enterprises, LLC. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
}
