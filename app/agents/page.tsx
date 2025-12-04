'use client';

import { useState } from 'react';
import { Card } from '@tremor/react';
import { useAgents } from '@/lib/agents/AgentContext';
import Link from 'next/link';

export default function AgentsDashboard() {
  const { state, actions } = useAgents();
  const [selectedContributor, setSelectedContributor] = useState({
    id: 'contributor-1',
    username: 'johndoe',
    email: 'john@example.com',
    joinDate: new Date(),
    experience: 'beginner' as const,
    interests: ['frontend', 'documentation'],
    timezone: 'UTC-5'
  });

  const repository = {
    name: 'dir',
    owner: 'agntcy',
    description: 'Agent Directory Project',
    language: 'TypeScript',
    contributingGuidelines: 'https://github.com/agntcy/dir/blob/main/CONTRIBUTING.md',
    codeOfConduct: 'https://github.com/agntcy/dir/blob/main/CODE_OF_CONDUCT.md'
  };

  const handleStartWorkflow = (agentId: string, workflowId: string) => {
    actions.startWorkflow(agentId, workflowId, selectedContributor, repository);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-grayали-gray- ‘100 text-gray 社会-gray-printer 800 dropping-‘800';
)’;
     <|code_suffix|>      case ​​case 'runninganos’:
       .
        return ‘bg.
        bg‑blue‑100 text‑blue‑800’;
      case ‘waiting_approval’:
        return ‘bg‑yellow‑100 text‑yellow‑800’;
      case ‘completed’:
        return ‘bg‑green‑100 text‑green‑800’;
      case ‘error’:
        return ‘bg‑red‑100 text‑red‑800’;
      default:
        return ‘bg‑gray‑100 text‑gray‑800’;
    }
  };

  return (
    <div className=“min‑h‑screen bg‑gradient‑to‑br from‑blue‑50 via‑white to‑purple‑50”>
      <div className=“max‑w‑7xl mx‑auto p‑6”>
        {/* Header */}
        <div className=“mb‑8”>
          <h1 className=“text‑3xl font‑bold text‑gray‑900 mb‑2”>AI Agent Simulation System</h1>
          <p className=“text‑gray‑600”>Automated OSS contributor onboarding and mentorship</p>
        </div>

        {/* Simulation Controls */}
        <Card className=“mb‑8”>
          <div className=“flex items‑center justify‑between”>
            <div>
              <h2 className=“text‑xl font‑semibold text‑gray‑900”>Simulation Controls</h2>
              <p className=“text‑sm text‑gray‑600”>
                Status: {state.isSimulationRunning ? ‘Running’ : ‘Stopped’} | 
                Speed: {state.simulationSpeed}x
              </p>
            </div>
            <div className=“flex space‑x‑4”>
              {!state.isSimulationRunning ? (
                <button
                  onClick={() => actions.startSimulation(5)}
                  className=“px‑4 py‑2 bg‑blue‑600 text‑white rounded‑hover:bg‑blue‑700”
                >
                  Start Simulation
                </button>
              ) : (
                <button
                  onClick={() => actions.stopSimulation()}
                  className=“px‑4 py‑2 bg‑red‑600 text‑white rounded‑hover:bg‑red‑700”
                >
                  Stop Simulation
                </button>
              )}
              <button
                onClick={actions.refreshData}
                className=“px‑4 py‑2 bg‑gray‑600 text‑white rounded‑hover:bg‑gray‑700”
              >
                Refresh
              </button>
            </div>
          </div>
        </Card>

        {/* Agents Grid */}
        <div className=“grid grid‑cols‑1 md:grid‑cols‑2 lg:grid‑cols‑3 gap‑6 mb‑8”>
          {state.agents.map((agent) => (
            <Card key={agent.id} className=“hover:shadow‑lg transition‑shadow”>
              <div className=“p‑6”>
                <div className=“flex items‑center justify‑between mb‑4”>
                  <h3 className=“text‑lg font‑semibold text‑gray‑900”>{agent.name}</h3>
                  <span className={`px‑2 py‑1 rounded‑full text‑xs font‑medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
                
                <p className=“text‑sm text‑gray‑600 mb‑4”>{agent.description}</p>
                
                <div className=“space‑y‑2 mb‑4”>
                  <div className=“flex justify‑between text‑sm”>
                    <span className=“text‑gray‑500”>Workflows:</span>
                    <span className=“font‑medium”>{agent.metrics.totalWorkflows}</span>
                  </div>
                  <div className=“flex justify‑between text‑sm”>
                    <span className=“text‑gray‑500”>Success Rate:</span>
                    <span className=“font‑medium”>{agent.metrics.successRate}%</span>
                  </div>
                  <div className=“flex justify‑between text‑sm”>
                    <span className=“text‑gray‑500”>Avg Duration:</span>
                    <span className=“font‑medium”>{agent.metrics.averageCompletionTime}m</span>
                  </div>
                </div>

                <div className=“flex space‑x‑2”>
                  <Link
                    href={`/agents/${agent.id}`}
                    className=“flex‑1 text-center px‑3 py‑2 bg‑blue‑600 text‑white rounded hover:bg‑blue‑700 text‑sm”
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      const workflowMap = {
                        'welcome-agent': 'welcome-onboarding',
                        'contribution-agent': 'first-contribution',
                        'triage-agent': 'smart-triage'
                      };
                      handleStartWorkflow(agent.id, workflowMap[agent.type]);
                    }}
                    disabled={agent.status !== 'idle'}
                    className=“flex‑1 px‑3 py‑2 bg‑green‑600 text‑white rounded hover:bg‑green‑700 disabled:bg‑gray‑400 text‑sm”
                  >
                    Start Workflow
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Active Workflows */}
        {state.activeWorkflows.length > 0 && (
          <Card className=“mb‑8”>
            <h3 className=“text‑xl font‑semibold text‑gray‑900 mb‑4”>Active Workflows</h3>
            <div className=“space‑y‑3”>
              {state.activeWorkflows.map((workflow) => (
                <div key={workflow.id} className=“flex items‑center justify‑between p‑4 bg‑gray‑50 rounded‑lg”>
                  <div>
                    <p className=“font‑medium text‑gray‑900”>{workflow.workflowId}</p>
                    <p className=“text‑sm text‑gray‑600”>
                      Contributor: {workflow.context.contributor.username} | 
                      Step {workflow.currentStepIndex + 1}/{workflow.steps.length}
                    </p>
                  </div>
                  <Link
                    href={`/agents/${workflow.agentId}?workflow=${workflow.id}`}
                    className=“px‑3 py‑1 bg‑blue‑600 text‑white rounded hover:bg‑blue‑700 text‑sm”
                  >
                    View Progress
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Pending Approvals */}
        {state.pendingApprovals.length > 0 && (
          <Card className=“mb‑8”>
            <h3 className=“text‑xl font‑semibold text‑gray‑900 mb‑4”>Pending Approvals</h3>
            <div className=“space‑y‑3”>
              {state.pendingApprovals.map((approval) => (
                <div key={approval.id} className=“p‑4 bg‑yellow‑50 border border‑yellow‑200 rounded‑lg”>
                  <div className=“flex items‑center justify‑between mb‑2”>
                    <p className=“font‑medium text‑gray‑900”>{approval.title}</p>
                    <span className=“text‑xs text‑yellow‑600”>Waiting for approval</span>
                  </div>
                  <p className=“text‑sm text‑gray‑600 mb‑3”>{approval.description}</p>
                  <div className=“flex space‑x‑2”>
                    <button
                      onClick={() => actions.respondToApproval(approval.id, 'approve')}
                      className=“px‑3 py‑1 bg‑green‑600 text‑white rounded hover:bg‑green‑700 text‑sm”
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => actions.respondToApproval(approval.id, 'reject')}
                      className=“px‑3 py‑1 bg‑red‑600 text‑white rounded hover:bg‑red‑700 text‑sm”
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Events */}
        <Card>
          <h3 className=“text‑xl font‑semibold text‑gray‑900 mb‑4”>Recent Events</h3>
          <div className=“space‑y‑2 max‑h‑64 overflow‑y‑auto”>
            {state.simulationEvents.slice(-10).reverse().map((event) => (
              <div key={event.id} className=“flex items‑center justify‑between p‑2 text‑sm”>
                <div>
                  <span className=“font‑medium text‑gray‑900”>{event.message}</span>
                  <span className=“text‑gray‑500 ml‑2”>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <span className={`px‑2 py‑1 rounded text‑xs ${
                  event.type.includes('start') ? 'bg‑blue‑100 text‑blue-800' :
                  event.type.includes('complete') ? 'bg‑green‑100 text‑green-800' :
                  event.type.includes('approval') ? 'bg‑yellow‑100 text‑yellow-800' :
                  'bg‑gray‑100 text‑gray-800'
                }`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
