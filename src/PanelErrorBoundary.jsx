import { Component } from 'react'

export default class PanelErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    // Keep the UI available when a non-critical map or chart panel fails.
    console.error('CivicSync panel failed to render:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="grid min-h-40 place-items-center rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 text-center shadow-soft dark:border-amber-900/60 dark:bg-amber-950/25">
          <div>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{this.props.label || 'This panel'} could not be loaded.</p>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">The rest of CivicSync is still available. Try refreshing the page.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
