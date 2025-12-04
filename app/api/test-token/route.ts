import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    
    if (!token) {
      return NextResponse.json({ 
        error: 'No GitHub token found in environment variables'
      }, { status: 500 });
    }
    
    const octokit = new Octokit({ auth: token });
    
    // Test a simple API call
    const { data } = await octokit.repos.get({
      owner: 'agntcy',
      repo: 'dir'
    });
    
    return NextResponse.json({
      success: true,
      repo: {
        name: data.name,
        stars: data.stargazers_count,
        forks: data.forks_count
      },
      tokenLength: token.length
    });
    
  } catch (error: any) {
    console.error('Token test error:', error);
    return NextResponse.json({
      error: error.message,
      status: error.status,
      tokenExists: !!process.env.GITHUB_TOKEN
    }, { status: 500 });
  }
}
