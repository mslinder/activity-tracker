import React from 'react';

interface CompactDateNavigationProps {
  selectedDate: Date;
  availableDates: Date[];
  onPreviousDay: () => void;
  onNextDay: () => void;
}

const CompactDateNavigation: React.FC<CompactDateNavigationProps> = ({
  selectedDate,
  availableDates,
  onPreviousDay,
  onNextDay
}) => {
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '8px 12px',
      background: '#fff',
      marginBottom: '8px',
      display: 'grid',
      gridTemplateColumns: '60px 1fr 60px',
      gap: '8px',
      alignItems: 'center'
    }}>
      <button
        onClick={onPreviousDay}
        style={{
          padding: '4px 8px',
          fontSize: '0.8rem',
          backgroundColor: '#f5f5f5',
          color: '#333',
          border: '1px solid #ddd',
          borderRadius: '2px',
          cursor: 'pointer'
        }}
      >
        ← Prev
      </button>
      
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontWeight: 600,
          fontSize: '0.9rem',
          color: '#333'
        }}>
          {selectedDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
          })}
          {isToday && (
            <span style={{
              marginLeft: '6px',
              padding: '1px 4px',
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '2px',
              fontSize: '0.7rem'
            }}>
              Today
            </span>
          )}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: '#666'
        }}>
          {selectedDate.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
      </div>
      
      <button
        onClick={onNextDay}
        style={{
          padding: '4px 8px',
          fontSize: '0.8rem',
          backgroundColor: '#f5f5f5',
          color: '#333',
          border: '1px solid #ddd',
          borderRadius: '2px',
          cursor: 'pointer'
        }}
      >
        Next →
      </button>
    </div>
  );
};

export default CompactDateNavigation;