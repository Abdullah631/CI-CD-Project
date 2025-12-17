import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--bg)" }}
        >
          <div className="clay-card max-w-2xl w-full p-8 text-center">
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: "var(--cinnamon)" }}
            >
              Oops! Something went wrong
            </h1>
            <p
              className="text-lg mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              We encountered an unexpected error. Don't worry, your data is
              safe.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary px-6 py-3 rounded-xl font-semibold"
              >
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="btn-ghost px-6 py-3 rounded-xl font-semibold"
              >
                Go Home
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-8 text-left">
                <summary
                  className="cursor-pointer font-semibold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  Error Details (Development Mode)
                </summary>
                <pre
                  className="p-4 rounded-lg overflow-auto text-xs"
                  style={{
                    background: "var(--surface-1)",
                    color: "var(--text-primary)",
                  }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
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
