import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const ErrorPage = () => {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('message') || 'An error occurred';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-surface-800 rounded-lg shadow-lg text-center border border-surface-700">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h1>
        <p className="text-slate-300 mb-6">{errorMessage}</p>
        <Link to="/login" className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;