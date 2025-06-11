import { useState } from 'react';
import { addAnxietyThought } from './firebase';

interface AnxietyLoggerProps {
  onClose: () => void;
  onSave: () => void;
}

const AnxietyLogger: React.FC<AnxietyLoggerProps> = ({ onClose, onSave }) => {
  const [intensity, setIntensity] = useState<number>(3);
  const [thought, setThought] = useState<string>('');
  const [timestamp, setTimestamp] = useState<Date>(new Date());
  const [error, setError] = useState<string>('');

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateTimeValue = e.target.value;
    if (dateTimeValue) {
      const newTimestamp = new Date(dateTimeValue);
      setTimestamp(newTimestamp);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (intensity < 1 || intensity > 5) {
      setError('Intensity must be between 1 and 5');
      return;
    }
    
    if (timestamp > new Date()) {
      setError('Time cannot be in the future');
      return;
    }
    
    try {
      await addAnxietyThought(intensity, thought || undefined, timestamp);
      onSave();
      onClose();
    } catch (err) {
      setError('Failed to log anxiety thought');
      console.error(err);
    }
  };

  const intensityLabels = [
    'Mild unease, barely noticeable',
    'Noticeable worry, manageable',
    'Moderate anxiety, somewhat distressing',
    'High anxiety, significantly distressing',
    'Severe anxiety, overwhelming/panic-level'
  ];

  return (
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
        width: '350px',
        maxWidth: '90%'
      }}>
        <h2>Log Anxious Thought</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Intensity:
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setIntensity(value)}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    border: intensity === value ? '2px solid #4CAF50' : '1px solid #ccc',
                    backgroundColor: intensity === value ? '#e8f5e9' : 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '12px',
              color: '#666',
              marginTop: '5px'
            }}>
              <span>Mild</span>
              <span>Severe</span>
            </div>
            <div style={{ 
              fontSize: '14px',
              color: '#666',
              marginTop: '10px',
              textAlign: 'center'
            }}>
              {intensityLabels[intensity - 1]}
            </div>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Thought (optional):
              <textarea 
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="What's on your mind?"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Time:
              <input 
                type="datetime-local" 
                value={timestamp.toISOString().slice(0, 16)}
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
              onClick={onClose}
              style={{
                padding: '10px 15px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Log Thought
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnxietyLogger;
