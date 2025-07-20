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

  // Debug: Log exercise weight info
  console.log(`Exercise: ${exercise.name}`, {
    hasWeight: !!exercise.planned.weight,
    weightUnit: exercise.planned.weight?.unit,
    weightAmount: exercise.planned.weight?.amount,
    isBodyweight: exercise.planned.weight?.unit === 'bodyweight',
    shouldShowWeightFields: exercise.planned.weight && exercise.planned.weight.unit !== 'bodyweight'
  });

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
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'box-shadow 0.2s ease'
    }}>
      {/* Header - Exercise name and planned info on one line */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{ 
          margin: 0,
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#1e293b',
          letterSpacing: '-0.025em'
        }}>
          {exercise.name}
        </h4>
        <div style={{ 
          fontSize: '0.875rem', 
          color: '#64748b',
          display: 'flex',
          gap: '16px',
          fontWeight: 500
        }}>
          <span>{formatPlannedDisplay()}</span>
          {exercise.planned.weight && <span>{formatWeightDisplay()}</span>}
          {exercise.planned.equipment && <span>{exercise.planned.equipment}</span>}
        </div>
      </div>

      {/* Description if exists - compact */}
      {exercise.description && (
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#64748b',
          margin: '0 0 16px 0',
          fontStyle: 'italic',
          lineHeight: '1.5'
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
      <div style={{ marginBottom: '20px' }}>
        {/* Headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: (() => {
            const isUnilateral = exercise.planned.isUnilateral;
            // Always show weight fields unless explicitly bodyweight
            const hasWeight = !exercise.planned.weight || exercise.planned.weight.unit !== 'bodyweight';
            
            if (isUnilateral && hasWeight) {
              return '40px 90px 70px 90px 70px 50px'; // Set, Left Reps, Left Weight, Right Reps, Right Weight, Done
            } else if (isUnilateral) {
              return '40px 100px 100px 50px'; // Set, Left Reps, Right Reps, Done
            } else if (hasWeight) {
              return '40px 100px 100px 50px'; // Set, Reps/Time, Weight, Done
            } else {
              return '40px 1fr 50px'; // Set, Reps/Time, Done
            }
          })(),
          gap: '8px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: '#475569',
          padding: '8px 0',
          borderBottom: '2px solid #e2e8f0'
        }}>
          <div>Set</div>
          {exercise.planned.isUnilateral ? (
            (!exercise.planned.weight || exercise.planned.weight.unit !== 'bodyweight') ? (
              <>
                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>LEFT</div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                    {exercise.planned.unit === 'reps' ? 'Reps' : 'Time'}
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Weight</div>
                  <div style={{ color: '#64748b', fontSize: '0.65rem' }}>({exercise.planned.weight?.unit || 'lb'})</div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>RIGHT</div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                    {exercise.planned.unit === 'reps' ? 'Reps' : 'Time'}
                  </div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Weight</div>
                  <div style={{ color: '#64748b', fontSize: '0.65rem' }}>({exercise.planned.weight?.unit || 'lb'})</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.75rem' }}>LEFT</div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                    {exercise.planned.unit === 'reps' ? 'Reps' : 'Time'}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.75rem' }}>RIGHT</div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                    {exercise.planned.unit === 'reps' ? 'Reps' : 'Time'}
                  </div>
                </div>
              </>
            )
          ) : (
            <>
              <div style={{ textAlign: 'center' }}>
                <div>{exercise.planned.unit === 'reps' ? 'Reps' : 'Time'}</div>
              </div>
              {(!exercise.planned.weight || exercise.planned.weight.unit !== 'bodyweight') && (
                <div style={{ textAlign: 'center' }}>
                  <div>Weight</div>
                  <div style={{ color: '#64748b', fontSize: '0.7rem' }}>({exercise.planned.weight?.unit || 'lb'})</div>
                </div>
              )}
            </>
          )}
          <div>Done</div>
        </div>

        {/* Set rows */}
        {exercise.planned.sets.map((plannedValue, index) => (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: (() => {
              const isUnilateral = exercise.planned.isUnilateral;
              // Always show weight fields unless explicitly bodyweight
              const hasWeight = !exercise.planned.weight || exercise.planned.weight.unit !== 'bodyweight';
              
              if (isUnilateral && hasWeight) {
                return '40px 90px 70px 90px 70px 50px'; // Set, Left Reps, Left Weight, Right Reps, Right Weight, Done
              } else if (isUnilateral) {
                return '40px 100px 100px 50px'; // Set, Left Reps, Right Reps, Done
              } else if (hasWeight) {
                return '40px 100px 100px 50px'; // Set, Reps/Time, Weight, Done
              } else {
                return '40px 1fr 50px'; // Set, Reps/Time, Done
              }
            })(),
            gap: '8px',
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>{index + 1}</div>
            
            {exercise.planned.isUnilateral ? (
              (!exercise.planned.weight || exercise.planned.weight.unit !== 'bodyweight') ? (
                <>
                  {/* Left Reps/Duration */}
                  <input
                    type="text"
                    placeholder={plannedValue.toString()}
                    value={
                      exercise.planned.unit === 'reps' 
                        ? formData.sets[index]?.leftReps || ''
                        : formData.sets[index]?.leftDuration || ''
                    }
                    onChange={(e) => onSetChange(index, exercise.planned.unit === 'reps' ? 'leftReps' : 'leftDuration', e.target.value)}
                    onBlur={(e) => onAutoSave && onAutoSave(index, exercise.planned.unit === 'reps' ? 'leftReps' : 'leftDuration', e.target.value)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      fontSize: '0.875rem',
                      height: '36px',
                      backgroundColor: '#fff',
                      transition: 'border-color 0.2s ease',
                      textAlign: 'left'
                    }}
                  />
                  
                  {/* Left Weight */}
                  <input
                    type="text"
                    placeholder={exercise.planned.weight?.amount?.toString() || 'Weight'}
                    value={formData.sets[index]?.leftWeight?.amount || ''}
                    onChange={(e) => onSetChange(index, 'leftWeight', e.target.value ? { amount: parseFloat(e.target.value) || 0, unit: exercise.planned.weight?.unit || 'lb' } : undefined)}
                    onBlur={(e) => onAutoSave && onAutoSave(index, 'leftWeight', e.target.value ? { amount: parseFloat(e.target.value) || 0, unit: exercise.planned.weight?.unit || 'lb' } : undefined)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      fontSize: '0.875rem',
                      height: '36px',
                      backgroundColor: '#fff',
                      transition: 'border-color 0.2s ease',
                      textAlign: 'left'
                    }}
                  />
                  
                  {/* Right Reps/Duration */}
                  <input
                    type="text"
                    placeholder={plannedValue.toString()}
                    value={
                      exercise.planned.unit === 'reps' 
                        ? formData.sets[index]?.rightReps || ''
                        : formData.sets[index]?.rightDuration || ''
                    }
                    onChange={(e) => onSetChange(index, exercise.planned.unit === 'reps' ? 'rightReps' : 'rightDuration', e.target.value)}
                    onBlur={(e) => onAutoSave && onAutoSave(index, exercise.planned.unit === 'reps' ? 'rightReps' : 'rightDuration', e.target.value)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      fontSize: '0.875rem',
                      height: '36px',
                      backgroundColor: '#fff',
                      transition: 'border-color 0.2s ease',
                      textAlign: 'left'
                    }}
                  />
                  
                  {/* Right Weight */}
                  <input
                    type="text"
                    placeholder={exercise.planned.weight?.amount?.toString() || 'Weight'}
                    value={formData.sets[index]?.rightWeight?.amount || ''}
                    onChange={(e) => onSetChange(index, 'rightWeight', e.target.value ? { amount: parseFloat(e.target.value) || 0, unit: exercise.planned.weight?.unit || 'lb' } : undefined)}
                    onBlur={(e) => onAutoSave && onAutoSave(index, 'rightWeight', e.target.value ? { amount: parseFloat(e.target.value) || 0, unit: exercise.planned.weight?.unit || 'lb' } : undefined)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 8px',
                      fontSize: '0.875rem',
                      height: '36px',
                      backgroundColor: '#fff',
                      transition: 'border-color 0.2s ease',
                      textAlign: 'left'
                    }}
                  />
                </>
              ) : (
                <>
                  {/* Left Reps/Duration - no weight */}
                  <input
                    type="text"
                    placeholder={plannedValue.toString()}
                    value={
                      exercise.planned.unit === 'reps' 
                        ? formData.sets[index]?.leftReps || ''
                        : formData.sets[index]?.leftDuration || ''
                    }
                    onChange={(e) => onSetChange(index, exercise.planned.unit === 'reps' ? 'leftReps' : 'leftDuration', e.target.value)}
                    onBlur={(e) => onAutoSave && onAutoSave(index, exercise.planned.unit === 'reps' ? 'leftReps' : 'leftDuration', e.target.value)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      height: '36px',
                      backgroundColor: '#fff',
                      transition: 'border-color 0.2s ease',
                      textAlign: 'left'
                    }}
                  />
                  
                  {/* Right Reps/Duration - no weight */}
                  <input
                    type="text"
                    placeholder={plannedValue.toString()}
                    value={
                      exercise.planned.unit === 'reps' 
                        ? formData.sets[index]?.rightReps || ''
                        : formData.sets[index]?.rightDuration || ''
                    }
                    onChange={(e) => onSetChange(index, exercise.planned.unit === 'reps' ? 'rightReps' : 'rightDuration', e.target.value)}
                    onBlur={(e) => onAutoSave && onAutoSave(index, exercise.planned.unit === 'reps' ? 'rightReps' : 'rightDuration', e.target.value)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      height: '36px',
                      backgroundColor: '#fff',
                      transition: 'border-color 0.2s ease',
                      textAlign: 'left'
                    }}
                  />
                </>
              )
            ) : (
              <>
                {/* Bilateral exercise - reps/time input */}
                <input
                  type="text"
                  placeholder={plannedValue.toString()}
                  value={formData.sets[index]?.reps || formData.sets[index]?.duration || ''}
                  onChange={(e) => onSetChange(index, exercise.planned.unit === 'reps' ? 'reps' : 'duration', e.target.value)}
                  onBlur={(e) => onAutoSave && onAutoSave(index, exercise.planned.unit === 'reps' ? 'reps' : 'duration', e.target.value)}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.875rem',
                    height: '36px',
                    backgroundColor: '#fff',
                    transition: 'border-color 0.2s ease',
                    textAlign: 'center'
                  }}
                />
                
                {/* Weight input for bilateral exercises */}
                {(!exercise.planned.weight || exercise.planned.weight.unit !== 'bodyweight') && (
                  <input
                    type="text"
                    placeholder={exercise.planned.weight?.amount?.toString() || 'Weight'}
                    value={formData.sets[index]?.weight?.amount || ''}
                    onChange={(e) => onSetChange(index, 'weight', e.target.value ? { amount: parseFloat(e.target.value) || 0, unit: exercise.planned.weight?.unit || 'lb' } : undefined)}
                    onBlur={(e) => onAutoSave && onAutoSave(index, 'weight', e.target.value ? { amount: parseFloat(e.target.value) || 0, unit: exercise.planned.weight?.unit || 'lb' } : undefined)}
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.875rem',
                      height: '36px',
                      backgroundColor: '#fff',
                      transition: 'border-color 0.2s ease',
                      textAlign: 'left'
                    }}
                  />
                )}
              </>
            )}
            
            <button
              onClick={() => handleSetComplete(index)}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                fontSize: '0.875rem',
                height: '36px',
                width: '36px',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              ✓
            </button>
          </div>
        ))}
      </div>

      {/* Complete and Notes buttons - right-aligned */}
      <div style={{ textAlign: 'right', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={openNotesPopup}
          style={{
            padding: '8px 16px',
            fontSize: '0.875rem',
            backgroundColor: formData.sets[0]?.notes ? '#2ea3f2' : '#64748b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            fontWeight: 500
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = formData.sets[0]?.notes ? '#1e90ff' : '#475569'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = formData.sets[0]?.notes ? '#2ea3f2' : '#64748b'}
        >
          {formData.sets[0]?.notes ? '📝' : '💬'} Notes
        </button>
        <button 
          onClick={onMarkAsCompleted}
          style={{
            padding: '8px 16px',
            fontSize: '0.875rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            fontWeight: 500
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
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