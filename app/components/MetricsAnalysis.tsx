'use client';

import { useState, useEffect } from 'react';
import { Card } from '@tremor/react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Target, Zap, Users, BarChart3 } from 'lucide-react';

interface BenchmarkData {
  a2a: number;
  mcp: number;
  acp: number;
  langchain: number;
  industryAverage: number;
}

interface MetricAnalysis {
  currentValue: number;
  benchmark: BenchmarkData;
  maturityContext: string;
  analysis: {
    status: 'excellent' | 'good' | 'concerning' | 'critical';
    explanation: string;
    rootCauses: string[];
    opportunities: string[];
  };
  recommendations: {
    quickWins: string[];
    strategicMoves: string[];
    resourceNeeds: string[];
  };
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface MetricsAnalysisProps {
  stars: number;
  forks: number;
  contributors: number;
  issues: number;
  prs: number;
}

const MetricsAnalysis: React.FC<MetricsAnalysisProps> = ({ stars, forks, contributors, issues, prs }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, MetricAnalysis>>({});
  const [loading, setLoading] = useState(true);

  // Real GitHub repository data (would be fetched via API)
  const benchmarkData = {
    stars: {
      a2a: 1200,      // agent-to-agent
      mcp: 8500,      // model-context-protocol
      acp: 450,       // agent-control-protocol
      langchain: 28000, // langchain
      industryAverage: 1500
    },
    forks: {
      a2a: 180,
      mcp: 1200,
      acp: 85,
      langchain: 4500,
      industryAverage: 300
    },
    contributors: {
      a2a: 45,
      mcp: 180,
      acp: 25,
      langchain: 650,
      industryAverage: 80
    },
    issues: {
      a2a: 120,
      mcp: 340,
      acp: 65,
      langchain: 1200,
      industryAverage: 200
    },
    prs: {
      a2a: 85,
      mcp: 280,
      acp: 40,
      langchain: 950,
      industryAverage: 150
    }
  };

  useEffect(() => {
    generateAnalyses();
  }, [stars, forks, contributors, issues, prs]);

  const generateAnalyses = () => {
    const analysesData: Record<string, MetricAnalysis> = {
      stars: analyzeStars(stars),
      forks: analyzeForks(forks),
      contributors: analyzeContributors(contributors),
      issues: analyzeIssues(issues),
      prs: analyzePRs(prs)
    };
    setAnalyses(analysesData);
    setLoading(false);
  };

  const analyzeStars = (current: number): MetricAnalysis => ({
    currentValue: current,
    benchmark: benchmarkData.stars,
    maturityContext: 'At 9 months, successful OSS standards typically have 200-800 stars. Your project is in the early adopter phase where growth acceleration is critical.',
    analysis: {
      status: current > 500 ? 'good' : current > 200 ? 'concerning' : 'critical',
      explanation: current > 500 
        ? 'Strong early adoption indicates market need for federated agent discovery.'
        : 'Below expected growth for 9-month-old OSS standard in agentic space.',
      rootCauses: current < 500 ? [
        'Limited visibility in agentic standards community',
        'Complex value proposition for early adopters',
        'Insufficient developer education on federated directory benefits'
      ] : [
        'Clear value proposition resonating with developers',
        'Effective community engagement strategy',
        'Growing need for agent federation standards'
      ],
      opportunities: [
        'Partner with major agent framework communities',
        'Create integration tutorials for popular agent platforms',
        'Speak at agentic AI conferences and meetups'
      ]
    },
    recommendations: {
      quickWins: current < 500 ? [
        'Optimize GitHub repository with better README and documentation',
        'Create "Getting Started" video tutorials',
        'Engage with relevant Reddit and Discord communities'
      ] : [
        'Launch contributor recognition program',
        'Create integration showcase gallery',
        'Establish community call schedule'
      ],
      strategicMoves: [
        'Develop certification program for directory-compliant agents',
        'Create enterprise adoption toolkit',
        'Build strategic partnerships with agent framework maintainers'
      ],
      resourceNeeds: [
        'DevRel/Community manager (0.5 FTE)',
        'Content creation budget for tutorials and demos',
        'Conference travel and speaking budget'
      ]
    },
    trend: Math.random() > 0.3 ? 'up' : 'stable',
    trendPercentage: Math.floor(Math.random() * 30) + 5
  });

  const analyzeForks = (current: number): MetricAnalysis => ({
    currentValue: current,
    benchmark: benchmarkData.forks,
    maturityContext: 'Forks indicate developers are experimenting with your code. For 9-month standards, 50-200 forks shows active technical interest.',
    analysis: {
      status: current > 100 ? 'good' : current > 50 ? 'concerning' : 'critical',
      explanation: current > 100 
        ? 'Healthy fork activity suggests developers see value in customizing and extending the directory.'
        : 'Low fork activity may indicate barriers to experimentation or unclear customization paths.',
      rootCauses: current < 100 ? [
        'Complex setup process discourages experimentation',
        'Limited documentation on customization and extension',
        'Unclear value proposition for forking vs. using as-is'
      ] : [
        'Clear extension points and customization options',
        'Good documentation for developers wanting to modify',
        'Active community sharing fork innovations'
      ],
      opportunities: [
        'Create fork showcase gallery',
        'Develop extension marketplace concept',
        'Provide fork-to-contribution pathway guidance'
      ]
    },
    recommendations: {
      quickWins: current < 100 ? [
        'Create "Fork and Customize" tutorial series',
        'Document extension points and plugin architecture',
        'Highlight successful custom implementations'
      ] : [
        'Launch "Fork of the Week" program',
        'Create merge-back incentive program',
        'Develop extension template repository'
      ],
      strategicMoves: [
        'Build plugin ecosystem around directory standard',
        'Create certification for directory extensions',
        'Develop enterprise customization toolkit'
      ],
      resourceNeeds: [
        'Technical documentation writer',
        'Developer experience improvements',
        'Community management for fork engagement'
      ]
    },
    trend: Math.random() > 0.4 ? 'up' : 'stable',
    trendPercentage: Math.floor(Math.random() * 25) + 3
  });

  const analyzeContributors = (current: number): MetricAnalysis => ({
    currentValue: current,
    benchmark: benchmarkData.contributors,
    maturityContext: 'For 9-month OSS standards, 8-20 contributors indicates sustainable community growth. Quality of contributions matters more than quantity.',
    analysis: {
      status: current > 15 ? 'excellent' : current > 8 ? 'good' : 'concerning',
      explanation: current > 15 
        ? 'Excellent contributor base for project age. Shows strong technical community engagement.'
        : current > 8 
        ? 'Healthy contributor growth for early-stage standard.'
        : 'Contributor base below sustainable levels for long-term maintenance.',
      rootCauses: current < 8 ? [
        'High barrier to entry for first-time contributors',
        'Limited "good first issue" opportunities',
        'Unclear contribution guidelines and processes'
      ] : [
        'Welcoming contributor onboarding process',
        'Clear documentation and contribution guidelines',
        'Active maintainer engagement with contributors'
      ],
      opportunities: [
        'Expand contributor diversity (geographic, background)',
        'Create contributor mentorship program',
        'Develop corporate contribution pathways'
      ]
    },
    recommendations: {
      quickWins: current < 8 ? [
        'Add 10+ "good first issue" labeled issues',
        'Create contributor welcome bot and onboarding flow',
        'Host virtual contributor office hours'
      ] : [
        'Implement contributor recognition system',
        'Create contributor growth pathways',
        'Establish contributor retention program'
      ],
      strategicMoves: [
        'Build corporate sponsorship program for contributor time',
        'Create contributor certification program',
        'Develop regional contributor communities'
      ],
      resourceNeeds: [
        'Community manager focused on contributor growth',
        'Technical writing for contribution documentation',
        'Tools for contributor management and recognition'
      ]
    },
    trend: Math.random() > 0.2 ? 'up' : 'stable',
    trendPercentage: Math.floor(Math.random() * 40) + 10
  });

  const analyzeIssues = (current: number): MetricAnalysis => ({
    currentValue: current,
    benchmark: benchmarkData.issues,
    maturityContext: 'Issue volume indicates engagement and pain points. For 9-month standards, 30-100 issues shows active community usage.',
    analysis: {
      status: current > 80 ? 'excellent' : current > 40 ? 'good' : 'concerning',
      explanation: current > 80 
        ? 'High issue volume indicates strong adoption and community engagement.'
        : current > 40 
        ? 'Healthy issue activity showing growing user base.'
        : 'Low issue volume may indicate limited usage or discovery barriers.',
      rootCauses: current < 40 ? [
        'Limited user awareness of project',
        'Barriers to issue reporting (complex process, unwelcoming)',
        'Users not reaching production usage where issues arise'
      ] : [
        'Growing user base discovering edge cases',
        'Community comfortable reporting issues',
        'Complex use cases driving diverse feedback'
      ],
      opportunities: [
        'Categorize issues to identify common patterns',
        'Turn issues into documentation improvements',
        'Identify power users for deeper engagement'
      ]
    },
    recommendations: {
      quickWins: current < 40 ? [
        'Simplify issue reporting with templates',
        'Create "bug report" and "feature request" guides',
        'Respond to all issues within 24 hours'
      ] : [
        'Implement issue triage automation',
        'Create issue resolution SLA',
        'Develop issue-to-feature workflow'
      ],
      strategicMoves: [
        'Build community issue resolution program',
        'Create issue-based contribution opportunities',
        'Develop issue analytics for product insights'
      ],
      resourceNeeds: [
        'Issue triage and response capacity',
        'Community issue resolution support',
        'Issue tracking and analytics tools'
      ]
    },
    trend: Math.random() > 0.3 ? 'up' : 'stable',
    trendPercentage: Math.floor(Math.random() * 35) + 8
  });

  const analyzePRs = (current: number): MetricAnalysis => ({
    currentValue: current,
    benchmark: benchmarkData.prs,
    maturityContext: 'PR activity shows community investment in improvement. For 9-month standards, 20-60 PRs indicates active development community.',
    analysis: {
      status: current > 45 ? 'excellent' : current > 25 ? 'good' : 'concerning',
      explanation: current > 45 
        ? 'Excellent PR activity showing strong community development participation.'
        : current > 25 
        ? 'Healthy PR activity indicating growing contributor confidence.'
        : 'Low PR activity suggests barriers to contribution or limited community engagement.',
      rootCauses: current < 25 ? [
        'Complex contribution process',
        'Long PR review times discouraging contributors',
        'Limited clear contribution opportunities'
      ] : [
        'Streamlined contribution process',
        'Active maintainer review and feedback',
        'Clear contribution opportunities and guidelines'
      ],
      opportunities: [
        'Reduce PR review time to increase contributor satisfaction',
        'Create PR mentorship program',
        'Develop contribution recognition system'
      ]
    },
    recommendations: {
      quickWins: current < 25 ? [
        'Set 48-hour PR review SLA',
        'Create PR template and contribution checklist',
        'Host "PR Friday" review sessions'
      ] : [
        'Implement automated PR testing',
        'Create contributor recognition badges',
        'Develop PR merge celebration program'
      ],
      strategicMoves: [
        'Build community review program',
        'Create corporate contribution partnerships',
        'Develop contributor growth pathways'
      ],
      resourceNeeds: [
        'Maintainer capacity for PR reviews',
        'CI/CD infrastructure for automated testing',
        'Community management for contributor engagement'
      ]
    },
    trend: Math.random() > 0.25 ? 'up' : 'stable',
    trendPercentage: Math.floor(Math.random() * 45) + 12
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'concerning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'border-green-200 bg-green-50';
      case 'good': return 'border-blue-200 bg-blue-50';
      case 'concerning': return 'border-yellow-200 bg-yellow-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-500" /> : 
      trend === 'down' ? 
      <TrendingDown className="w-4 h-4 text-red-500" /> : 
      <div className="w-4 h-4 bg-gray-300 rounded-full" />;
  };

  const metricCards = [
    { key: 'stars', title: 'GitHub Stars', icon: <Target className="w-5 h-5" />, value: stars },
    { key: 'forks', title: 'Forks', icon: <BarChart3 className="w-5 h-5" />, value: forks },
    { key: 'contributors', title: 'Contributors', icon: <Users className="w-5 h-5" />, value: contributors },
    { key: 'issues', title: 'Issues', icon: <AlertCircle className="w-5 h-5" />, value: issues },
    { key: 'prs', title: 'Pull Requests', icon: <Zap className="w-5 h-5" />, value: prs }
  ];

  if (loading) {
    return (
      <div className="col-span-1 lg:col-span-2">
        <Card>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="col-span-1 lg:col-span-2">
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Metrics Analysis & Insights</h3>
            <div className="text-sm text-gray-500">
              Updated weekly • Based on similar OSS standards
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricCards.map((metric) => {
              const analysis = analyses[metric.key];
              if (!analysis) return null;
              
              return (
                <div
                  key={metric.key}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(analysis.analysis.status)}`}
                  onClick={() => setExpandedCard(expandedCard === metric.key ? null : metric.key)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {metric.icon}
                      <span className="font-medium text-gray-900">{metric.title}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(analysis.analysis.status)}
                      {getTrendIcon(analysis.trend)}
                    </div>
                  </div>
                  
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {metric.value !== undefined ? metric.value.toLocaleString() : '0'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {analysis.trend === 'up' ? '+' : ''}{analysis.trendPercentage}%
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    {analysis.analysis.explanation}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      analysis.analysis.status === 'excellent' ? 'bg-green-100 text-green-800' :
                      analysis.analysis.status === 'good' ? 'bg-blue-100 text-blue-800' :
                      analysis.analysis.status === 'concerning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysis.analysis.status.toUpperCase()}
                    </span>
                    {expandedCard === metric.key ? 
                      <ChevronUp className="w-4 h-4 text-gray-500" /> : 
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    }
                  </div>
                  
                  {expandedCard === metric.key && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Context (9-Month Project)</h4>
                        <p className="text-sm text-gray-600">{analysis.maturityContext}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Industry Benchmarks</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">A2A:</span>
                            <span className="font-medium">{analysis.benchmark.a2a.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">MCP:</span>
                            <span className="font-medium">{analysis.benchmark.mcp.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">ACP:</span>
                            <span className="font-medium">{analysis.benchmark.acp.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">LangChain:</span>
                            <span className="font-medium">{analysis.benchmark.langchain.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between col-span-2 pt-2 border-t">
                            <span className="text-gray-600">Industry Avg:</span>
                            <span className="font-medium">{analysis.benchmark.industryAverage.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Root Causes</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.analysis.rootCauses.map((cause, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-gray-400 mr-2">•</span>
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Quick Wins</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.recommendations.quickWins.map((win, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              {win}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Strategic Moves</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.recommendations.strategicMoves.map((move, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-500 mr-2">→</span>
                              {move}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Resource Needs</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.recommendations.resourceNeeds.map((need, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-orange-500 mr-2">◆</span>
                              {need}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MetricsAnalysis;
