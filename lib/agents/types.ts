// Core Agent System Types

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'welcome' | 'contribution' | 'triage';
  status: 'idle' | 'running' | 'waiting_approval' | 'completed' | 'error';
  config: AgentConfig;
  currentWorkflow?: WorkflowExecution;
  metrics: AgentMetrics;
}

export interface AgentConfig {
  autoApprove: boolean;
  simulationSpeed: number; // 1-10, higher = faster
  notificationPreferences: {
    email: boolean;
    slack: boolean;
    inApp: boolean;
  };
}

export interface AgentMetrics {
  totalWorkflows: number;
  completedWorkflows: number;
  averageCompletionTime: number; // in minutes
  successRate: number; // percentage
  lastActivity: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  agentType: 'welcome' | 'contribution' | 'triage';
  steps: WorkflowStep[];
  estimatedDuration: number; // in minutes
  triggerDescription?: string; // Description of when this workflow is triggered
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'automated' | 'human_approval' | 'data_collection' | 'notification';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval';
  config: StepConfig;
  dependencies?: string[]; // step IDs that must complete first
  estimatedDuration: number; // in minutes
  simulatedAction?: string; // Description of what this step simulates
  humanDecision?: string; // Description of decision needed for human steps
}

export interface StepConfig {
  [key: string]: any;
  // Common config fields
  timeout?: number; // in minutes
  retryAttempts?: number;
  
  // Type-specific config
  approvalMessage?: string;
  approvalOptions?: ApprovalOption[];
  dataFields?: string[];
  notificationTemplate?: string;
  automationScript?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentStepIndex: number;
  steps: WorkflowExecutionStep[];
  context: WorkflowContext;
  events: SimulationEvent[];
}

export interface WorkflowExecutionStep extends WorkflowStep {
  startTime?: Date;
  endTime?: Date;
  output?: any;
  error?: string;
  approvalRequest?: ApprovalRequest;
}

export interface WorkflowContext {
  contributor: ContributorInfo;
  repository: RepositoryInfo;
  metadata: Record<string, any>;
}

export interface ContributorInfo {
  id: string;
  username: string;
  email?: string;
  joinDate: Date;
  experience: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  timezone: string;
}

export interface RepositoryInfo {
  name: string;
  owner: string;
  description: string;
  language: string;
  contributingGuidelines?: string;
  codeOfConduct?: string;
}

export interface ApprovalRequest {
  id: string;
  stepId: string;
  workflowExecutionId: string;
  agentId: string;
  title: string;
  description: string;
  options?: ApprovalOption[];
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  responseAt?: Date;
  responseBy?: string;
  comments?: string;
}

export interface ApprovalOption {
  id: string;
  label: string;
  description: string;
  action: 'approve' | 'reject' | 'modify' | 'skip';
}

export interface SimulationEvent {
  id: string;
  type: 'step_start' | 'step_complete' | 'step_error' | 'approval_requested' | 'approval_responded' | 'workflow_start' | 'workflow_complete';
  timestamp: Date;
  workflowExecutionId: string;
  agentId: string;
  stepId?: string;
  data: Record<string, any>;
  message: string;
}

// State Management Types
export interface AgentState {
  agents: Agent[];
  activeWorkflows: WorkflowExecution[];
  pendingApprovals: ApprovalRequest[];
  simulationEvents: SimulationEvent[];
  isSimulationRunning: boolean;
  simulationSpeed: number;
}

// UI Component Types
export interface AgentCardProps {
  agent: Agent;
  onStartWorkflow: (agentId: string, workflowId: string) => void;
  onViewDetails: (agentId: string) => void;
}

export interface WorkflowTimelineProps {
  execution: WorkflowExecution;
  onStepAction: (stepId: string, action: string) => void;
}

export interface ApprovalModalProps {
  request: ApprovalRequest;
  onResponse: (requestId: string, response: 'approve' | 'reject', comments?: string) => void;
}
