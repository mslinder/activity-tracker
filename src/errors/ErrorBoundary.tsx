import React, { Component, ReactNode } from 'react';
import { AppError, ErrorCode } from './AppError';
import { getErrorMessage } from './errorMessages';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isAppError = this.state.error instanceof AppError;
      const errorMessage = isAppError 
        ? getErrorMessage((this.state.error as AppError).code)
        : 'An unexpected error occurred. Please try again.';

      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          backgroundColor: '#fef2f2',
          margin: '20px'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#991b1b', marginBottom: '20px' }}>
            {errorMessage}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Try Again
          </button>
          {!isAppError && (
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#666' }}>
                Technical Details
              </summary>
              <pre style={{
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '10px'
              }}>
                {this.state.error?.message}
                {'\n'}
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}