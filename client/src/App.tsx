import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import { Toaster } from './components/ui/toaster';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const BpdManagement = lazy(() => import('./pages/BpdManagement'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Information = lazy(() => import('./pages/Information'));


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {

  // Loading component for Suspense
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={
            <Suspense fallback={<LoadingFallback />}>
              <Login />
            </Suspense>
          } />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="bpd" element={
              <Suspense fallback={<LoadingFallback />}>
                <BpdManagement />
              </Suspense>
            } />
            <Route path="users" element={
              <Suspense fallback={<LoadingFallback />}>
                <UserManagement />
              </Suspense>
            } />
            <Route path="information" element={
              <Suspense fallback={<LoadingFallback />}>
                <Information />
              </Suspense>
            } />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
