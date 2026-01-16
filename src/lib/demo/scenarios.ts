import { DemoStep } from '@/types';
import { SIMULATED_EMAILS, GONG_TRANSCRIPT, PROSPECT, SENDER } from './mock-data';

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

Be personable but professional. No generic templates.`,
      task: 'Draft and send the initial outreach email to Marcus Chen.'
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
- They responded positively to your outreach and want to learn more
- You need to offer specific meeting times

Your task:
1. Thank them warmly for their response
2. Acknowledge their timing comment about Q2 pressure
3. Offer 3-4 specific time slots over the next week (Tuesday-Thursday preferred, mornings PT)
4. Keep it brief and easy to respond to

Be warm but efficient. Make it easy for them to just pick a time.`,
      task: 'Reply to Marcus with available meeting times for this week and next.'
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

Your task:
1. Create a calendar invite with a clear title
2. Add a brief agenda in the description
3. Send a short confirmation email

Calendar invite should include:
- Clear title: "InventoryAI <> Acme Corp - Discovery Call"
- Video link placeholder: "Video link will be added"
- Brief agenda: Introductions, Understanding current challenges, Quick overview of InventoryAI, Q&A, Next steps`,
      task: 'Create the calendar invite for Thursday 10am PT and send Marcus a confirmation.'
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

Your task:
1. Analyze the transcript to extract:
   - Key pain points discussed
   - Specific requirements mentioned
   - Action items you committed to
   - Objections or concerns raised
   - Next steps agreed upon

2. Search Google Drive for relevant documents:
   - Distribution Pro case study (mentioned in call)
   - NetSuite integration specs (requested)
   - Any other relevant materials

3. Draft a follow-up email that:
   - Thanks them for their time
   - Summarizes 2-3 key takeaways (shows you listened)
   - Attaches the requested documents
   - Confirms next steps (demo scheduled)
   - Is warm but professional

Keep the email concise - busy executives skim.`,
      task: 'Analyze the call transcript, find the requested documents in Drive, and send a follow-up email with attachments.'
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

Prospect requirements (from their email):
- 12,000 SKUs
- 2 warehouse locations
- 15 user licenses
- NetSuite integration required

Pricing structure (use these numbers):
- Base platform: $2,500/month
- Per warehouse: $500/month each
- User licenses: $50/user/month (15 users = $750/month)
- NetSuite integration: $1,000 one-time setup + $200/month
- Implementation: $5,000 one-time

Total monthly: $4,450/month
Total one-time: $6,000

Your task:
1. Create a clear, professional proposal email that:
   - Acknowledges their timeline (Monday leadership meeting)
   - Breaks down the pricing clearly
   - Highlights value (reference the $50K stockout cost from call)
   - Includes ROI framing
   - Offers to answer questions

2. Search Drive for the pricing guide to attach

IMPORTANT: This email will be reviewed by a human before sending due to the pricing content.`,
      task: 'Generate a pricing proposal based on Marcus\'s requirements and prepare to send (pending approval).'
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
      systemPrompt: 'Send the approved proposal email.',
      task: 'Send the previously drafted and approved proposal to Marcus.'
    }
  }
];
