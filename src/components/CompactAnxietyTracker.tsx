import React, { useState } from 'react';
import { addAnxietyThought } from '../firebase';

interface CompactAnxietyTrackerProps {
  onClose: () => void;
  onSave: () => void;
}

const CompactAnxietyTracker: React.FC<CompactAnxietyTrackerProps> = ({ onClose, onSave }) => {
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


  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '12px',
      marginBottom: '8px',
      background: '#fff'
    }}>
      <h3 style={{ 
        margin: '0 0 12px 0',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#333'
      }}>
        Log Anxious Thought
      </h3>
      
      <form onSubmit={handleSubmit}>
        {/* Intensity selector - compact horizontal */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            marginBottom: '4px',
            color: '#666'
          }}>
            Intensity:
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setIntensity(value)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: intensity === value ? '2px solid #4CAF50' : '1px solid #ccc',
                  backgroundColor: intensity === value ? '#e8f5e9' : 'white',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {value}
              </button>
            ))}
            <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '8px' }}>
              {intensity === 1 && 'Mild'}
              {intensity === 2 && 'Low'}
              {intensity === 3 && 'Moderate'}
              {intensity === 4 && 'High'}
              {intensity === 5 && 'Severe'}
            </span>
          </div>
        </div>

        {/* Time input */}
        <div style={{ marginBottom: '8px' }}>
          <input 
            type="datetime-local" 
            value={timestamp.toISOString().slice(0, 16)}
            onChange={handleDateTimeChange}
            style={{ 
              width: '100%',
              padding: '4px',
              fontSize: '0.85rem',
              border: '1px solid #ddd',
              borderRadius: '2px',
              height: '28px'
            }}
          />
        </div>

        {/* Thought input - always visible */}
        <div style={{ marginBottom: '8px' }}>
          <textarea
            value={thought}
            onChange={(e) => setThought(e.target.value)}
            placeholder="What's on your mind? (optional)"
            style={{
              width: '100%',
              height: '60px',
              border: '1px solid #ddd',
              borderRadius: '2px',
              padding: '4px',
              fontSize: '0.85rem',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>
        
        {error && <div style={{ color: 'red', fontSize: '0.8rem', marginBottom: '8px' }}>{error}</div>}
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              padding: '4px 8px',
              fontSize: '0.8rem',
              backgroundColor: '#ccc',
              color: '#333',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit"
            style={{
              padding: '4px 8px',
              fontSize: '0.8rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            Log
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompactAnxietyTracker;