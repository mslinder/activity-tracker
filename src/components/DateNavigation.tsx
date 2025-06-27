import React from 'react';
import { Button, FlexContainer } from './styled';

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
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <FlexContainer justify="space-between" align="center">
        <Button 
          variant="secondary"
          size="sm"
          onClick={onPreviousDay}
        >
          ← {availableDates.length > 0 ? 'Previous' : ''}
        </Button>
        
        <div style={{ 
          textAlign: 'center',
          padding: '0 1rem'
        }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '1.25rem', 
            color: '#1e293b',
            marginBottom: '0.25rem'
          }}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric'
            })}
          </div>
          <div style={{
            fontSize: '0.9rem',
            color: '#64748b'
          }}>
            {selectedDate.getFullYear()}
            {selectedDate.toDateString() === new Date().toDateString() && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.25rem 0.5rem',
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 500
              }}>
                Today
              </span>
            )}
          </div>
        </div>
        
        <Button 
          variant="secondary"
          size="sm"
          onClick={onNextDay}
        >
          {availableDates.length > 0 ? 'Next' : ''} →
        </Button>
      </FlexContainer>
    </div>
  );
};

export default DateNavigation;