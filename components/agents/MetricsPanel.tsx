'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Users, 
  Activity, 
  BarChart3,
  RefreshCw,
  Download
} from 'lucide-react';

interface SimulationMetrics {
  totalSimulations: number;
  averageCompletionTime: number;
  humanApprovalRate: number;
  successRate: {
    welcome: number;
    contribution: number;
    triage: number;
  };
  currentActiveSimulations: number;
  hourlyData: Array<{
    hour: string;
    simulations: number;
  }>;
  stepDistribution: Array<{
    stepType: string;
    completed: number;
    failed: number;
  }>;
  agentPerformance: Array<{
    agent: string;
    avgTime: number;
    successRate: number;
    totalRuns: number;
  }>;
}

interface MetricsPanelProps {
  className?: string;
}

const COLORS = {
  welcome: '#3B82F6',
  contribution: '#10B981', 
  triage: '#8B5CF6',
  completed: '#10B981',
  failed: '#EF4444',
  pending: '#F59E0B'
};

export default function MetricsPanel({ className = "" }: MetricsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    totalSimulations: 0,
    averageCompletionTime: 0,
    humanApprovalRate: 0,
    successRate: {
      welcome: 0,
      contribution: 0,
      triage: 0
    },
    currentActiveSimulations: 0,
    hourlyData: [],
    stepDistribution: [],
    agentPerformance: []
  });

  // Load metrics from localStorage on mount
  useEffect(() => {
    const storedMetrics = localStorage.getItem('agentMetrics');
    if (storedMetrics) {
      try {
        const parsed = JSON.parse(storedMetrics);
        setMetrics({
          ...parsed,
          hourlyData: generateHourlyData(parsed.totalSimulations || 0),
          stepDistribution: generateStepDistribution(parsed.totalSimulations || 0),
          agentPerformance: generateAgentPerformance(parsed.totalSimulations || 0)
        });
      } catch (error) {
        console.error('Error loading metrics:', error);
        initializeMetrics();
      }
    } else {
      initializeMetrics();
    }
  }, []);

  // Save metrics to localStorage whenever they change
  useEffect(() => {
    if (metrics.totalSimulations > 0) {
      localStorage.setItem('agentMetrics', JSON.stringify(metrics));
    }
  }, [metrics]);

  const initializeMetrics = () => {
    const initialMetrics: SimulationMetrics = {
      totalSimulations: 156,
      averageCompletionTime: 45000,
      humanApprovalRate: 78.5,
      successRate: {
        welcome: 94.2,
        contribution: 89.7,
        triage: 91.3
      },
      currentActiveSimulations: 2,
      hourlyData: generateHourlyData(156),
      stepDistribution: generateStepDistribution(156),
      agentPerformance: generateAgentPerformance(156)
    };
    setMetrics(initialMetrics);
  };

  const generateHourlyData = (totalSimulations: number) => {
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const simulations = Math.floor(Math.random() * 8) + (i < 4 ? Math.floor(totalSimulations / 24) : 0);
      data.push({
        hour: hour.getHours() + ':00',
        simulations
      });
    }
    return data;
  };

  const generateStepDistribution = (totalSimulations: number) => {
    return [
      { stepType: 'Data Collection', completed: Math.floor(totalSimulations * 2.8), failed: Math.floor(totalSimulations * 0.2) },
      { stepType: 'Automated Tasks', completed: Math.floor(totalSimulations * 3.2), failed: Math.floor(totalSimulations * 0.3) },
      { stepType: 'Human Approval', completed: Math.floor(totalSimulations * 1.5), failed: Math.floor(totalSimulations * 0.1) },
      { stepType: 'Notifications', completed: Math.floor(totalSimulations * 2.1), failed: Math.floor(totalSimulations * 0.1) }
    ];
  };

  const generateAgentPerformance = (totalSimulations: number) => {
    return [
      { 
        agent: 'Welcome Agent', 
        avgTime: 42000, 
        successRate: 94.2, 
        totalRuns: Math.floor(totalSimulations * 0.35) 
      },
      { 
        agent: 'Contribution Agent', 
        avgTime: 51000, 
        successRate: 89.7, 
        totalRuns: Math.floor(totalSimulations * 0.40) 
      },
      { 
        agent: 'Triage Agent', 
        avgTime: 38000, 
        successRate: 91.3, 
        totalRuns: Math.floor(totalSimulations * 0.25) 
      }
    ];
  };

  const refreshMetrics = () => {
    // Simulate refreshing metrics with slight variations
    setMetrics(prev => ({
      ...prev,
      totalSimulations: prev.totalSimulations + Math.floor(Math.random() * 3),
      averageCompletionTime: prev.averageCompletionTime + (Math.random() - 0.5) * 2000,
      humanApprovalRate: Math.min(100, Math.max(0, prev.humanApprovalRate + (Math.random() - 0.5) * 2)),
      currentActiveSimulations: Math.floor(Math.random() * 4),
      hourlyData: generateHourlyData(prev.totalSimulations + Math.floor(Math.random() * 3))
    }));
  };

  const exportMetrics = () => {
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agent-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 transition-colors"
          >
            <BarChart3 className={`w-6 h-6 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-90'}`} />
          </button>
          <h3 className="text-xl font-semibold text-gray-900">Agent Performance Metrics</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshMetrics}
            className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={exportMetrics}
            className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            title="Export metrics"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-none opacity-100'
      }`}>
        {/* Real-time Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">Total</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{metrics.totalSimulations}</div>
          <div className="text-xs text-blue-700">Simulations Run</div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-xs text-green-600 font-medium">Average</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{formatTime(metrics.averageCompletionTime)}</div>
          <div className="text-xs text-green-700">Completion Time</div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-yellow-600" />
            <span className="text-xs text-yellow-600 font-medium">Rate</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">{metrics.humanApprovalRate.toFixed(1)}%</div>
          <div className="text-xs text-yellow-700">Human Approval</div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">Active</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{metrics.currentActiveSimulations}</div>
          <div className="text-xs text-purple-700">Simulations</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-5 h-5 text-amber-600" />
            <span className="text-xs text-amber-600 font-medium">Success</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">
            {((metrics.successRate.welcome + metrics.successRate.contribution + metrics.successRate.triage) / 3).toFixed(1)}%
          </div>
          <div className="text-xs text-amber-700">Overall Rate</div>
        </div>
      </div>

      {/* Success Rate by Agent */}
      <div className="mb-8">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Success Rate by Agent</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Welcome Agent</span>
              <span className="text-lg font-bold text-blue-600">{metrics.successRate.welcome.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.successRate.welcome}%` }}
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-900">Contribution Agent</span>
              <span className="text-lg font-bold text-green-600">{metrics.successRate.contribution.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.successRate.contribution}%` }}
              />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-900">Triage Agent</span>
              <span className="text-lg font-bold text-purple-600">{metrics.successRate.triage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.successRate.triage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulations Over Time */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Simulations Over Time (Last 24 Hours)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={metrics.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="simulations" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Step Completion Distribution */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">Step Completion Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics.stepDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stepType" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill={COLORS.completed} />
              <Bar dataKey="failed" fill={COLORS.failed} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Performance Comparison */}
      <div className="mt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Agent Performance Comparison</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={metrics.agentPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="agent" />
            <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="avgTime" fill={COLORS.welcome} name="Avg Time (ms)" />
            <Bar yAxisId="right" dataKey="successRate" fill={COLORS.contribution} name="Success Rate (%)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            Data persists across sessions • Last updated: {new Date().toLocaleString()}
          </div>
          <div className="flex items-center space-x-4">
            <span>Total Agents: 3</span>
            <span>•</span>
            <span>Step Types: 4</span>
            <span>•</span>
            <span>Data Points: {metrics.hourlyData.length + metrics.stepDistribution.length + metrics.agentPerformance.length}</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
