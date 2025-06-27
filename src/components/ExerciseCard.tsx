import React, { useEffect } from 'react';
import type { Exercise, SetEntry } from '../services/exerciseService';
import SetInputRow from './SetInputRow';
import { Card, FlexContainer, Button } from './styled';

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
    <Card elevated style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      border: '1px solid #e2e8f0',
      marginBottom: 0
    }}>
      <FlexContainer justify="space-between" align="center" style={{ marginBottom: '1rem' }}>
        <h4 style={{ 
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#1e293b',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {exercise.name}
        </h4>
      </FlexContainer>
      
      {exercise.description && (
        <p style={{ 
          fontSize: '0.9rem', 
          color: '#64748b',
          marginBottom: '1rem',
          fontStyle: 'italic',
          background: '#f1f5f9',
          padding: '0.75rem',
          borderRadius: '8px',
          borderLeft: '3px solid #0ea5e9'
        }}>
          {exercise.description}
        </p>
      )}
      
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ 
            fontSize: '1.1rem',
            color: '#0ea5e9'
          }}>📋</span>
          <div>
            <div style={{ 
              fontSize: '0.8rem',
              color: '#64748b',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>Planned</div>
            <div style={{ 
              color: '#1e293b',
              fontWeight: 600
            }}>{formatPlannedDisplay()}</div>
          </div>
        </div>
        
        {exercise.planned.weight && (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ 
              fontSize: '1.1rem',
              color: '#10b981'
            }}>⚖️</span>
            <div>
              <div style={{ 
                fontSize: '0.8rem',
                color: '#64748b',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Weight</div>
              <div style={{ 
                color: '#1e293b',
                fontWeight: 600
              }}>{formatWeightDisplay()}</div>
            </div>
          </div>
        )}
        
        {exercise.planned.equipment && (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ 
              fontSize: '1.1rem',
              color: '#f59e0b'
            }}>🏋️</span>
            <div>
              <div style={{ 
                fontSize: '0.8rem',
                color: '#64748b',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>Equipment</div>
              <div style={{ 
                color: '#1e293b',
                fontWeight: 600
              }}>{exercise.planned.equipment}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Sets logging form */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        padding: '1.5rem', 
        borderRadius: '16px',
        border: '1px solid #cbd5e1',
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            fontWeight: 600, 
            marginBottom: '1rem', 
            color: '#1e293b',
            fontSize: '1.1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>📝</span>
            Log your sets:
          </div>
          
          {/* Column Headers */}
          <div 
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '12px',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)'
            }}
          >
            <div style={{ 
              width: '36px', 
              fontWeight: 600, 
              color: '#ffffff',
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>Set</div>
            <div style={{ 
              flex: 1, 
              textAlign: 'center', 
              fontWeight: 600, 
              color: '#ffffff',
              fontSize: '0.9rem'
            }}>
              {exercise.planned.unit === 'reps' ? 'Reps' : 'Duration'}
            </div>
            {exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight' && (
              <div style={{ 
                flex: 1, 
                textAlign: 'center', 
                fontWeight: 600, 
                color: '#ffffff',
                fontSize: '0.9rem'
              }}>Weight</div>
            )}
            <div style={{ 
              width: '70px', 
              textAlign: 'center', 
              fontWeight: 600, 
              color: '#ffffff',
              fontSize: '0.9rem'
            }}>Notes</div>
          </div>
          
          {/* Auto-expanded sets based on planned sets */}
          {exercise.planned.sets.map((plannedValue, index) => (
            <SetInputRow
              key={index}
              setNumber={index + 1}
              set={formData.sets[index] || {}}
              plannedValue={plannedValue}
              unit={exercise.planned.unit}
              showWeight={!!(exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight')}
              plannedWeight={exercise.planned.weight}
              onSetChange={(field, value) => handleSetChange(index, field, value)}
            />
          ))}
        </div>
        
        <FlexContainer justify="flex-end" style={{ marginTop: '1.5rem' }}>
          <Button 
            variant="success"
            onClick={handleMarkAsCompleted}
          >
            ✓ Mark as Completed
          </Button>
        </FlexContainer>
      </div>
    </Card>
  );
};

export default ExerciseCard;