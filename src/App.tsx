import { useState, useEffect } from 'react';
import { addActivity, getTodaysActivities } from './firebase';
import type { Activity, CoffeeActivity, AnxietyActivity } from './firebase.ts';
import AnxietyLogger from './AnxietyLogger';
import CoffeeLogger from './CoffeeLogger';
import ExerciseDashboard from './components/ExerciseDashboard';

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showAnxietyModal, setShowAnxietyModal] = useState(false);
  const [currentView, setCurrentView] = useState<'activities' | 'exercises'>('activities');
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Personal Activity Tracker</h1>
      
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '20px', 
        borderBottom: '1px solid #ccc'
      }}>
        <button 
          onClick={() => setCurrentView('activities')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'activities' ? '#4CAF50' : '#f0f0f0',
            color: currentView === 'activities' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            marginRight: '5px'
          }}
        >
          Activities
        </button>
        <button 
          onClick={() => setCurrentView('exercises')}
          style={{
            padding: '10px 20px',
            backgroundColor: currentView === 'exercises' ? '#4CAF50' : '#f0f0f0',
            color: currentView === 'exercises' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer'
          }}
        >
          Exercises
        </button>
      </div>
      
      {currentView === 'activities' && (
        <>
          <h2>Quick Log</h2>
          <button onClick={handleQuickAddCoffee} style={{ marginRight: '10px' }}>
            Quick Coffee ☕
          </button>
          <button onClick={handleOpenCoffeeModal} style={{ marginRight: '10px' }}>
            Add Coffee Details
          </button>
          <button onClick={handleOpenAnxietyModal} style={{ marginRight: '10px' }}>
            Log Anxious Thought
          </button>
        </>
      )}
      
      
      {currentView === 'activities' && (
        <>
          <h2>Today's Activities ({activities.length})</h2>
          {activities.length === 0 ? (
            <p>No activities logged today</p>
          ) : (
            <ul>
              {activities.map((activity) => (
                <li key={activity.id}>
                  {activity.type === 'coffee' && (
                    <>
                      <strong>☕ {(activity as CoffeeActivity).data.coffeeType}</strong> ({(activity as CoffeeActivity).data.amount}) - {activity.timestamp.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })}
                    </>
                  )}
                  {activity.type === 'anxiety' && (
                    <>
                      <strong>Anxiety</strong> - {activity.timestamp.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })} 
                      (Intensity: {(activity as AnxietyActivity).data.intensity}/5)
                      {(activity as AnxietyActivity).data.thought && 
                        <span style={{ display: 'block', marginLeft: '20px', fontSize: '0.9em', color: '#666' }}>
                          "{(activity as AnxietyActivity).data.thought}"
                        </span>
                      }
                    </>
                  )}
                  {activity.type === 'exercise' && (
                    <>
                      <strong>Exercise</strong> - {activity.timestamp.toLocaleTimeString('en-US', { timeZone: 'America/Los_Angeles' })} ({activity.data.name})
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
          
          <hr />
          <p>Firebase Status: {error ? '❌ Error' : '✅ Connected'}</p>
        </>
      )}
      
      {currentView === 'exercises' && (
        <ExerciseDashboard />
      )}

      {/* Coffee Modal */}
      {showCoffeeModal && (
        <CoffeeLogger
          coffeeForm={coffeeForm}
          onFormChange={handleCoffeeFormChange}
          onDateTimeChange={handleDateTimeChange}
          onSubmit={handleSubmitCoffee}
          onClose={handleCloseCoffeeModal}
          error={error}
          formatDateTimeForInput={formatDateTimeForInput}
        />
      )}

      {/* Anxiety Logger Modal */}
      {showAnxietyModal && (
        <AnxietyLogger
          onClose={handleCloseAnxietyModal}
          onSave={loadActivities}
        />
      )}
    </div>
  );
}

export default App;