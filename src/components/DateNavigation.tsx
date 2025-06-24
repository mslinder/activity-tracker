import React from 'react';

interface DateNavigationProps {
  selectedDate: Date;
  availableDates: Date[];
  onPreviousDay: () => void;
  onNextDay: () => void;
}

const DateNavigation: React.FC<DateNavigationProps> = ({
  selectedDate,
  availableDates,
  onPreviousDay,
  onNextDay
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '20px',
      padding: '10px',
      backgroundColor: '#e0e0e0',
      borderRadius: '8px'
    }}>
      <button 
        onClick={onPreviousDay}
        style={{
          padding: '8px 12px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        ← {availableDates.length > 0 ? 'Previous' : ''}
      </button>
      
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#000' }}>
        {selectedDate.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        })}
        {selectedDate.toDateString() === new Date().toDateString() && ' (Today)'}
      </div>
      
      <button 
        onClick={onNextDay}
        style={{
          padding: '8px 12px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {availableDates.length > 0 ? 'Next' : ''} →
      </button>
    </div>
  );
};

export default DateNavigation;