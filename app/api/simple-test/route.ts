import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Simple test API called successfully');
  return NextResponse.json({ 
    message: 'API is working',
    timestamp: new Date().toISOString(),
    envVars: {
      GITHUB_TOKEN: !!process.env.GITHUB_TOKEN,
      NEXT_PUBLIC_GITHUB_TOKEN: !!process.env.NEXT_PUBLIC_GITHUB_TOKEN
    }
  });
}
