import React, { useState } from 'react';
import type { SetEntry } from '../services/exerciseService';

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
          gap: '10px',
          marginBottom: '5px',
          alignItems: 'center',
          backgroundColor: setNumber % 2 === 0 ? '#f0f0f0' : '#ffffff',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #eaeaea'
        }}
      >
        <div style={{ 
          width: '30px', 
          fontWeight: 'bold', 
          backgroundColor: '#2196f3',
          color: '#fff',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px'
        }}>
          {setNumber}
        </div>
        
        <div style={{ flex: 1 }}>
          <input
            type="number"
            value={getCurrentValue()}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={`${plannedValue} ${unit === 'reps' ? 'reps' : 'sec'}`}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #2196f3',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              color: '#000000'
            }}
          />
        </div>
        
        {showWeight && (
          <div style={{ flex: 1 }}>
            <input
              type="number"
              step="0.5"
              value={getCurrentWeight()}
              onChange={(e) => handleWeightChange(e.target.value)}
              placeholder={plannedWeight ? `${plannedWeight.amount}${plannedWeight.unit}` : 'Weight'}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #4caf50',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                color: '#000000'
              }}
            />
          </div>
        )}
        
        <div style={{ width: '60px', textAlign: 'center' }}>
          <button
            onClick={() => setShowNotes(!showNotes)}
            style={{
              backgroundColor: showNotes || set.notes ? '#ff9800' : '#e0e0e0',
              color: showNotes || set.notes ? 'white' : '#666',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Notes
          </button>
        </div>
      </div>
      
      {showNotes && (
        <div style={{ 
          marginLeft: '40px', 
          marginBottom: '10px',
          backgroundColor: '#f9f9f9',
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          <textarea
            value={set.notes || ''}
            onChange={(e) => onSetChange('notes', e.target.value)}
            placeholder="Notes for this set..."
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minHeight: '60px',
              backgroundColor: '#ffffff',
              color: '#000000',
              fontSize: '12px',
              resize: 'vertical'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SetInputRow;