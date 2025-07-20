import { useState, useEffect } from 'react';
import { signInUser, signOutUser, onAuthStateChange } from './firebase';
import type { User } from 'firebase/auth';
import Sidebar from './components/Sidebar';
import ExerciseDashboard from './components/ExerciseDashboard';
import Admin from './components/Admin';
import { ErrorBoundary } from './errors';
import { ThemeProvider } from './theme';

function App() {
  const [currentView, setCurrentView] = useState<'exercises' | 'admin'>('exercises');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      setAuthError('Please enter both email and password');
      return;
    }

    try {
      setAuthError('');
      await signInUser(email, password);
      // User state will be updated by onAuthStateChanged listener
    } catch (error: any) {
      setAuthError(error.message || 'Failed to sign in');
      setPassword('');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);


  if (authLoading) return <div>Loading...</div>;

  // Show login screen if not authenticated
  if (!user) {
    return (
      <ThemeProvider>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '440px',
            width: '100%',
            margin: '24px'
          }}>
            <h2 style={{
              textAlign: 'center',
              marginBottom: '32px',
              color: '#1e293b',
              fontSize: '1.75rem',
              fontWeight: 600,
              letterSpacing: '-0.025em'
            }}>
              Personal Activity Tracker
            </h2>
            
            <p style={{
              textAlign: 'center',
              color: '#64748b',
              fontSize: '1rem',
              marginBottom: '32px',
              lineHeight: '1.5'
            }}>
              Sign in to access your activity data
            </p>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease'
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '1rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>

            {authError && (
              <div style={{
                color: '#dc2626',
                fontSize: '0.875rem',
                marginBottom: '20px',
                textAlign: 'center',
                backgroundColor: '#fef2f2',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #fecaca'
              }}>
                {authError}
              </div>
            )}

            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1rem',
                backgroundColor: '#2ea3f2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background-color 0.2s ease'
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar
              currentView={currentView}
              onViewChange={setCurrentView}
              isCollapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            
            <div style={{ 
              flex: 1,
              padding: '32px',
              width: '100vw',
              paddingTop: sidebarCollapsed ? '96px' : '32px',
              transition: 'padding-top 0.3s ease',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
                {currentView === 'exercises' && (
                  <ErrorBoundary>
                    <ExerciseDashboard />
                  </ErrorBoundary>
                )}

                {currentView === 'admin' && (
                  <ErrorBoundary>
                    <Admin onSignOut={handleSignOut} />
                  </ErrorBoundary>
                )}
              </div>
            </div>
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;