export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  agentType: 'welcome' | 'contribution' | 'triage';
  contributor: {
    username: string;
    experience: string;
    interests: string[];
    timezone: string;
    avatar?: string;
  };
  timing: {
    stepDuration: number;
    approvalDelay: number;
    totalDuration: number;
  };
  autoPilot: boolean;
  prefillData: {
    [stepId: string]: any;
  };
  humanResponses: {
    [stepId: string]: {
      action: 'approve' | 'modify' | 'reject' | 'skip';
      modifications?: any;
      reason?: string;
    };
  };
  expectedOutcome: {
    success: boolean;
    completionTime: number;
    humanInteractions: number;
    errors: string[];
  };
}

export const demoScenarios: DemoScenario[] = [
  {
    id: 'happy-path',
    name: 'Happy Path',
    description: 'Perfect onboarding experience - all steps succeed, human approves quickly',
    agentType: 'welcome',
    contributor: {
      username: 'alexchen',
      experience: 'intermediate',
      interests: ['TypeScript', 'React', 'Testing'],
      timezone: 'PST',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alexchen'
    },
    timing: {
      stepDuration: 1500,
      approvalDelay: 1000,
      totalDuration: 12000
    },
    autoPilot: true,
    prefillData: {
      'welcome-1': {
        technical_experience: 'intermediate',
        preferred_languages: ['TypeScript', 'JavaScript', 'React'],
        activity_level: 'high',
        confidence: 0.92,
        previous_contributions: 12,
        github_stars: 45
      },
      'welcome-2': {
        message: 'Hi Alex! Welcome to our community! 🎉 We noticed your strong TypeScript background and experience with React. We have some exciting documentation improvements and type definition updates that would be perfect for your skills. Your first contribution could be helping us improve our TypeScript definitions for the React components.',
        personalization_score: 0.95,
        tone: 'enthusiastic',
        suggested_issues: ['ISSUE-234', 'ISSUE-256', 'ISSUE-278']
      },
      'welcome-3': {
        setup_checklist: [
          '✅ Node.js 18+ installed',
          '✅ Git configured',
          '✅ VS Code with TypeScript extensions',
          '✅ Forked repository',
          '⏳ Local development environment'
        ],
        estimated_setup_time: '15 minutes',
        difficulty_level: 'beginner'
      },
      'welcome-4': {
        recommended_mentor: 'sarah_dev',
        reasoning: 'Perfect match: TypeScript expertise, React experience, same timezone (PST), high mentor rating (4.8/5)',
        alternatives: ['mike_ts', 'julia_react'],
        mentor_profile: {
          name: 'Sarah Chen',
          expertise: ['TypeScript', 'React', 'Node.js'],
          timezone: 'PST',
          availability: 'High',
          success_rate: 96,
          mentees_count: 23
        },
        matching_score: {
          technical_match: 0.95,
          timezone_match: 1.0,
          availability_match: 0.9,
          personality_match: 0.88,
          overall: 0.93
        }
      }
    },
    humanResponses: {
      'welcome-4': {
        action: 'approve',
        modifications: null,
        reason: 'Great mentor match!'
      }
    },
    expectedOutcome: {
      success: true,
      completionTime: 12000,
      humanInteractions: 1,
      errors: []
    }
  },
  {
    id: 'stuck-contributor',
    name: 'Stuck Contributor',
    description: 'Contributor needs help - agent provides additional support and guidance',
    agentType: 'contribution',
    contributor: {
      username: 'newbie_dev',
      experience: 'beginner',
      interests: ['HTML', 'CSS', 'JavaScript'],
      timezone: 'EST',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newbie_dev'
    },
    timing: {
      stepDuration: 2000,
      approvalDelay: 3000,
      totalDuration: 18000
    },
    autoPilot: true,
    prefillData: {
      'contrib-1': {
        technical_experience: 'beginner',
        preferred_languages: ['HTML', 'CSS', 'JavaScript'],
        activity_level: 'low',
        confidence: 0.65,
        previous_contributions: 0,
        learning_style: 'visual',
        challenges: ['Git commands', 'Terminal usage', 'Code review process']
      },
      'contrib-2': {
        recommended_issue: 'ISSUE-145: Fix broken link in documentation',
        reasoning: 'Perfect first issue: low complexity, high impact, good learning opportunity, clear instructions',
        estimated_time: '2-3 hours',
        learning_value: 'very_high',
        difficulty_score: 2.1,
        skills_gained: ['Git workflow', 'Markdown editing', 'Pull request process']
      },
      'contrib-4': {
        setup_status: 'incomplete',
        issues_found: [
          'Git not configured properly',
          'Node.js version mismatch',
          'Confusion about branch creation'
        ],
        help_needed: true,
        support_level: 'high'
      },
      'contrib-6': {
        checkpoints: [
          { step: 'Fork repository', status: 'completed', help_provided: false },
          { step: 'Create branch', status: 'stuck', help_provided: true },
          { step: 'Edit file', status: 'pending', help_provided: false },
          { step: 'Commit changes', status: 'pending', help_provided: false }
        ],
        current_blocker: 'Git branch creation commands',
        additional_resources: [
          'Git tutorial video',
          'Step-by-step screenshots',
          'Live office hours invitation'
        ]
      }
    },
    humanResponses: {
      'contrib-2': {
        action: 'modify',
        modifications: {
          issue_id: 'ISSUE-189',
          title: 'Add alt text to hero images',
          reasoning: 'Even simpler issue, focuses on accessibility, good for HTML/CSS practice'
        },
        reason: 'Contributor is complete beginner, need even simpler first issue'
      },
      'contrib-7': {
        action: 'approve',
        modifications: null,
        reason: 'Good progress despite initial challenges'
      }
    },
    expectedOutcome: {
      success: true,
      completionTime: 18000,
      humanInteractions: 2,
      errors: ['Git configuration issues', 'Setup problems']
    }
  },
  {
    id: 'complex-issue',
    name: 'Complex Issue',
    description: 'Requires extensive triage and multiple maintainers for resolution',
    agentType: 'triage',
    contributor: {
      username: 'expert_dev',
      experience: 'expert',
      interests: ['Performance', 'Architecture', 'Security'],
      timezone: 'UTC',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=expert_dev'
    },
    timing: {
      stepDuration: 2500,
      approvalDelay: 4000,
      totalDuration: 25000
    },
    autoPilot: true,
    prefillData: {
      'triage-1': {
        new_issues: 3,
        new_prs: 2,
        activity_spike: true,
        priority_alerts: ['SECURITY', 'PERFORMANCE', 'BUG']
      },
      'triage-2': {
        issue_analysis: {
          'ISSUE-412': {
            category: 'security_vulnerability',
            severity: 'critical',
            complexity: 'high',
            estimated_effort: '16-24 hours',
            required_expertise: ['Security', 'Backend'],
            impact: 'production_users'
          },
          'ISSUE-413': {
            category: 'performance_regression',
            severity: 'high',
            complexity: 'medium',
            estimated_effort: '8-12 hours',
            required_expertise: ['Performance', 'Frontend'],
            impact: 'user_experience'
          },
          'ISSUE-414': {
            category: 'feature_request',
            severity: 'medium',
            complexity: 'low',
            estimated_effort: '4-6 hours',
            required_expertise: ['UI/UX'],
            impact: 'user_satisfaction'
          }
        },
        sentiment_analysis: {
          overall: 'concerned',
          urgency: 'high',
          community_impact: 'significant'
        }
      },
      'triage-3': {
        suggested_labels: {
          'ISSUE-412': ['security', 'critical', 'backend', 'immediate'],
          'ISSUE-413': ['performance', 'regression', 'frontend', 'high-priority'],
          'ISSUE-414': ['enhancement', 'ui/ux', 'good-first-issue']
        },
        suggested_assignees: {
          'ISSUE-412': ['security_team', 'backend_leads'],
          'ISSUE-413': ['performance_team', 'frontend_experts'],
          'ISSUE-414': ['ui_team', 'design_team']
        },
        confidence_scores: {
          'ISSUE-412': 0.94,
          'ISSUE-413': 0.87,
          'ISSUE-414': 0.91
        }
      },
      'triage-4': {
        matching_results: {
          'ISSUE-412': {
            primary: 'security_expert_1',
            backup: ['backend_senior_2', 'security_reviewer_3'],
            confidence: 0.89,
            availability: 'immediate'
          },
          'ISSUE-413': {
            primary: 'performance_guru',
            backup: ['frontend_optimize', 'speed_specialist'],
            confidence: 0.92,
            availability: 'today'
          }
        }
      },
      'triage-5': {
        outreach_strategies: {
          'ISSUE-412': {
            channel: 'private_slack',
            urgency: 'immediate',
            message: 'Critical security issue requires immediate attention',
            escalation: 'cto_notified'
          },
          'ISSUE-413': {
            channel: 'team_discussion',
            urgency: 'high',
            message: 'Performance regression affecting user experience',
            escalation: 'tech_lead'
          }
        }
      },
      'triage-6': {
        monitoring_data: {
          contributor_engagement: 'high',
          resolution_velocity: 'slowing',
          blocker_count: 2,
          escalation_needed: true
        }
      }
    },
    humanResponses: {
      'triage-3': {
        action: 'modify',
        modifications: {
          'ISSUE-412': {
            labels: ['security', 'critical', 'backend', 'immediate', 'cve-2024-001'],
            assignees: ['security_team', 'incident_commander']
          },
          'ISSUE-413': {
            labels: ['performance', 'regression', 'frontend', 'high-priority', 'q3-2024'],
            assignees: ['performance_guru', 'frontend_lead']
          }
        },
        reason: 'Add additional labels for tracking and include incident commander for security issue'
      },
      'triage-5': {
        action: 'modify',
        modifications: {
          'ISSUE-412': {
            escalation: 'security_incident_created',
            incident_id: 'INC-2024-042',
            response_team: ['security_team', 'devops', 'incident_commander']
          }
        },
        reason: 'Create formal security incident for proper tracking'
      },
      'triage-7': {
        action: 'approve',
        modifications: null,
        reason: 'Appropriate escalation and resource allocation'
      }
    },
    expectedOutcome: {
      success: true,
      completionTime: 25000,
      humanInteractions: 3,
      errors: ['Initial severity underestimation', 'Resource allocation delay']
    }
  },
  {
    id: 'quick-win',
    name: 'Quick Win',
    description: 'Fast approval and successful first contribution - perfect demo scenario',
    agentType: 'contribution',
    contributor: {
      username: 'quicklearner',
      experience: 'intermediate',
      interests: ['Documentation', 'Testing', 'CI/CD'],
      timezone: 'CST',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=quicklearner'
    },
    timing: {
      stepDuration: 800,
      approvalDelay: 500,
      totalDuration: 6000
    },
    autoPilot: true,
    prefillData: {
      'contrib-1': {
        technical_experience: 'intermediate',
        preferred_languages: ['JavaScript', 'Python', 'Markdown'],
        activity_level: 'high',
        confidence: 0.88,
        previous_contributions: 5,
        quick_learner: true
      },
      'contrib-2': {
        recommended_issue: 'ISSUE-089: Fix typo in README.md',
        reasoning: 'Perfect quick win: minimal complexity, immediate impact, confidence booster',
        estimated_time: '30 minutes',
        learning_value: 'medium',
        difficulty_score: 0.5,
        skills_gained: ['Git basics', 'Pull request process']
      },
      'contrib-3': {
        assignment_status: 'completed',
        issue_url: 'https://github.com/project/repo/issues/89',
        reserved_by: 'quicklearner',
        reservation_time: '2024-01-15T10:30:00Z'
      },
      'contrib-4': {
        setup_status: 'completed',
        environment_ready: true,
        no_issues: true
      },
      'contrib-5': {
        branch_created: 'fix/readme-typo-089',
        branch_status: 'clean',
        ready_for_work: true
      },
      'contrib-6': {
        implementation_status: 'completed',
        changes_made: 1,
        files_modified: ['README.md'],
        testing_complete: true
      },
      'contrib-7': {
        pr_created: 'PR #234',
        pr_status: 'pending_review',
        automated_checks: 'passed',
        ready_for_merge: true
      }
    },
    humanResponses: {
      'contrib-2': {
        action: 'approve',
        modifications: null,
        reason: 'Perfect first issue for this contributor'
      },
      'contrib-7': {
        action: 'approve',
        modifications: null,
        reason: 'Clean implementation, ready to merge'
      }
    },
    expectedOutcome: {
      success: true,
      completionTime: 6000,
      humanInteractions: 2,
      errors: []
    }
  }
];

export const getScenarioById = (id: string): DemoScenario | undefined => {
  return demoScenarios.find(scenario => scenario.id === id);
};

export const getScenariosByAgentType = (agentType: 'welcome' | 'contribution' | 'triage'): DemoScenario[] => {
  return demoScenarios.filter(scenario => scenario.agentType === agentType);
};

export const runAutoPilotScenario = (scenario: DemoScenario, onStepComplete?: (stepId: string) => void) => {
  const stepIds = Object.keys(scenario.humanResponses);
  
  stepIds.forEach((stepId, index) => {
    const response = scenario.humanResponses[stepId];
    const delay = (index + 1) * scenario.timing.approvalDelay;
    
    setTimeout(() => {
      if (onStepComplete) {
        onStepComplete(stepId);
      }
    }, delay);
  });
};

export const calculateScenarioMetrics = (scenario: DemoScenario) => {
  return {
    totalSteps: Object.keys(scenario.humanResponses).length,
    humanInteractions: Object.keys(scenario.humanResponses).length,
    estimatedDuration: scenario.timing.totalDuration,
    complexity: scenario.timing.totalDuration > 15000 ? 'high' : 
                scenario.timing.totalDuration > 10000 ? 'medium' : 'low',
    autoPilotReady: scenario.autoPilot,
    expectedSuccess: scenario.expectedOutcome.success
  };
};
