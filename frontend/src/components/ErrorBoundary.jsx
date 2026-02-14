import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Component Error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="max-w-xl w-full bg-white rounded-xl shadow-lg overflow-hidden border border-red-100">
                        <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                An error occurred while loading this component. Please try reloading the page.
                            </p>

                            <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64 mb-6">
                                <p className="font-mono text-red-400 text-sm mb-2 font-bold">
                                    {this.state.error && this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="font-mono text-gray-400 text-xs whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Reload Page
                                </button>
                                <button
                                    onClick={() => window.history.back()}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Go Back
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
