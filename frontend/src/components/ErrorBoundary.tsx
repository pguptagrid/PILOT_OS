import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[PILOT ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || "Component Error";
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: 1,
          height: "100%",
          padding: "2rem",
          background: "#F7F6F3", // Warm beige
          color: "#1A1A1A", // Charcoal
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
        }}>
          <div style={{
            maxWidth: "480px",
            padding: "2.5rem",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1.5px solid #E5E2DA",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          }}>
            {/* Warning Icon */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#FFF4D4", // Soft amber tint
              color: "#F5A700", // Amber
              fontSize: "1.75rem",
              marginBottom: "1.5rem",
            }}>
              ⚠
            </div>
            
            <h2 style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#1A1A1A",
              margin: "0 0 0.75rem 0",
            }}>
              {title}
            </h2>
            
            <p style={{
              fontSize: "0.9rem",
              color: "#666",
              lineHeight: "1.5",
              margin: "0 0 1.5rem 0",
            }}>
              A localized error occurred while rendering this view. You can attempt to reload this panel, or navigate to another feature using the sidebar.
            </p>

            {this.state.error && (
              <pre style={{
                fontSize: "0.75rem",
                background: "#F5F3ED",
                padding: "0.75rem",
                borderRadius: "8px",
                overflowX: "auto",
                textAlign: "left",
                color: "#D32F2F",
                border: "1px solid #E5E2DA",
                margin: "0 0 1.5rem 0",
                maxHeight: "150px",
              }}>
                {this.state.error.toString()}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              style={{
                padding: "0.65rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                background: "#F5A700", // Amber accent
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(245, 167, 0, 0.2)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#D99300")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F5A700")}
            >
              Reset Component
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
