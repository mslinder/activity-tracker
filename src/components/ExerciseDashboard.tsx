import React, { useState, useEffect } from 'react';
import { useWorkoutByDate, useWorkoutDates } from '../hooks/useExerciseHooks';
import { useExerciseForm } from '../hooks/useExerciseForm';
import DateNavigation from './DateNavigation';
import ExerciseCard from './ExerciseCard';
import WorkoutImporter from './WorkoutImporter';

const ExerciseDashboard = (): React.ReactElement => {
  console.log('ExerciseDashboard: Component starting...');
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showWorkoutImporter, setShowWorkoutImporter] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  const addDebugInfo = (info: string) => {
    console.log(info);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${info}`]);
  };
  
  const { workout, logs, loading, error, refresh: refreshWorkout } = useWorkoutByDate(selectedDate);
  const { dates, refresh: refreshDates } = useWorkoutDates();
  const {
    exerciseFormData,
    handleSetChange,
    markAsCompleted,
    autoSave
  } = useExerciseForm(workout, logs);

  useEffect(() => {
    addDebugInfo('ExerciseDashboard: Component mounted');
    addDebugInfo(`useWorkoutByDate complete - loading: ${loading}, error: ${error}, workout: ${workout?.name || 'none'}`);
    addDebugInfo(`useWorkoutDates complete - dates: ${dates?.length || 0}`);
    addDebugInfo(`useExerciseForm complete - exercises: ${Object.keys(exerciseFormData).length}`);
  }, [loading, error, workout?.name, dates?.length, Object.keys(exerciseFormData).length]);

  const goToPreviousDay = () => {
    if (!dates || dates.length === 0) return;
    
    const currentIndex = dates.findIndex(
      date => date.toDateString() === selectedDate.toDateString()
    );
    
    if (currentIndex > 0) {
      setSelectedDate(dates[currentIndex - 1]);
    } else if (currentIndex === -1 && dates.length > 0) {
      const previousDates = dates.filter(date => date < selectedDate);
      if (previousDates.length > 0) {
        setSelectedDate(previousDates[previousDates.length - 1]);
      }
    }
  };

  const goToNextDay = () => {
    if (!dates || dates.length === 0) return;
    
    const currentIndex = dates.findIndex(
      date => date.toDateString() === selectedDate.toDateString()
    );
    
    if (currentIndex !== -1 && currentIndex < dates.length - 1) {
      setSelectedDate(dates[currentIndex + 1]);
    } else if (currentIndex === -1) {
      const nextDates = dates.filter(date => date > selectedDate);
      if (nextDates.length > 0) {
        setSelectedDate(nextDates[0]);
      }
    } else if (currentIndex === dates.length - 1) {
      // Create tomorrow's date in local timezone
      const tomorrow = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
      setSelectedDate(tomorrow);
    }
  };

  const handleDataRefresh = () => {
    refreshWorkout();
    refreshDates();
  };
  

  
  
  if (loading) {
    return <div>Loading workout data...</div>;
  }
  
  if (error) {
    return <div>Error loading workout data: {error}</div>;
  }
  
  try {
    return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Exercise Tracker</h2>
      
      {/* Debug Info Panel - Remove this after fixing */}
      <details style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', fontSize: '12px' }}>
        <summary>Debug Info (Click to expand)</summary>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {debugInfo.map((info, index) => (
            <div key={index}>{info}</div>
          ))}
        </div>
      </details>
      
      {/* Import Workouts Section */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setShowWorkoutImporter(!showWorkoutImporter)}
          style={{
            padding: '8px 15px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showWorkoutImporter ? 'Hide Importer' : 'Import Workouts'}
        </button>
        
        {showWorkoutImporter && (
          <WorkoutImporter 
            onImportComplete={() => {
              setShowWorkoutImporter(false);
              handleDataRefresh();
            }} 
          />
        )}
      </div>
      
      <DateNavigation
        selectedDate={selectedDate}
        availableDates={dates || []}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
      />
      
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
          
          <div>
            {workout.exercises && workout.exercises.length > 0 ? (
              workout.exercises
                .sort((a, b) => a.order - b.order)
                .map(exercise => {
                  const formData = exerciseFormData[exercise.id];
                  if (!formData) return null;
                  
                  return (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      formData={formData}
                      onSetChange={(setIndex, field, value) => 
                        handleSetChange(exercise.id, setIndex, field, value)
                      }
                      onMarkAsCompleted={() => 
                        markAsCompleted(exercise.id)
                      }
                      onAutoSave={(setIndex, field, value) =>
                        autoSave(exercise.id, setIndex, field, value)
                      }
                    />
                  );
                })
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

    </div>
    );
  } catch (renderError) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h3>Render Error</h3>
        <p>Error: {renderError instanceof Error ? renderError.message : String(renderError)}</p>
        <details>
          <summary>Debug Info</summary>
          {debugInfo.map((info, index) => (
            <div key={index}>{info}</div>
          ))}
        </details>
      </div>
    );
  }
};

export default ExerciseDashboard;
