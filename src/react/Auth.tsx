import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface Props {
  children: ReactNode;
}

export default function Auth({ children }: Props) {
  const [inputSecret, setInputSecret] = useState<string>('');
  const [querySecret, setQuerySecret] = useState<string>('');
  const [isChecking, setIsChecking] = useState(true);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Only run the query if we have a secret to check
  const isAdmin = useQuery(
    api.auth.isAdmin,
    querySecret ? { secret: querySecret } : 'skip'
  );

  // Initial cookie check
  useEffect(() => {
    console.log('Checking cookies...');
    const cookies = document.cookie.split(';');
    const adminSecretCookie = cookies.find(cookie => cookie.trim().startsWith('admin_secret='));
    if (adminSecretCookie) {
      const storedSecret = adminSecretCookie.split('=')[1];
      console.log('Found stored secret in cookies');
      setInputSecret(storedSecret);
      setQuerySecret(storedSecret);
    } else {
      console.log('No stored secret found in cookies');
      setIsChecking(false);
    }
  }, []);

  // Handle authentication result
  useEffect(() => {
    if (isAdmin === undefined) return; // Still loading

    if (isAdmin === true) {
      console.log('Admin authenticated, setting cookie');
      document.cookie = `admin_secret=${querySecret}; path=/; max-age=2592000`; // 30 days
      setIsChecking(false);
      setQuerySecret(''); // Clear query secret to prevent repeated calls
      setIsAuthenticated(true);
    } else if (isAdmin === false) {
      console.log('Admin authentication failed');
      setIsChecking(false);
      setHasAttemptedLogin(true);
      setQuerySecret(''); // Clear query secret after failed attempt
      setIsAuthenticated(false);
    }
  }, [isAdmin, querySecret]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted');
    setQuerySecret(inputSecret);
    setHasAttemptedLogin(false);
  };

  // Show loading spinner only when we're checking cookies or when we have a pending query
  const isLoading = isChecking || (querySecret !== '' && isAdmin === undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Access
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please enter the admin secret to continue
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="secret" className="sr-only">
                  Admin Secret
                </label>
                <input
                  id="secret"
                  name="secret"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Admin Secret"
                  value={inputSecret}
                  onChange={(e) => setInputSecret(e.target.value)}
                />
              </div>
            </div>

            {hasAttemptedLogin && (
              <div className="text-red-500 text-sm text-center">
                Invalid admin secret
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 