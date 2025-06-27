import { useState, useEffect } from 'react';
import { addActivity, getTodaysActivities } from './firebase';
import type { Activity, CoffeeActivity, AnxietyActivity } from './firebase';
import CompactAnxietyTracker from './components/CompactAnxietyTracker';
import CompactCoffeeTracker from './components/CompactCoffeeTracker';
import CompactTabNavigation from './components/CompactTabNavigation';
import CompactQuickActions from './components/CompactQuickActions';
import CompactActivityList from './components/CompactActivityList';
import ExerciseDashboard from './components/ExerciseDashboard';
import Admin from './components/Admin';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './theme';
import { 
  AppContainer, 
  MainContent, 
  ContentSection, 
  PageHeader, 
  PageTitle, 
  FlexContainer,
  Divider
} from './components/styled';
import { TabContainer, Tab } from './components/styled';
import { Button } from './components/styled';

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showAnxietyModal, setShowAnxietyModal] = useState(false);
  const [currentView, setCurrentView] = useState<'activities' | 'exercises' | 'admin'>('activities');
  // Helper function to get current time in PST
  const getCurrentPSTTime = () => {
    // Simply return the current time as we're already in PST
    // This works because the user is in PST timezone
    return new Date();
  };
  
  // Format date for datetime-local input in PST timezone
  const formatDateTimeForInput = (date: Date) => {
    // Get the date components in PST timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // Format as YYYY-MM-DDThh:mm (required format for datetime-local input)
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [coffeeForm, setCoffeeForm] = useState({
    coffeeType: 'Espresso' as const,
    amount: 1,
    timestamp: getCurrentPSTTime()
  });

  // Load today's activities
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const todayActivities = await getTodaysActivities();
      setActivities(todayActivities);
      setError('');
    } catch (err) {
      setError('Failed to load activities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddCoffee = async () => {
    try {
      await addActivity({
        type: 'coffee',
        timestamp: getCurrentPSTTime(),
        data: {
          coffeeType: 'Espresso',
          amount: 1
        }
      });
      loadActivities(); // Refresh the list
    } catch {
      setError('Failed to add coffee');
    }
  };

  const handleOpenCoffeeModal = () => {
    setCoffeeForm({
      coffeeType: 'Espresso' as const,
      amount: 1,
      timestamp: getCurrentPSTTime()
    });
    setShowCoffeeModal(true);
  };

  const handleCloseCoffeeModal = () => {
    setShowCoffeeModal(false);
  };

  const handleCoffeeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCoffeeForm(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateTimeValue = e.target.value;
    if (dateTimeValue) {
      // Parse datetime-local input format (YYYY-MM-DDTHH:MM) as local time
      const [datePart, timePart] = dateTimeValue.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hours, minutes] = timePart.split(':').map(Number);
      
      // Create date with local timezone interpretation
      const newTimestamp = new Date(year, month - 1, day, hours, minutes);
      setCoffeeForm(prev => ({
        ...prev,
        timestamp: newTimestamp
      }));
    }
  };

  const handleSubmitCoffee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (coffeeForm.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    
    if (coffeeForm.timestamp > new Date()) {
      setError('Time cannot be in the future');
      return;
    }
    
    try {
      await addActivity({
        type: 'coffee',
        timestamp: coffeeForm.timestamp,
        data: {
          coffeeType: coffeeForm.coffeeType,
          amount: coffeeForm.amount
        }
      });
      setShowCoffeeModal(false);
      loadActivities(); // Refresh the list
      setError('');
    } catch {
      setError('Failed to add coffee');
    }
  };

  const handleOpenAnxietyModal = () => {
    setShowAnxietyModal(true);
  };

  const handleCloseAnxietyModal = () => {
    setShowAnxietyModal(false);
  };


  if (loading) return <div>Loading...</div>;

  return (
    <ThemeProvider>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
          <div style={{
            padding: '12px',
            marginBottom: '8px',
            textAlign: 'center',
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: '#fff'
          }}>
            Activity Tracker
          </div>
          
          {error && (
            <div style={{
              border: '1px solid #fecaca',
              borderRadius: '4px',
              padding: '8px 12px',
              background: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.85rem',
              marginBottom: '8px'
            }}>
              Error: {error}
            </div>
          )}
          
          <CompactTabNavigation 
            currentView={currentView}
            onViewChange={setCurrentView}
          />
      
          {currentView === 'activities' && (
            <CompactQuickActions 
              onOpenCoffeeModal={handleOpenCoffeeModal}
              onOpenAnxietyModal={handleOpenAnxietyModal}
            />
          )}
          
          {currentView === 'activities' && (
            <>
              <CompactActivityList activities={activities} />
              
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px 12px',
                background: '#fff',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: '#666'
              }}>
                <span>Firebase:</span>
                <span style={{ 
                  color: error ? '#dc2626' : '#16a34a',
                  fontWeight: 500
                }}>
                  {error ? '❌ Error' : '✅ Connected'}
                </span>
              </div>
            </>
          )}
          
          {currentView === 'exercises' && (
            <ErrorBoundary>
              <ExerciseDashboard />
            </ErrorBoundary>
          )}

          {currentView === 'admin' && (
            <ErrorBoundary>
              <Admin />
            </ErrorBoundary>
          )}

          {/* Coffee Modal */}
          {showCoffeeModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                padding: '20px',
                borderRadius: '8px',
                width: '400px',
                maxWidth: '90%'
              }}>
                <CompactCoffeeTracker
                  coffeeForm={coffeeForm}
                  onFormChange={handleCoffeeFormChange}
                  onDateTimeChange={handleDateTimeChange}
                  onSubmit={handleSubmitCoffee}
                  onClose={handleCloseCoffeeModal}
                  error={error}
                  formatDateTimeForInput={formatDateTimeForInput}
                />
              </div>
            </div>
          )}

          {/* Anxiety Logger Modal */}
          {showAnxietyModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                padding: '20px',
                borderRadius: '8px',
                width: '400px',
                maxWidth: '90%'
              }}>
                <CompactAnxietyTracker
                  onClose={handleCloseAnxietyModal}
                  onSave={loadActivities}
                />
              </div>
            </div>
          )}
      </div>
    </ThemeProvider>
  );
}

export default App;