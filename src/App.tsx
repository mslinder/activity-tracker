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
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            width: '100%',
            margin: '16px'
          }}>
            <h2 style={{
              textAlign: 'center',
              marginBottom: '24px',
              color: '#333',
              fontSize: '1.5rem'
            }}>
              Personal Activity Tracker
            </h2>
            
            <p style={{
              textAlign: 'center',
              color: '#666',
              fontSize: '0.9rem',
              marginBottom: '24px'
            }}>
              Sign in to access your activity data
            </p>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {authError && (
              <div style={{
                color: '#dc2626',
                fontSize: '0.85rem',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                {authError}
              </div>
            )}

            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '1rem',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
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
              padding: '20px',
              width: '100vw',
              paddingTop: sidebarCollapsed ? '80px' : '20px',
              transition: 'padding-top 0.3s ease'
            }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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