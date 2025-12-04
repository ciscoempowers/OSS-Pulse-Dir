'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkEnv = () => {
      setDebugInfo({
        hasToken: !!process.env.NEXT_PUBLIC_GITHUB_TOKEN,
        hasPrivateToken: !!process.env.GITHUB_TOKEN,
        nodeEnv: process.env.NODE_ENV,
        tokenLength: process.env.NEXT_PUBLIC_GITHUB_TOKEN?.length || 0
      });
    };

    checkEnv();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
