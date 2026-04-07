import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string, name: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'StartupOps <noreply@startupops.com>',
    to: email,
    subject: 'Your OTP Code - StartupOps',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; border: 2px solid #2563eb; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>StartupOps</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Your One-Time Password (OTP) for signing in to StartupOps is:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} StartupOps. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send workspace invitation email
export async function sendInviteEmail(
  email: string,
  inviterName: string,
  workspaceName: string,
  inviteLink: string,
  customMessage?: string
) {
  const mailOptions = {
    from: process.env.SMTP_FROM || 'StartupOps <noreply@startupops.com>',
    to: email,
    subject: `${inviterName} invited you to join ${workspaceName} on StartupOps`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; }
            .message-box { background: #f3f4f6; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; font-style: italic; }
            .button { background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">StartupOps</h1>
            </div>
            <div class="content">
              <h2>You're Invited! 🎉</h2>
              <p><strong>${inviterName}</strong> has invited you to join the <strong>${workspaceName}</strong> workspace on StartupOps.</p>
              ${customMessage ? `<div class="message-box">"${customMessage}"</div>` : ''}
              <p>StartupOps helps early-stage founders manage execution, validate ideas, and collaborate with their teams.</p>
              <div style="text-align: center;">
                <a href="${inviteLink}" class="button">Join Workspace</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Or copy this link: <a href="${inviteLink}">${inviteLink}</a></p>
              <p style="color: #6b7280; font-size: 14px;">This invitation expires in 7 days.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} StartupOps. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Invitation email sent to:', email);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    console.warn('Email sending failed, but invite link is still valid');
  }
}
