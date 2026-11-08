import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PoliciesErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PoliciesErrorBoundary] Uncaught exception in Policies module:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      // Clear policies-specific storage namespace only
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('devrian.policies.v1.')) {
          localStorage.removeItem(key);
        }
      });
      window.location.reload();
    } catch (e) {
      console.error('Failed to reset storage:', e);
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] flex items-center justify-center p-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center mx-auto text-red-400">
              <AlertOctagon size={24} />
            </div>

            <div>
              <h2 className="text-base font-bold text-white">
                Terms &amp; Policies Module Encountered an Error
              </h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                The Terms &amp; Policies module encountered an unexpected issue. The main Invoice &amp; Payment Receipt features remain completely operational and unaffected.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-neutral-950 rounded-lg text-left text-[11px] font-mono text-red-300 overflow-x-auto max-h-32 border border-neutral-800">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition"
              >
                Try Reloading Module
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-neutral-950 text-xs font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                Reset Policies Storage
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

