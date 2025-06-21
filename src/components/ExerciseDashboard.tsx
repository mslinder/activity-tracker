import React, { useState, useEffect } from 'react';
import { useWorkoutByDate, useWorkoutDates } from '../hooks/useExerciseHooks';
import type { ExerciseLog, SetEntry } from '../services/exerciseService';
import { exerciseService } from '../services/exerciseService';

interface ExerciseFormData {
  sets: SetEntry[];
  comments: string;
  completed: 'full' | 'partial' | 'none';
}

const ExerciseDashboard = (): React.ReactElement => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { workout, logs, loading, error } = useWorkoutByDate(selectedDate);
  const { dates } = useWorkoutDates();
  
  // Track form data for each exercise
  const [exerciseFormData, setExerciseFormData] = useState<Record<string, ExerciseFormData>>({});
  
  // State for tracking success feedback
  const [savedExerciseIds, setSavedExerciseIds] = useState<string[]>([]);

  // State for tracking loading states per exercise
  const [savingExerciseIds, setSavingExerciseIds] = useState<string[]>([]);

  // Date formatting is handled inline in the component

  // Navigate to previous day with workout
  const goToPreviousDay = () => {
    if (dates.length === 0) return;
    
    const currentIndex = dates.findIndex(
      date => date.toDateString() === selectedDate.toDateString()
    );
    
    if (currentIndex > 0) {
      setSelectedDate(dates[currentIndex - 1]);
    } else if (currentIndex === -1 && dates.length > 0) {
      // If current date is not in the list, find the closest previous date
      const previousDates = dates.filter(date => date < selectedDate);
      if (previousDates.length > 0) {
        setSelectedDate(previousDates[previousDates.length - 1]);
      }
    }
  };

  // Navigate to next day with workout
  const goToNextDay = () => {
    if (dates.length === 0) return;
    
    const currentIndex = dates.findIndex(
      date => date.toDateString() === selectedDate.toDateString()
    );
    
    if (currentIndex !== -1 && currentIndex < dates.length - 1) {
      // If current date is in the list and not the last one, go to next date in list
      setSelectedDate(dates[currentIndex + 1]);
    } else if (currentIndex === -1) {
      // If current date is not in the list, find the closest next date
      const nextDates = dates.filter(date => date > selectedDate);
      if (nextDates.length > 0) {
        setSelectedDate(nextDates[0]);
      }
    } else if (currentIndex === dates.length - 1) {
      // If we're on the last date in the list, go to tomorrow
      const tomorrow = new Date(selectedDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow);
    }
  };

  // Initialize form data when workout or logs change
  useEffect(() => {
    console.log('useEffect triggered with workout:', workout);
    console.log('useEffect triggered with logs:', logs);
    
    if (workout && logs) {
      console.log(`Processing workout: ${workout.name} with ${workout.exercises?.length || 0} exercises`);
      
      // Check if exercises array exists and has items
      if (!workout.exercises || workout.exercises.length === 0) {
        console.error('Workout has no exercises array or empty array:', workout);
        return;
      }
      
      const newFormData: Record<string, ExerciseFormData> = {};
      
      workout.exercises.forEach(exercise => {
        console.log('Processing exercise:', exercise);
        
        // Check if exercise has required properties
        if (!exercise.id || !exercise.planned) {
          console.error('Exercise missing required properties:', exercise);
          return;
        }
        
        const log = logs.find(log => log.exerciseId === exercise.id);
        console.log('Found log for exercise:', log);
        
        // Parse planned sets from the string (e.g., "3 x 10" becomes 3 sets)
        const plannedSetsMatch = exercise.planned.setsRepsDuration?.match(/^(\d+)\s*x/i);
        const numSets = plannedSetsMatch ? parseInt(plannedSetsMatch[1]) : 1;
        console.log(`Parsed ${numSets} sets from planned data:`, exercise.planned.setsRepsDuration);
        
        if (log && log.actual.sets && log.actual.sets.length > 0) {
          // Use existing logged sets
          console.log('Using existing logged sets:', log.actual.sets);
          
          // Determine completion status based on existing data
          let completionStatus: 'full' | 'partial' | 'none' = 'none';
          
          // Check if all sets have data
          const allSetsHaveData = log.actual.sets.every(set => 
            (set.reps !== undefined || set.duration !== undefined)
          );
          
          if (allSetsHaveData) {
            completionStatus = 'full';
          } else if (log.actual.sets.some(set => 
            (set.reps !== undefined || set.duration !== undefined)
          )) {
            completionStatus = 'partial';
          }
          
          newFormData[exercise.id] = {
            sets: [...log.actual.sets],
            comments: log.comments || '',
            completed: completionStatus
          };
        } else {
          // Create empty sets based on planned sets count
          console.log(`Creating ${numSets} empty sets for exercise:`, exercise.name);
          
          newFormData[exercise.id] = {
            sets: Array(numSets).fill(null).map(() => ({
              reps: undefined,
              duration: undefined,
              weight: undefined
            })),
            comments: log?.comments || '',
            completed: 'none'
          };
        }
      });
      
      console.log('Setting form data:', newFormData);
      setExerciseFormData(newFormData);
    } else {
      console.log('No workout or logs available to process');
    }
  }, [workout, logs]);
  
  // Find log for a specific exercise
  const findLogForExercise = (exerciseId: string): ExerciseLog | undefined => {
    return logs.find(log => log.exerciseId === exerciseId);
  };
  
  // Handle changes to set values
  const handleSetChange = (exerciseId: string, setIndex: number, field: keyof SetEntry, value: string | number | undefined) => {
    setExerciseFormData(prev => {
      const updatedSets = [...prev[exerciseId].sets];
      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: value
      };
      
      // Determine completion status based on input
      let completionStatus = prev[exerciseId].completed;
      
      // If any set has data, at least mark as partial
      if (updatedSets.some(set => set.reps !== undefined || set.duration !== undefined || set.weight !== undefined)) {
        // Check if all sets have data
        const allSetsHaveData = updatedSets.every(set => 
          (set.reps !== undefined || set.duration !== undefined)
        );
        
        completionStatus = allSetsHaveData ? 'full' : 'partial';
      } else {
        completionStatus = 'none';
      }
      
      return {
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          sets: updatedSets,
          completed: completionStatus
        }
      };
    });
  };
  
  // Handle comments change
  const handleCommentsChange = (exerciseId: string, comments: string) => {
    setExerciseFormData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        comments
      }
    }));
  };
  
  // Handle completion status change
  const handleCompletionChange = (exerciseId: string, status: 'full' | 'partial' | 'none') => {
    setExerciseFormData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        completed: status
      }
    }));
    
    // Auto-save when completion status changes
    saveExerciseLog(exerciseId);
  };
  
  // Show temporary success message
  const showSuccessFeedback = (exerciseId: string) => {
    setSavedExerciseIds(prev => [...prev, exerciseId]);
    setTimeout(() => {
      setSavedExerciseIds(prev => prev.filter(id => id !== exerciseId));
    }, 3000); // Hide after 3 seconds
  };
  
  // Save exercise log
  const saveExerciseLog = async (exerciseId: string) => {
    if (!workout) return;
    
    const formData = exerciseFormData[exerciseId];
    const existingLog = findLogForExercise(exerciseId);
    
    try {
      // Mark exercise as saving
      setSavingExerciseIds(prev => [...prev, exerciseId]);
      
      if (existingLog) {
        // Update existing log
        await exerciseService.updateExerciseLog(existingLog.id!, {
          actual: {
            sets: formData.sets,
            // Generate legacy format for backward compatibility
            setsRepsDuration: formData.sets.map((set, i) => 
              `Set ${i+1}: ${set.reps || ''}${set.duration ? ` ${set.duration}` : ''}`
            ).join(', '),
            weight: formData.sets.map(set => set.weight).filter(Boolean).join(', ')
          },
          comments: formData.comments
        });
      } else {
        await exerciseService.logExercise({
          workoutId: workout.id,
          exerciseId,
          loggedAt: new Date(),
          actual: {
            sets: formData.sets,
            // Generate legacy format for backward compatibility
            setsRepsDuration: formData.sets.map((set, i) => 
              `Set ${i+1}: ${set.reps || ''}${set.duration ? ` ${set.duration}` : ''}`
            ).join(', '),
            weight: formData.sets.map(set => set.weight).filter(Boolean).join(', ')
          },
          comments: formData.comments
        });
      }
      
      // Show success feedback
      const exerciseItem = workout.exercises.find(ex => ex.id === exerciseId);
      console.log(`Exercise ${exerciseItem?.name || exerciseId} saved successfully`);
      showSuccessFeedback(exerciseId);
      
      // Remove from saving state
      setSavingExerciseIds(prev => prev.filter(id => id !== exerciseId));
      
    } catch (error) {
      console.error('Error saving exercise log:', error);
    } finally {
      // Reset saving state
      setSavingExerciseIds(prev => prev.filter(id => id !== exerciseId));
    }
  };
  
  // Mark exercise as completed with planned values
  const markAsCompleted = (exerciseId: string, status: 'full' | 'partial' | 'none' = 'full') => {
    if (!workout) return;
    
    const exerciseItem = workout.exercises.find(ex => ex.id === exerciseId);
    if (!exerciseItem) return;
    
    // Parse planned sets and reps
    const plannedSetsReps = exerciseItem.planned?.setsRepsDuration?.split('x').map(s => s.trim()) || [];
    const plannedSets = parseInt(plannedSetsReps[0]) || 0;
    const plannedReps = parseInt(plannedSetsReps[1]) || 0;
    
    // Create sets array with planned values
    const setsArray: SetEntry[] = Array(plannedSets).fill(0).map(() => ({
      reps: plannedReps,
      weight: exerciseItem.planned?.weight,
      duration: undefined
    }));
    
    // Update form data with planned values
    setExerciseFormData(prev => ({
      ...prev,
      [exerciseId]: {
        sets: setsArray,
        comments: 'Completed as planned',
        completed: status
      }
    }));
    
    // Save the exercise log immediately
    saveExerciseLog(exerciseId);
  };

  // Add debugging logs
  console.log('Current state:', {
    selectedDate: selectedDate.toISOString(),
    workout,
    loading,
    error,
    exerciseFormData: Object.keys(exerciseFormData).length
  });
  
  if (loading) {
    return <div>Loading workout data...</div>;
  }
  
  if (error) {
    return <div>Error loading workout data: {error}</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Exercise Tracker</h2>
      
      {/* Date Navigation */}
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
          onClick={goToPreviousDay}
          style={{
            padding: '8px 12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← {dates.length > 0 ? 'Previous' : ''}
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
          onClick={goToNextDay}
          style={{
            padding: '8px 12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {dates.length > 0 ? 'Next' : ''} →
        </button>
      </div>
      
      {/* Workout Display */}
      {workout ? (
        <div>
          <h3 style={{ 
            marginBottom: '20px',
            padding: '10px',
            backgroundColor: '#2196f3',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#fff'
          }}>
            {workout.name}
          </h3>
          
          {/* Exercise List */}
          <div>
            {workout.exercises && workout.exercises.length > 0 ? (
              workout.exercises
                .sort((a, b) => a.order - b.order)
                .map(exercise => (
                  <div
                    key={exercise.id}
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
                      cursor: 'pointer',
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
                    <strong>Planned:</strong> {exercise.planned.setsRepsDuration}
                  </div>
                  
                  {exercise.planned.weight && (
                    <div style={{ marginBottom: '10px', color: '#000' }}>
                      <strong>Weight:</strong> {exercise.planned.weight}
                    </div>
                  )}
                  
                  {/* Show log if it exists */}
                  {findLogForExercise(exercise.id) && (
                    <div style={{ 
                      backgroundColor: '#bbdefb', 
                      padding: '10px', 
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#000' }}>Logged:</div>
                      <div style={{ color: '#000' }}>
                        {findLogForExercise(exercise.id)?.actual.setsRepsDuration}
                        {findLogForExercise(exercise.id)?.actual.weight && 
                          ` (${findLogForExercise(exercise.id)?.actual.weight})`}
                      </div>
                      {findLogForExercise(exercise.id)?.comments && (
                        <div style={{ marginTop: '5px', color: '#000' }}>
                          <em>Comments: {findLogForExercise(exercise.id)?.comments}</em>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Inline exercise logging form */}
                  {exerciseFormData[exercise.id] && (
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
                          <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>Reps</div>
                          <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>Weight</div>
                          <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>Duration</div>
                        </div>
                        
                        {exerciseFormData[exercise.id].sets.map((set, index) => (
                          <div 
                            key={index}
                            style={{
                              display: 'flex',
                              gap: '10px',
                              marginBottom: '10px',
                              alignItems: 'center',
                              backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff',
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
                              {index + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <input
                                type="number"
                                value={set.reps || ''}
                                onChange={(e) => handleSetChange(
                                  exercise.id,
                                  index,
                                  'reps',
                                  e.target.value ? parseInt(e.target.value) : undefined
                                )}
                                placeholder="Reps"
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #2196f3',
                                  borderRadius: '4px',
                                  backgroundColor: '#ffffff'
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <input
                                type="text"
                                value={set.weight || ''}
                                onChange={(e) => handleSetChange(
                                  exercise.id,
                                  index,
                                  'weight',
                                  e.target.value
                                )}
                                placeholder="Weight"
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #4caf50',
                                  borderRadius: '4px',
                                  backgroundColor: '#ffffff'
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <input
                                type="text"
                                value={set.duration || ''}
                                onChange={(e) => handleSetChange(
                                  exercise.id,
                                  index,
                                  'duration',
                                  e.target.value
                                )}
                                placeholder="Duration"
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #ff9800',
                                  borderRadius: '4px',
                                  backgroundColor: '#ffffff'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#000' }}>
                          Notes
                        </label>
                        <textarea
                          value={exerciseFormData[exercise.id].comments}
                          onChange={(e) => handleCommentsChange(exercise.id, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #757575',
                            borderRadius: '4px',
                            minHeight: '80px',
                            backgroundColor: '#ffffff'
                          }}
                        />
                      </div>
                      
                      <div style={{ marginTop: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#000' }}>
                          Completion Status
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#000' }}>
                            <input
                              type="radio"
                              name={`completion-${exercise.id}`}
                              checked={exerciseFormData[exercise.id].completed === 'full'}
                              onChange={() => handleCompletionChange(exercise.id, 'full')}
                              style={{ marginRight: '5px' }}
                            />
                            Fully Completed
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#000' }}>
                            <input
                              type="radio"
                              name={`completion-${exercise.id}`}
                              checked={exerciseFormData[exercise.id].completed === 'partial'}
                              onChange={() => handleCompletionChange(exercise.id, 'partial')}
                              style={{ marginRight: '5px' }}
                            />
                            Partially Completed
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#000' }}>
                            <input
                              type="radio"
                              name={`completion-${exercise.id}`}
                              checked={exerciseFormData[exercise.id].completed === 'none'}
                              onChange={() => handleCompletionChange(exercise.id, 'none')}
                              style={{ marginRight: '5px' }}
                            />
                            Not Completed
                          </label>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                        <button 
                          onClick={() => markAsCompleted(exercise.id)}
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
                        <button 
                          onClick={() => saveExerciseLog(exercise.id)}
                          disabled={savingExerciseIds.includes(exercise.id)}
                          style={{
                            backgroundColor: '#2196f3',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: savingExerciseIds.includes(exercise.id) ? 'default' : 'pointer',
                            fontSize: '14px',
                            opacity: savingExerciseIds.includes(exercise.id) ? 0.7 : 1
                          }}
                        >
                          {savingExerciseIds.includes(exercise.id) ? 'Saving...' : 'Save'}
                        </button>
                        {savedExerciseIds.includes(exercise.id) && (
                          <span style={{ color: '#4caf50', alignSelf: 'center', fontWeight: 'bold' }}>
                            Saved!
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Quick action button for exercises without logs */}
                  {!findLogForExercise(exercise.id) && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                      <button 
                        onClick={() => markAsCompleted(exercise.id)}
                        style={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          cursor: 'pointer'
                        }}
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No exercises in this workout.</p>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#e0e0e0',
            borderRadius: '8px'
          }}
        >
          <p>No workout planned for this date.</p>
        </div>
      )}

      {/* No modal needed - inputs are always visible */}
    </div>
  );
};

export default ExerciseDashboard;
