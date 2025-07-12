import React, { useState } from 'react';
import type { Exercise, SetEntry } from '../services/exerciseService';
import ExerciseTimer from './ExerciseTimer';

interface ExerciseFormData {
  sets: SetEntry[];
}

interface CompactExerciseCardProps {
  exercise: Exercise;
  formData: ExerciseFormData;
  onSetChange: (setIndex: number, field: keyof SetEntry, value: string | number | undefined) => void;
  onMarkAsCompleted: () => void;
  onSetCompleted?: (setIndex: number) => void;
  onAutoSave?: (setIndex: number, field: keyof SetEntry, value: string | number | undefined) => void;
}

const CompactExerciseCard: React.FC<CompactExerciseCardProps> = ({
  exercise,
  formData,
  onSetChange,
  onMarkAsCompleted,
  onSetCompleted,
  onAutoSave
}) => {
  const [notesPopup, setNotesPopup] = useState<{ notes: string } | null>(null);
  const formatPlannedDisplay = () => {
    const setsDisplay = exercise.planned.sets.join(', ');
    return `${setsDisplay} ${exercise.planned.unit}`;
  };

  const formatWeightDisplay = () => {
    if (!exercise.planned.weight) return null;
    if (exercise.planned.weight.unit === 'bodyweight') {
      return 'BW';
    }
    return `${exercise.planned.weight.amount}${exercise.planned.weight.unit}`;
  };

  const openNotesPopup = () => {
    // Get notes from the first set as general exercise notes
    setNotesPopup({ 
      notes: formData.sets[0]?.notes || '' 
    });
  };

  const saveNotes = () => {
    if (notesPopup) {
      // Save notes to the first set as general exercise notes
      onSetChange(0, 'notes', notesPopup.notes);
      setNotesPopup(null);
    }
  };

  const handleSetComplete = (setIndex: number) => {
    if (onSetCompleted) {
      onSetCompleted(setIndex);
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
      {/* Header - Exercise name and planned info on one line */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <h4 style={{ 
          margin: 0,
          fontSize: '1rem',
          fontWeight: 600,
          color: '#333'
        }}>
          {exercise.name}
        </h4>
        <div style={{ 
          fontSize: '0.85rem', 
          color: '#666',
          display: 'flex',
          gap: '12px'
        }}>
          <span>{formatPlannedDisplay()}</span>
          {exercise.planned.weight && <span>{formatWeightDisplay()}</span>}
          {exercise.planned.equipment && <span>{exercise.planned.equipment}</span>}
        </div>
      </div>

      {/* Description if exists - compact */}
      {exercise.description && (
        <p style={{ 
          fontSize: '0.8rem', 
          color: '#666',
          margin: '0 0 8px 0',
          fontStyle: 'italic'
        }}>
          {exercise.description}
        </p>
      )}

      {/* Timer for duration-based exercises */}
      {(() => {
        const isTimeBased = exercise.planned.unit === 'duration' || 
                          exercise.planned.unit === 'seconds' || 
                          exercise.planned.unit === 'minutes' ||
                          exercise.planned.unit === 'sec' ||
                          exercise.planned.unit === 'min';
        
        // Debug log to see what units we're getting
        console.log(`Exercise: ${exercise.name}, Unit: ${exercise.planned.unit}, IsTimeBased: ${isTimeBased}`);
        
        return isTimeBased;
      })() && (
        <ExerciseTimer 
          duration={exercise.planned.sets[0]?.toString() || '0'}
          onComplete={() => console.log(`Timer completed for ${exercise.name}`)}
        />
      )}

      {/* Sets table - very compact */}
      <div style={{ marginBottom: '8px' }}>
        {/* Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight' 
            ? '30px 1fr 1fr 50px' 
            : '30px 1fr 50px',
          gap: '4px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#666',
          padding: '4px 0',
          borderBottom: '1px solid #eee'
        }}>
          <div>Set</div>
          <div>{exercise.planned.unit === 'reps' ? 'Reps' : 'Time'}</div>
          {exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight' && <div>Weight</div>}
          <div>Done</div>
        </div>

        {/* Set rows */}
        {exercise.planned.sets.map((plannedValue, index) => (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight' 
              ? '30px 1fr 1fr 50px' 
              : '30px 1fr 50px',
            gap: '4px',
            alignItems: 'center',
            padding: '2px 0'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{index + 1}</div>
            <input
              type="text"
              placeholder={plannedValue.toString()}
              value={formData.sets[index]?.reps || formData.sets[index]?.duration || ''}
              onChange={(e) => onSetChange(index, exercise.planned.unit === 'reps' ? 'reps' : 'duration', e.target.value)}
              onBlur={(e) => onAutoSave && onAutoSave(index, exercise.planned.unit === 'reps' ? 'reps' : 'duration', e.target.value)}
              style={{
                border: '1px solid #ddd',
                borderRadius: '2px',
                padding: '2px 4px',
                fontSize: '0.8rem',
                height: '24px'
              }}
            />
            {exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight' && (
              <input
                type="text"
                placeholder={exercise.planned.weight.amount?.toString() || ''}
                value={formData.sets[index]?.weight?.amount || ''}
                onChange={(e) => onSetChange(index, 'weight', e.target.value ? { amount: parseFloat(e.target.value) || 0, unit: 'lb' } : undefined)}
                onBlur={(e) => onAutoSave && onAutoSave(index, 'weight', e.target.value ? { amount: parseFloat(e.target.value) || 0, unit: 'lb' } : undefined)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '2px',
                  padding: '2px 4px',
                  fontSize: '0.8rem',
                  height: '24px'
                }}
              />
            )}
            <button
              onClick={() => handleSetComplete(index)}
              style={{
                border: '1px solid #4CAF50',
                borderRadius: '2px',
                padding: '2px 4px',
                fontSize: '0.7rem',
                height: '24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              ✓
            </button>
          </div>
        ))}
      </div>

      {/* Complete and Notes buttons - right-aligned */}
      <div style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={openNotesPopup}
          style={{
            padding: '4px 8px',
            fontSize: '0.8rem',
            backgroundColor: formData.sets[0]?.notes ? '#2196F3' : '#9E9E9E',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          {formData.sets[0]?.notes ? '📝' : '💬'} Notes
        </button>
        <button 
          onClick={onMarkAsCompleted}
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
          Complete
        </button>
      </div>

      {/* Notes Popup */}
      {notesPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>
              Exercise Notes
            </h3>
            <textarea
              value={notesPopup.notes}
              onChange={(e) => setNotesPopup({ ...notesPopup, notes: e.target.value })}
              placeholder="Add notes for this exercise..."
              style={{
                width: '100%',
                height: '120px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px',
                fontSize: '0.9rem',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              justifyContent: 'flex-end',
              marginTop: '16px'
            }}>
              <button
                onClick={() => setNotesPopup(null)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  backgroundColor: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactExerciseCard;