'use client';

import { useState } from 'react';
import { AlertCircle, Bot, User, CheckCircle, Edit3, XCircle, Clock, Eye, Send } from 'lucide-react';

export interface ApprovalOption {
  id: string;
  label: string;
  description: string;
  action: 'approve' | 'modify' | 'reject' | 'skip';
  icon?: React.ReactNode;
}

export interface SimulatedData {
  [key: string]: any;
  message?: string;
  reasoning?: string;
  recommendations?: string[];
  metrics?: Record<string, number>;
  confidence?: number;
}

export interface HumanApprovalCardProps {
  title: string;
  description: string;
  agentName: string;
  agentType: 'welcome' | 'contribution' | 'triage';
  contributor: {
    username: string;
    experience: string;
    interests: string[];
  };
  simulatedData: SimulatedData;
  approvalOptions: ApprovalOption[];
  onApprove: (modifiedData?: SimulatedData) => void;
  onReject: (reason: string) => void;
  onModify: (modifiedData: SimulatedData) => void;
  isLoading?: boolean;
  timestamp?: Date;
}

export default function HumanApprovalCard({
  title,
  description,
  agentName,
  agentType,
  contributor,
  simulatedData,
  approvalOptions,
  onApprove,
  onReject,
  onModify,
  isLoading = false,
  timestamp = new Date()
}: HumanApprovalCardProps) {
  const [showRejectionReason, setShowRejectionReason] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showEditMode, setShowEditMode] = useState(false);
  const [editedData, setEditedData] = useState(simulatedData);
  const [showPreview, setShowPreview] = useState(true);

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(rejectionReason);
    }
  };

  const handleModify = () => {
    onModify(editedData);
    setShowEditMode(false);
  };

  const getAgentIcon = () => {
    switch (agentType) {
      case 'welcome': return <User className="w-5 h-5" />;
      case 'contribution': return <Bot className="w-5 h-5" />;
      case 'triage': return <AlertCircle className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  const getAgentColor = () => {
    switch (agentType) {
      case 'welcome': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contribution': return 'bg-green-100 text-green-800 border-green-200';
      case 'triage': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative">
      {/* Pulse Animation Container */}
      <div className="absolute inset-0 bg-yellow-200 rounded-lg opacity-20 animate-pulse" />
      
      <div className={`relative border-2 rounded-lg p-6 ${getAgentColor()} shadow-lg`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAgentColor()}`}>
              {getAgentIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm opacity-80">
                {agentName} • {contributor.username} ({contributor.experience})
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm opacity-70">
            <Clock className="w-4 h-4" />
            {timestamp.toLocaleTimeString()}
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed">{description}</p>

        {/* AI Generated Content */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">AI Analysis & Recommendations:</h4>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1 text-xs opacity-70 hover:opacity-100"
            >
              <Eye className="w-3 h-3" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>
          
          {showPreview && (
            <div className="bg-white bg-opacity-50 rounded border p-4">
              <div className="space-y-3">
                {simulatedData.message && (
                  <div>
                    <h5 className="font-medium text-sm mb-1">Generated Message:</h5>
                    <div className="p-3 bg-white rounded border text-sm">
                      {simulatedData.message}
                    </div>
                  </div>
                )}
                
                {simulatedData.reasoning && (
                  <div>
                    <h5 className="font-medium text-sm mb-1">AI Reasoning:</h5>
                    <div className="p-3 bg-white rounded border text-sm">
                      {simulatedData.reasoning}
                    </div>
                  </div>
                )}
                
                {simulatedData.recommendations && (
                  <div>
                    <h5 className="font-medium text-sm mb-1">Recommendations:</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {simulatedData.recommendations.map((rec: string, index: number) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {simulatedData.confidence && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium">Confidence:</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${simulatedData.confidence * 100}%` }}
                        />
                      </div>
                      <span>{Math.round(simulatedData.confidence * 100)}%</span>
                    </div>
                  </div>
                )}
                
                {/* Display other data as JSON */}
                {Object.keys(simulatedData).filter(key => 
                  !['message', 'reasoning', 'recommendations', 'confidence'].includes(key)
                ).length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-1">Additional Data:</h5>
                    <pre className="text-xs bg-white rounded border p-2 overflow-x-auto">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(simulatedData).filter(([key]) => 
                            !['message', 'reasoning', 'recommendations', 'confidence'].includes(key)
                          )
                        ), 
                        null, 
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Edit Mode */}
        {showEditMode && (
          <div className="mb-6 p-4 bg-white bg-opacity-70 rounded border">
            <h4 className="font-medium text-sm mb-3">Edit AI Output:</h4>
            <textarea
              value={JSON.stringify(editedData, null, 2)}
              onChange={(e) => setEditedData(JSON.parse(e.target.value))}
              className="w-full h-32 p-3 border rounded text-sm font-mono"
              placeholder="Edit the JSON data..."
            />
          </div>
        )}

        {/* Rejection Reason */}
        {showRejectionReason && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
            <h4 className="font-medium text-sm mb-2 text-red-800">Rejection Reason:</h4>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full h-20 p-3 border border-red-200 rounded text-sm"
              placeholder="Please explain why you're rejecting this action..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {approvalOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                switch (option.action) {
                  case 'approve':
                    onApprove();
                    break;
                  case 'modify':
                    if (option.id === 'edit-approve') {
                      handleModify();
                    } else {
                      setShowEditMode(true);
                    }
                    break;
                  case 'reject':
                    setShowRejectionReason(true);
                    break;
                  case 'skip':
                    onApprove();
                    break;
                }
              }}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                option.action === 'approve' 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : option.action === 'modify'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : option.action === 'reject'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {option.icon || (
                option.action === 'approve' ? <CheckCircle className="w-4 h-4" /> :
                option.action === 'modify' ? <Edit3 className="w-4 h-4" /> :
                option.action === 'reject' ? <XCircle className="w-4 h-4" /> :
                <Send className="w-4 h-4" />
              )}
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Conditional Action Buttons */}
        {showRejectionReason && (
          <div className="flex space-x-3 mt-3">
            <button
              onClick={handleReject}
              disabled={!rejectionReason.trim() || isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Rejection
            </button>
            <button
              onClick={() => {
                setShowRejectionReason(false);
                setRejectionReason('');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium text-sm hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}

        {showEditMode && (
          <div className="flex space-x-3 mt-3">
            <button
              onClick={handleModify}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Approve with Changes
            </button>
            <button
              onClick={() => {
                setShowEditMode(false);
                setEditedData(simulatedData);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium text-sm hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Example Usage Mock Data
export const mockApprovalData: HumanApprovalCardProps = {
  title: "Mentor Assignment Decision",
  description: "Review and approve the AI-recommended mentor assignment based on contributor profile analysis and mentor availability.",
  agentName: "Welcome & Environment Setup",
  agentType: "welcome",
  contributor: {
    username: "johndoe",
    experience: "intermediate",
    interests: ["frontend", "documentation"]
  },
  simulatedData: {
    recommended_mentor: "senior_dev_123",
    reasoning: "Matches TypeScript experience and timezone compatibility. Mentor has strong background in frontend development and has successfully onboarded 12+ contributors.",
    alternatives: ["mentor_456 (React specialist)", "mentor_789 (Documentation expert)"],
    confidence: 0.87,
    mentor_profile: {
      name: "Sarah Chen",
      expertise: ["TypeScript", "React", "Node.js"],
      timezone: "PST",
      availability: "High",
      success_rate: 94
    },
    matching_score: {
      technical_match: 0.9,
      timezone_match: 0.8,
      availability_match: 0.9,
      overall: 0.87
    }
  },
  approvalOptions: [
    {
      id: 'approve',
      label: 'Assign Mentor',
      description: 'This mentor is a good match',
      action: 'approve',
      icon: <CheckCircle className="w-4 h-4" />
    },
    {
      id: 'modify',
      label: 'Choose Different Mentor',
      description: 'Select a different mentor from alternatives',
      action: 'modify',
      icon: <Edit3 className="w-4 h-4" />
    },
    {
      id: 'skip',
      label: 'Skip Mentor Assignment',
      description: 'Proceed without assigning a mentor',
      action: 'skip',
      icon: <XCircle className="w-4 h-4" />
    }
  ],
  onApprove: (modifiedData) => console.log('Approved:', modifiedData),
  onReject: (reason) => console.log('Rejected:', reason),
  onModify: (modifiedData) => console.log('Modified:', modifiedData),
  isLoading: false,
  timestamp: new Date()
};
