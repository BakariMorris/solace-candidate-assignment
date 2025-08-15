"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ 
          margin: "24px", 
          textAlign: "center", 
          padding: "2rem",
          border: "1px solid #dc2626",
          borderRadius: "8px",
          backgroundColor: "#fef2f2"
        }}>
          <h2 style={{ color: "#dc2626", marginBottom: "1rem" }}>Application Error</h2>
          <p style={{ marginBottom: "1rem", color: "#7f1d1d" }}>
            A critical error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={reset}
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
      </body>
    </html>
  );
}