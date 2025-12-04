import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

export async function GET() {
  try {
    console.log('=== TOKEN TEST DEBUG ===');
    console.log('All environment variables:', Object.keys(process.env));
    console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? 'EXISTS' : 'MISSING');
    console.log('NEXT_PUBLIC_GITHUB_TOKEN:', process.env.NEXT_PUBLIC_GITHUB_TOKEN ? 'EXISTS' : 'MISSING');
    
    const token = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
    
    if (!token) {
      return NextResponse.json({ 
        error: 'No token found',
        envVars: {
          GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
          NEXT_PUBLIC_GITHUB_TOKEN: !!process.env.NEXT_PUBLIC_GITHUB_TOKEN
        }
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
