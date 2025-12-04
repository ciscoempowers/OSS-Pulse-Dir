'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { agentSimulator } from './simulator';
import { 
  Agent, 
  WorkflowExecution, 
  ApprovalRequest, 
  SimulationEvent,
  AgentState,
  ContributorInfo,
  RepositoryInfo 
} from './types';

// Action types
type AgentAction =
  | { type: 'SET_AGENTS'; payload: Agent[] }
  | { type: 'SET_ACTIVE_WORKFLOWS'; payload: WorkflowExecution[] }
  | { type: 'SET_PENDING_APPROVALS'; payload: ApprovalRequest[] }
  | { type: 'ADD_EVENT'; payload: SimulationEvent }
  | { type: 'SET_SIMULATION_RUNNING'; payload: boolean }
  | { type: 'SET_SIMULATION_SPEED'; payload: number }
  | { type: 'START_WORKFLOW'; payload: { agentId: string; workflowId: string; contributor: ContributorInfo; repository: RepositoryInfo } }
  | { type: 'RESPOND_TO_APPROVAL'; payload: { approvalId: string; response: 'approve' | 'reject'; comments?: string } };

// Initial state
const initialState: AgentState = {
  agents: [],
  activeWorkflows: [],
  pendingApprovals: [],
  simulationEvents: [],
  isSimulationRunning: false,
  simulationSpeed: 1
};

// Reducer
function agentReducer(state: AgentState, action: AgentAction): AgentState {
  switch (action.type) {
    case 'SET_AGENTS':
      return { ...state, agents: action.payload };
    
    case 'SET_ACTIVE_WORKFLOWS':
      return { ...state, activeWorkflows: action.payload };
    
    case 'SET_PENDING_APPROVALS':
      return { ...state, pendingApprovals: action.payload };
    
    case 'ADD_EVENT':
      return { 
        ...state, 
        simulationEvents: [...state.simulationEvents, action.payload].slice(-100) // Keep last 100 events
      };
    
    case 'SET_SIMULATION_RUNNING':
      return { ...state, isSimulationRunning: action.payload };
    
    case 'SET_SIMULATION_SPEED':
      return { ...state, simulationSpeed: action.payload };
    
    case 'START_WORKFLOW':
      // This is handled by the simulator, but we can update UI state
      return state;
    
    case 'RESPOND_TO_APPROVAL':
      // This is handled by the simulator, but we can update UI state
      return state;
    
    default:
      return state;
  }
}

// Context
const AgentContext = createContext<{
  state: AgentState;
  dispatch: React.Dispatch<AgentAction>;
  actions: {
    startSimulation: (speed?: number) => void;
    stopSimulation: () => void;
    startWorkflow: (agentId: string, workflowId: string, contributor: ContributorInfo, repository: RepositoryInfo) => Promise<void>;
    respondToApproval: (approvalId: string, response: 'approve' | 'reject', comments?: string) => Promise<void>;
    refreshData: () => void;
  };
} | null>(null);

// Provider
export function AgentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  // Initialize agents and workflows
  useEffect(() => {
    const initializeAgents = () => {
      // Register agents
      const agents = [
        {
          id: 'welcome-agent',
          name: 'Welcome & Environment Setup Agent',
          description: 'Helps new contributors get started with the project',
          type: 'welcome' as const,
          status: 'idle' as const,
          config: {
            autoApprove: false,
            simulationSpeed: 5,
            notificationPreferences: {
              email: true,
              slack: false,
              inApp: true
            }
          },
          metrics: {
            totalWorkflows: 0,
            completedWorkflows: 0,
            averageCompletionTime: 0,
            successRate: 100,
            lastActivity: new Date()
          }
        },
        {
          id: 'contribution-agent',
          name: 'First Contribution Facilitator',
          description: 'Guides contributors through their first contribution',
          type: 'contribution' as const,
          status: 'idle' as const,
          config: {
            autoApprove: false,
            simulationSpeed: 3,
            notificationPreferences: {
              email: true,
              slack: true,
              inApp: true
            }
          },
          metrics: {
            totalWorkflows: 0,
            completedWorkflows: 0,
            averageCompletionTime: 0,
            successRate: 100,
            lastActivity: new Date()
          }
        },
        {
          id: 'triage-agent',
          name: 'Smart Triage & Mentorship Agent',
          description: 'Intelligently triages issues and provides mentorship',
          type: 'triage' as const,
          status: 'idle' as const,
          config: {
            autoApprove: false,
            simulationSpeed: 4,
            notificationPreferences: {
              email: true,
              slack: true,
              inApp: true
            }
          },
          metrics: {
            totalWorkflows: 0,
            completedWorkflows: 0,
            averageCompletionTime: 0,
            successRate: 100,
            lastActivity: new Date()
          }
        }
      ];

      agents.forEach(agent => agentSimulator.registerAgent(agent));
      dispatch({ type: 'SET_AGENTS', payload: agents });

      // Register workflows
      const { welcomeWorkflow } = require('./workflows/welcome-workflow');
      const { contributionWorkflow } = require('./workflows/contribution-workflow');
      const { triageWorkflow } = require('./workflows/triage-workflow');

      agentSimulator.registerWorkflow(welcomeWorkflow);
      agentSimulator.registerWorkflow(contributionWorkflow);
      agentSimulator.registerWorkflow(triageWorkflow);
    };

    initializeAgents();

    // Set up event listener
    agentSimulator.onEvent((event: SimulationEvent) => {
      dispatch({ type: 'ADD_EVENT', payload: event });
      refreshData();
    });

    // Initial data refresh
    refreshData();
  }, []);

  const refreshData = () => {
    dispatch({ type: 'SET_ACTIVE_WORKFLOWS', payload: agentSimulator.getActiveWorkflows() });
    dispatch({ type: 'SET_PENDING_APPROVALS', payload: agentSimulator.getPendingApprovals() });
    dispatch({ type: 'SET_AGENTS', payload: agentSimulator.getAllAgents() });
  };

  const actions = {
    startSimulation: (speed: number = 1) => {
      agentSimulator.startSimulation(speed);
      dispatch({ type: 'SET_SIMULATION_RUNNING', payload: true });
      dispatch({ type: 'SET_SIMULATION_SPEED', payload: speed });
    },

    stopSimulation: () => {
      agentSimulator.stopSimulation();
      dispatch({ type: 'SET_SIMULATION_RUNNING', payload: false });
    },

    startWorkflow: async (agentId: string, workflowId: string, contributor: ContributorInfo, repository: RepositoryInfo) => {
      try {
        await agentSimulator.startWorkflow(agentId, workflowId, contributor, repository);
        refreshData();
      } catch (error) {
        console.error('Failed to start workflow:', error);
      }
    },

    respondToApproval: async (approvalId: string, response: 'approve' | 'reject', comments?: string) => {
      try {
        await agentSimulator.respondToApproval(approvalId, response, comments);
        refreshData();
      } catch (error) {
        console.error('Failed to respond to approval:', error);
      }
    },

    refreshData
  };

  return (
    <AgentContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AgentContext.Provider>
  );
}

// Hook
export function useAgents() {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
}
