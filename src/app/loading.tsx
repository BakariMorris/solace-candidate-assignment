export default function Loading() {
  return (
    <div style={{ 
      margin: "24px", 
      textAlign: "center", 
      padding: "2rem"
    }}>
      <div 
        style={{ 
          display: "inline-block",
          width: "40px", 
          height: "40px", 
          border: "4px solid #f3f4f6",
          borderTop: "4px solid #3b82f6",
          borderRadius: "50%",
          marginBottom: "1rem"
        }}
        className="animate-spin"
      ></div>
      <p style={{ color: "#6b7280" }}>Loading...</p>
    </div>
  );
}