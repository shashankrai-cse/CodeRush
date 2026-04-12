// ─────────────────────────────────────────────────────────
// Email Notification Utility – Resend API
// Gracefully skips if API key is not configured.
// ─────────────────────────────────────────────────────────

import { Resend } from 'resend';
import env from '../config/env.js';

let resend = null;

if (env.resendApiKey) {
  resend = new Resend(env.resendApiKey);
  console.log('📧 Resend email service configured.');
} else {
  console.warn('⚠️  RESEND_API_KEY not set. Email notifications disabled.');
}

// ── Core send function ──────────────────────────────────
export async function sendMail(to, subject, html) {
  if (!resend) return; // graceful skip
  try {
    const { data, error } = await resend.emails.send({
      from: 'Smart Campus OS <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    if (error) {
      console.error(`[Email] Resend error for ${to}:`, JSON.stringify(error));
    } else {
      console.log(`[Email] ✅ Delivered to ${to} (id: ${data?.id})`);
    }
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
}

// ── Send to multiple recipients in parallel ─────────────
export async function sendBulkMail(recipients, subject, htmlContent) {
  if (!resend || !recipients.length) return;
  const promises = recipients.map(r => {
    return sendMail(r.email, subject, htmlContent);
  });
  await Promise.allSettled(promises);
  console.log(`[Email] Sent "${subject}" to ${recipients.length} recipients.`);
}

// ── Premium HTML Email Template ─────────────────────────
export function buildEmailHTML({ type, icon, title, details, ctaText }) {
  const typeColors = {
    assignment: { bg: '#eff6ff', accent: '#2563eb', badge: '#dbeafe' },
    notice:     { bg: '#fefce8', accent: '#ca8a04', badge: '#fef9c3' },
    practical:  { bg: '#f0fdf4', accent: '#16a34a', badge: '#dcfce7' },
    class:      { bg: '#faf5ff', accent: '#9333ea', badge: '#f3e8ff' },
  };
  const colors = typeColors[type] || typeColors.assignment;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:2rem auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#111827,#1f2937);padding:1.5rem 2rem;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.1);border-radius:10px;padding:0.5rem 1.2rem;margin-bottom:0.5rem;">
        <span style="color:#f4e8d1;font-size:1.1rem;font-weight:800;letter-spacing:0.02em;">● Smart Campus OS</span>
      </div>
      <div style="color:rgba(255,255,255,0.6);font-size:0.82rem;margin-top:0.3rem;">Intelligent Campus Notification</div>
    </div>

    <!-- Body -->
    <div style="padding:2rem;">
      <!-- Type Badge -->
      <div style="display:inline-block;background:${colors.badge};color:${colors.accent};padding:0.35rem 0.9rem;border-radius:99px;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:1rem;">
        ${icon} ${type}
      </div>

      <!-- Title -->
      <h1 style="margin:0 0 1rem;font-size:1.4rem;font-weight:800;color:#111827;line-height:1.3;">${title}</h1>

      <!-- Details -->
      <div style="background:${colors.bg};border-radius:12px;padding:1.2rem;border-left:4px solid ${colors.accent};margin-bottom:1.5rem;">
        ${details.map(d => `
          <div style="margin-bottom:0.6rem;">
            <span style="color:${colors.accent};font-weight:700;font-size:0.85rem;">${d.label}: </span>
            <span style="color:#374151;font-size:0.85rem;">${d.value}</span>
          </div>
        `).join('')}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-top:1.5rem;">
        <a href="${env.clientOrigin}" style="display:inline-block;background:${colors.accent};color:#fff;padding:0.75rem 2rem;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.9rem;">
          ${ctaText || 'Open Dashboard →'}
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:1.2rem 2rem;text-align:center;border-top:1px solid #f3f4f6;">
      <p style="margin:0;color:#9ca3af;font-size:0.75rem;">
        This is an automated notification from Smart Campus OS.<br/>
        Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;
}
