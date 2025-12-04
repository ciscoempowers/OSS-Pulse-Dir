import { 
  Agent, 
  Workflow, 
  WorkflowExecution, 
  WorkflowExecutionStep, 
  SimulationEvent,
  ApprovalRequest,
  ApprovalOption,
  ContributorInfo,
  RepositoryInfo 
} from './types';

// Event types for the simulation engine (must match SimulationEvent.type)
export type SimulationEventType = 
  | 'step_start'
  | 'step_complete' 
  | 'approval_requested'
  | 'workflow_complete'
  | 'workflow_start'
  | 'step_error'
  | 'approval_responded';

// Simulation control events (separate from workflow events)
export type SimulationControlEventType = 
  | 'simulation_started'
  | 'simulation_paused'
  | 'simulation_resumed';

// Event listener interface
export interface SimulationEventListener {
  (event: SimulationEvent): void;
}

// Sample data generators
export class DataGenerator {
  static generateContributor(): ContributorInfo {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    const experiences: ('beginner' | 'intermediate' | 'advanced')[] = ['beginner', 'intermediate', 'advanced'];
    const interests = ['frontend', 'backend', 'documentation', 'testing', 'devops', 'ui/ux', 'mobile', 'ai'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    
    return {
      id: `contributor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      email: `${username}@example.com`,
      joinDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Joined in last 30 days
      experience: experiences[Math.floor(Math.random() * experiences.length)],
      interests: interests.slice(0, Math.floor(Math.random() * 3) + 1),
      timezone: `UTC${Math.random() > 0.5 ? '+' : '-'}${Math.floor(Math.random() * 12) + 1}`
    };
  }

  static generateRepository(): RepositoryInfo {
    const repos = [
      { name: 'dir', description: 'Agent Directory Project', language: 'TypeScript' },
      { name: 'awesome-agents', description: 'Curated list of AI agents', language: 'JavaScript' },
      { name: 'agent-orchestrator', description: 'Multi-agent coordination system', language: 'Python' }
    ];
    
    const repo = repos[Math.floor(Math.random() * repos.length)];
    
    return {
      name: repo.name,
      owner: 'agntcy',
      description: repo.description,
      language: repo.language,
      contributingGuidelines: `https://github.com/agntcy/${repo.name}/blob/main/CONTRIBUTING.md`,
      codeOfConduct: `https://github.com/agntcy/${repo.name}/blob/main/CODE_OF_CONDUCT.md`
    };
  }

  static generateIssues(count: number = 5) {
    const issueTitles = [
      'Add welcome message for new contributors',
      'Fix typo in documentation',
      'Improve error handling in API',
      'Add unit tests for authentication',
      'Update dependencies to latest versions',
      'Implement dark mode toggle',
      'Add accessibility improvements',
      'Optimize database queries',
      'Add Docker support',
      'Fix responsive design issues'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `issue-${i + 1}`,
      title: issueTitles[Math.floor(Math.random() * issueTitles.length)],
      number: i + 1,
      state: Math.random() > 0.3 ? 'open' : 'closed',
      labels: ['good first issue', 'help wanted', 'documentation', 'bug', 'enhancement'].slice(0, Math.floor(Math.random() * 3) + 1),
      assignee: Math.random() > 0.7 ? `user${Math.floor(Math.random() * 100)}` : null,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));
  }

  static generatePullRequests(count: number = 3) {
    const prTitles = [
      'feat: Add contributor onboarding workflow',
      'fix: Resolve authentication issues',
      'docs: Update README with installation guide',
      'refactor: Improve code organization',
      'test: Add comprehensive test coverage'
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: `pr-${i + 1}`,
      title: prTitles[Math.floor(Math.random() * prTitles.length)],
      number: i + 1,
      state: Math.random() > 0.4 ? 'open' : 'merged',
      author: `contributor${Math.floor(Math.random() * 100)}`,
      reviewers: [`reviewer${Math.floor(Math.random() * 5) + 1}`].slice(0, Math.floor(Math.random() * 2) + 1),
      createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date()
    }));
  }
}

// Main Simulation Engine
export class SimulationEngine {
  private agents: Map<string, Agent> = new Map();
  private workflows: Map<string, Workflow> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private pendingApprovals: Map<string, ApprovalRequest> = new Map();
  private events: SimulationEvent[] = [];
  private listeners: SimulationEventListener[] = [];
  
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private currentExecution: WorkflowExecution | null = null;
  private simulationSpeed: number = 1;

  // Event management
  addEventListener(listener: SimulationEventListener) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: SimulationEventListener) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private emitEvent(type: SimulationEventType, data: any = {}) {
    const event: SimulationEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date(),
      workflowExecutionId: this.currentExecution?.id || 'system',
      agentId: this.currentExecution?.agentId || 'system',
      stepId: data.stepId,
      data,
      message: data.message || this.generateEventMessage(type, data)
    };

    this.events.push(event);
    this.listeners.forEach(listener => listener(event));
  }

  private emitControlEvent(type: SimulationControlEventType, data: any = {}) {
    // Create a control event that conforms to SimulationEvent interface
    const controlEvent: SimulationEvent = {
      id: `control-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'step_start', // Use a valid event type as placeholder
      timestamp: new Date(),
      workflowExecutionId: 'system',
      agentId: 'system',
      data: { ...data, controlEventType: type, isControlEvent: true },
      message: this.generateControlEventMessage(type)
    };

    // Add to events array
    this.events.push(controlEvent);
    
    // Log control events to console
    console.log(`[SIMULATION CONTROL] ${controlEvent.message}`);
  }

  private generateEventMessage(type: SimulationEventType, data: any): string {
    switch (type) {
      case 'step_start':
        return `Started: ${data.stepName}`;
      case 'step_complete':
        return `Completed: ${data.stepName}`;
      case 'approval_requested':
        return `Approval required: ${data.stepName}`;
      case 'workflow_complete':
        return `Workflow completed: ${data.workflowName}`;
      case 'workflow_start':
        return 'Workflow started';
      case 'step_error':
        return `Error in: ${data.stepName}`;
      case 'approval_responded':
        return `Approval response: ${data.response}`;
      default:
        return 'Unknown event';
    }
  }

  private generateControlEventMessage(type: SimulationControlEventType): string {
    switch (type) {
      case 'simulation_started':
        return 'Simulation started';
      case 'simulation_paused':
        return 'Simulation paused';
      case 'simulation_resumed':
        return 'Simulation resumed';
      default:
        return 'Unknown control event';
    }
  }

  // Agent and workflow management
  registerAgent(agent: Agent) {
    this.agents.set(agent.id, agent);
  }

  registerWorkflow(workflow: Workflow) {
    this.workflows.set(workflow.id, workflow);
  }

  // Simulation control
  start(speed: number = 1) {
    this.simulationSpeed = speed;
    this.isRunning = true;
    this.isPaused = false;
    this.emitControlEvent('simulation_started', { speed });
  }

  pause() {
    this.isPaused = true;
    this.emitControlEvent('simulation_paused');
  }

  resume() {
    this.isPaused = false;
    this.emitControlEvent('simulation_resumed');
  }

  reset() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentExecution = null;
    this.executions.clear();
    this.pendingApprovals.clear();
    this.events = [];
  }

  // Workflow execution
  async executeWorkflow(agentId: string, workflowId: string, contributor?: ContributorInfo, repository?: RepositoryInfo): Promise<WorkflowExecution> {
    if (!this.isRunning) {
      throw new Error('Simulation not started. Call start() first.');
    }

    const agent = this.agents.get(agentId);
    const workflow = this.workflows.get(workflowId);

    if (!agent || !workflow) {
      throw new Error('Agent or workflow not found');
    }

    // Generate sample data if not provided
    const finalContributor = contributor || DataGenerator.generateContributor();
    const finalRepository = repository || DataGenerator.generateRepository();

    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      agentId,
      status: 'running',
      startTime: new Date(),
      currentStepIndex: 0,
      steps: workflow.steps.map(step => ({
        ...step,
        status: 'pending'
      })),
      context: {
        contributor: finalContributor,
        repository: finalRepository,
        metadata: {
          issues: DataGenerator.generateIssues(3),
          pullRequests: DataGenerator.generatePullRequests(2)
        }
      },
      events: []
    };

    this.executions.set(execution.id, execution);
    this.currentExecution = execution;

    // Update agent status
    agent.status = 'running';
    agent.currentWorkflow = execution;

    // Execute steps
    await this.executeSteps(execution);

    return execution;
  }

  private async executeSteps(execution: WorkflowExecution) {
    const workflow = this.workflows.get(execution.workflowId)!;

    for (let i = 0; i < workflow.steps.length; i++) {
      if (!this.isRunning || this.isPaused) break;

      execution.currentStepIndex = i;
      const step = execution.steps[i];

      if (step.status !== 'pending') continue;

      // Check dependencies
      if (step.dependencies && step.dependencies.length > 0) {
        const dependenciesMet = step.dependencies.every(depId => {
          const depStep = execution.steps.find(s => s.id === depId);
          return depStep?.status === 'completed';
        });

        if (!dependenciesMet) {
          continue; // Skip this step for now, dependencies not met
        }
      }

      await this.executeStep(execution, step);

      // If this is a human approval step, pause execution
      if (step.type === 'human_approval') {
        // The requestApproval method will set status to 'waiting_approval'
        break;
      }
    }

    // Check if workflow is complete
    if (execution.steps.every(step => step.status === 'completed')) {
      this.completeWorkflow(execution);
    }
  }

  private async executeStep(execution: WorkflowExecution, step: WorkflowExecutionStep) {
    step.status = 'running';
    step.startTime = new Date();

    this.emitEvent('step_start', {
      stepId: step.id,
      stepName: step.name,
      stepType: step.type
    });

    // Calculate delay based on simulation speed
    const baseDelay = Math.random() * 2500 + 500; // 500ms - 3000ms
    const actualDelay = baseDelay / this.simulationSpeed;

    await this.delay(actualDelay);

    switch (step.type) {
      case 'automated':
        await this.executeAutomatedStep(execution, step);
        break;
      case 'human_approval':
        await this.requestApproval(execution, step);
        break;
      case 'data_collection':
        await this.collectData(execution, step);
        break;
      case 'notification':
        await this.sendNotification(execution, step);
        break;
    }
  }

  private async executeAutomatedStep(execution: WorkflowExecution, step: WorkflowExecutionStep) {
    // Simulate automated task completion
    step.output = {
      success: true,
      data: `Automated result for ${step.name}`,
      timestamp: new Date(),
      details: {
        processed: Math.floor(Math.random() * 100) + 1,
        errors: Math.floor(Math.random() * 3),
        warnings: Math.floor(Math.random() * 5)
      }
    };
    step.status = 'completed';
    step.endTime = new Date();

    this.emitEvent('step_complete', {
      stepId: step.id,
      stepName: step.name,
      output: step.output
    });
  }

  private async requestApproval(execution: WorkflowExecution, step: WorkflowExecutionStep) {
    const approval: ApprovalRequest = {
      id: `approval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stepId: step.id,
      workflowExecutionId: execution.id,
      agentId: execution.agentId,
      title: step.config.approvalMessage || `Approval required for ${step.name}`,
      description: step.description,
      options: step.config.approvalOptions || [
        { id: 'approve', label: 'Approve', description: 'Continue with the workflow', action: 'approve' },
        { id: 'reject', label: 'Reject', description: 'Stop the workflow', action: 'reject' }
      ],
      requestedBy: execution.agentId,
      requestedAt: new Date(),
      status: 'pending'
    };

    this.pendingApprovals.set(approval.id, approval);
    step.approvalRequest = approval;
    step.status = 'waiting_approval';

    this.emitEvent('approval_requested', {
      stepId: step.id,
      stepName: step.name,
      approvalId: approval.id,
      approvalTitle: approval.title
    });
  }

  private async collectData(execution: WorkflowExecution, step: WorkflowExecutionStep) {
    // Simulate data collection
    step.output = {
      collected: [
        `User experience: ${execution.context.contributor.experience}`,
        `Interests: ${execution.context.contributor.interests.join(', ')}`,
        `Timezone: ${execution.context.contributor.timezone}`,
        `Repository language: ${execution.context.repository.language}`
      ],
      timestamp: new Date(),
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    };
    step.status = 'completed';
    step.endTime = new Date();

    this.emitEvent('step_complete', {
      stepId: step.id,
      stepName: step.name,
      output: step.output
    });
  }

  private async sendNotification(execution: WorkflowExecution, step: WorkflowExecutionStep) {
    // Simulate notification
    step.output = {
      sent: true,
      recipients: [execution.context.contributor.email || 'user@example.com'],
      channels: ['email', 'slack'],
      timestamp: new Date(),
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    step.status = 'completed';
    step.endTime = new Date();

    this.emitEvent('step_complete', {
      stepId: step.id,
      stepName: step.name,
      output: step.output
    });
  }

  // Approval handling
  async respondToApproval(approvalId: string, response: 'approve' | 'reject', comments?: string) {
    const approval = this.pendingApprovals.get(approvalId);
    if (!approval) {
      throw new Error('Approval not found');
    }

    approval.status = response === 'approve' ? 'approved' : 'rejected';
    approval.responseAt = new Date();
    approval.comments = comments;

    const execution = this.executions.get(approval.workflowExecutionId);
    if (execution) {
      const step = execution.steps.find(s => s.id === approval.stepId);
      if (step) {
        step.status = response === 'approve' ? 'completed' : 'failed';
        step.endTime = new Date();

        this.emitEvent('step_complete', {
          stepId: step.id,
          stepName: step.name,
          approvalResponse: response,
          comments
        });

        // Continue execution if approved
        if (response === 'approve') {
          await this.executeSteps(execution);
        } else {
          this.completeWorkflow(execution, 'failed');
        }
      }
    }

    this.pendingApprovals.delete(approvalId);
  }

  private completeWorkflow(execution: WorkflowExecution, status: 'completed' | 'failed' = 'completed') {
    execution.status = status;
    execution.endTime = new Date();

    const agent = this.agents.get(execution.agentId);
    if (agent) {
      agent.status = 'idle';
      agent.currentWorkflow = undefined;
      agent.metrics.totalWorkflows++;
      if (status === 'completed') {
        agent.metrics.completedWorkflows++;
      }
      agent.metrics.lastActivity = new Date();
    }

    this.emitEvent('workflow_complete', {
      workflowId: execution.workflowId,
      workflowName: this.workflows.get(execution.workflowId)?.name,
      status,
      duration: execution.endTime.getTime() - execution.startTime.getTime()
    });
  }

  // Utility methods
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Getters for UI state
  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  getActiveWorkflows(): WorkflowExecution[] {
    return Array.from(this.executions.values()).filter(e => e.status === 'running');
  }

  getPendingApprovals(): ApprovalRequest[] {
    return Array.from(this.pendingApprovals.values());
  }

  getRecentEvents(limit: number = 50): SimulationEvent[] {
    return this.events.slice(-limit).reverse();
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id);
  }

  // Simulation status
  getStatus(): {
    isRunning: boolean;
    isPaused: boolean;
    simulationSpeed: number;
    activeExecutions: number;
    pendingApprovals: number;
  } {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      simulationSpeed: this.simulationSpeed,
      activeExecutions: this.getActiveWorkflows().length,
      pendingApprovals: this.getPendingApprovals().length
    };
  }
}

// Example usage:
/*
// Create simulation engine
const engine = new SimulationEngine();

// Set up event listener
engine.addEventListener((event) => {
  console.log(`[${event.timestamp.toISOString()}] ${event.message}`);
});

// Register agents and workflows
engine.registerAgent(welcomeAgent);
engine.registerWorkflow(welcomeWorkflow);

// Start simulation
engine.start(2); // 2x speed

// Execute workflow
const execution = await engine.executeWorkflow(
  'welcome-agent',
  'welcome-onboarding',
  DataGenerator.generateContributor(),
  DataGenerator.generateRepository()
);

// Handle approval when needed
engine.addEventListener((event) => {
  if (event.type === 'approval_required') {
    // Show approval UI
    const approval = engine.getPendingApprovals()[0];
    if (approval) {
      // User can respond with:
      // engine.respondToApproval(approval.id, 'approve', 'Looks good!');
    }
  }
});

// Control simulation
engine.pause();
engine.resume();
engine.reset();
*/

// Singleton instance for easy access
export const simulationEngine = new SimulationEngine();
