import { Component, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AdminRoute, EmployeeRoute } from './components/auth';
import Layout from './components/layout/Layout';
import POSLogin from './pages/pos/Login';
import AdminLogin from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import Sales from './pages/admin/Sales';
import Menu from './pages/admin/Menu';
import POS from './pages/pos/POS';
import { isSupabaseConfigured } from './lib/supabase';

// Configuration Error Component
function ConfigurationError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration Required</h1>
        <p className="text-gray-600 mb-4">
          This app requires Supabase to be configured. Please set the following environment variables in your Netlify dashboard:
        </p>
        <div className="bg-gray-100 rounded-lg p-4 text-left mb-4">
          <code className="text-sm text-gray-800 block">VITE_SUPABASE_URL</code>
          <code className="text-sm text-gray-800 block">VITE_SUPABASE_ANON_KEY</code>
        </div>
        <p className="text-sm text-gray-500">
          Go to Netlify → Site Settings → Environment Variables to add these values.
        </p>
      </div>
    </div>
  );
}

// Error Boundary to catch React errors and prevent white screens
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReload = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Show configuration error if Supabase isn't set up
  if (!isSupabaseConfigured) {
    return <ConfigurationError />;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* POS Login - Public */}
            <Route path="/pos/login" element={<POSLogin />} />

            {/* POS Route - Protected (Employee or Admin) */}
            <Route
              path="/pos"
              element={
                <EmployeeRoute>
                  <POS />
                </EmployeeRoute>
              }
            />

            {/* Admin Login - Public */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Admin Routes - Protected (Admin only) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="menu" element={<Menu />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="sales" element={<Sales />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Catch-all 404 - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
