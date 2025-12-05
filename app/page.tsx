'use client'; // v2 - TECH HEALTH COMPLETELY REMOVED bust

import { useEffect, useState, useMemo } from 'react';

import { Card } from '@tremor/react';
import { Gantt, ViewMode, Task } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import type { Milestone as GitHubMilestone, Discussion as GitHubDiscussion } from './lib/github';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AIStrategicPartner from './components/AIStrategicPartner';
import { Activity, Play, Square, RotateCcw, Users, GitBranch, Brain, Loader2, CheckCircle, Clock, User, Bot, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import HumanApprovalCard, { mockApprovalData } from '../components/agents/HumanApprovalCard';
import MetricsPanel from '../components/agents/MetricsPanel';
import { AGENT_COLORS, ANIMATIONS, getAgentColors, getStatusColors } from '../lib/agents/theme';
import MetricsAnalysisCompact from './components/MetricsAnalysisCompact';

// Vercel deployment trigger - button debugging deployed
interface Agent {
  id: string;
  name: string;
  type: 'welcome' | 'contribution' | 'triage';
  status: 'idle' | 'running' | 'paused' | 'completed';
  description: string;
  progress: number;
  lastRun?: Date;
  metrics: {
    totalWorkflows: number;
    successRate: number;
    averageCompletionTime: number;
  };
}

interface GanttTask extends Task {
  customData: {
    description: string;
    openIssues: number;
    closedIssues: number;
    completion: string;
    dueDate: string;
    state: string;
    milestoneNumber: number;
    repository: string;
    title: string;
  };
}

const extractKeyPoints = (body: string | undefined): string[] => {
  if (!body) return [];
  const points = body.match(/^[-*]\s+(.+)$/gm) || [];
  if (points.length === 0) {
    const sentences = body
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0 && !p.startsWith('#') && p.length < 200);
    return sentences.slice(0, 3);
  }
  return points
    .map(p => p.replace(/^[-*]\s+/, '').trim())
    .slice(0, 3);
};

const createGanttTasks = (milestones: GitHubMilestone[]): GanttTask[] => {
  if (!milestones || !Array.isArray(milestones)) return [];
  
  // Sort milestones by due date (earliest first)
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.due_on) return 1;
    if (!b.due_on) return -1;
    return new Date(a.due_on).getTime() - new Date(b.due_on).getTime();
  });

  return sortedMilestones
    .map((milestone) => {
      if (!milestone.due_on) return null;
      
      const startDate = new Date(milestone.created_at);
      const endDate = new Date(milestone.due_on);
      const isCompleted = milestone.state === 'closed';
      
      // Calculate progress based on epic completion (issues)
      let progress = 0;
      if (milestone.closed_issues > 0 || milestone.open_issues > 0) {
        progress = Math.round(
          (milestone.closed_issues / (milestone.closed_issues + milestone.open_issues)) * 100
        );
      } else {
        // If no issues, use time-based progress for in-flight milestones
        if (!isCompleted) {
          const now = new Date();
          const totalDuration = endDate.getTime() - startDate.getTime();
          const timePassed = now.getTime() - startDate.getTime();
          progress = Math.min(100, Math.max(0, (timePassed / totalDuration) * 100));
        }
      }
      
      return {
        id: `${(milestone as any).repository || 'dir'}-${milestone.number}`,
        name: `${(milestone as any).repository?.toUpperCase() || 'DIR'}: ${milestone.title}`,
        start: startDate,
        end: endDate,
        progress: isCompleted ? 100 : progress,
        type: 'task',
        styles: {
          backgroundColor: isCompleted ? '#D1FAE5' : '#9CA3AF',
          backgroundSelectedColor: isCompleted ? '#A7F3D0' : '#6B7280',
          progressColor: isCompleted ? '#059669' : '#000000',
          progressSelectedColor: isCompleted ? '#047857' : '#000000',
        },
        isDisabled: false,
        project: (milestone as any).repository?.toUpperCase() || 'DIR',
        hideChildren: false,
        // Enhanced tooltip data
        customData: {
          description: milestone.description || 'No description available',
          openIssues: milestone.open_issues,
          closedIssues: milestone.closed_issues,
          completion: isCompleted ? 'Completed' : `${progress}% of epics completed`,
          dueDate: endDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          state: milestone.state,
          milestoneNumber: milestone.number,
          repository: (milestone as any).repository || 'dir',
          title: milestone.title
        }
      };
    })
    .filter(Boolean) as GanttTask[];
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload.customData;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
        <h3 className="font-bold text-gray-900 mb-2">{payload[0].payload.name}</h3>
        {data.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">{data.description}</p>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Repository:</span>
            <span className="font-medium text-gray-900">{data.repository.toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status:</span>
            <span className={`font-medium ${data.state === 'closed' ? 'text-green-600' : 'text-blue-600'}`}>
              {data.state === 'closed' ? 'Completed' : 'In Progress'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Epics Progress:</span>
            <span className="font-medium text-blue-600">{data.completion}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Issues:</span>
            <span>
              <span className="text-green-600">{data.closedIssues} closed</span>
              <span className="mx-1">•</span>
              <span className="text-gray-600">{data.openIssues} open</span>
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Due Date:</span>
            <span className={new Date() > new Date(payload[0].payload.end) ? 'text-red-600 font-medium' : ''}>
              {data.dueDate}
            </span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <a 
            href={`https://github.com/agntcy/${data.repository}/milestone/${data.milestoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const generateTimelineDates = (tasks: any[]) => {
    if (!tasks || !tasks.length || !Array.isArray(tasks)) return [];
    
    const allDates = tasks.flatMap(task => {
      if (!task || !task.start || !task.end) return [];
      return [task.start.getTime(), task.end.getTime()];
    });
    
    if (!allDates.length) return [];
    
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    
    const dates = [];
    const currentDate = new Date(minDate);
    currentDate.setDate(currentDate.getDate() - 7); // Start 7 days before first milestone
    
    while (currentDate <= maxDate) {
      dates.push(new Date(currentDate).getTime());
      currentDate.setDate(currentDate.getDate() + 14); // 2-week intervals
    }
    
    return dates;
  };
  
  const calculateTaskPosition = (task: any, timelineDates: number[]) => {
    if (!timelineDates.length) return { startPosition: 0, width: 0 };
    
    const taskStart = task.start.getTime();
    const taskEnd = task.end.getTime();
    const timelineStart = timelineDates[0];
    const timelineEnd = timelineDates[timelineDates.length - 1];
    
    const totalDuration = timelineEnd - timelineStart;
    const startPosition = ((taskStart - timelineStart) / totalDuration) * 100;
    const width = ((taskEnd - taskStart) / totalDuration) * 100;
    
    return {
      startPosition: Math.max(0, startPosition),
      width: Math.max(1, width)
    };
  };

  const [milestones, setMilestones] = useState<GitHubMilestone[]>([]);
  const [discussions, setDiscussions] = useState<GitHubDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repoStats, setRepoStats] = useState({ stars: 0, forks: 0, name: '', openIssues: 0, downloads: 0, contributors: 0, pullRequests: 0, newContributorsThisMonth: 0, starsThisMonth: 0, forksThisMonth: 0, downloadsThisMonth: 0 });

  // Workflow step interfaces
  interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    type: 'automated' | 'human_approval' | 'data_collection' | 'notification';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'waiting_approval';
    startTime?: Date;
    endTime?: Date;
    executionTime?: number;
    simulatedData?: any;
    approvalOptions?: Array<{ id: string; label: string; description: string; action: 'approve' | 'modify' | 'reject' | 'skip' }>;
  }

  interface WorkflowExecution {
    id: string;
    agentId: string;
    agentName: string;
    status: 'idle' | 'running' | 'paused' | 'completed';
    currentStepIndex: number;
    steps: WorkflowStep[];
    startTime?: Date;
    endTime?: Date;
    contributor: {
      username: string;
      experience: string;
      interests: string[];
    };
  }

  // Agent simulation state
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowExecution | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
    
  
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'integration-agent',
      name: 'New Developer Onboarding',
      type: 'contribution',
      status: 'idle',
      description: 'Onboards new developers with custom video tutorials and environment setup',
      progress: 0,
      metrics: {
        totalWorkflows: 8,
        successRate: 87.5,
        averageCompletionTime: 6.8
      }
    },
    {
      id: 'welcome-agent',
      name: 'New Contributor Onboarding',
      type: 'welcome',
      status: 'idle',
      description: 'Onboards new contributors and notifies working group members weekly',
      progress: 0,
      metrics: {
        totalWorkflows: 12,
        successRate: 95.8,
        averageCompletionTime: 4.2
      }
    },
    {
      id: 'community-agent',
      name: 'Community Growth',
      type: 'triage',
      status: 'idle',
      description: 'Analyzes contribution and developer growth patterns across the directory ecosystem',
      progress: 0,
      metrics: {
        totalWorkflows: 15,
        successRate: 92.0,
        averageCompletionTime: 3.5
      }
    }
  ]);

  // Simulation functions
  const startSimulation = () => {
    setIsSimulationRunning(true);
  };

  const stopSimulation = () => {
    setIsSimulationRunning(false);
  };

  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setSimulationSpeed(1);
    setActiveWorkflows([]);
    setAgents(agents.map(agent => ({ ...agent, status: 'idle', progress: 0 })));
  };

  const getWorkflowSteps = (agentId: string): WorkflowStep[] => {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return [];

  switch (agentId) {
    case 'welcome-agent':
      return [
        {
          id: 'welcome-1',
          name: 'Analyze Contributor Profile',
          description: 'Analyze GitHub profile, contribution history, and technical background',
          type: 'data_collection',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'welcome-2',
          name: 'Send Personalized Welcome',
          description: 'Send customized welcome message based on contributor analysis',
          type: 'notification',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'welcome-3',
          name: 'First Contribution Assignment',
          description: 'Assign appropriate first contribution based on skills and interests',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'welcome-4',
          name: 'Contribution Recognition & Badging',
          description: 'Award contribution maturity badges and recognize achievements',
          type: 'human_approval',
          status: 'pending',
          approvalOptions: [
            { id: 'approve', label: 'Award Badge', description: 'Grant recognition badge', action: 'approve' },
            { id: 'defer', label: 'Defer Recognition', description: 'Wait for more contributions', action: 'skip' },
            { id: 'upgrade', label: 'Upgrade Badge', description: 'Award higher level badge', action: 'modify' }
          ]
        },
        {
          id: 'welcome-5',
          name: 'Weekly WG Notification',
          description: 'Add contributor to weekly working group notification digest',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'welcome-6',
          name: 'Contributor Growth Tracking',
          description: 'Track contributor progress and suggest next steps',
          type: 'data_collection',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'welcome-7',
          name: 'Community Integration',
          description: 'Integrate contributor into community channels and discussions',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'welcome-8',
          name: 'Onboarding Completion',
          description: 'Complete onboarding and transition to active contributor status',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        }
      ];
    case 'integration-agent':
      return [
        {
          id: 'integration-1',
          name: 'Developer Profile Analysis',
          description: 'Analyze developer profile from GitHub and LinkedIn for personalized onboarding',
          type: 'data_collection',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'integration-2',
          name: 'Environment Setup Assessment',
          description: 'Assess current development environment and setup requirements',
          type: 'data_collection',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'integration-3',
          name: 'Custom Video Tutorial Generation',
          description: 'Generate personalized video tutorial based on environment setup and developer profile',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'integration-4',
          name: 'Integration Recommendations',
          description: 'Review and approve recommended integration approach for the project',
          type: 'human_approval',
          status: 'pending',
          approvalOptions: [
            { id: 'approve', label: 'Use This Approach', description: 'Recommended integration strategy', action: 'approve' },
            { id: 'modify', label: 'Modify Approach', description: 'Adjust integration strategy', action: 'modify' },
            { id: 'custom', label: 'Custom Integration', description: 'Design custom approach', action: 'modify' }
          ]
        },
        {
          id: 'integration-5',
          name: 'Automated Setup Script Generation',
          description: 'Generate automated setup scripts for the directory integration',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'integration-6',
          name: 'Weekly WG Digest Preparation',
          description: 'Prepare weekly working group notification with new developer profiles and integration statuses',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'integration-7',
          name: 'Target Follow-up Recommendations',
          description: 'Generate persona-based follow-up recommendations for working group members',
          type: 'data_collection',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'integration-8',
          name: 'Integration Validation',
          description: 'Validate successful integration and run compatibility tests',
          type: 'human_approval',
          status: 'pending',
          approvalOptions: [
            { id: 'approve', label: 'Integration Complete', description: 'Successfully integrated', action: 'approve' },
            { id: 'debug', label: 'Debug Issues', description: 'Fix integration problems', action: 'modify' },
            { id: 'retry', label: 'Retry Integration', description: 'Attempt different approach', action: 'modify' }
          ]
        }
      ];
    case 'community-agent':
      return [
        {
          id: 'community-1',
          name: 'Ecosystem-Wide Data Collection',
          description: 'Collect contribution and growth data across all directory projects (dir, dir-spec, oasf-sdk)',
          type: 'data_collection',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'community-2',
          name: 'Cross-Project Growth Analysis',
          description: 'Analyze growth patterns and contributor movement between directory projects',
          type: 'human_approval',
          status: 'pending',
          approvalOptions: [
            { id: 'approve', label: 'Publish Analysis', description: 'Share ecosystem insights', action: 'approve' },
            { id: 'modify', label: 'Adjust Analysis', description: 'Modify analysis approach', action: 'modify' },
            { id: 'internal', label: 'Internal Only', description: 'For working group review', action: 'skip' }
          ]
        },
        {
          id: 'community-3',
          name: 'Developer Journey Mapping',
          description: 'Map developer journeys across directory ecosystem projects and integrations',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'community-4',
          name: 'Adoption Pattern Analysis',
          description: 'Identify adoption patterns and integration success across different use cases',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'community-5',
          name: 'Ecosystem Engagement Metrics',
          description: 'Analyze cross-project engagement and identify ecosystem growth opportunities',
          type: 'data_collection',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'community-6',
          name: 'Contributor Blocker Detection',
          description: 'Detect patterns of blockers for contributors and developers based on behavioral data',
          type: 'data_collection',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'community-7',
          name: 'Weekly Blocker Analysis Report',
          description: 'Send weekly blocker analysis to working group in Slack with recommendations',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'community-8',
          name: 'Knowledge Sharing Recommendations',
          description: 'Recommend knowledge sharing opportunities and community initiatives',
          type: 'automated',
          status: 'pending',
          approvalOptions: []
        },
        {
          id: 'community-9',
          name: 'Ecosystem Health Report',
          description: 'Generate comprehensive ecosystem health and growth report',
          type: 'human_approval',
          status: 'pending',
          approvalOptions: [
            { id: 'publish', label: 'Publish Report', description: 'Share with community', action: 'approve' },
            { id: 'draft', label: 'Save as Draft', description: 'Refine before publishing', action: 'modify' },
            { id: 'internal', label: 'Internal Only', description: 'For internal review', action: 'skip' }
          ]
        }
      ];
      default:
        return [];
    }
  };

  const startAgentSimulation = (agentId: string) => {
    console.log(`startAgentSimulation called with agentId: ${agentId}`);
    const agent = agents.find(a => a.id === agentId);
    if (!agent) {
      console.log(`Agent not found for ID: ${agentId}`);
      return;
    }

    console.log(`Starting simulation for ${agent.name} (${agentId})`);
    
    const workflowSteps = getWorkflowSteps(agentId);
    console.log(`Workflow steps for ${agent.name}:`, workflowSteps.length, 'steps');

    // Create workflow execution
    const workflowExecution: WorkflowExecution = {
      id: `workflow-${Date.now()}`,
      agentId,
      agentName: agent.name,
      status: 'running',
      currentStepIndex: 0,
      startTime: new Date(),
      contributor: {
        username: 'johndoe',
        experience: 'intermediate',
        interests: ['frontend', 'documentation']
      },
      steps: workflowSteps
    };
    
    console.log(`Created workflow execution:`, workflowExecution);

    setSelectedWorkflow(workflowExecution);
    
    setAgents(prev => prev.map(a => 
      a.id === agentId 
        ? { ...a, status: 'running', progress: 0 } 
        : a
    ));
    
    executeWorkflowSteps(workflowExecution);
  };

  const executeWorkflowSteps = (workflow: WorkflowExecution) => {
    console.log(`executeWorkflowSteps called for ${workflow.agentName} with ${workflow.steps.length} steps`);
    console.log(`Current simulation speed: ${simulationSpeed}x`);
    
    if (!workflow.steps || workflow.steps.length === 0) {
      console.error(`No steps found for workflow ${workflow.agentName}`);
      return;
    }
    
    let currentStepIndex = workflow.currentStepIndex || 0;
    console.log(`Starting from step index: ${currentStepIndex}`);
    
    const executeNextStep = () => {
      console.log(`Executing step ${currentStepIndex + 1}/${workflow.steps.length} for ${workflow.agentName}`);
      
      if (currentStepIndex >= workflow.steps.length) {
        console.log(`Workflow completed for ${workflow.agentName}`);
        completeWorkflow(workflow);
        return;
      }

      const step = workflow.steps[currentStepIndex];
      console.log(`Starting step: ${step.name} (${step.type})`);
      const updatedWorkflow = { ...workflow };
      updatedWorkflow.currentStepIndex = currentStepIndex;
      updatedWorkflow.steps = [...workflow.steps];
      updatedWorkflow.steps[currentStepIndex] = { ...step, status: 'running', startTime: new Date() };
      
      setSelectedWorkflow(updatedWorkflow);
      
      // Simulate step execution
      setTimeout(() => {
        const processedStep = { ...step, endTime: new Date() };
        processedStep.executionTime = processedStep.endTime.getTime() - (processedStep.startTime?.getTime() || 0);
        processedStep.simulatedData = generateSimulatedData(step);
        
        if (step.type === 'human_approval') {
          processedStep.status = 'waiting_approval';
          updatedWorkflow.steps[currentStepIndex] = processedStep;
          setSelectedWorkflow(updatedWorkflow);
          
          // Auto-approve after 2 seconds for demo purposes (happy path)
          const approvalDelay = 2000 / simulationSpeed;
          console.log(`Scheduling auto-approval for ${step.name} in ${approvalDelay}ms`);
          setTimeout(() => {
            console.log(`Auto-approving step: ${step.name} for ${workflow.agentName}`);
            console.log(`Workflow ID: ${workflow.id}, Step ID: ${step.id}`);
            handleApproval(workflow.id, step.id, 'approve', workflow);
          }, approvalDelay);
        } else {
          processedStep.status = 'completed';
          updatedWorkflow.steps[currentStepIndex] = processedStep;
          setSelectedWorkflow(updatedWorkflow);
          currentStepIndex++;
          setTimeout(executeNextStep, 1000 / simulationSpeed);
        }
      }, 2000 / simulationSpeed);
    };
    
    executeNextStep();
  };

  const generateSimulatedData = (step: WorkflowStep) => {
    switch (step.id) {
      // New Contributor Onboarding
      case 'welcome-1':
        return {
          technical_experience: 'intermediate',
          preferred_languages: ['TypeScript', 'JavaScript'],
          activity_level: 'moderate',
          confidence: 0.85
        };
      case 'welcome-2':
        return {
          message: 'Welcome johndoe! We noticed your experience with TypeScript. Here are some great first issues...',
          personalization_score: 0.9
        };
      case 'welcome-3':
        return {
          assigned_issue: 'Add TypeScript types for new API endpoints',
          difficulty_level: 'beginner',
          estimated_time: '2-3 hours',
          mentor_assigned: 'alice'
        };
      case 'welcome-4':
        return {
          badge_awarded: 'First Contribution',
          badge_level: 'bronze',
          contribution_count: 1,
          recognition_message: 'Congratulations on your first contribution!'
        };
      case 'welcome-5':
        return {
          notification_sent: true,
          wg_members_notified: 12,
          weekly_digest_scheduled: true
        };
      case 'welcome-6':
        return {
          progress_score: 0.75,
          next_suggested_contribution: 'Improve documentation',
          skill_development: ['API design', 'TypeScript']
        };
      case 'welcome-7':
        return {
          channels_joined: ['discord-general', 'github-discussions'],
          community_score: 0.8,
          integration_complete: true
        };
      case 'welcome-8':
        return {
          onboarding_status: 'completed',
          contributor_level: 'active',
          total_contributions: 3,
          next_milestone: 'regular contributor'
        };
            
      // New Developer Onboarding
      case 'integration-1':
        return {
          project_type: 'React Application',
          tech_stack: ['React', 'TypeScript', 'Node.js'],
          integration_points: ['package.json', 'config', 'middleware'],
          complexity: 'medium'
        };
      case 'integration-2':
        return {
          environment_status: 'partially_configured',
          setup_requirements: ['Node.js 18+', 'npm 8+', 'TypeScript 5+'],
          profile_analysis: {
            experience_level: 'intermediate',
            preferred_frameworks: ['React', 'Next.js'],
            learning_style: 'visual'
          }
        };
      case 'integration-3':
        return {
          video_generated: true,
          video_length: '12 minutes',
          content_topics: ['environment setup', 'first integration', 'common pitfalls'],
          personalization_score: 0.92
        };
      case 'integration-4':
        return {
          recommended_approach: 'npm package integration',
          compatibility_score: 0.95,
          setup_time: '30 minutes',
          maintenance_overhead: 'low'
        };
      case 'integration-5':
        return {
          scripts_generated: ['setup.sh', 'validate.js', 'example.js'],
          automation_level: 'high',
          custom_configurations: 3
        };
      case 'integration-6':
        return {
          digest_prepared: true,
          new_developers: 5,
          integration_statuses: {
            completed: 3,
            in_progress: 2,
            blocked: 0
          },
          follow_up_recommendations: 8
        };
      case 'integration-7':
        return {
          behavioral_patterns: {
            completion_rate: 0.85,
            preferred_contact: 'email',
            active_hours: '9-17 UTC',
            skill_gaps: ['advanced TypeScript']
          },
          follow_up_actions: ['advanced tutorial', 'mentor pairing', 'office hours invite']
        };
      case 'integration-8':
        return {
          validation_passed: true,
          test_results: {
            unit_tests: 'passing',
            integration_tests: 'passing',
            compatibility_tests: 'passing'
          },
          performance_impact: 'minimal'
        };
      
      // Community Growth
      case 'community-1':
        return {
          total_integrations: 156,
          active_projects: 89,
          new_integrations_this_month: 12,
          retention_rate: 0.87
        };
      case 'community-2':
        return {
          contributions_analyzed: 234,
          top_contributors: ['alice', 'bob', 'charlie'],
          community_health_score: 8.5,
          growth_trend: 'positive'
        };
      case 'community-3':
        return {
          success_stories: [
            'Company X reduced integration time by 60%',
            'Startup Y built ecosystem on directory standard',
            'Enterprise Z adopted across 5 departments'
          ],
          impact_metrics: {
            time_saved: '4500 hours',
            cost_reduction: '$2.3M',
            developer_satisfaction: 9.2
          }
        };
      case 'community-5':
        return {
          engagement_metrics: {
            github_stars: 1250,
            forks: 234,
            issues_resolved: 89,
            pr_merged: 45
          },
          growth_opportunities: ['documentation', 'examples', 'plugins']
        };
      case 'community-6':
        return {
          blocker_patterns: {
            setup_issues: 0.35,
            documentation_gaps: 0.28,
            api_complexity: 0.22,
            tooling_barriers: 0.15
          },
          affected_users: 45,
          severity_levels: {
            high: 8,
            medium: 23,
            low: 14
          }
        };
      case 'community-7':
        return {
          weekly_report_sent: true,
          slack_channel: '#wg-ecosystem',
          blocker_summary: {
            new_blockers: 5,
            resolved_blockers: 12,
            recurring_patterns: 3
          },
          recommendations_sent: 8
        };
      case 'community-8':
        return {
          knowledge_sharing_opportunities: [
            'weekly office hours',
            'contributor spotlight',
            'integration patterns library'
          ],
          community_initiatives: 4,
          engagement_boost: 0.23
        };
      case 'community-9':
        return {
          ecosystem_health: 9.1,
          adoption_rate: 0.73,
          community_satisfaction: 8.8,
          recommendations: ['expand documentation', 'more enterprise features']
        };
      
      default:
        return { status: 'completed', timestamp: new Date() };
    }
  };

  const handleApproval = (workflowId: string, stepId: string, action: string, currentWorkflow?: WorkflowExecution) => {
    console.log(`handleApproval called: workflowId=${workflowId}, stepId=${stepId}, action=${action}`);
    const workflow = currentWorkflow || selectedWorkflow;
    if (!workflow || workflow.id !== workflowId) {
      console.log('Workflow not found or ID mismatch');
      console.log(`Looking for workflow ID: ${workflowId}`);
      console.log(`Current workflow ID: ${workflow?.id || 'none'}`);
      return;
    }

    const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;

    const updatedWorkflow = { ...workflow };
    updatedWorkflow.steps = [...workflow.steps];
    updatedWorkflow.steps[stepIndex] = {
      ...workflow.steps[stepIndex],
      status: 'completed',
      endTime: new Date(),
      simulatedData: { ...workflow.steps[stepIndex].simulatedData, approval: action }
    };

    setSelectedWorkflow(updatedWorkflow);

    // Continue with next step
    setTimeout(() => {
      console.log(`Continuing workflow after approval. Next step index: ${stepIndex + 1}`);
      const nextWorkflow = { ...updatedWorkflow, currentStepIndex: stepIndex + 1 };
      executeWorkflowSteps(nextWorkflow);
    }, 1000 / simulationSpeed);
  };

  const completeWorkflow = (workflow: WorkflowExecution) => {
    const completedWorkflow = { ...workflow, status: 'completed' as const, endTime: new Date() };
    setSelectedWorkflow(completedWorkflow);
    
    setAgents(prev => prev.map(agent => 
      agent.id === workflow.agentId 
        ? { ...agent, status: 'completed', progress: 100, metrics: { ...agent.metrics, totalWorkflows: agent.metrics.totalWorkflows + 1 } }
        : agent
    ));
    
  };

  
  // Demo mode functions
  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    const scenario = getScenarioById(scenarioId);
    if (scenario) {
      // Update the contributor info for the selected scenario
      const agentId = `${scenario.agentType}-agent`;
      setAgents(prev => prev.map(agent => 
        agent.id === agentId 
          ? { ...agent, contributor: scenario.contributor }
          : agent
      ));
    }
  };

  const handleAutoPilotToggle = (enabled: boolean) => {
    setAutoPilot(enabled);
  };

  const handleRunAllScenarios = async () => {
    setIsRunningAllScenarios(true);
    
    for (const scenario of demoScenarios) {
      setSelectedScenario(scenario.id);
      handleScenarioSelect(scenario.id);
      
      // Start the agent for this scenario
      const agentId = `${scenario.agentType}-agent`;
      await new Promise(resolve => setTimeout(resolve, 1000));
      startAgentSimulation(agentId);
      
      // Wait for scenario to complete or timeout
      await new Promise(resolve => setTimeout(resolve, scenario.timing.totalDuration + 2000));
    }
    
    setIsRunningAllScenarios(false);
  };

  const runDemoScenario = (scenarioId: string) => {
    const scenario = getScenarioById(scenarioId);
    if (!scenario || !autoPilot) return;
    
    const agentId = `${scenario.agentType}-agent`;
    
    // Set up auto-approval for human steps
    runAutoPilotScenario(scenario, (stepId) => {
      const response = scenario.humanResponses[stepId];
      if (response) {
        setTimeout(() => {
          handleApproval(selectedWorkflow?.id || '', stepId, response.action);
        }, scenario.timing.approvalDelay);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return `${AGENT_COLORS.pending.bg} ${AGENT_COLORS.pending.text} ${AGENT_COLORS.pending.border}`;
      case 'running': return `${AGENT_COLORS.automated.bg} ${AGENT_COLORS.automated.text} ${AGENT_COLORS.automated.border}`;
      case 'paused': return `${AGENT_COLORS.human.bg} ${AGENT_COLORS.human.text} ${AGENT_COLORS.human.border}`;
      case 'completed': return `${AGENT_COLORS.completed.bg} ${AGENT_COLORS.completed.text} ${AGENT_COLORS.completed.border}`;
      default: return `${AGENT_COLORS.pending.bg} ${AGENT_COLORS.pending.text} ${AGENT_COLORS.pending.border}`;
    }
  };

  const [contributorGrowth, setContributorGrowth] = useState<{month: string; contributors: number}[]>([
    { month: 'Jul', contributors: 3 },
    { month: 'Aug', contributors: 6 },
    { month: 'Sep', contributors: 8 },
    { month: 'Oct', contributors: 9 },
    { month: 'Nov', contributors: 11 },
    { month: 'Dec', contributors: 12 }
  ]);
  const [detailedAnalytics, setDetailedAnalytics] = useState<{
    newContributorsPerMonth: {month: string; newContributors: number}[];
    retentionRates: {month: string; retentionRate: number}[];
    mostActiveNewContributors: {username: string; contributions: number; firstMonth: string}[];
  }>({
    newContributorsPerMonth: [],
    retentionRates: [],
    mostActiveNewContributors: []
  });
  const [viralityData, setViralityData] = useState<{
    dependentsCount: number;
    packagesCount: number;
    kFactor: number;
    topDependents: {name: string; stars: number; forks: number}[];
  }>({
    dependentsCount: 0,
    packagesCount: 0,
    kFactor: 0,
    topDependents: []
  });
  const [adoptionMetrics, setAdoptionMetrics] = useState<{
    downloadTrends: {month: string; downloads: number}[];
    netNewDownloads: {month: string; downloads: number}[];
    geographicDistribution: {country: string; percentage: number}[];
    industryBreakdown: {industry: string; count: number}[];
  }>({
    downloadTrends: [
      { month: 'Jul', downloads: 245 },
      { month: 'Aug', downloads: 312 },
      { month: 'Sep', downloads: 389 },
      { month: 'Oct', downloads: 467 },
      { month: 'Nov', downloads: 523 },
      { month: 'Dec', downloads: 589 }
    ],
    netNewDownloads: [
      { month: 'Jul', downloads: 245 },
      { month: 'Aug', downloads: 67 },
      { month: 'Sep', downloads: 77 },
      { month: 'Oct', downloads: 78 },
      { month: 'Nov', downloads: 56 },
      { month: 'Dec', downloads: 66 }
    ],
    geographicDistribution: [],
    industryBreakdown: []
  });
  const [downloadView, setDownloadView] = useState<'net-new' | 'cumulative'>('net-new');
  const [devExperienceMetrics, setDevExperienceMetrics] = useState<{
    issueResolutionTime: {averageHours: number; trend: 'improving' | 'declining' | 'stable'};
    documentationEngagement: {views: number; uniqueReaders: number};
    apiResponseTimes: {averageMs: number; p95Ms: number};
    codeReviewTime: {averageHours: number; medianHours: number};
  }>({
    issueResolutionTime: { averageHours: 0, trend: 'stable' },
    documentationEngagement: { views: 0, uniqueReaders: 0 },
    apiResponseTimes: { averageMs: 0, p95Ms: 0 },
    codeReviewTime: { averageHours: 0, medianHours: 0 }
  });

  const [expandedMilestones, setExpandedMilestones] = useState<Set<number>>(new Set());

  const toggleMilestoneDescription = (milestoneId: number) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  };

  const [bugTrends, setBugTrends] = useState<{month: string; bugsOpened: number; bugsClosed: number; netChange: number}[]>([
    { month: 'Jul', bugsOpened: 12, bugsClosed: 8, netChange: 4 },
    { month: 'Aug', bugsOpened: 15, bugsClosed: 18, netChange: -3 },
    { month: 'Sep', bugsOpened: 10, bugsClosed: 14, netChange: -4 },
    { month: 'Oct', bugsOpened: 18, bugsClosed: 12, netChange: 6 },
    { month: 'Nov', bugsOpened: 14, bugsClosed: 16, netChange: -2 },
    { month: 'Dec', bugsOpened: 8, bugsClosed: 11, netChange: -3 }
  ]);

  const [contributorView, setContributorView] = useState<'cumulative' | 'net-new'>('net-new');
  const [starsView, setStarsView] = useState<'cumulative' | 'net-new'>('net-new');
  
  const [starsTrends, setStarsTrends] = useState<{month: string; stars: number}[]>([
    { month: 'Jul', stars: 150 },
    { month: 'Aug', stars: 180 },
    { month: 'Sep', stars: 220 },
    { month: 'Oct', stars: 265 },
    { month: 'Nov', stars: 310 },
    { month: 'Dec', stars: 355 }
  ]);
  
  const [netNewStarsTrends, setNetNewStarsTrends] = useState<{month: string; newStars: number}[]>([
    { month: 'Jul', newStars: 15 },
    { month: 'Aug', newStars: 30 },
    { month: 'Sep', newStars: 40 },
    { month: 'Oct', newStars: 45 },
    { month: 'Nov', newStars: 45 },
    { month: 'Dec', newStars: 45 }
  ]);

  const [forksView, setForksView] = useState<'cumulative' | 'net-new'>('net-new');
  
  const [forksTrends, setForksTrends] = useState<{month: string; forks: number}[]>([
    { month: 'Jul', forks: 45 },
    { month: 'Aug', forks: 58 },
    { month: 'Sep', forks: 72 },
    { month: 'Oct', forks: 89 },
    { month: 'Nov', forks: 105 },
    { month: 'Dec', forks: 124 }
  ]);

  const [netNewForksTrends, setNetNewForksTrends] = useState<{month: string; newForks: number}[]>([
    { month: 'Jul', newForks: 8 },
    { month: 'Aug', newForks: 13 },
    { month: 'Sep', newForks: 14 },
    { month: 'Oct', newForks: 17 },
    { month: 'Nov', newForks: 16 },
    { month: 'Dec', newForks: 19 }
  ]);


  const ganttTasks = useMemo(() => createGanttTasks(milestones), [milestones]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from server-side API route
        const response = await fetch('/api/github-data');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch GitHub data: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        // Set all data from server response
        if (data.milestones) setMilestones(data.milestones);
        if (data.discussions) setDiscussions(data.discussions);
        if (data.stars) setRepoStats(data.stars);
        if (data.contributorGrowth) setContributorGrowth(data.contributorGrowth);
        if (data.contributorAnalytics) setDetailedAnalytics(data.contributorAnalytics);
        if (data.dependents) setViralityData(data.dependents);
        if (data.adoption) setAdoptionMetrics(data.adoption);
        if (data.devExperience) setDevExperienceMetrics(data.devExperience);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        
        // Set fallback data
        setMilestones([{
          id: 1,
          number: 1,
          title: 'Core Infrastructure v1.0',
          description: 'Complete core infrastructure setup',
          state: 'closed',
          open_issues: 0,
          closed_issues: 12,
          created_at: '2024-07-01T00:00:00Z',
          updated_at: '2024-07-15T00:00:00Z',
          due_on: '2024-07-15T00:00:00Z',
          html_url: 'https://github.com/agntcy/dir/milestone/1',
          repository: 'dir'
        }]);
        setDiscussions([{
          id: 1,
          number: 123,
          title: 'Discussion: API Rate Limiting Strategy',
          body: 'We need to discuss the best approach for handling API rate limits in production...',
          created_at: '2024-12-01T10:00:00Z',
          updated_at: '2024-12-02T15:30:00Z',
          comments: 8,
          html_url: 'https://github.com/agntcy/dir/issues/123'
        }]);
        setRepoStats({
          stars: 0,
          forks: 0,
          name: 'dir',
          openIssues: 0,
          downloads: 1200,
          contributors: 0,
          pullRequests: 45,
          newContributorsThisMonth: 0,
          starsThisMonth: 0,
          forksThisMonth: 0,
          downloadsThisMonth: 150
        });
        setContributorGrowth([]);
        setDetailedAnalytics({
          newContributorsPerMonth: [],
          retentionRates: [],
          mostActiveNewContributors: []
        });
        setViralityData({ dependentsCount: 0, packagesCount: 0, kFactor: 0, topDependents: [] });
        setAdoptionMetrics({ downloadTrends: [], netNewDownloads: [], geographicDistribution: [], industryBreakdown: [] });
        setDevExperienceMetrics({
          issueResolutionTime: { averageHours: 0, trend: 'stable' },
          documentationEngagement: { views: 0, uniqueReaders: 0 },
          apiResponseTimes: { averageMs: 0, p95Ms: 0 },
          codeReviewTime: { averageHours: 0, medianHours: 0 }
        });
      }
      
      setLoading(false);
    };

    fetchData();
  }, []);

  const completedMilestones = useMemo(() => 
    milestones.filter(m => m.state === 'closed'), 
    [milestones]
  );

  const inProgressMilestones = useMemo(() => 
    milestones
      .filter(m => m.state === 'open')
      .sort((a, b) => {
        if (!a.due_on && !b.due_on) return 0;
        if (!a.due_on) return 1; // Put milestones without due dates at the end
        if (!b.due_on) return -1; // Put milestones without due dates at the end
        return new Date(a.due_on).getTime() - new Date(b.due_on).getTime(); // Soonest due date first
      }), 
    [milestones]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
            
      {/* Main Content */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info - Hidden */}

        <header id="overview" className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AGNTCY Directory OSS Pulse
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Real-time insights into project health, community engagement, and technical excellence
          </p>
          <div className="text-gray-500 text-sm max-w-3xl mx-auto leading-relaxed mt-2">
            data srcs: agntcy GH repos - dir, dir-spec, oasf-sdk
          </div>
        </header>

      {/* Community Engagement Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Community Engagement</h2>
            <p className="text-gray-700">Track community growth and activity patterns</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2 mb-12">
        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="p-2 md:p-3 text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mb-1 mx-auto">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">
              {repoStats.stars.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm font-medium">GitHub Stars</div>
            <div className="text-xs text-gray-500 mt-1">
              +{netNewStarsTrends.length > 0 
                ? netNewStarsTrends[netNewStarsTrends.length - 1].newStars
                : (repoStats.starsThisMonth || 0)
              } this month
            </div>
          </div>
        </Card>
        
        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="p-2 md:p-3 text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mb-1 mx-auto">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
              </svg>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">
              {repoStats.forks.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm font-medium">Forks</div>
            <div className="text-xs text-gray-500 mt-1">
              +{netNewForksTrends.length > 0 
                ? netNewForksTrends[netNewForksTrends.length - 1].newForks
                : (repoStats.forksThisMonth || 0)
              } this month
            </div>
          </div>
        </Card>
        
        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="p-2 md:p-3 text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full mb-1 mx-auto">
              <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-1">
              {repoStats.downloads.toLocaleString()}
            </div>
            <div className="text-gray-600 text-sm font-medium">Downloads</div>
            <div className="text-xs text-gray-500 mt-1">
              +{repoStats.downloadsThisMonth || 0} this month
            </div>
          </div>
        </Card>
        
        <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="p-2 md:p-3 text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-teal-100 rounded-full mb-1 mx-auto">
              <svg className="w-4 h-4 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-teal-600 mb-1">
              {repoStats.contributors || 0}
            </div>
            <div className="text-gray-600 text-sm font-medium">Contributors</div>
            <div className="text-xs text-gray-500 mt-1">
              +{detailedAnalytics.newContributorsPerMonth.length > 0 
                ? detailedAnalytics.newContributorsPerMonth[detailedAnalytics.newContributorsPerMonth.length - 1].newContributors 
                : repoStats.newContributorsThisMonth || 0} this month
            </div>
          </div>
        </Card>
        
              </div>

      {/* Community Engagement Graphs */}
      <div id="community" className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Graphs (2 columns) */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Left: Contributor Growth */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Contributor Growth</h3>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setContributorView('net-new')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    contributorView === 'net-new'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Net New
                </button>
                <button
                  onClick={() => setContributorView('cumulative')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    contributorView === 'cumulative'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cumulative
                </button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <LineChart data={contributorView === 'cumulative' ? contributorGrowth : 
    (detailedAnalytics.newContributorsPerMonth.length > 0 ? detailedAnalytics.newContributorsPerMonth :
      contributorGrowth.map((item, index) => {
        if (index === 0) return { month: item.month, newContributors: item.contributors };
        const previousContributors = contributorGrowth[index - 1].contributors;
        return { month: item.month, newContributors: item.contributors - previousContributors };
      })
    )
  }>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey={contributorView === 'cumulative' ? 'contributors' : 'newContributors'} 
                    stroke={contributorView === 'cumulative' ? '#10b981' : '#3b82f6'} 
                    strokeWidth={2}
                    dot={{ fill: contributorView === 'cumulative' ? '#059669' : '#2563eb', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Middle: Stars Growth */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Stars Growth</h3>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setStarsView('net-new')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    starsView === 'net-new'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Net New
                </button>
                <button
                  onClick={() => setStarsView('cumulative')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    starsView === 'cumulative'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cumulative
                </button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <LineChart data={starsView === 'cumulative' ? starsTrends : netNewStarsTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey={starsView === 'cumulative' ? 'stars' : 'newStars'} 
                    stroke={starsView === 'cumulative' ? '#f59e0b' : '#ef4444'} 
                    strokeWidth={2}
                    dot={{ fill: starsView === 'cumulative' ? '#d97706' : '#dc2626', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Right: Forks Growth */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Forks Growth</h3>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setForksView('net-new')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    forksView === 'net-new'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Net New
                </button>
                <button
                  onClick={() => setForksView('cumulative')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    forksView === 'cumulative'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cumulative
                </button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <LineChart data={forksView === 'cumulative' ? forksTrends : netNewForksTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey={forksView === 'cumulative' ? 'forks' : 'newForks'} 
                    stroke={forksView === 'cumulative' ? '#06b6d4' : '#0891b2'} 
                    strokeWidth={2}
                    dot={{ fill: forksView === 'cumulative' ? '#0891b2' : '#0e7490', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bottom Left: Contributor Retention */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Contributor Retention Rates</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <LineChart data={detailedAnalytics.retentionRates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="retentionRate" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#7c3aed', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bottom Middle: Download Trends */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Download Trends</h3>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setDownloadView('net-new')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    downloadView === 'net-new'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Net New
                </button>
                <button
                  onClick={() => setDownloadView('cumulative')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    downloadView === 'cumulative'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cumulative
                </button>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <LineChart 
                  data={downloadView === 'net-new' ? 
    (adoptionMetrics.netNewDownloads.length > 0 ? adoptionMetrics.netNewDownloads : [
      { month: 'Jul', downloads: 245 },
      { month: 'Aug', downloads: 67 },
      { month: 'Sep', downloads: 77 },
      { month: 'Oct', downloads: 78 },
      { month: 'Nov', downloads: 56 },
      { month: 'Dec', downloads: 66 }
    ]) : 
    (adoptionMetrics.downloadTrends.length > 0 ? adoptionMetrics.downloadTrends : [
      { month: 'Jul', downloads: 245 },
      { month: 'Aug', downloads: 312 },
      { month: 'Sep', downloads: 389 },
      { month: 'Oct', downloads: 467 },
      { month: 'Nov', downloads: 523 },
      { month: 'Dec', downloads: 589 }
    ])
  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Downloads']} />
                  <Line 
                    type="monotone" 
                    dataKey="downloads" 
                    stroke={downloadView === 'net-new' ? '#3b82f6' : '#10b981'} 
                    strokeWidth={2}
                    dot={{ fill: downloadView === 'net-new' ? '#2563eb' : '#059669', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
            </div>
          </div>
          
          {/* Right: Compact Metrics Analysis */}
          <div className="lg:col-span-1">
            <MetricsAnalysisCompact 
              stars={repoStats.stars}
              forks={repoStats.forks}
              contributors={repoStats.contributors}
              downloads={repoStats.downloads}
            />
          </div>
        </div>
      </div>

      {/* Developer Experience Metrics */}
      <Card className="mb-8">
        <h3 className="text-xl font-bold text-black mb-4">Developer Experience Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{devExperienceMetrics.issueResolutionTime.averageHours}h</div>
            <div className="text-sm text-gray-600">Issue Resolution Time</div>
            <div className={`text-xs mt-1 ${
              devExperienceMetrics.issueResolutionTime.trend === 'improving' ? 'text-green-600' :
              devExperienceMetrics.issueResolutionTime.trend === 'declining' ? 'text-red-600' :
              'text-gray-500'
            }`}>
              {devExperienceMetrics.issueResolutionTime.trend === 'improving' ? '↓ Improving' :
               devExperienceMetrics.issueResolutionTime.trend === 'declining' ? '↑ Declining' :
               '→ Stable'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{devExperienceMetrics.documentationEngagement.views}</div>
            <div className="text-sm text-gray-600">Documentation Views</div>
            <div className="text-xs mt-1 text-blue-600">↑ Growing</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{devExperienceMetrics.apiResponseTimes.averageMs}ms</div>
            <div className="text-sm text-gray-600">API Response Time</div>
            <div className="text-xs mt-1 text-green-600">↓ Fast</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{devExperienceMetrics.codeReviewTime.averageHours}h</div>
            <div className="text-sm text-gray-600">Code Review Time</div>
            <div className="text-xs mt-1 text-blue-600">→ Stable</div>
          </div>
        </div>
      </Card>


      {/* Project Roadmap */}

      {/* Project Roadmap */}
      <div id="roadmap" className="mb-8">
        <Card>
          <h2 className="text-2xl font-bold text-black mb-4">Project Roadmap</h2>
          <p className="text-gray-700 mb-6">Strategic vision and upcoming initiatives</p>
          
          {/* Milestone Timeline - First Subsection */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-black mb-4">Milestone Timeline</h3>
            <div className="bg-white rounded-lg p-4">
              {ganttTasks.length > 0 ? (
                <>
                  <div className="text-xs text-gray-500 mb-4">
                    Found {ganttTasks.length} milestones
                  </div>
                  <div className="overflow-x-auto border border-gray-300 rounded-lg">
                    <div className="min-w-[1200px] p-4 bg-white">
                      {/* Timeline Header */}
                      <div className="flex border-b-2 border-gray-300 pb-2 mb-4 sticky top-0 bg-white z-20">
                        <div className="w-64 pr-4 font-semibold text-sm text-gray-900 bg-gray-50 sticky left-0 border-r border-gray-300">Milestone</div>
                        <div className="flex-1 flex justify-between text-xs text-gray-500 bg-gray-50">
                          {generateTimelineDates(ganttTasks).map(date => (
                            <div key={date} className="text-center px-2 py-1 border-r border-gray-200">
                              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Gantt Rows */}
                      <div className="space-y-2">
                        {ganttTasks.map((task, index) => {
                          const { startPosition, width } = calculateTaskPosition(task, generateTimelineDates(ganttTasks));
                          const getTaskColor = () => {
                            if (task.progress === 100) return 'bg-green-500 border-green-600'; // Completed
                            if (task.progress > 0) return 'bg-blue-500 border-blue-600'; // In-flight
                            return 'bg-blue-500 border-blue-600'; // Not started
                          };
                          return (
                            <div key={task.id} className="flex items-center sticky left-0 bg-white">
                              {/* Task Name - Sticky */}
                              <div className="w-64 pr-4 sticky left-0 bg-white z-10 border-r border-gray-300">
                                <div className="font-medium text-sm text-gray-900 truncate">
                                  {task.name.split(':')[1]?.trim() || task.name}
                                </div>
                                <div className="text-xs text-gray-500">{task.project}</div>
                              </div>
                              
                              {/* Timeline Bar */}
                              <div className="flex-1 relative h-8">
                                {/* Background Grid */}
                                <div className="absolute inset-0 flex">
                                  {generateTimelineDates(ganttTasks).map((_, i) => (
                                    <div key={i} className="flex-1 border-r border-gray-100"></div>
                                  ))}
                                </div>
                                
                                {/* Task Bar */}
                                <div
                                  className={`absolute top-1 h-8 rounded-md transition-all duration-300 border-2 ${getTaskColor()}`}
                                  style={{
                                    left: `${startPosition}%`,
                                    width: `${Math.max(width, 2)}%`
                                  }}
                                >
                                  {/* Progress overlay for in-flight tasks */}
                                  {task.progress > 0 && task.progress < 100 && (
                                    <div className="absolute inset-0 flex">
                                      {/* Completed portion */}
                                      <div 
                                        className="bg-blue-800 rounded-l-md"
                                        style={{ width: `${task.progress}%` }}
                                      ></div>
                                      {/* Incomplete portion */}
                                      <div 
                                        className="bg-blue-500 rounded-r-md"
                                        style={{ width: `${100 - task.progress}%` }}
                                      ></div>
                                    </div>
                                  )}
                                  <div className="h-full flex items-center justify-center relative z-10">
                                    <span className="text-xs font-bold text-white drop-shadow">
                                      {task.progress}%
                                    </span>
                                  </div>
                                  
                                  {/* Due date indicator for incomplete releases */}
                                  {task.progress < 100 && (
                                    <div className="absolute -top-6 right-0 text-xs text-black font-medium whitespace-nowrap">
                                      {new Date(task.end).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: '2-digit'
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Enhanced Legend */}
                      <div className="flex items-center justify-center mt-6 space-x-8 text-xs">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                          <span className="text-gray-600">Completed</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                          <span className="text-gray-600">Incomplete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No milestones available for timeline view
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div id="milestones" className="mb-8">
        {/* Milestone Progress - Full Width */}
        <Card>
          <h3 className="text-xl font-bold text-black">Milestone Progress</h3>
          <p className="text-gray-700 mb-4">Current status of active milestones</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 w-1/2">Milestone Details</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 w-1/2">Description</th>
                </tr>
              </thead>
              <tbody>
                {inProgressMilestones.slice(0, 5).map((milestone) => {
                  const progress = Math.round(
                    (milestone.closed_issues / (milestone.closed_issues + milestone.open_issues)) * 100
                  );
                  const isExpanded = expandedMilestones.has(milestone.number);
                  return (
                    <tr key={milestone.id} className="border-b border-gray-100">
                      <td className="py-4 px-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-black">{milestone.title}</h4>
                              {milestone.due_on && (
                                <span className="text-xs text-gray-500">
                                  Due: {new Date(milestone.due_on).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-blue-700">{progress}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{milestone.closed_issues} of {milestone.closed_issues + milestone.open_issues} tasks</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {milestone.description ? (
                          <div className="text-sm text-gray-700">
                            {milestone.description}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 italic">
                            Description not available
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {inProgressMilestones.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-center text-gray-500 py-4">
                      No active milestones
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Technical Steering Committee Minutes */}
      <Card id="meetings" className="mb-8">
        <h2 className="text-2xl font-bold text-black">Working Group Meeting Notes</h2>
        <p className="text-gray-700 mb-6">Recent meetings: Key takeaways and decisions</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meeting 1 (Latest) */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-black">Working Group Meeting - Nov 21, 2025</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Discussion #715</span>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Key Decisions:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• DIR v0.6.0 release approved for end of November</li>
                  <li>• Registry protocol v2.0 specification finalized</li>
                  <li>• Agentic Runtime integration roadmap approved</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Action Items:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Complete storage layer refactoring by Dec 1</li>
                  <li>• Update documentation for registry interop</li>
                  <li>• Schedule v0.7.0 planning meeting</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Meeting 2 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-black">WG Meeting - Nov 13, 2025</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Discussion #703</span>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Key Decisions:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• External registry integration strategy approved</li>
                  <li>• Performance benchmarks established</li>
                  <li>• Security audit scope defined</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Action Items:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Implement external registry connectors</li>
                  <li>• Conduct performance testing</li>
                  <li>• Engage security team for audit</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Meeting 3 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-black">WG Meeting - Nov 6, 2025</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Discussion #641</span>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Key Decisions:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Record handling architecture redesigned</li>
                  <li>• Interopability standards adopted</li>
                  <li>• Community governance model updated</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Action Items:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Refactor record processing pipeline</li>
                  <li>• Publish interopability guidelines</li>
                  <li>• Update contribution guidelines</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Meeting 4 (Earliest) */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-black">WG Meeting - Oct 30, 2025</h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Discussion #604</span>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Key Decisions:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Storage specification v1.0 ratified</li>
                  <li>• Agentic Runtime support prioritized</li>
                  <li>• Testing framework requirements defined</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Action Items:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Implement storage layer improvements</li>
                  <li>• Develop Agentic Runtime adapters</li>
                  <li>• Create comprehensive test suite</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* See More Link */}
        <div className="mt-6 text-center">
          <a 
            href="https://github.com/agntcy/dir/discussions/604"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            See all meetings →
          </a>
        </div>
      </Card>

      
      {/* Agent Simulation Section */}
      <div className="mt-12">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-4">
            <Activity className="w-4 h-4 mr-2" />
            Simulated Agentic Workflow
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">AI Agent Simulation System</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience automated OSS contributor onboarding through intelligent AI agents. 
            Watch as they analyze profiles, assign mentors, and guide contributions in real-time.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {agents.map((agent) => (
            <Card key={agent.id} className={`transition-all duration-300 transform hover:scale-102 border-0 shadow-md ${
                  agent.status === 'running' 
                    ? 'ring-2 ring-blue-500 shadow-xl scale-105 animate-pulse' 
                    : agent.status === 'completed'
                    ? 'ring-2 ring-green-500 shadow-lg'
                    : 'hover:shadow-lg'
                }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getAgentColors(agent.type).bg} ${getAgentColors(agent.type).border}`}>
                      {agent.type === 'welcome' ? <Users className="w-5 h-5" style={{ color: getAgentColors(agent.type).primary }} /> :
                       agent.type === 'contribution' ? <GitBranch className="w-5 h-5" style={{ color: getAgentColors(agent.type).primary }} /> :
                       <Brain className="w-5 h-5" style={{ color: getAgentColors(agent.type).primary }} />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-500">{agent.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{agent.description}</p>
                
                {/* Progress Indicator */}
                {agent.status === 'running' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium">{agent.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-700 ease-out ${agent.status === 'running' ? 'animate-pulse' : ''}`}
                        style={{ 
                          width: `${agent.progress}%`,
                          backgroundColor: getAgentColors(agent.type).primary
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Workflows:</span>
                    <span className="font-medium">{agent.metrics.totalWorkflows}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="font-medium">{agent.metrics.successRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Run:</span>
                    <span className="font-medium">
                      {agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const workflow = selectedWorkflow?.agentId === agent.id ? null : 
                        { id: `workflow-${agent.id}`, agentId: agent.id, agentName: agent.name, status: 'idle' as const, currentStepIndex: 0, steps: getWorkflowSteps(agent.id), contributor: { username: 'johndoe', experience: 'intermediate', interests: ['frontend', 'documentation'] } };
                      setSelectedWorkflow(workflow);
                    }}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                      selectedWorkflow?.agentId === agent.id
                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-600 text-white hover:bg-gray-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {selectedWorkflow?.agentId === agent.id ? 'Hide Details' : 'View Details'}
                  </button>
                  <button
                    onClick={() => {
                    console.log(`Button clicked for agent: ${agent.name} (${agent.id})`);
                    startAgentSimulation(agent.id);
                  }}
                    disabled={agent.status !== 'idle'}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                      agent.status === 'idle' 
                        ? 'text-white hover:shadow-md shadow-sm' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{
                      backgroundColor: agent.status === 'idle' ? getAgentColors(agent.type).primary : undefined
                    }}
                  >
                    {agent.status === 'idle' ? (
                      <>
                        <Play className="w-4 h-4 inline mr-2" />
                        Start
                      </>
                    ) : agent.status === 'running' ? (
                      <>
                        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                        Running
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        {agent.status}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Active Workflows */}
        {activeWorkflows.length > 0 && (
          <Card className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Workflows</h3>
            <div className="space-y-3">
              {activeWorkflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{workflow.name}</p>
                    <p className="text-sm text-gray-600">
                      Agent: {workflow.agentName} | Step {workflow.currentStep + 1}/{workflow.totalSteps}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${workflow.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{workflow.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Events */}
        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {events.slice(-10).reverse().map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    event.type.includes('start') ? 'bg-blue-500' :
                    event.type.includes('complete') ? 'bg-green-500' :
                    event.type.includes('approval') ? 'bg-yellow-500' :
                    'bg-gray-400'
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{event.message}</p>
                    <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  event.type.includes('start') ? 'bg-blue-100 text-blue-800' :
                  event.type.includes('complete') ? 'bg-green-100 text-green-800' :
                  event.type.includes('approval') ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Detailed Workflow View */}
        {selectedWorkflow && (
          <Card className="mt-8">
            {/* Workflow Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedWorkflow.agentId === 'welcome-agent' ? 'bg-blue-100' :
                  selectedWorkflow.agentId === 'contribution-agent' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  {selectedWorkflow.agentId === 'welcome-agent' ? <Users className="w-6 h-6 text-blue-600" /> :
                   selectedWorkflow.agentId === 'contribution-agent' ? <GitBranch className="w-6 h-6 text-green-600" /> :
                   <Brain className="w-6 h-6 text-purple-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedWorkflow.agentName}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedWorkflow.agentId === 'community-agent' 
                      ? 'Scope: Directory Ecosystem | Analysis: Cross-Project Patterns'
                      : `Contributor: ${selectedWorkflow.contributor.username} | Experience: ${selectedWorkflow.contributor.experience}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedWorkflow.status)}`}>
                  {selectedWorkflow.status}
                </span>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>
                    {selectedWorkflow.startTime && new Date(selectedWorkflow.startTime).toLocaleTimeString()}
                    {selectedWorkflow.endTime && ` - ${new Date(selectedWorkflow.endTime).toLocaleTimeString()}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Overall Progress</span>
                <span className="font-medium">
                  {selectedWorkflow.currentStepIndex + 1}/{selectedWorkflow.steps.length} steps
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((selectedWorkflow.currentStepIndex + 1) / selectedWorkflow.steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Vertical Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300" />
              
              {/* Steps */}
              <div className="space-y-6">
                {selectedWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="relative flex items-start space-x-4">
                    {/* Step Icon */}
                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      step.status === 'completed' ? 'bg-green-100 border-green-500' :
                      step.status === 'running' ? 'bg-blue-100 border-blue-500' :
                      step.status === 'waiting_approval' ? 'bg-yellow-100 border-yellow-500' :
                      'bg-gray-100 border-gray-300'
                    }`}>
                      {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                       step.status === 'running' ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> :
                       step.status === 'waiting_approval' ? <AlertCircle className="w-5 h-5 text-yellow-600" /> :
                       step.type === 'human_approval' ? <User className="w-5 h-5 text-gray-600" /> :
                       <Bot className="w-5 h-5 text-gray-600" />}
                    </div>

                    {/* Step Content */}
                    <div className={`flex-1 p-4 rounded-lg border ${
                      step.status === 'running' ? 'bg-blue-50 border-blue-200' :
                      step.status === 'waiting_approval' ? 'bg-yellow-50 border-yellow-200' :
                      step.status === 'completed' ? 'bg-green-50 border-green-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {index + 1}. {step.name}
                          </h4>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            step.status === 'completed' ? 'bg-green-100 text-green-800' :
                            step.status === 'running' ? 'bg-blue-100 text-blue-800' :
                            step.status === 'waiting_approval' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {step.status.replace('_', ' ')}
                          </span>
                          {step.executionTime && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {(step.executionTime / 1000).toFixed(1)}s
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Simulated Data Display */}
                      {step.simulatedData && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Generated Output:</h5>
                          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(step.simulatedData, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Approval UI */}
                      {step.status === 'waiting_approval' && step.approvalOptions && (
                        <div className="mt-4">
                          <HumanApprovalCard
                            title={step.name}
                            description={step.description}
                            agentName={selectedWorkflow.agentName}
                            agentType={selectedWorkflow.agentId.replace('-agent', '') as 'welcome' | 'contribution' | 'triage'}
                            contributor={selectedWorkflow.contributor}
                            simulatedData={step.simulatedData || {}}
                            approvalOptions={step.approvalOptions}
                            onApprove={(modifiedData) => {
                              handleApproval(selectedWorkflow.id, step.id, 'approve');
                            }}
                            onReject={(reason) => {
                              handleApproval(selectedWorkflow.id, step.id, 'reject');
                            }}
                            onModify={(modifiedData) => {
                              handleApproval(selectedWorkflow.id, step.id, 'modify');
                            }}
                            isLoading={false}
                            timestamp={new Date()}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Controls */}
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close View
              </button>
              <button
                onClick={() => {
                  console.log('Restart workflow button clicked');
                  const agent = agents.find(a => a.id === selectedWorkflow.agentId);
                  if (agent) {
                    console.log(`Restarting simulation for agent: ${agent.name} (${agent.id})`);
                    startAgentSimulation(agent.id);
                  } else {
                    console.log('No agent found for selected workflow');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Restart Workflow
              </button>
            </div>
          </Card>
        )}
          </div>

        {/* Metrics Panel */}
        <div className="mt-8">
          <MetricsPanel />
        </div>
      </div>

      </div>

      <AIStrategicPartner />
      </div>
    </div>
  );
}