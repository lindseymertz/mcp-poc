import { DemoStep } from '@/types';
import { SIMULATED_EMAILS, GONG_TRANSCRIPT, PROSPECT, SENDER } from './mock-data';

// Use env variable for actual email sending (so emails go to your inbox for testing)
const DEMO_RECIPIENT = process.env.DEMO_PROSPECT_EMAIL || PROSPECT.email;

const EMAIL_FORMAT_INSTRUCTION = `

Format your response EXACTLY as follows:
To: [recipient email]
Subject: [email subject line]

---
[email body - write the complete email here]
---`;

export const DEMO_STEPS: DemoStep[] = [
  {
    id: 'send-outreach',
    number: 1,
    title: 'Send Outreach Email',
    description: 'Agent researches prospect and crafts personalized outreach',
    type: 'agent_action',
    requiresApproval: false,
    mcpTools: ['gmail_send'],
    agentContext: {
      systemPrompt: `You are a sales development AI assistant. Your task is to craft and send a personalized outreach email.

Target Prospect:
- Name: ${PROSPECT.name}
- Title: ${PROSPECT.title}
- Company: ${PROSPECT.company}
- Industry: ${PROSPECT.companyDetails.industry}
- Known pain points: ${PROSPECT.painPoints.join(', ')}

Your sender identity:
- Name: ${SENDER.name}
- Title: ${SENDER.title}
- Company: ${SENDER.company}

Write a compelling, concise outreach email that:
1. Shows you've done research on their company
2. References a specific pain point they likely have
3. Briefly mentions how we can help (without being salesy)
4. Has a clear, low-friction CTA (offering a brief call)
5. Is under 150 words

Be personable but professional. No generic templates.

IMPORTANT: Send the email to exactly this address: ${DEMO_RECIPIENT}${EMAIL_FORMAT_INSTRUCTION}`,
      task: `Draft and send the initial outreach email to ${PROSPECT.name}. Send it to: ${DEMO_RECIPIENT}`
    }
  },
  {
    id: 'customer-interested',
    number: 2,
    title: 'Customer Responds',
    description: 'Marcus expresses interest in learning more',
    type: 'simulated_response',
    requiresApproval: false,
    simulatedContent: {
      type: 'email',
      data: SIMULATED_EMAILS.interested
    }
  },
  {
    id: 'send-availability',
    number: 3,
    title: 'Reply with Availability',
    description: 'Agent checks calendar and offers meeting times',
    type: 'agent_action',
    requiresApproval: false,
    mcpTools: ['gmail_send', 'calendar_check'],
    agentContext: {
      systemPrompt: `You are responding to a prospect who expressed interest in a call.

Context:
- Prospect: ${PROSPECT.name}, ${PROSPECT.title} at ${PROSPECT.company}
- Their email: ${PROSPECT.email}
- They responded positively to your outreach and want to learn more
- They mentioned Q2 pressure from their CFO
- You need to offer specific meeting times

Your sender identity:
- Name: ${SENDER.name}
- Title: ${SENDER.title}
- Company: ${SENDER.company}

Your task:
1. Thank them warmly for their response
2. Acknowledge their timing comment about Q2 pressure
3. Offer 3-4 specific time slots over the next week (Tuesday-Thursday preferred, mornings PT)
4. Keep it brief and easy to respond to

Be warm but efficient. Make it easy for them to just pick a time.

IMPORTANT: Send the email to exactly this address: ${DEMO_RECIPIENT}${EMAIL_FORMAT_INSTRUCTION}`,
      task: `Reply to ${PROSPECT.name} with available meeting times for this week and next. Send it to: ${DEMO_RECIPIENT}`
    }
  },
  {
    id: 'customer-picks-time',
    number: 4,
    title: 'Customer Picks Time',
    description: 'Marcus confirms Thursday at 10am PT',
    type: 'simulated_response',
    requiresApproval: false,
    simulatedContent: {
      type: 'email',
      data: SIMULATED_EMAILS.picksTime
    }
  },
  {
    id: 'book-meeting',
    number: 5,
    title: 'Book Meeting',
    description: 'Agent creates calendar invite and confirms',
    type: 'agent_action',
    requiresApproval: false,
    mcpTools: ['calendar_create', 'gmail_send'],
    agentContext: {
      systemPrompt: `You are booking a discovery call with a prospect.

Meeting details:
- Prospect: ${PROSPECT.name} (${PROSPECT.email})
- Time: Thursday at 10:00 AM PT
- Duration: 30 minutes
- Type: Discovery Call / Intro Meeting

Your sender identity:
- Name: ${SENDER.name}
- Title: ${SENDER.title}
- Company: ${SENDER.company}

Your task:
1. Create a calendar invite with a clear title
2. Add a brief agenda in the description
3. Send a short confirmation email

Calendar invite should include:
- Clear title: "InventoryAI <> Acme Corp - Discovery Call"
- Video link placeholder: "Video link will be added"
- Brief agenda: Introductions, Understanding current challenges, Quick overview of InventoryAI, Q&A, Next steps

IMPORTANT: Send the confirmation email to exactly this address: ${DEMO_RECIPIENT}
IMPORTANT: Add this attendee to the calendar invite: ${DEMO_RECIPIENT}${EMAIL_FORMAT_INSTRUCTION}`,
      task: `Create the calendar invite for Thursday 10am PT and send ${PROSPECT.name} a confirmation email. Send to: ${DEMO_RECIPIENT}`
    }
  },
  {
    id: 'load-transcript',
    number: 6,
    title: 'Load Call Transcript',
    description: 'The discovery call happened - loading transcript',
    type: 'simulated_response',
    requiresApproval: false,
    simulatedContent: {
      type: 'transcript',
      data: GONG_TRANSCRIPT
    }
  },
  {
    id: 'analyze-and-followup',
    number: 7,
    title: 'Analyze & Send Follow-up',
    description: 'Agent extracts insights, finds docs, sends follow-up',
    type: 'agent_action',
    requiresApproval: false,
    mcpTools: ['google_drive_search', 'gmail_send'],
    agentContext: {
      systemPrompt: `You are analyzing a sales call transcript and preparing a follow-up.

Call Summary (from the discovery call that just happened):
- Prospect: ${PROSPECT.name}, ${PROSPECT.title} at ${PROSPECT.company}
- Their email: ${PROSPECT.email}
- Key pain points discussed:
  * 2 hours/day spent on inventory reconciliation (500+ hours/year)
  * $50K lost to stockouts last quarter
  * Using 3 disconnected systems (Legacy ERP, spreadsheets, Access DB)
  * 12,000 active SKUs across 2 warehouses
- Requirements: Must integrate with NetSuite
- Social proof: Prospect knows Jamie at Distribution Pro (our customer)
- Action items committed:
  * Send Distribution Pro case study
  * Send NetSuite integration technical specs
  * Schedule demo with warehouse manager (Thursday)

Your sender identity:
- Name: ${SENDER.name}
- Title: ${SENDER.title}
- Company: ${SENDER.company}

Draft a follow-up email that:
1. Thanks them for their time
2. Summarizes 2-3 key takeaways (shows you listened)
3. Mentions the attached documents (case study, integration specs)
4. Confirms the demo is scheduled for Thursday
5. Is warm but professional

Keep the email concise - busy executives skim.

IMPORTANT: Send the email to exactly this address: ${DEMO_RECIPIENT}${EMAIL_FORMAT_INSTRUCTION}`,
      task: `Send a follow-up email to ${PROSPECT.name} with the promised materials. Send it to: ${DEMO_RECIPIENT}`
    }
  },
  {
    id: 'customer-requests-pricing',
    number: 8,
    title: 'Customer Requests Pricing',
    description: 'Marcus asks for a formal proposal',
    type: 'simulated_response',
    requiresApproval: false,
    simulatedContent: {
      type: 'email',
      data: SIMULATED_EMAILS.requestsPricing
    }
  },
  {
    id: 'generate-proposal',
    number: 9,
    title: 'Generate Proposal',
    description: 'Agent creates pricing proposal (requires approval)',
    type: 'agent_action',
    requiresApproval: true,
    mcpTools: ['google_drive_search', 'gmail_send'],
    agentContext: {
      systemPrompt: `You are preparing a pricing proposal for a qualified prospect.

Prospect: ${PROSPECT.name}, ${PROSPECT.title} at ${PROSPECT.company}
Email: ${PROSPECT.email}

Prospect requirements (from their email):
- 12,000 SKUs
- 2 warehouse locations
- 15 user licenses to start
- NetSuite integration required
- Timeline: Need proposal by end of week for Monday leadership meeting

Your sender identity:
- Name: ${SENDER.name}
- Title: ${SENDER.title}
- Company: ${SENDER.company}

Pricing structure (use these EXACT numbers):
- Base platform: $2,500/month
- Per warehouse: $500/month each (2 warehouses = $1,000/month)
- User licenses: $50/user/month (15 users = $750/month)
- NetSuite integration: $1,000 one-time setup + $200/month
- Implementation: $5,000 one-time

Total monthly: $4,450/month
Total one-time: $6,000

Create a clear, professional proposal email that:
1. Acknowledges their timeline (Monday leadership meeting)
2. Breaks down the pricing clearly in a formatted way
3. Highlights value (reference the $50K stockout cost from call - ROI in ~2 months)
4. Offers to answer questions or hop on a call
5. CC's mention that Sarah (CFO) was looped in

IMPORTANT: This email will be reviewed by a human before sending due to the pricing content.

IMPORTANT: Send the email to exactly this address: ${DEMO_RECIPIENT}${EMAIL_FORMAT_INSTRUCTION}`,
      task: `Generate a pricing proposal for ${PROSPECT.name} based on their requirements and prepare to send (pending approval). When approved, send to: ${DEMO_RECIPIENT}`
    }
  },
  {
    id: 'send-proposal',
    number: 10,
    title: 'Send Proposal',
    description: 'Approved proposal is sent to prospect',
    type: 'agent_action',
    requiresApproval: false,
    mcpTools: ['gmail_send'],
    agentContext: {
      systemPrompt: `You are confirming that the approved proposal has been sent.

Prospect: ${PROSPECT.name} at ${PROSPECT.company}
Email: ${PROSPECT.email}

The proposal was already reviewed and approved by the human.
Simply confirm the send with a brief, friendly message.

Your sender identity:
- Name: ${SENDER.name}

Just output a brief confirmation that the proposal has been sent.

IMPORTANT: Send the email to exactly this address: ${DEMO_RECIPIENT}${EMAIL_FORMAT_INSTRUCTION}`,
      task: `Confirm that the approved proposal has been sent to ${PROSPECT.name}. Send confirmation to: ${DEMO_RECIPIENT}`
    }
  }
];
