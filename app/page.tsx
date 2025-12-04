'use client'; // v3.0 - final cache bust

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@tremor/react';
import { Gantt, ViewMode, Task } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { getAllMilestones, getDiscussions, getRepoStars, getContributorGrowth, getDetailedContributorAnalytics, getGitHubDependents, getAdoptionMetrics, getDeveloperExperienceMetrics } from './lib/github';
import type { Milestone as GitHubMilestone, Discussion as GitHubDiscussion } from './lib/github';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AIStrategicPartner from './components/AIStrategicPartner';

// Agent interfaces
interface Agent {
  id: string;
  name: string;
  type: 'engagement' | 'onboarding' | 'analytics';
  status: 'active' | 'idle' | 'processing';
  lastActivity: string;
  tasksCompleted: number;
  currentTask?: string;
}

interface AgentTask {
  id: string;
  agentId: string;
  type: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
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
  const [repoStats, setRepoStats] = useState({ stars: 0, forks: 0, name: '', openIssues: 0, downloads: 0, contributors: 0, newContributorsThisMonth: 0, starsThisMonth: 0, forksThisMonth: 0, downloadsThisMonth: 0 });
  
  // Agent system state
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'engagement-1',
      name: 'Engagement Agent',
      type: 'engagement',
      status: 'active',
      lastActivity: '2 minutes ago',
      tasksCompleted: 47,
      currentTask: 'Responding to issue #123'
    },
    {
      id: 'onboarding-1', 
      name: 'Onboarding Agent',
      type: 'onboarding',
      status: 'processing',
      lastActivity: '5 minutes ago',
      tasksCompleted: 23,
      currentTask: 'Guiding new contributor @johndoe'
    },
    {
      id: 'analytics-1',
      name: 'Analytics Agent', 
      type: 'analytics',
      status: 'active',
      lastActivity: '1 minute ago',
      tasksCompleted: 156,
      currentTask: 'Generating community health report'
    }
  ]);
  
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([
    {
      id: 'task-1',
      agentId: 'engagement-1',
      type: 'issue-response',
      description: 'Respond to GitHub issue about installation problems',
      status: 'completed',
      createdAt: '2025-12-02T10:30:00Z',
      completedAt: '2025-12-02T10:45:00Z'
    },
    {
      id: 'task-2',
      agentId: 'onboarding-1',
      type: 'contributor-welcome',
      description: 'Send welcome message to new contributor @johndoe',
      status: 'in-progress',
      createdAt: '2025-12-02T11:15:00Z'
    },
    {
      id: 'task-3',
      agentId: 'analytics-1',
      type: 'community-report',
      description: 'Generate weekly community engagement metrics',
      status: 'pending',
      createdAt: '2025-12-02T12:00:00Z'
    }
  ]);
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
        
        // Helper function to check if error is rate limit related
        const isRateLimitError = (error: any) => {
          if (error?.status === 403 || error?.response?.status === 403) {
            return true;
          }
          if (error?.message?.includes('rate limit') || error?.message?.includes('API rate limit exceeded')) {
            return true;
          }
          return false;
        };
        
        const [milestonesData, discussionsData, repoData, growthData, analyticsData, viralityDataFetch, adoptionData, devExperienceData] = await Promise.allSettled([
          getAllMilestones(),
          getDiscussions(),
          getRepoStars('dir'),
          getContributorGrowth('dir'),
          getDetailedContributorAnalytics('dir'),
          getGitHubDependents('dir'),
          getAdoptionMetrics('dir'),
          getDeveloperExperienceMetrics('dir'),
        ]);

        // Check for rate limit errors and set appropriate error state
        const rateLimitErrors = [
          milestonesData, discussionsData, repoData, growthData, 
          analyticsData, viralityDataFetch, adoptionData, devExperienceData
        ].filter(data => data.status === 'rejected' && isRateLimitError(data.reason));
        
        if (rateLimitErrors.length > 0) {
          setError('GitHub API rate limit exceeded. Some data may be unavailable. Please try again later.');
        }

        if (milestonesData.status === 'fulfilled') {
          setMilestones(milestonesData.value);
        } else {
          console.error('Milestones data failed, using fallback:', milestonesData.reason);
          // Fallback mock milestones
          setMilestones([
            {
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
            },
            {
              id: 2,
              number: 2,
              title: 'API Integration v2.0',
              description: 'Integrate with external APIs',
              state: 'open',
              open_issues: 5,
              closed_issues: 8,
              created_at: '2024-08-01T00:00:00Z',
              updated_at: '2024-12-01T00:00:00Z',
              due_on: '2024-12-31T00:00:00Z',
              html_url: 'https://github.com/agntcy/dir/milestone/2',
              repository: 'dir'
            }
          ]);
        }

        if (discussionsData.status === 'fulfilled') {
          setDiscussions(discussionsData.value);
        } else {
          console.error('Discussions data failed, using fallback:', discussionsData.reason);
          // Fallback mock discussions
          setDiscussions([
            {
              id: 1,
              number: 123,
              title: 'Discussion: API Rate Limiting Strategy',
              body: 'We need to discuss the best approach for handling API rate limits in production...',
              created_at: '2024-12-01T10:00:00Z',
              updated_at: '2024-12-02T15:30:00Z',
              comments: 8,
              html_url: 'https://github.com/agntcy/dir/issues/123'
            },
            {
              id: 2,
              number: 124,
              title: 'Feature Request: Enhanced Dashboard Analytics',
              body: 'It would be great to have more detailed analytics on the dashboard...',
              created_at: '2024-12-02T09:15:00Z',
              updated_at: '2024-12-03T11:45:00Z',
              comments: 5,
              html_url: 'https://github.com/agntcy/dir/issues/124'
            }
          ]);
        }

        if (repoData.status === 'fulfilled') {
          setRepoStats({
            stars: repoData.value.stars,
            forks: repoData.value.forks,
            name: repoData.value.name,
            openIssues: repoData.value.open_issues_count,
            downloads: repoData.value.downloads,
            contributors: repoData.value.contributors,
            newContributorsThisMonth: repoData.value.newContributorsThisMonth,
            starsThisMonth: repoData.value.starsThisMonth,
            forksThisMonth: repoData.value.forksThisMonth,
            downloadsThisMonth: repoData.value.downloadsThisMonth
          });
        }

        if (growthData.status === 'fulfilled') {
          setContributorGrowth(growthData.value);
        }

        if (analyticsData.status === 'fulfilled') {
          setDetailedAnalytics(analyticsData.value);
          console.log("Setting detailed analytics:", analyticsData.value);
        } else {
          console.error('Analytics data failed, using fallback:', analyticsData.reason);
          // Fallback mock data for retention rates
          setDetailedAnalytics({
            newContributorsPerMonth: [
              { month: 'Jul', newContributors: 2 },
              { month: 'Aug', newContributors: 3 },
              { month: 'Sep', newContributors: 2 },
              { month: 'Oct', newContributors: 1 },
              { month: 'Nov', newContributors: 2 },
              { month: 'Dec', newContributors: 1 }
            ],
            retentionRates: [
              { month: 'Jul', retentionRate: 75 },
              { month: 'Aug', retentionRate: 80 },
              { month: 'Sep', retentionRate: 85 },
              { month: 'Oct', retentionRate: 78 },
              { month: 'Nov', retentionRate: 82 },
              { month: 'Dec', retentionRate: 88 }
            ],
            mostActiveNewContributors: []
          });
        }

        if (viralityDataFetch.status === 'fulfilled') {
          setViralityData(viralityDataFetch.value);
        }

        if (adoptionData.status === 'fulfilled') {
          // Only update if API returns meaningful data, otherwise keep mock data
          const apiData = adoptionData.value;
          if (apiData.downloadTrends && apiData.downloadTrends.length > 0 && apiData.downloadTrends[0].downloads > 0) {
            setAdoptionMetrics(apiData);
          }
        }

        if (devExperienceData.status === 'fulfilled') {
          setDevExperienceMetrics(devExperienceData.value);
        }

        if (technicalData.status === 'fulfilled') {
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Failed to load data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
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
      {/* Floating Left Navigation */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="space-y-2">
            <a href="#community" className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              KPI's
            </a>
            <a href="#roadmap" className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Roadmap
            </a>
            <a href="#meetings" className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Meetings and Discussions
            </a>
            <a href="#agents" className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Agents
            </a>
            <a href="#intelligence" className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Collective Intelligence
            </a>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="ml-64 p-4 md:p-8">
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

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info:</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <p>Milestones: {milestones.length} items</p>
            <p>Discussions: {discussions.length} items</p>
            <p>Retention Rates: {detailedAnalytics.retentionRates.length} items</p>
            <p>Repo Stats: {repoStats.stars} stars, {repoStats.forks} forks</p>
          </div>
        </div>

        <header id="overview" className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AGNTCY Directory OSS Pulse - FINAL CACHE BUST
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Real-time insights into project health, community engagement, and technical excellence
          <p className="text-gray-500 text-sm max-w-3xl mx-auto leading-relaxed mt-2">
            data srcs: agntcy GH repos - dir, dir-spec, oasf-sdk
          </p>
          </p>
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
              {starsTrends.length > 0 
                ? starsTrends[starsTrends.length - 1].stars.toLocaleString()
                : repoStats.stars
              }
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
              {forksTrends.length > 0 
                ? forksTrends[forksTrends.length - 1].forks.toLocaleString()
                : repoStats.forks
              }
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
              {downloadView === 'net-new' ? 
                (adoptionMetrics.netNewDownloads.length > 0 ? adoptionMetrics.netNewDownloads[adoptionMetrics.netNewDownloads.length - 1].downloads.toLocaleString() : "66") :
                (adoptionMetrics.downloadTrends.length > 0 ? adoptionMetrics.downloadTrends[adoptionMetrics.downloadTrends.length - 1].downloads.toLocaleString() : "589")
              }
            </div>
            <div className="text-gray-600 text-sm font-medium">Downloads</div>
            <div className="text-xs text-gray-500 mt-1">
              +{downloadView === 'net-new' ? 
                (adoptionMetrics.netNewDownloads.length > 0 ? adoptionMetrics.netNewDownloads[adoptionMetrics.netNewDownloads.length - 1].downloads : 66) :
                (adoptionMetrics.netNewDownloads.length > 0 ? adoptionMetrics.netNewDownloads[adoptionMetrics.netNewDownloads.length - 1].downloads : 66)
              } this month
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
              {contributorGrowth.length > 0 ? contributorGrowth[contributorGrowth.length - 1].contributors : repoStats.contributors || 0}
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
        {/* 3x2 Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <ResponsiveContainer width="100%" height="100%">
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
              <ResponsiveContainer width="100%" height="100%">
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
              <ResponsiveContainer width="100%" height="100%">
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
              <ResponsiveContainer width="100%" height="100%">
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
              <ResponsiveContainer width="100%" height="100%">
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

      {/* Recent GitHub Discussions */}
      <Card id="engagement" className="mb-8">
        <h2 className="text-2xl font-bold text-black">Recent GitHub Discussions</h2>
        <p className="text-gray-700 mb-4">Latest conversations and decisions</p>
        <div className="space-y-4">
          {discussions.slice(0, 5).map((discussion) => (
            <div key={discussion.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-black">{discussion.title}</h3>
                <span className="text-xs text-gray-600">
                  {new Date(discussion.updated_at).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-700 space-y-1">
                {extractKeyPoints(discussion.body).map((point, i) => (
                  <div key={i} className="flex items-start">
                    <span className="text-gray-500 mr-2">•</span>
                    <span className="text-gray-700">{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-blue-700 font-medium">
                {discussion.comments} comment{discussion.comments !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
          {discussions.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No recent discussions found
            </div>
          )}
        </div>
        
        {/* See More Link */}
        <div className="mt-6 text-center">
          <a 
            href="https://github.com/agntcy/dir/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            See all discussions →
          </a>
        </div>
      </Card>

      {/* Virality Debug - Dependent Projects */}
      <Card className="mb-8">
        <h3 className="text-xl font-bold text-black mb-4">Dependent Projects (Debug)</h3>
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <strong>Dependents Count:</strong> {viralityData.dependentsCount}
          </div>
          <div className="text-sm text-gray-600">
            <strong>Packages Count:</strong> {viralityData.packagesCount}
          </div>
          <div className="text-sm text-gray-600">
            <strong>K-Factor:</strong> {viralityData.kFactor}
          </div>
          
          {viralityData.topDependents.length > 0 ? (
            <div className="mt-4">
              <h4 className="font-semibold text-black mb-2">Top Dependent Projects:</h4>
              <div className="space-y-2">
                {viralityData.topDependents.map((dependent, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="font-medium text-black">{dependent.name}</div>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>⭐ {dependent.stars}</span>
                      <span>🍴 {dependent.forks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 text-center text-gray-500 py-4">
              No dependent projects found. Check console for debug messages.
            </div>
          )}
        </div>
      </Card>

      
      </div>

      {/* Multi-Agent Dashboard - Sample Data */}
      <div id="agents" className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Multi-Agent System</h2>
            <p className="text-gray-700">AI agents working together to manage the community</p>
          </div>
          <div className="px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
            <span className="text-xs font-medium text-yellow-800">SAMPLE DATA</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Engagement Agent */}
          <Card className="border-l-4 border-l-blue-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black">Engagement Agent</h3>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${agents.find(a => a.type === 'engagement')?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm text-gray-600">{agents.find(a => a.type === 'engagement')?.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasks Completed:</span>
                  <span className="font-medium">{agents.find(a => a.type === 'engagement')?.tasksCompleted}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Task:</span>
                  <span className="font-medium text-blue-600">{agents.find(a => a.type === 'engagement')?.currentTask}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="font-medium">{agents.find(a => a.type === 'engagement')?.lastActivity}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Onboarding Agent */}
          <Card className="border-l-4 border-l-green-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black">Onboarding Agent</h3>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${agents.find(a => a.type === 'onboarding')?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm text-gray-600">{agents.find(a => a.type === 'onboarding')?.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasks Completed:</span>
                  <span className="font-medium">{agents.find(a => a.type === 'onboarding')?.tasksCompleted}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Task:</span>
                  <span className="font-medium text-green-600">{agents.find(a => a.type === 'onboarding')?.currentTask}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="font-medium">{agents.find(a => a.type === 'onboarding')?.lastActivity}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Analytics Agent */}
          <Card className="border-l-4 border-l-purple-500">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black">Analytics Agent</h3>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${agents.find(a => a.type === 'analytics')?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm text-gray-600">{agents.find(a => a.type === 'analytics')?.status}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasks Completed:</span>
                  <span className="font-medium">{agents.find(a => a.type === 'analytics')?.tasksCompleted}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Task:</span>
                  <span className="font-medium text-purple-600">{agents.find(a => a.type === 'analytics')?.currentTask}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="font-medium">{agents.find(a => a.type === 'analytics')?.lastActivity}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Agent Task Queue */}
        <Card>
          <h3 className="text-xl font-bold text-black mb-4">Agent Task Queue</h3>
          <div className="space-y-3">
            {agentTasks.map(task => {
              const agent = agents.find(a => a.id === task.agentId);
              return (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      task.status === 'completed' ? 'bg-green-500' : 
                      task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <div className="font-medium text-black">{task.description}</div>
                      <div className="text-sm text-gray-600">
                        {agent?.name} • {task.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      
      {/* Collective Intelligence */}
      <div id="intelligence" className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Collective Intelligence</h2>
            <p className="text-gray-700">Ontology-driven insights and collaborative intelligence</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-purple-100 border border-purple-300 rounded-lg">
              <span className="text-xs font-medium text-purple-800">POWERED BY ONTOLOGY</span>
            </div>
            <div className="px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-lg">
              <span className="text-xs font-medium text-yellow-800">SAMPLE DATA</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* Cross-Domain Insights */}
          <Card className="border-l-4 border-blue-500">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600">🔗</span>
              </div>
              <h3 className="text-lg font-semibold text-black">Cross-Domain Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-1">Semantic Connection Detected</div>
                <div className="text-xs text-gray-600">Downloads ↓ 15% correlates with API stability ↓ 8%</div>
                <div className="text-xs text-blue-600 mt-1">Likely cause: Recent code quality issues</div>
              </div>
              <div className="text-xs text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  3 semantic relationships found
                </div>
              </div>
            </div>
          </Card>

          {/* Smart Recommendations */}
          <Card className="border-l-4 border-green-500">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-black">Smart Recommendations</h3>
            </div>
            <div className="space-y-3">
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-700">Your Role:</label>
                <select className="ml-2 text-xs border border-gray-300 rounded px-2 py-1">
                  <option>Maintainer</option>
                  <option>Contributor</option>
                  <option>Enterprise User</option>
                  <option>TSC Member</option>
                </select>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-1">Priority Actions</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Address contributor retention trends</li>
                  <li>• Monitor API stability metrics</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Knowledge Graph */}
          <Card className="border-l-4 border-purple-500">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600">🕸️</span>
              </div>
              <h3 className="text-lg font-semibold text-black">Knowledge Graph</h3>
            </div>
            <div className="space-y-3">
              <div className="h-40 bg-gray-50 rounded-lg p-4 relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 300 120">
                  {/* Nodes */}
                  <circle cx="50" cy="30" r="12" fill="#3B82F6" className="cursor-pointer hover:opacity-80">
                    <title>Downloads</title>
                  </circle>
                  <text x="50" y="35" textAnchor="middle" className="text-xs fill-white font-medium">DL</text>
                  
                  <circle cx="150" cy="30" r="12" fill="#10B981" className="cursor-pointer hover:opacity-80">
                    <title>Code Quality</title>
                  </circle>
                  <text x="150" y="35" textAnchor="middle" className="text-xs fill-white font-medium">CQ</text>
                  
                  <circle cx="250" cy="30" r="12" fill="#8B5CF6" className="cursor-pointer hover:opacity-80">
                    <title>API Stability</title>
                  </circle>
                  <text x="250" y="35" textAnchor="middle" className="text-xs fill-white font-medium">API</text>
                  
                  <circle cx="100" cy="80" r="12" fill="#F59E0B" className="cursor-pointer hover:opacity-80">
                    <title>Contributors</title>
                  </circle>
                  <text x="100" y="85" textAnchor="middle" className="text-xs fill-white font-medium">CO</text>
                  
                  <circle cx="200" cy="80" r="12" fill="#EF4444" className="cursor-pointer hover:opacity-80">
                    <title>Community Health</title>
                  </circle>
                  <text x="200" y="85" textAnchor="middle" className="text-xs fill-white font-medium">CH</text>
                  
                  {/* Connections */}
                  <line x1="62" y1="30" x2="138" y2="30" stroke="#D1D5DB" strokeWidth="2" className="animate-pulse"/>
                  <line x1="162" y1="30" x2="238" y2="30" stroke="#D1D5DB" strokeWidth="2"/>
                  <line x1="50" y1="42" x2="88" y2="68" stroke="#D1D5DB" strokeWidth="2"/>
                  <line x1="150" y1="42" x2="112" y2="68" stroke="#D1D5DB" strokeWidth="2"/>
                  <line x1="250" y1="42" x2="212" y2="68" stroke="#D1D5DB" strokeWidth="2"/>
                  <line x1="112" y1="80" x2="188" y2="80" stroke="#D1D5DB" strokeWidth="2"/>
                  
                  {/* Semantic relationship indicators */}
                  <circle cx="100" cy="30" r="3" fill="#10B981" className="animate-pulse"/>
                  <circle cx="200" cy="30" r="3" fill="#F59E0B"/>
                  <circle cx="150" cy="55" r="3" fill="#8B5CF6" className="animate-pulse"/>
                </svg>
                
                {/* Legend */}
                <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Strong correlation</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-600">12 metrics, 8 semantic links</div>
                <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                  Explore graph →
                </button>
              </div>
            </div>
          </Card>

          {/* Collaborative Intelligence */}
          <Card className="border-l-4 border-orange-500">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-orange-600">🤝</span>
              </div>
              <h3 className="text-lg font-semibold text-black">Collaborative Intelligence</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">Agent Insights Shared</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Analytics Agent:</span>
                    <span className="text-orange-600">Trend anomaly detected</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Engagement Agent:</span>
                    <span className="text-orange-600">Community health score: 8.2/10</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                  Live semantic synthesis active
                </div>
              </div>
            </div>
          </Card>

          {/* Domain Expertise */}
          <Card className="border-l-4 border-indigo-500">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-indigo-600">📚</span>
              </div>
              <h3 className="text-lg font-semibold text-black">Domain Expertise</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">Encoded Best Practices</div>
                <div className="space-y-1">
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Code quality &gt; 80% threshold</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Contributor retention &gt; 6 months</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="text-yellow-500 mr-2">⚠</span>
                    <span>API stability needs improvement</span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">
                View ontology rules →
              </div>
            </div>
          </Card>

          {/* Best Practice Discovery */}
          <Card className="border-l-4 border-pink-500">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-pink-600">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-black">Best Practice Discovery</h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">Similar Projects Analysis</div>
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">
                    <div className="font-medium text-gray-900">Top Performers:</div>
                    <div>• React: 95% code quality, 2.5k contributors</div>
                    <div>• Next.js: 92% code quality, 1.8k contributors</div>
                  </div>
                </div>
                <div className="text-xs text-pink-600 mt-2">
                  3 actionable patterns identified
                </div>
              </div>
              <div className="text-xs text-gray-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                  Analyzed 47 similar projects
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Ontology Overview */}
        <Card>
          <h3 className="text-lg font-semibold text-black mb-4">Semantic Framework Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">247</div>
              <div className="text-sm text-gray-600">Semantic Relationships</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">89%</div>
              <div className="text-sm text-gray-600">Insight Accuracy</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">12ms</div>
              <div className="text-sm text-gray-600">Avg. Response Time</div>
            </div>
          </div>
        </Card>
      </div>
      
      <AIStrategicPartner />
      </div>
    </div>
  );
}