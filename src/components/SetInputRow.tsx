import React, { useState } from 'react';
import type { SetEntry } from '../services/exerciseService';
import { Input, Button } from './styled';

interface SetInputRowProps {
  setNumber: number;
  set: SetEntry;
  plannedValue: number;
  unit: 'reps' | 'seconds' | 'minutes';
  showWeight: boolean;
  plannedWeight?: { amount: number; unit: 'lb' | 'kg' | 'bodyweight' };
  onSetChange: (field: keyof SetEntry, value: string | number | undefined) => void;
}

const SetInputRow: React.FC<SetInputRowProps> = ({ 
  setNumber, 
  set, 
  plannedValue, 
  unit, 
  showWeight, 
  plannedWeight, 
  onSetChange 
}) => {
  const [showNotes, setShowNotes] = useState(false);

  const handleValueChange = (value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    if (unit === 'reps') {
      onSetChange('reps', numValue);
    } else {
      onSetChange('duration', numValue);
    }
  };

  const handleWeightChange = (value: string) => {
    if (!value) {
      onSetChange('weight', undefined);
      return;
    }
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && plannedWeight) {
      onSetChange('weight', {
        amount: numValue,
        unit: plannedWeight.unit === 'bodyweight' ? 'lb' : plannedWeight.unit
      });
    }
  };

  const getCurrentValue = () => {
    if (unit === 'reps') {
      return set.reps || '';
    } else {
      return set.duration || '';
    }
  };

  const getCurrentWeight = () => {
    return set.weight?.amount?.toString() || '';
  };

  return (
    <div>
      <div 
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '8px',
          alignItems: 'center',
          background: setNumber % 2 === 0 ? 
            'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' : 
            'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          transition: 'all 200ms ease-in-out'
        }}
      >
        <div style={{ 
          width: '36px', 
          height: '36px',
          fontWeight: 600, 
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '10px',
          fontSize: '0.9rem',
          boxShadow: '0 2px 4px rgba(14, 165, 233, 0.3)'
        }}>
          {setNumber}
        </div>
        
        <div style={{ flex: 1 }}>
          <Input
            type="number"
            value={getCurrentValue()}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={`${plannedValue} ${unit === 'reps' ? 'reps' : 'sec'}`}
            style={{
              width: '100%',
              border: '1px solid #0ea5e9',
              background: '#ffffff'
            }}
          />
        </div>
        
        {showWeight && (
          <div style={{ flex: 1 }}>
            <Input
              type="number"
              step="0.5"
              value={getCurrentWeight()}
              onChange={(e) => handleWeightChange(e.target.value)}
              placeholder={plannedWeight ? `${plannedWeight.amount}${plannedWeight.unit}` : 'Weight'}
              style={{
                width: '100%',
                border: '1px solid #10b981',
                background: '#ffffff'
              }}
            />
          </div>
        )}
        
        <div style={{ width: '70px', textAlign: 'center' }}>
          <Button
            variant={showNotes || set.notes ? 'warning' : 'ghost'}
            size="sm"
            onClick={() => setShowNotes(!showNotes)}
            style={{
              fontSize: '0.75rem',
              padding: '0.5rem'
            }}
          >
            📝
          </Button>
        </div>
      </div>
      
      {showNotes && (
        <div style={{ 
          marginLeft: '48px', 
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid #f59e0b',
          boxShadow: '0 2px 4px rgba(245, 158, 11, 0.1)'
        }}>
          <textarea
            value={set.notes || ''}
            onChange={(e) => onSetChange('notes', e.target.value)}
            placeholder="Notes for this set..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d97706',
              borderRadius: '8px',
              minHeight: '70px',
              background: '#ffffff',
              color: '#1e293b',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              transition: 'border-color 200ms ease-in-out'
            }}
            onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
            onBlur={(e) => e.target.style.borderColor = '#d97706'}
          />
        </div>
      )}
    </div>
  );
};

export default SetInputRow;