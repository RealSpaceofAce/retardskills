import 'server-only';

import { Resend } from 'resend';

import { escapeHtml, sanitizeEmailText } from './html';

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content?: string;
    path?: string;
    contentId?: string;
  }>;
}

interface WelcomeEmailOptions {
  to: string;
  agentName?: string;
}

interface ProHumanFallbackEmailOptions {
  to: string;
  agentName?: string;
  updates: Array<{
    id: string;
    type: string;
    title: string;
    summary: string;
    priority: number;
    recommendedAction: string;
  }>;
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { data, error } = await getResendClient().emails.send({
      from: process.env.RESEND_FROM ?? 'Retard Skills <noreply@retardskills.com>',
      to: options.to,
      subject: sanitizeEmailText(options.subject),
      html: options.html,
      attachments: options.attachments,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email error';
    return { success: false, error: message };
  }
}

interface EditionEmailOptions {
  to: string;
  editionNumber: number;
  featuredAgent: string;
  strategy: string;
  keyInsight: string;
  tools: string[];
  implementationTime: string;
  agentName?: string;
}

export async function sendEditionEmail(options: EditionEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const editionLabel = `#${String(options.editionNumber).padStart(3, '0')}`;
  const featuredAgent = escapeHtml(options.featuredAgent);
  const strategy = escapeHtml(options.strategy);
  const keyInsight = escapeHtml(options.keyInsight);
  const tools = options.tools.map((tool) => escapeHtml(tool));
  const implementationTime = escapeHtml(options.implementationTime);
  const agentName = options.agentName ? escapeHtml(options.agentName) : undefined;

  const subject = `BossMode ${editionLabel}: ${options.strategy}`;
  const html = `
    <div style="font-family: monospace; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e4e4e7; padding: 32px;">
      <h1 style="color: #4B6BFF; font-size: 24px;">BossMode ${editionLabel}</h1>
      <h2 style="color: #22c55e; font-size: 18px;">Featured: ${featuredAgent}</h2>
      <p style="color: #a1a1aa;"><strong>Strategy:</strong> ${strategy}</p>
      <p style="color: #a1a1aa;"><strong>Key Insight:</strong> ${keyInsight}</p>
      <p style="color: #a1a1aa;"><strong>Tools:</strong> ${tools.join(', ')}</p>
      <p style="color: #a1a1aa;"><strong>Implementation Time:</strong> ${implementationTime}</p>
      <hr style="border-color: #27272a; margin: 24px 0;" />
      <p style="color: #71717a; font-size: 12px;">
        Your agent${agentName ? ` (${agentName})` : ''} received the full JSON payload. This is the human-readable summary.
      </p>
      <p style="color: #71717a; font-size: 12px;">
        <a href="https://bossmode.ing" style="color: #4B6BFF;">bossmode.ing</a>
      </p>
    </div>
  `;

  return sendEmail({ to: options.to, subject, html });
}

export async function sendWelcomeEmail(options: WelcomeEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, agentName } = options;
  const safeAgentName = agentName ? escapeHtml(agentName) : undefined;

  const subject = `Welcome to BossMode!${agentName ? ` - ${agentName}` : ''}`;
  const html = `
    <div style="font-family: monospace; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4B6BFF;">Welcome to BossMode!</h1>
      <p>Your agent${safeAgentName ? ` ${safeAgentName}` : ''} is now subscribed to the newsletter for AI agents that want to make more money.</p>
      <p>You'll receive:</p>
      <ul>
        <li>Weekly strategies from winning agents</li>
        <li>Revenue breakdowns and case studies</li>
        <li>Implementation guides</li>
      </ul>
      <p style="color: #666; margin-top: 30px;">
        Questions? Reply to this email.
      </p>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

export async function sendProHumanFallbackEmail(
  options: ProHumanFallbackEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const updateCount = options.updates.length;
  const safeAgentName = options.agentName ? escapeHtml(options.agentName) : undefined;
  const subject = updateCount === 1
    ? `BossMode: 1 high-priority update${options.agentName ? ` for ${options.agentName}` : ''}`
    : `BossMode: ${updateCount} high-priority updates${options.agentName ? ` for ${options.agentName}` : ''}`;

  const updateHtml = options.updates
    .slice(0, 3)
    .map((update) => {
      const title = escapeHtml(update.title);
      const summary = escapeHtml(update.summary);
      const action = escapeHtml(update.recommendedAction);
      const type = escapeHtml(update.type.replace(/_/g, ' '));

      return `
        <div style="border: 1px solid #27272a; padding: 16px; margin: 0 0 16px; background: #09090b;">
          <div style="color: #4B6BFF; font-weight: 700; margin-bottom: 8px;">${title}</div>
          <p style="color: #a1a1aa; margin: 0 0 8px;"><strong>Type:</strong> ${type} &middot; <strong>Priority:</strong> ${update.priority}</p>
          <p style="color: #d4d4d8; margin: 0 0 12px;">${summary}</p>
          <p style="color: #22c55e; margin: 0;"><strong>Recommended next step:</strong> ${action}</p>
        </div>
      `;
    })
    .join('');

  const html = `
    <div style="font-family: monospace; max-width: 640px; margin: 0 auto; background: #0a0a0a; color: #e4e4e7; padding: 32px;">
      <h1 style="color: #4B6BFF; font-size: 24px; margin-top: 0;">BossMode high-priority fallback</h1>
      <p style="color: #d4d4d8;">
        Your agent${safeAgentName ? ` ${safeAgentName}` : ''} is still the primary delivery target. This email only fired because operator fallback is enabled and new high-priority items were detected.
      </p>
      ${updateHtml}
      <p style="color: #71717a; font-size: 12px; margin-top: 24px;">
        Your local agent should continue polling BossMode on heartbeat or cron and acknowledge items after acting.
      </p>
    </div>
  `;

  return sendEmail({ to: options.to, subject, html });
}

// Welcome sequence emails
interface SequenceEmailOptions {
  to: string;
  agentName?: string;
  step: number;
}

export async function sendSequenceEmail(options: SequenceEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { to, agentName, step } = options;
  const safeAgentName = agentName ? escapeHtml(agentName) : undefined;
  
  const emails: Record<number, { subject: string; html: string }> = {
    1: {
      subject: "🦞 Day 1: How to get the most out of BossMode",
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e4e4e7; padding: 32px;">
          <h1 style="color: #4B6BFF;">How Your Agent Will Learn</h1>
          <p>Hey! Your agent${safeAgentName ? ` ${safeAgentName}` : ''} is now part of the BossMode network.</p>
          <p>Here's what happens next:</p>
          <ul style="color: #a1a1aa;">
            <li><strong style="color: #22c55e;">Every edition</strong> — Your agent receives a JSON payload with actionable strategies</li>
            <li><strong style="color: #22c55e;">You get summaries</strong> — Human-readable versions land in your inbox</li>
            <li><strong style="color: #22c55e;">Your agent implements</strong> — The strategies are structured for immediate action</li>
          </ul>
          <p style="color: #4B6BFF; margin-top: 20px;">First edition drops soon. Your agent will be ready.</p>
          <hr style="border-color: #27272a; margin: 24px 0;" />
          <p style="color: #71717a; font-size: 12px;">
            <a href="https://bossmode.ing" style="color: #4B6BFF;">bossmode.ing</a>
          </p>
        </div>
      `,
    },
    2: {
      subject: "🦞 Day 3: What winning agents do differently",
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e4e4e7; padding: 32px;">
          <h1 style="color: #4B6BFF;">The Pattern We're Seeing</h1>
          <p>After studying dozens of profitable AI agents, here's what separates winners from the rest:</p>
          <ol style="color: #a1a1aa;">
            <li><strong style="color: #22c55e;">They batch API calls</strong> — Cutting costs by 40%+ with smart timing</li>
            <li><strong style="color: #22c55e;">They compound learning</strong> — Every interaction makes them smarter</li>
            <li><strong style="color: #22c55e;">They share playbooks</strong> — Learning from each other's wins</li>
          </ol>
          <p>Your agent${safeAgentName ? ` ${safeAgentName}` : ''} is about to learn these exact strategies.</p>
          <p style="color: #4B6BFF; margin-top: 20px;">Stay tuned for detailed breakdowns.</p>
          <hr style="border-color: #27272a; margin: 24px 0;" />
          <p style="color: #71717a; font-size: 12px;">
            <a href="https://bossmode.ing" style="color: #4B6BFF;">bossmode.ing</a>
          </p>
        </div>
      `,
    },
    3: {
      subject: "🦞 Day 7: Your agent is ready",
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e4e4e7; padding: 32px;">
          <h1 style="color: #4B6BFF;">One Week In</h1>
          <p>Your agent${safeAgentName ? ` ${safeAgentName}` : ''} has been subscribed for a week now.</p>
          <p style="color: #a1a1aa;">By now, you should have received your first edition (or it's coming very soon).</p>
          <h2 style="color: #22c55e; font-size: 18px;">Quick check:</h2>
          <ul style="color: #a1a1aa;">
            <li>Is your agent processing the JSON payloads?</li>
            <li>Are the strategies being implemented?</li>
            <li>Any questions about the format?</li>
          </ul>
          <p>Just reply to this email if you need help. We read every message.</p>
          <p style="color: #4B6BFF; margin-top: 20px;">Let's make your agent profitable. 🦞</p>
          <hr style="border-color: #27272a; margin: 24px 0;" />
          <p style="color: #71717a; font-size: 12px;">
            <a href="https://bossmode.ing" style="color: #4B6BFF;">bossmode.ing</a>
          </p>
        </div>
      `,
    },
  };

  const email = emails[step];
  if (!email) {
    return { success: false, error: `Invalid sequence step: ${step}` };
  }

  return sendEmail({ to, subject: email.subject, html: email.html });
}

interface BetaSignupConfirmationOptions {
  to: string;
  name: string;
  agentName: string;
}

export async function sendBetaSignupConfirmation(options: BetaSignupConfirmationOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const safeName = escapeHtml(options.name);
  const safeAgentName = escapeHtml(options.agentName);

  const subject = `We received your BossMode beta application`;
  const html = `
    <div style="font-family: monospace; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e4e4e7; padding: 32px;">
      <h1 style="color: #4B6BFF; font-size: 24px; margin-top: 0;">We received your application, ${safeName}.</h1>
      <p style="color: #d4d4d8;">Thanks for applying to the BossMode beta.</p>
      <div style="border: 1px solid #27272a; padding: 16px; margin: 24px 0; background: #09090b;">
        <p style="color: #a1a1aa; margin: 0 0 8px;"><strong style="color: #e4e4e7;">Agent:</strong> ${safeAgentName}</p>
      </div>
      <p style="color: #a1a1aa;">Here&apos;s what happens next:</p>
      <ul style="color: #a1a1aa; line-height: 1.8;">
        <li>Our team reviews applications on a rolling basis.</li>
        <li>If you&apos;re approved, we&apos;ll email your access token and onboarding steps.</li>
        <li>You don&apos;t need to do anything else until you hear from us.</li>
      </ul>
      <p style="color: #d4d4d8; margin-top: 24px;">
        In the meantime, check out what BossMode actually does at
        <a href="https://bossmode.ing" style="color: #4B6BFF;">bossmode.ing</a>.
      </p>
      <hr style="border-color: #27272a; margin: 24px 0;" />
      <p style="color: #71717a; font-size: 12px;">
        You applied for the BossMode beta. If this wasn't you, ignore this email.
      </p>
    </div>
  `;

  return sendEmail({ to: options.to, subject, html });
}

interface BetaAdminNotificationOptions {
  name: string;
  email: string;
  agentName: string;
  goal: string;
  totalCount: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmLandingPath?: string;
  utmReferrer?: string;
}

export async function sendBetaAdminNotification(options: BetaAdminNotificationOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail) {
    return { success: false, error: 'ADMIN_NOTIFICATION_EMAIL is not set' };
  }

  const safeName = escapeHtml(options.name);
  const safeEmail = escapeHtml(options.email);
  const safeAgentName = escapeHtml(options.agentName);
  const safeGoal = escapeHtml(options.goal);
  const safeUtmSource = options.utmSource ? escapeHtml(options.utmSource) : null;
  const safeUtmMedium = options.utmMedium ? escapeHtml(options.utmMedium) : null;
  const safeUtmCampaign = options.utmCampaign ? escapeHtml(options.utmCampaign) : null;
  const safeUtmLandingPath = options.utmLandingPath ? escapeHtml(options.utmLandingPath) : null;
  const safeUtmReferrer = options.utmReferrer ? escapeHtml(options.utmReferrer) : null;
  const hasUtmData = Boolean(safeUtmSource || safeUtmMedium || safeUtmCampaign || safeUtmLandingPath || safeUtmReferrer);

  const subject = `New beta application: ${options.name} (${options.agentName})`;
  const html = `
    <div style="font-family: monospace; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #e4e4e7; padding: 32px;">
      <h1 style="color: #22c55e; font-size: 20px; margin-top: 0;">New beta application #${options.totalCount}</h1>
      <div style="border: 1px solid #27272a; padding: 16px; background: #09090b;">
        <p style="margin: 0 0 8px;"><strong style="color: #e4e4e7;">Name:</strong> <span style="color: #a1a1aa;">${safeName}</span></p>
        <p style="margin: 0 0 8px;"><strong style="color: #e4e4e7;">Email:</strong> <span style="color: #a1a1aa;">${safeEmail}</span></p>
        <p style="margin: 0 0 8px;"><strong style="color: #e4e4e7;">Agent name:</strong> <span style="color: #a1a1aa;">${safeAgentName}</span></p>
        <p style="margin: 0;"><strong style="color: #e4e4e7;">Goal:</strong> <span style="color: #a1a1aa;">${safeGoal}</span></p>
        ${hasUtmData ? `
        <hr style="border-color: #27272a; margin: 12px 0;" />
        <p style="margin: 0 0 8px;"><strong style="color: #e4e4e7;">UTM source:</strong> <span style="color: #a1a1aa;">${safeUtmSource ?? '—'}</span></p>
        <p style="margin: 0 0 8px;"><strong style="color: #e4e4e7;">UTM medium:</strong> <span style="color: #a1a1aa;">${safeUtmMedium ?? '—'}</span></p>
        <p style="margin: 0 0 8px;"><strong style="color: #e4e4e7;">UTM campaign:</strong> <span style="color: #a1a1aa;">${safeUtmCampaign ?? '—'}</span></p>
        <p style="margin: 0 0 8px;"><strong style="color: #e4e4e7;">Landing path:</strong> <span style="color: #a1a1aa;">${safeUtmLandingPath ?? '—'}</span></p>
        <p style="margin: 0;"><strong style="color: #e4e4e7;">Referrer:</strong> <span style="color: #a1a1aa;">${safeUtmReferrer ?? '—'}</span></p>` : ''}
      </div>
      <p style="color: #71717a; font-size: 12px; margin-top: 24px;">
        Total beta applications: ${options.totalCount}
      </p>
    </div>
  `;

  return sendEmail({ to: adminEmail, subject, html });
}

// ---------------------------------------------------------------------------
// sendInviteEmail — Wave 29 team invite MVP
// ---------------------------------------------------------------------------

interface InviteEmailOptions {
  to: string;
  invitedByName: string;
  joinUrl: string;
  role: string;
}

export async function sendInviteEmail(options: InviteEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `${sanitizeEmailText(options.invitedByName)} invited you to BossMode`;

  const safeInvitedBy = escapeHtml(options.invitedByName);
  const safeJoinUrl = escapeHtml(options.joinUrl);
  const safeRole = escapeHtml(options.role);

  const html = `
    <div style="background:#111111;color:#E3E3E3;font-family:monospace;max-width:560px;margin:0 auto;padding:40px 32px;border:1px solid rgba(227,227,227,0.15);">
      <div style="margin-bottom:28px;">
        <img src="https://bossmode.ing/images/bossmode-logo-header-menu.png" alt="BossMode" style="height:40px;width:auto;" />
      </div>

      <h1 style="font-size:18px;font-weight:600;letter-spacing:0.05em;color:#E3E3E3;margin:0 0 16px;">
        YOU HAVE BEEN INVITED
      </h1>

      <p style="font-size:13px;line-height:1.7;color:rgba(227,227,227,0.65);margin:0 0 24px;">
        <strong style="color:#E3E3E3;">${safeInvitedBy}</strong> has invited you to join their BossMode workspace as a <strong style="color:#E3E3E3;">${safeRole}</strong>.
      </p>

      <a href="${safeJoinUrl}" style="display:inline-block;background:#4B6BFF;color:#E3E3E3;font-family:monospace;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;padding:14px 28px;text-decoration:none;border:1px solid #4B6BFF;">
        ACCEPT INVITATION →
      </a>

      <p style="font-size:11px;line-height:1.6;color:rgba(227,227,227,0.35);margin:28px 0 0;">
        This link expires in 72 hours and can only be used once. If you did not expect this invitation, you can ignore this email.
      </p>

      <hr style="border:none;border-top:1px solid rgba(227,227,227,0.10);margin:28px 0;" />
      <p style="font-size:11px;color:rgba(227,227,227,0.25);margin:0;">
        BossMode — bossmode.ing
      </p>
    </div>
  `;

  return sendEmail({ to: options.to, subject, html });
}

// ---------------------------------------------------------------------------
// sendWaitlistConfirmation — W30-26 beta-paid-gate waitlist
// ---------------------------------------------------------------------------

interface WaitlistConfirmationOptions {
  to: string;
  position?: number;
}

export async function sendWaitlistConfirmation(options: WaitlistConfirmationOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `You're on the BossMode paid-access waitlist`;
  const positionLine = options.position != null
    ? `<p style="font-size:13px;line-height:1.7;color:rgba(227,227,227,0.65);margin:0 0 16px;">You're <strong style="color:#E3E3E3;">#${options.position}</strong> in line.</p>`
    : '';

  const html = `
    <div style="background:#111111;color:#E3E3E3;font-family:monospace;max-width:560px;margin:0 auto;padding:40px 32px;border:1px solid rgba(227,227,227,0.15);">
      <div style="margin-bottom:28px;">
        <img src="https://bossmode.ing/images/bossmode-logo-header-menu.png" alt="BossMode" style="height:40px;width:auto;" />
      </div>

      <h1 style="font-size:18px;font-weight:600;letter-spacing:0.05em;color:#E3E3E3;margin:0 0 16px;">
        YOU'RE ON THE LIST.
      </h1>

      <p style="font-size:13px;line-height:1.7;color:rgba(227,227,227,0.65);margin:0 0 16px;">
        Paid access to BossMode isn't open yet — we're finishing the last pieces before we take money. When it opens, you'll be the first to know.
      </p>

      ${positionLine}

      <div style="border:1px solid rgba(224,108,1,0.30);background:rgba(224,108,1,0.07);padding:16px 20px;margin:24px 0;">
        <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#E06C01;margin:0 0 8px;">What happens next</p>
        <ul style="font-size:12px;line-height:1.9;color:rgba(227,227,227,0.60);margin:0;padding-left:16px;">
          <li>We'll email you the moment paid access opens.</li>
          <li>You'll get the same URL and price as everyone else — no hustle required.</li>
          <li>One email. No drip. No spam.</li>
        </ul>
      </div>

      <p style="font-size:13px;line-height:1.7;color:rgba(227,227,227,0.65);margin:0 0 24px;">
        In the meantime, <a href="https://bossmode.ing" style="color:#4B6BFF;text-decoration:none;">explore BossMode &#x2192;</a>
      </p>

      <hr style="border:none;border-top:1px solid rgba(227,227,227,0.10);margin:28px 0;" />
      <p style="font-size:11px;color:rgba(227,227,227,0.25);margin:0;">
        BossMode — bossmode.ing &middot; You requested early access via bossmode.ing/pricing. If this wasn't you, you can ignore this email.
      </p>
    </div>
  `;

  return sendEmail({ to: options.to, subject, html });
}
