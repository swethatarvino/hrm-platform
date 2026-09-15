/**
 * Email Service
 * SMTP credentials stay on the local/server backend. The browser only calls
 * the same-origin email endpoint and never receives the SMTP password.
 */

export interface WelcomeEmailParams {
  recipientPersonalEmail: string;
  recipientName: string;
  officeEmail: string;
  tempPassword: string;
  companyName?: string;
  loginUrl?: string;
}

export interface PasswordResetEmailParams {
  recipientPersonalEmail: string;
  recipientName: string;
  resetCode: string;
  companyName?: string;
}

export function getEmailDeliveryError(error: unknown): string {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Email server is not running. Start it with: npm run dev:email';
  }
  return error instanceof Error ? error.message : 'SMTP delivery failed.';
}

export function isEmailConfigured(): boolean {
  return true;
}

export function initEmailService(): void {
  console.info('[EmailService] SMTP delivery uses the /api/email endpoint.');
}

/**
 * Sends a real welcome credentials email to the employee's personal email.
 * Returns { success, error? }.
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, loginUrl: params.loginUrl || (typeof window !== 'undefined' ? window.location.origin : '') }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Email server returned ${response.status}`);
    return { success: true };
  } catch (error: unknown) {
    const errMsg = getEmailDeliveryError(error);
    console.error('[EmailService] Failed to send welcome email:', errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Sends a real password reset code email to the employee's personal email.
 * Returns { success, error? }.
 */
export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/email/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || `Email server returned ${response.status}`);
    return { success: true };
  } catch (error: unknown) {
    const errMsg = getEmailDeliveryError(error);
    console.error('[EmailService] Failed to send password reset email:', errMsg);
    return { success: false, error: errMsg };
  }
}
