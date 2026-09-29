import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign ResizeObserver loop errors and unhandled websocket disconnects during CSS transitions
window.addEventListener('error', (e) => {
  if (
    e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
    e.message === 'ResizeObserver loop limit exceeded' ||
    e.message?.includes('ResizeObserver')
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason?.message?.includes('ResizeObserver') || e.reason?.message?.includes('WebSocket')) {
    e.preventDefault();
  }
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RootErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleResetAndReload = () => {
    try {
      localStorage.removeItem('jadwalpriok_ui_zoom_level');
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900 text-white font-sans">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-100">Aplikasi Memerlukan Muat Ulang</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {this.state.error?.message || 'Terjadi penyegaran tampilan dev server. Klik tombol di bawah untuk memuat ulang aplikasi.'}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all duration-150 cursor-pointer shadow-lg shadow-teal-500/20"
              >
                Muat Ulang Aplikasi (Reload)
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="w-full py-2 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-all duration-150 cursor-pointer"
              >
                Pulihkan Tampilan Default
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
