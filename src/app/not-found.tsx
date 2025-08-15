export default function NotFound() {
  return (
    <div style={{ 
      margin: "24px", 
      textAlign: "center", 
      padding: "2rem",
      border: "1px solid #f59e0b",
      borderRadius: "8px",
      backgroundColor: "#fffbeb"
    }}>
      <h2 style={{ color: "#d97706", marginBottom: "1rem" }}>404 - Page Not Found</h2>
      <p style={{ marginBottom: "1rem", color: "#92400e" }}>
        The page you're looking for doesn't exist.
      </p>
      <a 
        href="/"
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#d97706",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px",
          display: "inline-block"
        }}
      >
        Go back home
      </a>
    </div>
  );
}