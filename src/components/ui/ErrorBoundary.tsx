import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/** Top-level error boundary — catches render errors and shows a recovery UI. */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production this would send to an error tracking service
    void error
    void info
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary__box">
            <span className="error-boundary__icon" aria-hidden="true">⚠</span>
            <h2 className="error-boundary__title">Something went wrong</h2>
            <p className="error-boundary__message">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button className="error-boundary__reset" onClick={this.handleReset}>
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
