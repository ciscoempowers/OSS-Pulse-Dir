import { Workflow } from '../types';

// First Contribution Facilitator Agent Workflow
// Trigger: Contributor requests help with first contribution or expresses interest

export const contributionWorkflow: Workflow = {
  id: 'first-contribution',
  name: 'First Contribution Facilitator',
  description: 'Comprehensive workflow that guides contributors through their first successful contribution to the project',
  agentType: 'contribution',
  estimatedDuration: 60,
  triggerDescription: 'Triggered when contributor requests help, shows interest in contributing, or claims their first issue',
  steps: [
    {
      id: 'contrib-1',
      name: 'Analyze Contributor Profile & Skills',
      description: 'Deep analysis of contributor background, skills, and learning preferences to match with appropriate tasks',
      type: 'data_collection',
      status: 'pending',
      config: {
        simulationAction: 'analyzeContributorSkills',
        analysisFactors: ['github_activity', 'language_proficiency', 'project_complexity', 'learning_style'],
        skillAssessment: ['beginner_friendly', 'documentation', 'bug_fixes', 'tests', 'features'],
        difficultyMatching: true
      },
      estimatedDuration: 5,
      simulatedAction: 'Analyze GitHub contribution history, assess language proficiency from past projects, evaluate complexity of previous work, determine optimal starting difficulty level and task categories'
    },
    {
      id: 'contrib-2',
      name: 'Issue Recommendation Decision',
      description: 'Review and approve recommended first issue based on contributor skill analysis',
      type: 'human_approval',
      status: 'pending',
      config: {
        approvalMessage: 'Please review the recommended first issue for this contributor',
        approvalOptions: [
          { id: 'approve', label: 'Assign This Issue', description: 'This issue is perfect for the contributor\'s skill level', action: 'approve' },
          { id: 'suggest-alternative', label: 'Choose Different Issue', description: 'Select from alternative recommendations', action: 'modify' },
          { id: 'create-custom', label: 'Create Custom Task', description: 'Design a tailored first task', action: 'modify' }
        ],
        simulationAction: 'recommendFirstIssue',
        recommendationCriteria: ['skill_match', 'learning_value', 'impact', 'mentor_availability'],
        issueCategories: ['good_first_issue', 'documentation', 'bug_fix', 'test_improvement']
      },
      estimatedDuration: 8,
      simulatedAction: 'Scan repository for beginner-friendly issues, match issue requirements with contributor skills, prioritize issues with good learning value and mentor availability, present top 3 recommendations with detailed reasoning',
      humanDecision: 'Choose whether to assign the recommended issue, select an alternative, or create a custom first task'
    },
    {
      id: 'contrib-3',
      name: 'Reserve and Assign Issue',
      description: 'Formally assign the chosen issue to the contributor and update project tracking',
      type: 'automated',
      status: 'pending',
      config: {
        simulationAction: 'assignIssue',
        addLabels: ['first-timer-only', 'help-wanted', 'mentor-assigned'],
        notifyMaintainers: true,
        setDueDate: true,
        createTracking: true
      },
      estimatedDuration: 3,
      simulatedAction: 'Assign issue to contributor in GitHub, add appropriate labels for visibility, notify maintainers about new contributor, set reasonable due date based on issue complexity, create internal tracking for progress monitoring'
    },
    {
      id: 'contrib-4',
      name: 'Development Environment Setup',
      description: 'Guide contributor through complete local development environment configuration',
      type: 'automated',
      status: 'pending',
      config: {
        simulationAction: 'setupDevEnvironment',
        generateCommands: true,
        validateSetup: true,
        includeTests: true,
        osSpecific: true,
        ideIntegration: true
      },
      estimatedDuration: 12,
      simulatedAction: 'Generate OS-specific setup commands, verify git configuration, install project dependencies, configure development environment variables, run test suite to ensure everything works, set up IDE integration and debugging tools'
    },
    {
      id: 'contrib-5',
      name: 'Create Feature Branch Strategy',
      description: 'Help contributor create properly named feature branch and establish workflow',
      type: 'automated',
      status: 'pending',
      config: {
        simulationAction: 'createFeatureBranch',
        branchNaming: 'feature/ISSUE-123-brief-description',
        includeIssueNumber: true,
        setupUpstream: true,
        createTemplate: true
      },
      estimatedDuration: 3,
      simulatedAction: 'Generate appropriate branch name following project conventions, create feature branch from main/master, set up upstream tracking, create commit message template, establish branch protection rules and workflow guidelines'
    },
    {
      id: 'contrib-6',
      name: 'Implementation Guidance & Checkpoints',
      description: 'Provide step-by-step implementation guidance with interactive checkpoints',
      type: 'data_collection',
      status: 'pending',
      config: {
        simulationAction: 'provideImplementationGuidance',
        guidanceType: 'interactive',
        checkpoints: ['understanding_requirements', 'code_structure', 'testing', 'documentation'],
        resources: ['code_examples', 'templates', 'documentation_links', 'video_tutorials'],
        progressTracking: true
      },
      estimatedDuration: 20,
      simulatedAction: 'Break down implementation into manageable steps, provide code examples and templates, offer multiple learning resources, create interactive checkpoints for progress validation, adapt guidance based on contributor questions and progress'
    },
    {
      id: 'contrib-7',
      name: 'Code Review & Merge Decision',
      description: 'Submit completed work for code review and determine merge readiness',
      type: 'human_approval',
      status: 'pending',
      config: {
        approvalMessage: 'Review completed contribution and determine if ready for merge',
        approvalOptions: [
          { id: 'approve', label: 'Approve & Merge', description: 'Code meets standards and is ready to merge', action: 'approve' },
          { id: 'request-changes', label: 'Request Changes', description: 'Code needs revisions before approval', action: 'modify' },
          { id: 'more-guidance', label: 'Provide More Guidance', description: 'Contributor needs additional help', action: 'modify' }
        ],
        simulationAction: 'submitForReview',
        reviewCriteria: ['code_quality', 'test_coverage', 'documentation', 'standards_compliance'],
        reviewers: ['mentor', 'code_reviewer', 'maintainer']
      },
      estimatedDuration: 9,
      simulatedAction: 'Analyze code quality and test coverage, verify documentation completeness, check compliance with project standards, generate comprehensive review summary, provide specific feedback and improvement suggestions',
      humanDecision: 'Evaluate if the contribution is ready to merge, needs changes, or requires more guidance'
    }
  ]
};

// Workflow simulation logic
export const contributionSimulationActions = {
  analyzeContributorSkills: (contributor: any) => ({
    skill_level: 'intermediate',
    preferred_tasks: ['documentation', 'bug_fixes'],
    learning_style: 'visual',
    estimated_difficulty: 'beginner_to_intermediate',
    confidence: 0.88
  }),
  recommendFirstIssue: (profile: any, issues: any[]) => ({
    recommended_issue: issues[0],
    reasoning: 'Matches documentation experience and provides good learning opportunity',
    alternatives: issues.slice(1, 3),
    estimated_time: '4-6 hours',
    learning_value: 'high'
  }),
  assignIssue: (issue: any, contributor: any) => ({
    issue_assigned: true,
    labels_added: ['first-timer-only', 'help-wanted'],
    due_date: '2024-01-20',
    mentor_assigned: 'senior_dev_123',
    tracking_created: true
  }),
  setupDevEnvironment: (os: string, repo: any) => ({
    setup_commands: ['git clone', 'npm install', 'npm test'],
    validation_passed: true,
    tests_running: true,
    ide_configured: true,
    setup_time: '25 minutes'
  }),
  createFeatureBranch: (issue: any) => ({
    branch_name: 'feature/ISSUE-123-fix-typo-in-readme',
    upstream_configured: true,
    commit_template: 'Fix typo in README\n\nFixes #123',
    protection_rules: 'active'
  }),
  provideImplementationGuidance: (issue: any, progress: any) => ({
    current_step: 'code_structure',
    next_steps: ['Implement fix', 'Add tests', 'Update docs'],
    resources_provided: ['example_code', 'test_template'],
    progress_percentage: 45,
    estimated_completion: '2 more hours'
  }),
  submitForReview: (code: any, tests: any) => ({
    code_quality_score: 8.5,
    test_coverage: 95,
    documentation_complete: true,
    standards_compliant: true,
    review_summary: 'Good first contribution, minor style suggestions',
    ready_for_merge: true
  })
};
