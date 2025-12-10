'use client';

import Link from 'next/link';
import { FileX, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
          <FileX className="w-6 h-6 text-blue-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
          Page not found
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Sorry, we couldn't find the page you're looking for. The page might have been removed or doesn't exist.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Go home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}
