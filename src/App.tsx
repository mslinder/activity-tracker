import { useState, useEffect } from 'react';
import { addActivity, getTodaysActivities } from './firebase';
import type { Activity, CoffeeActivity, AnxietyActivity } from './firebase.ts';
import AnxietyLogger from './AnxietyLogger';

function App() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);
  const [showAnxietyModal, setShowAnxietyModal] = useState(false);
  const [coffeeForm, setCoffeeForm] = useState({
    coffeeType: 'Espresso' as const,
    amount: 1,
    timestamp: new Date()
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
        timestamp: new Date(),
        data: {
          coffeeType: 'Espresso',
          amount: 1
        }
      });
      loadActivities(); // Refresh the list
    } catch (err) {
      setError('Failed to add coffee');
    }
  };

  const handleOpenCoffeeModal = () => {
    setCoffeeForm({
      coffeeType: 'Espresso' as const,
      amount: 1,
      timestamp: new Date()
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
      const newTimestamp = new Date(dateTimeValue);
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
    } catch (err) {
      setError('Failed to add coffee');
    }
  };

  const handleOpenAnxietyModal = () => {
    setShowAnxietyModal(true);
  };

  const handleCloseAnxietyModal = () => {
    setShowAnxietyModal(false);
  };

  const handleAddExercise = async () => {
    const name = prompt('Exercise name:');
    if (!name) return;

    try {
      await addActivity({
        type: 'exercise',
        timestamp: new Date(),
        data: { name, completed: true }
      });
      loadActivities();
    } catch (err) {
      setError('Failed to add exercise');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Personal Activity Tracker</h1>
      
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      
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
      <button onClick={handleAddExercise} style={{ marginRight: '10px' }}>
        Add Exercise
      </button>
      
      <h2>Today's Activities ({activities.length})</h2>
      {activities.length === 0 ? (
        <p>No activities logged today</p>
      ) : (
        <ul>
          {activities.map((activity) => (
            <li key={activity.id}>
              {activity.type === 'coffee' && (
                <>
                  <strong>☕ {(activity as CoffeeActivity).data.coffeeType}</strong> ({(activity as CoffeeActivity).data.amount}) - {activity.timestamp.toLocaleTimeString()}
                </>
              )}
              {activity.type === 'anxiety' && (
                <>
                  <strong>Anxiety</strong> - {activity.timestamp.toLocaleTimeString()} 
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
                  <strong>Exercise</strong> - {activity.timestamp.toLocaleTimeString()} ({activity.data.name})
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      
      <hr />
      <p>Firebase Status: {error ? '❌ Error' : '✅ Connected'}</p>

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
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '5px',
            width: '300px',
            maxWidth: '90%'
          }}>
            <h2>Add Coffee</h2>
            <form onSubmit={handleSubmitCoffee}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Coffee Type:
                  <select 
                    name="coffeeType" 
                    value={coffeeForm.coffeeType}
                    onChange={handleCoffeeFormChange}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      marginTop: '5px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                  >
                    <option value="Espresso">Espresso</option>
                    <option value="Cold Brew">Cold Brew</option>
                    <option value="Pour Over">Pour Over</option>
                  </select>
                </label>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Amount:
                  <input 
                    type="number" 
                    name="amount" 
                    value={coffeeForm.amount}
                    min="1"
                    onChange={handleCoffeeFormChange}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      marginTop: '5px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                  />
                </label>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Time:
                  <input 
                    type="datetime-local" 
                    value={coffeeForm.timestamp.toISOString().slice(0, 16)}
                    onChange={handleDateTimeChange}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      marginTop: '5px',
                      borderRadius: '4px',
                      border: '1px solid #ccc'
                    }}
                  />
                </label>
              </div>
              
              {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button 
                  type="button" 
                  onClick={handleCloseCoffeeModal}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
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