import { NextResponse } from 'next/server';
import { getAllMilestones, getRepoStars, getContributorGrowth, getAdoptionMetrics, getDetailedContributorAnalytics, getDeveloperExperienceMetrics, getStarsGrowth, getForksGrowth, getDownloadsGrowth } from '../../lib/github';

export async function GET() {
  console.log("=== API ROUTE START ===");
  try {
    console.log('🚀 Starting GitHub data fetch...');
    
    // Fetch all data in parallel
    const [
      milestones,
      stars,
      contributorGrowth,
      adoptionMetrics,
      contributorAnalytics,
      devExperience,
      starsGrowth,
      forksGrowth,
      downloadsGrowth
    ] = await Promise.allSettled([
      getAllMilestones(),
      getRepoStars('dir'),
      getContributorGrowth('dir'),
      getAdoptionMetrics('dir'),
      getDetailedContributorAnalytics('dir'),
      getDeveloperExperienceMetrics('dir'),
      getStarsGrowth('agntcy', 'dir'),
      getForksGrowth('agntcy', 'dir'),
      getDownloadsGrowth('agntcy', 'dir')
    ]);

    return NextResponse.json({
      milestones: milestones.status === 'fulfilled' ? milestones.value : [],
      stars: stars.status === 'fulfilled' ? stars.value : { stars: 0, forks: 0, contributors: 0 },
      contributorGrowth: contributorGrowth.status === 'fulfilled' ? contributorGrowth.value : [],
      adoption: adoptionMetrics.status === 'fulfilled' ? adoptionMetrics.value : {},
      contributorAnalytics: contributorAnalytics.status === 'fulfilled' ? contributorAnalytics.value : {},
      devExperience: devExperience.status === 'fulfilled' ? devExperience.value : {},
      starsGrowth: starsGrowth.status === 'fulfilled' ? starsGrowth.value : [],
      forksGrowth: forksGrowth.status === 'fulfilled' ? forksGrowth.value : [],
      downloadsGrowth: downloadsGrowth.status === 'fulfilled' ? downloadsGrowth.value : []
    });

    console.log('✅ GitHub data fetch completed');
  } catch (error) {
    console.error('❌ Error fetching GitHub data:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub data' }, { status: 500 });
  }
}
