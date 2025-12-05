'use client';

import { useState } from 'react';
import { Card } from '@tremor/react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
}

interface Prompt {
  id: string;
  category: string;
  text: string;
  icon: string;
}

export default function AIStrategicPartner() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '👋 Hi! I\'m your AI Strategic Partner. I can help analyze your dashboard metrics and create improvement strategies. What would you like to explore?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const cannedPrompts: Prompt[] = [
    {
      id: '1',
      category: 'trend-analysis',
      text: 'Analyze trends in our community metrics',
      icon: '📈'
    },
    {
      id: '2',
      category: 'risks',
      text: 'Identify potential risks in our metrics',
      icon: '⚠️'
    },
    {
      id: '3',
      category: 'community-tactics',
      text: 'Suggest tactics to improve stars and downloads',
      icon: '🚀'
    },
    {
      id: '4',
      category: 'recommendations',
      text: 'Give context-aware recommendations',
      icon: '💡'
    },
    {
      id: '5',
      category: 'prioritization',
      text: 'Prioritize improvements by impact vs effort',
      icon: '🎯'
    },
    {
      id: '6',
      category: 'action-plan',
      text: 'Create an action plan for metric improvements',
      icon: '📋'
    }
  ];

  const aiResponses: Record<string, string> = {
    'trend-analysis': `📊 **Trend Analysis Summary:**

**Stars Growth:** +12% over last 3 months, but slowing in recent weeks
**Downloads:** Steady 8% monthly growth with strong retention
**Contributors:** Excellent 35% growth with good new contributor retention

**Key Insights:**
- Star acquisition is plateauing - need fresh outreach strategies
- Download trends show healthy organic adoption
- Contributor onboarding is working well

**Recommendations:**
- Focus on developer experience to reignite star growth
- Leverage existing contributors for community advocacy`,
    
    'risks': `⚠️ **Risk Assessment:**

**High Risks:**
- Declining issue resolution time (up 25% last month)
- Test coverage below 70% threshold
- API stability score dropping

**Medium Risks:**
- New contributor retention rate at 45% (target: 60%)
- Security posture score needs improvement

**Mitigation Strategies:**
- Implement automated issue triaging
- Set up code coverage gates
- Create API versioning strategy`,
    
    'community-tactics': `🚀 **Community Growth Tactics:**

**Stars Improvement:**
1. **Technical Blog Series** - Share architecture decisions and performance optimizations
2. **Conference Presentations** - Target 3-4 developer conferences next quarter
3. **GitHub Sponsors Program** - Recognize top contributors
4. **Integration Showcase** - Highlight popular use cases

**Downloads Boost:**
1. **Documentation Overhaul** - Interactive tutorials and quick-start guides
2. **Template Gallery** - Pre-built project templates
3. **Community Challenges** - Monthly build contests
4. **Partner Ecosystem** - Integrate with popular tools

**Expected Impact:** 25-40% increase in both metrics within 3 months`,
    
    'recommendations': `💡 **Context-Aware Recommendations:**

**Based on Current Metrics:**
- **Test Coverage (68%)**: Add integration tests for critical paths
- **Contributor Growth (35%)**: Expand contributor onboarding docs
- **Issue Resolution (48h avg)**: Implement SLA and automated triage

**Immediate Actions (Week 1-2):**
1. Set up GitHub Actions for automated testing
2. Create contributor welcome templates
3. Implement issue label automation

**Short-term (Month 1):**
1. Launch documentation improvement sprint
2. Establish community recognition program
3. Optimize CI/CD pipeline performance`,
    
    'prioritization': `🎯 **Impact vs Effort Matrix:**

**HIGH IMPACT / LOW EFFORT (Quick Wins):**
- Add GitHub issue templates (2 days, 30% faster triage)
- Improve README documentation (1 day, 15% more stars)
- Set up automated code coverage reporting (1 day, better visibility)

**HIGH IMPACT / HIGH EFFORT (Major Projects):**
- Comprehensive test suite (2 weeks, 20% quality improvement)
- API documentation overhaul (3 weeks, 25% better adoption)
- Community mentorship program (1 month, 40% better retention)

**MEDIUM IMPACT / LOW EFFORT:**
- Social media content calendar (1 day/week, steady growth)
- Contributor spotlight blog (2 hours/post, community engagement)

**Recommended Focus:** Start with Quick Wins, then tackle Major Projects in parallel`,
    
    'action-plan': `📋 **30-Day Action Plan:**

**Week 1: Foundation**
- [ ] Set up automated testing pipeline
- [ ] Create issue/PR templates
- [ ] Launch contributor onboarding guide
- **Target:** 90% test coverage automation

**Week 2: Documentation**
- [ ] Rewrite README with clear value proposition
- [ ] Create quick-start tutorial
- [ ] Add API examples and use cases
- **Target:** 20% reduction in setup questions

**Week 3: Community**
- [ ] Launch weekly contributor spotlight
- [ ] Set up Discord/Slack community
- [ ] Start technical blog series
- **Target:** 15 new active contributors

**Week 4: Optimization**
- [ ] Implement performance monitoring
- [ ] Create integration templates
- [ ] Establish release cadence
- **Target:** 25% improvement in all metrics

**Success Metrics:** Track daily/weekly progress in dashboard`
  };

  const handlePromptClick = (prompt: Prompt) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: prompt.text,
      timestamp: new Date().toLocaleTimeString()
    };

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: aiResponses[prompt.category] || 'I\'m analyzing your request and preparing personalized recommendations...',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString()
    };

    const aiMessage: Message = {
      id: crypto.randomUUID(),
      type: 'ai',
      content: `🤖 **Analyzing your request:** "${inputValue}"

I'm examining your dashboard metrics and preparing personalized recommendations. Based on your current data, I can provide insights on:
- Performance trends and patterns
- Improvement opportunities
- Risk factors and mitigation strategies
- Actionable next steps

What specific aspect would you like me to focus on?`,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInputValue('');
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
          </svg>
          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Strategic Partner
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96">
      <Card className="bg-white border-0 shadow-2xl">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-black">AI Strategic Partner</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Connected to GitHub</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm whitespace-pre-line">{message.content}</div>
                <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-2">Quick Actions:</div>
            <div className="grid grid-cols-2 gap-2">
              {cannedPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt)}
                  className="text-left p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{prompt.icon}</span>
                    <span className="text-xs text-gray-700 group-hover:text-gray-900">{prompt.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about your metrics..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
