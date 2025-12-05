'use client';

import { useState } from 'react';
import { Play, Settings, Zap, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { demoScenarios, getScenarioById, calculateScenarioMetrics } from '../../lib/agents/demoScenarios';

interface DemoControlsProps {
  onScenarioSelect: (scenarioId: string) => void;
  onAutoPilotToggle: (enabled: boolean) => void;
  onRunAllScenarios: () => void;
  selectedScenario: string;
  autoPilot: boolean;
  isRunningAllScenarios: boolean;
  className?: string;
}

export default function DemoControls({
  onScenarioSelect,
  onAutoPilotToggle,
  onRunAllScenarios,
  selectedScenario,
  autoPilot,
  isRunningAllScenarios,
  className = ""
}: DemoControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentScenario = selectedScenario ? getScenarioById(selectedScenario) : null;
  const metrics = currentScenario ? calculateScenarioMetrics(currentScenario) : null;

  const getScenarioIcon = (scenarioId: string) => {
    switch (scenarioId) {
      case 'happy-path': return <TrendingUp className="w-4 h-4" />;
      case 'stuck-contributor': return <AlertCircle className="w-4 h-4" />;
      case 'complex-issue': return <Settings className="w-4 h-4" />;
      case 'quick-win': return <Zap className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`bg-white border rounded-lg shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">Demo Mode</h3>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
            PRESET SCENARIOS
          </span>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Scenario Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Scenario
        </label>
        <select
          value={selectedScenario}
          onChange={(e) => onScenarioSelect(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose a scenario...</option>
          {demoScenarios.map(scenario => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name} - {scenario.agentType}
            </option>
          ))}
        </select>
      </div>

      {/* Scenario Details */}
      {currentScenario && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-start space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getScenarioIcon(currentScenario.id)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{currentScenario.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{currentScenario.description}</p>
            </div>
          </div>

          {/* Contributor Info */}
          <div className="mb-4 p-3 bg-white rounded border">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Contributor Profile</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Username:</span>
                <span className="ml-2 font-medium">{currentScenario.contributor.username}</span>
              </div>
              <div>
                <span className="text-gray-500">Experience:</span>
                <span className="ml-2 font-medium">{currentScenario.contributor.experience}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Interests:</span>
                <span className="ml-2">{currentScenario.contributor.interests.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          {metrics && (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-semibold text-gray-900">{metrics.totalSteps}</div>
                <div className="text-gray-500">Steps</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <div className="font-semibold text-gray-900">{(metrics.estimatedDuration / 1000).toFixed(0)}s</div>
                <div className="text-gray-500">Duration</div>
              </div>
              <div className="text-center p-2 bg-white rounded border">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(metrics.complexity)}`}>
                  {metrics.complexity}
                </span>
                <div className="text-gray-500 mt-1">Complexity</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-pilot Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">Auto-pilot Mode</div>
              <div className="text-sm text-blue-700">Automatically approve human steps after delay</div>
            </div>
          </div>
          <button
            onClick={() => onAutoPilotToggle(!autoPilot)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoPilot ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoPilot ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => {
            if (selectedScenario) {
              // This will be handled by the parent component
              console.log('Running scenario:', selectedScenario);
            }
          }}
          disabled={!selectedScenario}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>Run Selected Scenario</span>
        </button>

        <button
          onClick={onRunAllScenarios}
          disabled={isRunningAllScenarios}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          <span>{isRunningAllScenarios ? 'Running All Scenarios...' : 'Auto-run All Scenarios'}</span>
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Options</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Simulation Speed</span>
              <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="2">2x</option>
                <option value="4">4x</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Auto-pilot Delay</span>
              <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                <option value="1000">1s</option>
                <option value="2000">2s</option>
                <option value="3000">3s</option>
                <option value="5000">5s</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Pause on Human Steps</span>
              <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200">
                <span className="inline-block h-3 w-3 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scenario List */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">All Available Scenarios</h4>
        <div className="space-y-2">
          {demoScenarios.map(scenario => {
            const scenarioMetrics = calculateScenarioMetrics(scenario);
            return (
              <div
                key={scenario.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedScenario === scenario.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => onScenarioSelect(scenario.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getScenarioIcon(scenario.id)}
                    <div>
                      <div className="font-medium text-sm text-gray-900">{scenario.name}</div>
                      <div className="text-xs text-gray-500">{scenario.agentType} • {scenarioMetrics.totalSteps} steps</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(scenarioMetrics.complexity)}`}>
                      {scenarioMetrics.complexity}
                    </span>
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{(scenarioMetrics.estimatedDuration / 1000).toFixed(0)}s</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
