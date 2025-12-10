import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-blue-100 rounded-full mb-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Loading Dashboard...
        </h2>
        
        <p className="text-gray-600">
          Please wait while we prepare your workspace.
        </p>
      </div>
    </div>
  );
}
