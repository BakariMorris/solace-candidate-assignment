"use client";

import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ReactNode } from "react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div style={{ 
      margin: "24px", 
      textAlign: "center", 
      padding: "2rem", 
      backgroundColor: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: "8px"
    }}>
      <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>Something went wrong</h2>
      <details style={{ marginBottom: "1rem", textAlign: "left" }}>
        <summary style={{ cursor: "pointer", marginBottom: "0.5rem" }}>
          Error details (click to expand)
        </summary>
        <pre style={{ 
          backgroundColor: "#f5f5f5", 
          padding: "1rem", 
          borderRadius: "4px",
          fontSize: "0.8rem",
          overflow: "auto"
        }}>
          {error.message}
          {error.stack && "\n\nStack trace:\n" + error.stack}
        </pre>
      </details>
      <button 
        onClick={resetErrorBoundary}
        style={{ 
          padding: "0.5rem 1rem", 
          backgroundColor: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Try again
      </button>
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
      }}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}