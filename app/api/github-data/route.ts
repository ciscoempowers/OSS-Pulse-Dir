import { NextResponse } from 'next/server';
import { getAllMilestones, getDiscussions, getRepoStars, getContributorGrowth, getDetailedContributorAnalytics, getGitHubDependents, getAdoptionMetrics, getDeveloperExperienceMetrics } from '@/app/lib/github';

export async function GET() {
  try {
    console.log('=== SERVER-SIDE GITHUB API DEBUG ===');
    console.log('Environment variables available:');
    console.log('- GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);
    console.log('- NEXT_PUBLIC_GITHUB_TOKEN exists:', !!process.env.NEXT_PUBLIC_GITHUB_TOKEN);
    console.log('- All env vars starting with GITHUB:', Object.keys(process.env).filter(k => k.startsWith('GITHUB')));
    
    // Force reload the github module to ensure fresh environment variables
    delete require.cache[require.resolve('@/app/lib/github')];
    
    console.log('Fetching GitHub data on server side...');
    
    const results = await Promise.allSettled([
      getAllMilestones('agntcy', 'dir'),
      getDiscussions('agntcy', 'dir'),
      getRepoStars('agntcy', 'dir'),
      getContributorGrowth('agntcy', 'dir'),
      getDetailedContributorAnalytics('agntcy', 'dir'),
      getGitHubDependents('agntcy', 'dir'),
      getAdoptionMetrics('agntcy', 'dir'),
      getDeveloperExperienceMetrics('agntcy', 'dir'),
    ]);

    const data = {
      milestones: results[0].status === 'fulfilled' ? results[0].value : null,
      discussions: results[1].status === 'fulfilled' ? results[1].value : null,
      stars: results[2].status === 'fulfilled' ? results[2].value : null,
      contributorGrowth: results[3].status === 'fulfilled' ? results[3].value : null,
      contributorAnalytics: results[4].status === 'fulfilled' ? results[4].value : null,
      dependents: results[5].status === 'fulfilled' ? results[5].value : null,
      adoption: results[6].status === 'fulfilled' ? results[6].value : null,
      devExperience: results[7].status === 'fulfilled' ? results[7].value : null,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
  }
}
