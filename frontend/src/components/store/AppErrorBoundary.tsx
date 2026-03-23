import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Application error boundary caught an error", error, info);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background px-6 py-16 flex items-center justify-center">
        <div className="w-full max-w-xl bg-card border border-border rounded-sm p-8 text-center shadow-sm">
          <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
            Nevk Cosmetics
          </p>
          <h1 className="text-3xl md:text-4xl mb-3 heading-display">
            Something went wrong
          </h1>
          <p className="text-body text-muted-foreground mb-6">
            We hit an unexpected issue while loading this page. Please refresh
            and try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="btn-rose"
          >
            Reload Website
          </button>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
