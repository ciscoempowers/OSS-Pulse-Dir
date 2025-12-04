import { Workflow } from '../types';

// Smart Triage & Mentorship Agent Workflow
// Trigger: New issues/PRs created or contributor shows signs of needing help

export const triageWorkflow: Workflow = {
  id: 'smart-triage',
  name: 'Smart Triage & Mentorship',
  description: 'Intelligent issue triage system with ongoing mentorship and contributor support',
  agentType: 'triage',
  estimatedDuration: 45,
  triggerDescription: 'Triggered by new issues/PRs, contributor inactivity, or mentorship requests',
  steps: [
    {
      id: 'triage-1',
      name: 'Monitor Repository Activity',
      description: 'Continuously monitor repository for new issues, PRs, and contributor activity patterns',
      type: 'automated',
      status: 'pending',
      config: {
        simulationAction: 'monitorRepositoryActivity',
        monitoringScope: ['issues', 'pull_requests', 'discussions', 'contributor_activity'],
        filters: ['first_time_contributors', 'help_wanted', 'good_first_issue', 'stalled_prs'],
        alertThresholds: { new_issues: 5, stalled_prs: 3, new_contributors: 2 }
      },
      estimatedDuration: 3,
      simulatedAction: 'Scan repository for new issues and PRs, identify first-time contributors, detect stalled contributions, monitor discussion threads, track contributor activity patterns and engagement levels'
    },
    {
      id: 'triage-2',
      name: 'Intelligent Issue Analysis',
      description: 'Analyze and categorize issues using NLP and historical data',
      type: 'automated',
      status: 'pending',
      config: {
        simulationAction: 'analyzeIssueComplexity',
        analysisFactors: ['description_length', 'code_blocks', 'error_logs', 'reproduction_steps', 'attachments'],
        categories: ['bug_report', 'feature_request', 'documentation', 'question', 'enhancement'],
        complexityLevels: ['simple', 'moderate', 'complex', 'expert_required'],
        sentimentAnalysis: true
      },
      estimatedDuration: 4,
      simulatedAction: 'Apply NLP to understand issue content and intent, analyze complexity based on technical depth and scope, extract key entities and requirements, assess contributor sentiment and urgency, categorize and prioritize automatically'
    },
    {
      id: 'triage-3',
      name: 'Label & Priority Assignment',
      description: 'Review and approve AI-suggested labels and priority assignments',
      type: 'human_approval',
      status: 'pending',
      config: {
        approvalMessage: 'Please review AI-suggested labels and priority for this issue',
        approvalOptions: [
          { id: 'approve', label: 'Apply Suggestions', description: 'Use all AI-suggested labels and priority', action: 'approve' },
          { id: 'modify', label: 'Modify Labels', description: 'Adjust labels and priority before applying', action: 'modify' },
          { id: 'manual', label: 'Manual Assignment', description: 'Skip suggestions and assign manually', action: 'reject' }
        ],
        simulationAction: 'suggestLabelsAndPriority',
        labelCategories: ['type', 'priority', 'complexity', 'component', 'status'],
        priorityFactors: ['impact', 'urgency', 'contributor_level', 'dependencies']
      },
      estimatedDuration: 6,
      simulatedAction: 'Generate appropriate labels based on issue analysis, calculate priority using weighted factors, suggest component ownership, recommend status labels, provide reasoning for each suggestion',
      humanDecision: 'Choose whether to apply AI suggestions, modify them, or handle labeling manually'
    },
    {
      id: 'triage-4',
      name: 'Contributor Matching Algorithm',
      description: 'Intelligently match issues with suitable contributors and mentors',
      type: 'automated',
      status: 'pending',
      config: {
        simulationAction: 'matchContributors',
        matchingCriteria: ['skill_match', 'past_contributions', 'availability', 'interests', 'timezone', 'workload'],
        contributorTypes: ['experts', 'regulars', 'first_timers', 'mentors'],
        maxSuggestions: 5,
        diversityFactor: true
      },
      estimatedDuration: 5,
      simulatedAction: 'Analyze contributor skills and past contributions, assess current workload and availability, calculate skill compatibility scores, consider timezone and communication preferences, prioritize diverse contributor representation, rank and suggest best matches'
    },
    {
      id: 'triage-5',
      name: 'Personalized Outreach Strategy',
      description: 'Design and execute personalized outreach to matched contributors',
      type: 'human_approval',
      status: 'pending',
      config: {
        approvalMessage: 'Review personalized outreach strategy for this issue',
        approvalOptions: [
          { id: 'approve', label: 'Send Outreach', description: 'Execute the suggested outreach strategy', action: 'approve' },
          { id: 'modify', label: 'Modify Strategy', description: 'Adjust outreach approach before sending', action: 'modify' },
          { id: 'skip', label: 'Skip Outreach', description: 'Do not send outreach for this issue', action: 'skip' }
        ],
        simulationAction: 'designOutreachStrategy',
        outreachChannels: ['github_comment', 'slack_dm', 'email', 'discord'],
        personalizationFactors: ['contributor_history', 'communication_style', 'preferred_language', 'time_zone']
      },
      estimatedDuration: 8,
      simulatedAction: 'Analyze contributor communication preferences and history, craft personalized message highlighting relevant skills, suggest optimal timing and channel, create follow-up schedule, provide template for mentor introduction',
      humanDecision: 'Choose whether to send the personalized outreach, modify the approach, or skip outreach entirely'
    },
    {
      id: 'triage-6',
      name: 'Progress Monitoring & Analytics',
      description: 'Track contributor progress and identify intervention opportunities',
      type: 'data_collection',
      status: 'pending',
      config: {
        simulationAction: 'monitorContributorProgress',
        metrics: ['commit_frequency', 'pr_merge_rate', 'issue_resolution_time', 'code_quality', 'collaboration_score'],
        interventionTriggers: ['stalled_progress', 'declining_activity', 'repeated_failures', 'communication_gaps'],
        monitoringInterval: 24, // hours
        analyticsDepth: 'detailed'
      },
      estimatedDuration: 10,
      simulatedAction: 'Track real-time contributor activity and progress, analyze code quality and collaboration patterns, identify early warning signs of struggle, calculate engagement and success metrics, generate intervention recommendations and timeline'
    },
    {
      id: 'triage-7',
      name: 'Adaptive Mentorship Deployment',
      description: 'Deploy appropriate mentorship resources and human intervention',
      type: 'human_approval',
      status: 'pending',
      config: {
        approvalMessage: 'Review recommended mentorship intervention strategy',
        approvalOptions: [
          { id: 'auto_mentorship', label: 'Deploy AI Mentorship', description: 'Let AI handle mentorship with automated resources', action: 'approve' },
          { id: 'human_mentor', label: 'Assign Human Mentor', description: 'Assign experienced human mentor for personalized guidance', action: 'modify' },
          { id: 'hybrid', label: 'Hybrid Approach', description: 'Combine AI resources with human mentor oversight', action: 'modify' },
          { id: 'resources_only', label: 'Send Resources Only', description: 'Provide learning materials without active mentorship', action: 'skip' }
        ],
        simulationAction: 'deployMentorshipStrategy',
        mentorshipTypes: ['technical_guidance', 'process_mentoring', 'code_review', 'career_development'],
        interventionLevels: ['light_touch', 'moderate_support', 'intensive_mentoring']
      },
      estimatedDuration: 9,
      simulatedAction: 'Analyze contributor needs and progress patterns, recommend optimal mentorship approach, match with appropriate human mentors if needed, generate personalized learning resources, create intervention timeline and success metrics',
      humanDecision: 'Choose the best mentorship approach based on contributor needs and available resources'
    }
  ]
};

// Workflow simulation logic
export const triageSimulationActions = {
  monitorRepositoryActivity: (repo: any) => ({
    new_issues: 3,
    new_prs: 2,
    first_time_contributors: 1,
    stalled_contributions: 2,
    activity_score: 7.2,
    alerts_generated: 4
  }),
  analyzeIssueComplexity: (issue: any) => ({
    category: 'bug_report',
    complexity: 'moderate',
    sentiment: 'neutral',
    urgency: 'medium',
    estimated_effort: '4-6 hours',
    required_skills: ['javascript', 'testing'],
    confidence: 0.91
  }),
  suggestLabelsAndPriority: (analysis: any) => ({
    suggested_labels: ['bug', 'medium-priority', 'frontend', 'good-first-issue'],
    priority: 'medium',
    assignee_suggestion: 'contributor_jane',
    reasoning: 'Frontend bug with clear reproduction steps, suitable for intermediate contributor',
    confidence_score: 0.87
  }),
  matchContributors: (issue: any, contributors: any[]) => ({
    top_matches: [
      { contributor: contributors[0], match_score: 0.92, reason: 'Frontend expertise and availability' },
      { contributor: contributors[1], match_score: 0.85, reason: 'Past bug fixes in similar area' },
      { contributor: contributors[2], match_score: 0.78, reason: 'Looking for first contribution' }
    ],
    diversity_bonus: 0.15,
    timezone_compatibility: 0.88
  }),
  designOutreachStrategy: (contributor: any, issue: any) => ({
    recommended_channel: 'github_comment',
    personalization_level: 'high',
    message_tone: 'encouraging',
    optimal_timing: '2024-01-15 14:00 UTC',
    follow_up_schedule: [3, 7, 14],
    success_probability: 0.73
  }),
  monitorContributorProgress: (contributor: any, timeframe: number) => ({
    current_activity: 'active',
    progress_trend: 'positive',
    intervention_needed: false,
    engagement_score: 8.1,
    collaboration_quality: 'high',
    next_check_in: '2024-01-16'
  }),
  deployMentorshipStrategy: (contributor: any, needs: any) => ({
    recommended_approach: 'hybrid',
    mentorship_level: 'moderate_support',
    human_mentor_assigned: 'senior_dev_456',
    ai_resources: ['code_examples', 'best_practices_guide', 'video_tutorials'],
    intervention_timeline: '2 weeks',
    success_metrics: ['code_quality_improvement', 'independent_problem_solving']
  })
};
