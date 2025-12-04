'use client';

import { useState, useEffect } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

export default function DashboardNavigation() {
  const [activeSection, setActiveSection] = useState('overview');

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
    { id: 'milestones', label: 'Milestones', icon: '🎯' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'engagement', label: 'Engagement', icon: '💬' },
    { id: 'meetings', label: 'Meetings', icon: '📝' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'agents', label: 'AI Agents', icon: '🤖' },
    { id: 'intelligence', label: 'Intelligence', icon: '🧠' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      }));

      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        if (section.element) {
          const { offsetTop, offsetHeight } = section.element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-blue-100 text-blue-700 border-l-2 border-blue-500'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={item.label}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden xl:block">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
