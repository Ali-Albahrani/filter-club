// ErrorBoundary.js - Error boundary component for catching React rendering errors

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-brand-white p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-red mb-4">Something went wrong</h2>
            <p className="text-brand-blue mb-4">An error occurred while loading this section.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-red text-brand-white rounded-lg hover:bg-brand-red-secondary transition-colors font-medium"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="text-left text-red-600 mt-4">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 p-2 bg-red-100 rounded">
                  {this.state.error && this.state.error.toString()}
                </pre>
                <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;