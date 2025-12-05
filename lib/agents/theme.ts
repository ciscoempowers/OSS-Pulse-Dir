// Color scheme for agent POC
export const AGENT_COLORS = {
  // Agent-specific colors
  welcome: {
    primary: '#3B82F6',
    light: '#DBEAFE',
    dark: '#1E40AF',
    text: '#1E40AF',
    bg: '#EFF6FF',
    border: '#BFDBFE'
  },
  contribution: {
    primary: '#10B981',
    light: '#D1FAE5',
    dark: '#047857',
    text: '#047857',
    bg: '#ECFDF5',
    border: '#A7F3D0'
  },
  triage: {
    primary: '#8B5CF6',
    light: '#EDE9FE',
    dark: '#6D28D9',
    text: '#6D28D9',
    bg: '#F5F3FF',
    border: '#DDD6FE'
  },
  
  // Status colors
  automated: {
    primary: '#3B82F6',
    light: '#DBEAFE',
    dark: '#1E40AF',
    text: '#1E40AF',
    bg: '#EFF6FF',
    border: '#BFDBFE'
  },
  human: {
    primary: '#F97316',
    light: '#FED7AA',
    dark: '#C2410C',
    text: '#C2410C',
    bg: '#FFF7ED',
    border: '#FDBA74'
  },
  completed: {
    primary: '#10B981',
    light: '#D1FAE5',
    dark: '#047857',
    text: '#047857',
    bg: '#ECFDF5',
    border: '#A7F3D0'
  },
  error: {
    primary: '#EF4444',
    light: '#FEE2E2',
    dark: '#B91C1C',
    text: '#B91C1C',
    bg: '#FEF2F2',
    border: '#FCA5A5'
  },
  pending: {
    primary: '#6B7280',
    light: '#F3F4F6',
    dark: '#374151',
    text: '#374151',
    bg: '#F9FAFB',
    border: '#D1D5DB'
  }
};

// Animation classes
export const ANIMATIONS = {
  // Button hover effects
  buttonHover: 'transition-all duration-200 transform hover:scale-105 hover:shadow-lg',
  buttonHoverScale: 'transition-all duration-200 hover:scale-105',
  buttonHoverShadow: 'transition-all duration-200 hover:shadow-md',
  
  // Progress animations
  progressSmooth: 'transition-all duration-500 ease-out',
  progressBounce: 'transition-all duration-1000 ease-bounce',
  
  // Step completion animations
  stepComplete: 'animate-pulse-once bg-green-50 border-green-200',
  stepStart: 'animate-slide-in bg-blue-50 border-blue-200',
  
  // Loading states
  skeleton: 'animate-pulse bg-gray-200',
  loading: 'animate-spin',
  
  // Toast animations
  toastSlideIn: 'animate-slide-in-right',
  toastFadeOut: 'animate-fade-out'
};

// Utility functions
export const getAgentColors = (agentType: 'welcome' | 'contribution' | 'triage') => {
  return AGENT_COLORS[agentType];
};

export const getStatusColors = (status: 'automated' | 'human' | 'completed' | 'error' | 'pending') => {
  return AGENT_COLORS[status];
};

export const getStepAnimation = (status: string) => {
  switch (status) {
    case 'completed': return ANIMATIONS.stepComplete;
    case 'running': return ANIMATIONS.stepStart;
    default: return '';
  }
};
