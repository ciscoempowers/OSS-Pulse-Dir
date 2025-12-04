import { Workflow } from '../types';

// Welcome & Environment Setup Agent Workflow
// Trigger: New contributor joins the repository or first-time contribution

export const welcomeWorkflow: Workflow = {
  id: 'welcome-setup',
  name: 'Welcome & Environment Setup',
  description: 'Comprehensive onboarding workflow that welcomes new contributors and sets up their development environment',
  agentType: 'welcome',
  estimatedDuration: 20,
  triggerDescription: 'Automatically triggered when a new contributor joins or makes their first contribution',
  steps: [
    {
      id: 'welcome-1',
      name: 'Analyze Contributor Profile',
      description: 'Analyze GitHub profile, contribution history, and technical background',
      type: 'data_collection',
      status: 'pending',
      config: {
        dataFields: ['github_username', 'public_repos', 'languages', 'contribution_frequency'],
        simulationAction: 'analyzeGitHubProfile',
        expectedOutputs: ['technical_experience', 'preferred_languages', 'activity_level']
      },
      estimatedDuration: 2,
      simulatedAction: 'Scan GitHub API for contributor profile data, analyze repository contributions, identify primary programming languages, assess contribution patterns and frequency'
    },
    {
      id: 'welcome-2',
      name: 'Send Personalized Welcome',
      description: 'Send customized welcome message based on contributor analysis',
      type: 'notification',
      status: 'pending',
      config: {
        notificationTemplate: 'personalized-welcome',
        channels: ['email', 'slack'],
        personalizationFields: ['name', 'background', 'interests'],
        simulationAction: 'generateWelcomeMessage'
      },
      estimatedDuration: 1,
      simulatedAction: 'Generate personalized welcome message referencing contributor background, include relevant project links, suggest initial contribution areas based on their skills'
    },
    {
      id: 'welcome-3',
      name: 'Generate Environment Setup Guide',
      description: 'Create personalized development environment setup checklist',
      type: 'automated',
      status: 'pending',
      config: {
        template: 'environment-setup',
        includeItems: ['git_config', 'ide_setup', 'dependencies', 'testing_tools'],
        simulationAction: 'generateSetupChecklist',
        osDetection: true
      },
      estimatedDuration: 3,
      simulatedAction: 'Analyze repository requirements, detect contributor OS (if available), generate step-by-step setup instructions, include verification commands, create personalized checklist'
    },
    {
      id: 'welcome-4',
      name: 'Mentor Assignment Decision',
      description: 'Review and approve mentor assignment based on contributor profile and availability',
      type: 'human_approval',
      status: 'pending',
      config: {
        approvalMessage: 'Please review the suggested mentor assignment for this contributor',
        approvalOptions: [
          { id: 'approve', label: 'Assign Mentor', description: 'This mentor is a good match for the contributor', action: 'approve' },
          { id: 'reassign', label: 'Choose Different Mentor', description: 'Select a different mentor from available options', action: 'modify' },
          { id: 'skip', label: 'Skip Mentor Assignment', description: 'Proceed without assigning a mentor', action: 'skip' }
        ],
        simulationAction: 'suggestMentor',
        mentorCriteria: ['experience_match', 'timezone_compatibility', 'availability']
      },
      estimatedDuration: 5,
      simulatedAction: 'Match contributor with available mentors based on expertise overlap, timezone compatibility, and current workload. Present top 3 mentor options with reasoning.',
      humanDecision: 'Choose whether to assign the suggested mentor, select a different one, or skip mentorship'
    },
    {
      id: 'welcome-5',
      name: 'Schedule Onboarding Session',
      description: 'Schedule welcome call with assigned mentor and team',
      type: 'automated',
      status: 'pending',
      config: {
        simulationAction: 'scheduleOnboardingCall',
        duration: 30,
        participants: ['contributor', 'mentor', 'team_lead'],
        agenda: ['project_overview', 'contribution_process', 'q&a']
      },
      estimatedDuration: 2,
      simulatedAction: 'Find available time slots for all participants, generate calendar invitation with project overview and contribution guidelines, send reminders to all attendees'
    },
    {
      id: 'welcome-6',
      name: 'Curate Learning Resources',
      description: 'Send personalized learning materials and documentation',
      type: 'automated',
      status: 'pending',
      config: {
        simulationAction: 'curateResources',
        resourceCategories: ['getting_started', 'project_specific', 'best_practices', 'tools'],
        personalization: true,
        format: 'email'
      },
      estimatedDuration: 3,
      simulatedAction: 'Analyze contributor skill gaps, match resources to experience level, prioritize project-specific documentation, include video tutorials for complex topics, create learning path timeline'
    },
    {
      id: 'welcome-7',
      name: 'Setup Verification Check',
      description: 'Verify development environment is properly configured',
      type: 'data_collection',
      status: 'pending',
      config: {
        simulationAction: 'verifyEnvironment',
        checks: ['git_config', 'dependencies_installed', 'tests_running', 'ide_integration'],
        successCriteria: ['all_checks_pass', 'contributor_confirmed']
      },
      estimatedDuration: 4,
      simulatedAction: 'Run automated verification scripts, check if git is configured properly, verify all dependencies are installed, confirm test suite runs successfully, validate IDE integration if applicable'
    }
  ]
};

// Workflow simulation logic
export const welcomeSimulationActions = {
  analyzeGitHubProfile: (contributor: any) => ({
    technical_experience: 'intermediate',
    preferred_languages: ['TypeScript', 'JavaScript'],
    activity_level: 'moderate',
    confidence: 0.85
  }),
  generateWelcomeMessage: (profile: any) => ({
    message: `Welcome ${profile.name}! We noticed your experience with ${profile.languages.join(', ')}. Here are some great first issues...`,
    personalization_score: 0.9
  }),
  generateSetupChecklist: (os: string, repo: any) => ({
    checklist: [
      'Configure git with your name and email',
      'Install Node.js v18 or higher',
      'Clone the repository and run npm install',
      'Set up your IDE with recommended extensions'
    ],
    estimated_time: '45 minutes'
  }),
  suggestMentor: (contributor: any, mentors: any[]) => ({
    recommended_mentor: mentors[0],
    reasoning: 'Matches TypeScript experience and timezone',
    alternatives: mentors.slice(1, 3)
  }),
  scheduleOnboardingCall: (participants: string[]) => ({
    scheduled_time: '2024-01-15 10:00 AM PST',
    meeting_link: 'https://meet.example.com/onboarding',
    agenda_sent: true
  }),
  curateResources: (profile: any) => ({
    resources: [
      { type: 'documentation', title: 'Contributing Guide', priority: 'high' },
      { type: 'video', title: 'Project Overview', priority: 'medium' },
      { type: 'tutorial', title: 'First Contribution Walkthrough', priority: 'high' }
    ],
    learning_path: '2-week onboarding plan'
  }),
  verifyEnvironment: () => ({
    git_configured: true,
    dependencies_installed: true,
    tests_passing: true,
    ide_ready: true,
    overall_status: 'ready'
  })
};
