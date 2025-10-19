import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: 'Zypher Admin <onboarding@resend.dev>',
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
