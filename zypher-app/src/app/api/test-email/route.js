import { Resend } from 'resend';
import { NextResponse } from 'next/server';

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}
const RESEND_FROM = process.env.RESEND_FROM || 'Zypher Admin <onboarding@resend.dev>';

export async function GET() {
  try {
    const resend = getResend();
    if (!resend) {
      return NextResponse.json({ success: false, error: 'RESEND_API_KEY is missing' }, { status: 500 });
    }

    const data = await resend.emails.send({
      from: RESEND_FROM,
      to: 'hkularatne2002@gmail.com', // your email here
      subject: 'Zypher Test Email',
      html: '<p>Hello Hansika 👋<br>This is a test email from your Zypher project.</p>',
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
