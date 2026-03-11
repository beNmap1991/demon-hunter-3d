import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <div className="text-5xl font-black text-red-500 font-mono mb-4">WebGL Required</div>
            <p className="text-gray-300 mb-4">
              This game requires WebGL support. Please try:
            </p>
            <ul className="text-left text-gray-400 text-sm space-y-2 mb-6">
              <li>• Using a modern browser (Chrome, Firefox, Edge)</li>
              <li>• Enabling hardware acceleration in your browser settings</li>
              <li>• Updating your graphics drivers</li>
            </ul>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold font-mono rounded-lg"
            >
              RETRY
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
