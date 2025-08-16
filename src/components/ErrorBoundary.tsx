"use client";

import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ReactNode } from "react";
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { errorMonitor } from '../lib/error-monitor';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-h3">Something went wrong</CardTitle>
          <p className="text-body text-muted-foreground">
            We're sorry, but something unexpected happened. The error has been logged and our team will investigate.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-muted rounded-md">
              <h4 className="font-medium text-sm mb-2">Error Details (Development):</h4>
              <pre className="text-xs text-muted-foreground overflow-auto">
                {error.message}
                {error.stack && "\n\nStack trace:\n" + error.stack}
              </pre>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={resetErrorBoundary}
              className="flex-1 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={handleGoHome}
              className="flex-1 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </div>
          
          <p className="text-caption text-muted-foreground text-center">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export default function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Error caught by boundary:", error, errorInfo);
        // Log to error monitor with React-specific context
        errorMonitor.logReactError(error, errorInfo, errorInfo.componentStack || undefined);
      }}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    errorMonitor.logReactError(error, errorInfo);
  };
}