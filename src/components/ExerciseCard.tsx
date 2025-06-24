import React, { useEffect } from 'react';
import type { Exercise, ExerciseLog, SetEntry } from '../services/exerciseService';
import SetInputRow from './SetInputRow';

interface ExerciseFormData {
  sets: SetEntry[];
}

interface ExerciseCardProps {
  exercise: Exercise;
  formData: ExerciseFormData;
  onSetChange: (setIndex: number, field: keyof SetEntry, value: string | number | undefined) => void;
  onMarkAsCompleted: () => void;
  onAutoSave: (setIndex: number, field: keyof SetEntry, value: string | number | undefined) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  formData,
  onSetChange,
  onMarkAsCompleted,
  onAutoSave
}) => {
  // Auto-expand sets table based on planned sets
  useEffect(() => {
    // Initialize sets array to match planned sets length if not already done
    if (formData.sets.length !== exercise.planned.sets.length) {
      const newSets: SetEntry[] = exercise.planned.sets.map(() => ({}));
      // Copy existing data if available
      for (let i = 0; i < Math.min(formData.sets.length, newSets.length); i++) {
        newSets[i] = { ...formData.sets[i] };
      }
    }
  }, [exercise.planned.sets.length, formData.sets.length, exercise.planned.sets, formData.sets]);

  const handleSetChange = (setIndex: number, field: keyof SetEntry, value: string | number | undefined) => {
    onSetChange(setIndex, field, value);
    // Auto-save when user enters data
    onAutoSave(setIndex, field, value);
  };

  const handleMarkAsCompleted = () => {
    // Auto-fill prescribed reps/weight for all sets
    onMarkAsCompleted();
  };

  const formatPlannedDisplay = () => {
    const setsDisplay = exercise.planned.sets.join(', ');
    return `${setsDisplay} ${exercise.planned.unit}`;
  };

  const formatWeightDisplay = () => {
    if (!exercise.planned.weight) return null;
    if (exercise.planned.weight.unit === 'bodyweight') {
      return 'Bodyweight';
    }
    return `${exercise.planned.weight.amount}${exercise.planned.weight.unit}`;
  };

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <h4 
        style={{ 
          marginTop: 0, 
          marginBottom: '10px', 
          color: '#000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>{exercise.name}</span>
      </h4>
      
      {exercise.description && (
        <p style={{ 
          fontSize: '0.9rem', 
          color: '#333',
          marginBottom: '10px'
        }}>
          {exercise.description}
        </p>
      )}
      
      <div style={{ marginBottom: '10px', color: '#000' }}>
        <strong>Planned:</strong> {formatPlannedDisplay()}
      </div>
      
      {exercise.planned.weight && (
        <div style={{ marginBottom: '10px', color: '#000' }}>
          <strong>Weight:</strong> {formatWeightDisplay()}
        </div>
      )}
      
      {exercise.planned.equipment && (
        <div style={{ marginBottom: '10px', color: '#000' }}>
          <strong>Equipment:</strong> {exercise.planned.equipment}
        </div>
      )}
      
      {/* Sets logging form */}
      <div style={{ 
        backgroundColor: '#e0e0e0', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '15px',
        marginBottom: '15px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>Log your sets:</div>
          
          {/* Column Headers */}
          <div 
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '8px',
              alignItems: 'center',
              backgroundColor: '#2196f3',
              padding: '8px',
              borderRadius: '4px'
            }}
          >
            <div style={{ width: '30px', fontWeight: 'bold', color: '#fff' }}>Set</div>
            <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>
              {exercise.planned.unit === 'reps' ? 'Reps' : 'Duration'}
            </div>
            {exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight' && (
              <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>Weight</div>
            )}
            <div style={{ width: '60px', textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>Notes</div>
          </div>
          
          {/* Auto-expanded sets based on planned sets */}
          {exercise.planned.sets.map((plannedValue, index) => (
            <SetInputRow
              key={index}
              setNumber={index + 1}
              set={formData.sets[index] || {}}
              plannedValue={plannedValue}
              unit={exercise.planned.unit}
              showWeight={exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight'}
              plannedWeight={exercise.planned.weight}
              onSetChange={(field, value) => handleSetChange(index, field, value)}
            />
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
          <button 
            onClick={handleMarkAsCompleted}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;