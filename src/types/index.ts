export interface Prospect {
  name: string;
  title: string;
  company: string;
  email: string;
  painPoints: string[];
  companyDetails: {
    industry: string;
    size: string;
    skus: string;
    warehouses: number;
    currentTools: string[];
  };
}

export interface Sender {
  name: string;
  title: string;
  company: string;
  email: string;
}

export interface Email {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}

export interface Transcript {
  callId: string;
  title: string;
  date: string;
  duration: string;
  participants: {
    name: string;
    role: string;
    company: string;
  }[];
  transcript: string;
  keyMoments: {
    timestamp: string;
    type: string;
    note: string;
  }[];
}

export interface DemoStep {
  id: string;
  number: number;
  title: string;
  description: string;
  type: 'agent_action' | 'simulated_response';
  requiresApproval: boolean;
  mcpTools?: string[];
  agentContext?: {
    systemPrompt: string;
    task: string;
  };
  simulatedContent?: {
    type: 'email' | 'transcript';
    data: Email | Transcript;
  };
}

export type StepStatus = 'pending' | 'active' | 'complete';

export interface DemoState {
  currentStepIndex: number;
  stepStatuses: StepStatus[];
  isRunning: boolean;
  thinkingContent: string;
  contentHistory: ContentItem[];
}

export interface ContentItem {
  type: 'email' | 'transcript' | 'proposal';
  direction?: 'sent' | 'received';
  data: Email | Transcript | Proposal;
  stepNumber: number;
}

export interface Proposal {
  id: string;
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
  timestamp: string;
}
