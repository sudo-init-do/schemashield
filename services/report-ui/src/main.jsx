import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Use proxy endpoint or fallback to direct API
const API_BASE = "/api";

// Utility functions
const getMethodClass = (method) => `method-${method.toLowerCase()}`;

const getResponseClass = (status) => {
  const statusNum = parseInt(status);
  if (statusNum >= 200 && statusNum < 300) return 'response-2xx';
  if (statusNum >= 300 && statusNum < 400) return 'response-3xx';
  if (statusNum >= 400 && statusNum < 500) return 'response-4xx';
  if (statusNum >= 500) return 'response-5xx';
  return 'response-default';
};

const SearchIcon = () => (
  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
  </svg>
);

const RefreshIcon = ({ spinning = false }) => (
  <svg className={`w-4 h-4 ${spinning ? 'loading-spinner' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>
);

const BarChartIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>
);

const EmptyStateIcon = () => (
  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin mx-auto h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Components
const MethodBadge = ({ method }) => (
  <span className={`method-badge ${getMethodClass(method)}`}>
    {method}
  </span>
);

const ResponseBadges = ({ responses }) => {
  if (!responses || responses.length === 0) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {responses.map((status, index) => (
        <span key={index} className={`response-badge ${getResponseClass(status)}`}>
          {status}
        </span>
      ))}
    </div>
  );
};

const EndpointCard = ({ endpoint }) => (
  <div className="p-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-200 last:border-b-0">
    <div className="flex items-start justify-between mb-3">
      <MethodBadge method={endpoint.method} />
      <ResponseBadges responses={endpoint.responses} />
    </div>
    <div className="mt-2">
      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-900 break-all block font-mono">
        {endpoint.path}
      </code>
    </div>
  </div>
);

const EndpointRow = ({ endpoint }) => (
  <tr className="hover:bg-gray-50 transition-colors duration-150">
    <td className="px-6 py-4 whitespace-nowrap">
      <MethodBadge method={endpoint.method} />
    </td>
    <td className="px-6 py-4">
      <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-900 break-all font-mono">
        {endpoint.path}
      </code>
    </td>
    <td className="px-6 py-4">
      <ResponseBadges responses={endpoint.responses} />
    </td>
  </tr>
);

const StatsCard = ({ count, isLoading }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Total Endpoints
        </h3>
        <p className={`text-3xl font-bold text-gray-900 mt-1 transition-all duration-300 ${
          isLoading ? 'animate-pulse' : 'bounce-in'
        }`}>
          {count}
        </p>
      </div>
      <div className="bg-blue-50 p-3 rounded-full">
        <BarChartIcon />
      </div>
    </div>
  </div>
);

const SearchInput = ({ value, onChange, onFocus }) => (
  <div className="flex-1 min-w-0">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon />
      </div>
      <input
        id="search-input"
        type="text"
        placeholder="Search endpoints by path or method..."
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      />
    </div>
  </div>
);

const RefreshButton = ({ onClick, isLoading }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ${
      isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md transform hover:-translate-y-0.5'
    }`}
  >
    <RefreshIcon spinning={isLoading} />
    <span className="ml-2">
      {isLoading ? 'Loading...' : 'Refresh'}
    </span>
  </button>
);

const EmptyState = ({ hasSearchTerm, onClearSearch }) => (
  <div className="text-center py-12">
    <EmptyStateIcon />
    <h3 className="mt-2 text-sm font-medium text-gray-900">
      {hasSearchTerm ? 'No matching endpoints' : 'No endpoints found'}
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      {hasSearchTerm 
        ? 'Try adjusting your search terms.' 
        : 'No captures yet. Hit the proxy and click Refresh.'
      }
    </p>
    {hasSearchTerm && (
      <button
        onClick={onClearSearch}
        className="mt-3 text-sm text-blue-600 hover:text-blue-500 underline"
      >
        Clear search
      </button>
    )}
  </div>
);

const LoadingState = () => (
  <div className="text-center py-12">
    <LoadingSpinner />
    <p className="mt-2 text-sm text-gray-500">Loading endpoints...</p>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="text-center py-12">
    <div className="mx-auto h-12 w-12 text-red-400 mb-4">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
      </svg>
    </div>
    <h3 className="text-sm font-medium text-gray-900">Failed to load endpoints</h3>
    <p className="mt-1 text-sm text-gray-500 mb-4">
      Please check your connection and try again.
    </p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
      Try Again
    </button>
  </div>
);

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [summary, setSummary] = useState(null);
  const [paths, setPaths] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(false);
    
    try {
      const res = await fetch(`${API_BASE}/report`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      setSummary(data.summary);
      setPaths(data.openapi?.paths || {});
    } catch (e) {
      console.error('Failed to load report:', e);
      setError(true);
      setSummary(null);
      setPaths({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Transform paths into endpoints array
  const allEndpoints = useMemo(() => {
    const endpoints = Object.entries(paths).flatMap(([path, methods]) =>
      Object.entries(methods).map(([method, def]) => ({
        path,
        method: method.toUpperCase(),
        responses: Object.keys(def.responses || {}).sort(),
      }))
    );

    // Sort endpoints by path, then by method
    return endpoints.sort((a, b) => {
      if (a.path !== b.path) return a.path.localeCompare(b.path);
      return a.method.localeCompare(b.method);
    });
  }, [paths]);

  // Filter endpoints based on search term
  const filteredEndpoints = useMemo(() => {
    if (!searchTerm.trim()) return allEndpoints;
    
    const term = searchTerm.toLowerCase();
    return allEndpoints.filter(endpoint => 
      endpoint.method.toLowerCase().includes(term) ||
      endpoint.path.toLowerCase().includes(term)
    );
  }, [allEndpoints, searchTerm]);

  // Auto-refresh functionality
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    const startAutoRefresh = () => {
      const interval = setInterval(fetchReport, 30000); // 30 seconds
      setAutoRefreshInterval(interval);
    };

    const stopAutoRefresh = () => {
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        setAutoRefreshInterval(null);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh();
      } else {
        startAutoRefresh();
      }
    };

    // Start auto-refresh
    startAutoRefresh();

    // Handle page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopAutoRefresh();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchReport, autoRefreshInterval]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + R to refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchReport();
      }
      
      // Ctrl/Cmd + F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fetchReport]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    // Stop auto-refresh when user is actively searching
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      setAutoRefreshInterval(null);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const displayCount = searchTerm.trim() ? filteredEndpoints.length : summary?.endpoints || allEndpoints.length;
  const hasSearchTerm = searchTerm.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            SchemaShield — Report
          </h1>
          <p className="text-gray-600 text-lg">
            API endpoints discovered from captured traffic
          </p>
        </div>

        {/* Stats Card */}
        <StatsCard count={displayCount} isLoading={loading} />

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            <RefreshButton onClick={fetchReport} isLoading={loading} />
          </div>
          
          {/* Keyboard shortcuts hint */}
          <div className="mt-3 text-xs text-gray-500">
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl/⌘ + F</kbd> to search, 
            <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs ml-1">Ctrl/⌘ + R</kbd> to refresh
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading && !error && <LoadingState />}
          
          {error && !loading && (
            <ErrorState onRetry={fetchReport} />
          )}
          
          {!loading && !error && filteredEndpoints.length === 0 && (
            <EmptyState hasSearchTerm={hasSearchTerm} onClearSearch={clearSearch} />
          )}
          
          {!loading && !error && filteredEndpoints.length > 0 && (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Path
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responses
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEndpoints.map((endpoint, index) => (
                      <EndpointRow key={`${endpoint.method}-${endpoint.path}-${index}`} endpoint={endpoint} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {filteredEndpoints.map((endpoint, index) => (
                  <EndpointCard key={`${endpoint.method}-${endpoint.path}-${index}`} endpoint={endpoint} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            API via <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">/api/</code> endpoint
            {autoRefreshInterval && (
              <span className="ml-2 text-green-600">• Auto-refreshing every 30s</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
