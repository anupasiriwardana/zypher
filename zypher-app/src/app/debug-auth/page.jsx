"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const { data: session, status } = useSession();
  const [apiTest, setApiTest] = useState(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        const response = await fetch('/api/custom-rule-file', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = await response.json();
        setApiTest({
          status: response.status,
          statusText: response.statusText,
          data: result
        });
      } catch (error) {
        setApiTest({
          error: error.message
        });
      }
    };

    if (status === 'authenticated') {
      testApi();
    }
  }, [status]);

  if (status === 'loading') {
    return <div className="p-8">Loading session...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Info</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Session Status</h2>
          <p><strong>Status:</strong> {status}</p>
        </div>

        {session && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Session Data</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        )}

        {apiTest && (
          <div className="bg-gray-100 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">API Test Result</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">What to Check</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Is the user role exactly "rule-maintainer"?</li>
            <li>Is the session valid and not expired?</li>
            <li>Are there any typos in the role name?</li>
            <li>Is the JWT token being generated correctly?</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
