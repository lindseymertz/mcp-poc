import { PROSPECT, SENDER } from '@/lib/demo/mock-data';

export interface ParsedEmail {
  to: string;
  toName: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
}

export function parseEmailFromOutput(output: string): ParsedEmail | null {
  // Agent will be prompted to output in a structured format
  // Try to extract email components

  // Try structured format first: To: / Subject: / --- body ---
  const toMatch = output.match(/To:\s*(.+?)(?:\n|$)/i);
  const subjectMatch = output.match(/Subject:\s*(.+?)(?:\n|$)/i);

  // Look for body between --- markers
  const bodyMatch = output.match(/---\s*\n([\s\S]+?)\n---/);

  if (subjectMatch && bodyMatch) {
    return {
      to: toMatch?.[1]?.trim() || PROSPECT.email,
      toName: PROSPECT.name,
      from: SENDER.email,
      fromName: SENDER.name,
      subject: subjectMatch[1].trim(),
      body: bodyMatch[1].trim(),
    };
  }

  // Fallback: Try to extract from less structured output
  // Look for "Subject:" line and treat everything after as body
  const subjectOnlyMatch = output.match(/Subject:\s*(.+?)(?:\n|$)/i);
  if (subjectOnlyMatch) {
    const subjectIndex = output.indexOf(subjectOnlyMatch[0]);
    const afterSubject = output.slice(subjectIndex + subjectOnlyMatch[0].length).trim();

    // Remove any leading "Body:" label if present
    const bodyContent = afterSubject.replace(/^Body:\s*/i, '').trim();

    if (bodyContent) {
      return {
        to: toMatch?.[1]?.trim() || PROSPECT.email,
        toName: PROSPECT.name,
        from: SENDER.email,
        fromName: SENDER.name,
        subject: subjectOnlyMatch[1].trim(),
        body: bodyContent,
      };
    }
  }

  // Last resort: If output looks like an email body (has greeting), use it as-is
  if (output.match(/^(Hi|Hello|Hey|Dear)\s+\w+/i)) {
    return {
      to: PROSPECT.email,
      toName: PROSPECT.name,
      from: SENDER.email,
      fromName: SENDER.name,
      subject: 'Re: InventoryAI - Streamlining Your Operations',
      body: output.trim(),
    };
  }

  return null;
}

export function parseProposalFromOutput(output: string): {
  to: string;
  toName: string;
  subject: string;
  body: string;
  pricing: {
    basePlatform: number;
    perWarehouse: number;
    warehouseCount: number;
    userLicenses: number;
    userCount: number;
    integrationSetup: number;
    integrationMonthly: number;
    implementation: number;
    totalMonthly: number;
    totalOneTime: number;
  };
} | null {
  const email = parseEmailFromOutput(output);
  if (!email) return null;

  // Standard pricing from the spec
  const pricing = {
    basePlatform: 2500,
    perWarehouse: 500,
    warehouseCount: 2,
    userLicenses: 50,
    userCount: 15,
    integrationSetup: 1000,
    integrationMonthly: 200,
    implementation: 5000,
    totalMonthly: 4450,
    totalOneTime: 6000,
  };

  return {
    to: email.to,
    toName: email.toName,
    subject: email.subject,
    body: email.body,
    pricing,
  };
}
