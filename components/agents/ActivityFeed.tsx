'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Trash2, 
  Users, 
  GitBranch, 
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface AgentEvent {
  id: string;
  type: 'agent_started' | 'agent_completed' | 'step_started' | 'step_completed' | 'approval_requested' | 'approval_completed' | 'workflow_completed' | 'error';
  agentId: string;
  agentName: string;
  agentType: 'welcome' | 'contribution' | 'triage';
  message: string;
  timestamp: Date;
  details?: {
    stepName?: string;
    stepId?: string;
    workflowId?: string;
    contributor?: string;
    confidence?: number;
    duration?: number;
  };
}

interface ActivityFeedProps {
  events: AgentEvent[];
  onClearAll?: () => void;
  maxEvents?: number;
  className?: string;
}

export default function ActivityFeed({ 
  events, 
  onClearAll, 
  maxEvents = 50, 
  className = "" 
}: ActivityFeedProps) {
  const [filteredEvents, setFilteredEvents] = useState<AgentEvent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // Get unique agents for filtering
  const uniqueAgents = Array.from(new Set(events.map(event => event.agentId)))
    .map(agentId => {
      const event = events.find(e => e.agentId === agentId);
      return {
        id: agentId,
        name: event?.agentName || 'Unknown Agent',
        type: event?.agentType || 'welcome'
      };
    });

  // Event type options
  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'agent_started', label: 'Agent Started' },
    { value: 'agent_completed', label: 'Agent Completed' },
    { value: 'step_started', label: 'Step Started' },
    { value: 'step_completed', label: 'Step Completed' },
    { value: 'approval_requested', label: 'Approval Needed' },
    { value: 'approval_completed', label: 'Approval Completed' },
    { value: 'workflow_completed', label: 'Workflow Completed' },
    { value: 'error', label: 'Error' }
  ];

  // Apply filters
  useEffect(() => {
    let filtered = [...events].slice(-maxEvents);
    
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(event => event.agentId === selectedAgent);
    }
    
    if (selectedEventType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedEventType);
    }
    
    setFilteredEvents(filtered);
  }, [events, selectedAgent, selectedEventType, maxEvents]);

  // Auto-scroll to newest event
  useEffect(() => {
    if (feedRef.current && isExpanded) {
      const scrollContainer = feedRef.current.querySelector('.events-container');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [filteredEvents, isExpanded]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'agent_started': return <Play className="w-4 h-4" />;
      case 'agent_completed': return <CheckCircle className="w-4 h-4" />;
      case 'step_started': return <Activity className="w-4 h-4" />;
      case 'step_completed': return <CheckCircle className="w-4 h-4" />;
      case 'approval_requested': return <AlertCircle className="w-4 h-4" />;
      case 'approval_completed': return <CheckCircle className="w-4 h-4" />;
      case 'workflow_completed': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'agent_started': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'agent_completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'step_started': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'step_completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'approval_requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approval_completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'workflow_completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'welcome': return <Users className="w-4 h-4" />;
      case 'contribution': return <GitBranch className="w-4 h-4" />;
      case 'triage': return <Brain className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getAgentColor = (agentType: string) => {
    switch (agentType) {
      case 'welcome': return 'text-blue-600';
      case 'contribution': return 'text-green-600';
      case 'triage': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div ref={feedRef} className={`bg-white border rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Activity Feed</h3>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {filteredEvents.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded"
            >
              <Filter className="w-4 h-4" />
            </button>
            {onClearAll && (
              <button
                onClick={onClearAll}
                className="p-1 text-gray-500 hover:text-red-600 rounded"
                title="Clear all events"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-500 hover:text-gray-700 rounded"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 space-y-2">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Agent</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1"
              >
                <option value="all">All Agents</option>
                {uniqueAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Event Type</label>
              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      {isExpanded && (
        <div className="events-container max-h-96 overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events to display</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={`p-3 hover:bg-gray-50 transition-all duration-300 ${
                    index === filteredEvents.length - 1 ? 'animate-pulse-once' : ''
                  }`}
                  style={{
                    animation: index === filteredEvents.length - 1 
                      ? 'slideInRight 0.3s ease-out' 
                      : undefined
                  }}
                >
                  <div className="flex items-start space-x-3">
                    {/* Event Icon */}
                    <div className={`p-2 rounded-full border ${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`inline-flex items-center ${getAgentColor(event.agentType)}`}>
                          {getAgentIcon(event.agentType)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {event.agentName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-1">
                        {event.message}
                      </p>
                      
                      {/* Event Details */}
                      {event.details && (
                        <div className="text-xs text-gray-500 space-y-1">
                          {event.details.stepName && (
                            <div>Step: {event.details.stepName}</div>
                          )}
                          {event.details.contributor && (
                            <div>Contributor: {event.details.contributor}</div>
                          )}
                          {event.details.confidence && (
                            <div>Confidence: {Math.round(event.details.confidence * 100)}%</div>
                          )}
                          {event.details.duration && (
                            <div>Duration: {(event.details.duration / 1000).toFixed(1)}s</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-pulse-once {
          animation: pulse 1s ease-in-out;
        }
        
        @keyframes pulse {
          0%, 100% {
            background-color: transparent;
          }
          50% {
            background-color: rgba(59, 130, 246, 0.05);
          }
        }
      `}</style>
    </div>
  );
}

// Example usage with mock data
export const mockEvents: AgentEvent[] = [
  {
    id: '1',
    type: 'agent_started',
    agentId: 'welcome-agent',
    agentName: 'Welcome & Environment Setup',
    agentType: 'welcome',
    message: 'Agent started processing new contributor',
    timestamp: new Date(Date.now() - 5000),
    details: {
      contributor: 'johndoe',
      stepName: 'Analyze Contributor Profile'
    }
  },
  {
    id: '2',
    type: 'step_completed',
    agentId: 'welcome-agent',
    agentName: 'Welcome & Environment Setup',
    agentType: 'welcome',
    message: 'Profile analysis completed',
    timestamp: new Date(Date.now() - 3000),
    details: {
      stepName: 'Analyze Contributor Profile',
      confidence: 0.87,
      duration: 2000
    }
  },
  {
    id: '3',
    type: 'approval_requested',
    agentId: 'welcome-agent',
    agentName: 'Welcome & Environment Setup',
    agentType: 'welcome',
    message: 'Mentor assignment requires approval',
    timestamp: new Date(Date.now() - 1000),
    details: {
      stepName: 'Mentor Assignment Decision',
      contributor: 'johndoe',
      confidence: 0.92
    }
  }
];
