import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'LSUS Connect <onboarding@resend.dev>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Send verification email
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your LSUS Connect account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 32px; font-weight: bold; }
              .yellow { color: #FDD023; }
              .purple { color: #461D7C; }
              .button { display: inline-block; padding: 15px 30px; background-color: #FDD023; color: black; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">
                  <span class="yellow">LSUS</span> <span class="purple">CONNECT</span>
                </div>
              </div>
              
              <h2 style="color: #461D7C;">Welcome to LSUS Connect!</h2>
              
              <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              
              <p style="margin-top: 30px; color: #666;">This link will expire in 24 hours.</p>
              
              <div class="footer">
                <p>If you didn't create an account, you can safely ignore this email.</p>
                <p>&copy; 2026 LSUS Connect. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Verification email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your LSUS Connect password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 32px; font-weight: bold; }
              .yellow { color: #FDD023; }
              .purple { color: #461D7C; }
              .button { display: inline-block; padding: 15px 30px; background-color: #FDD023; color: black; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
              .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">
                  <span class="yellow">LSUS</span> <span class="purple">CONNECT</span>
                </div>
              </div>
              
              <h2 style="color: #461D7C;">Reset Your Password</h2>
              
              <p>We received a request to reset your password. Click the button below to create a new password.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetUrl}</p>
              
              <p style="margin-top: 30px; color: #666;">This link will expire in 1 hour.</p>
              
              <div class="footer">
                <p>If you didn't request a password reset, you can safely ignore this email.</p>
                <p>&copy; 2026 LSUS Connect. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log('Password reset email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}