import React, { Component, ReactNode } from 'react'

type ErrorBoundaryProps = {
  children: ReactNode
}

type ErrorBoundaryState = {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App render error caught by ErrorBoundary', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
          <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-xl items-center justify-center">
            <div className="w-full rounded-[28px] border border-amber-300/20 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/25 bg-amber-200/10 text-2xl text-amber-200">
                *
              </div>
              <p className="mb-3 text-xs uppercase tracking-[0.32em] text-amber-200/70">
                Sacred Pause
              </p>
              <h1 className="mb-3 text-3xl font-semibold text-white">
                Something interrupted this session
              </h1>
              <p className="mb-8 text-sm leading-6 text-slate-300">
                The screen hit an unexpected error while loading. Refresh and continue,
                or return after a moment if the issue persists.
              </p>
              <button
                className="inline-flex items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
                onClick={this.handleReload}
                type="button"
              >
                Reload the app
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
