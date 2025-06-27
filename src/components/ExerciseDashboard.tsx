import React, { useState } from 'react';
import { useWorkoutByDate, useWorkoutDates } from '../hooks/useExerciseHooks';
import { useExerciseForm } from '../hooks/useExerciseForm';
import CompactDateNavigation from './CompactDateNavigation';
import CompactWorkoutHeader from './CompactWorkoutHeader';
import CompactExerciseCard from './CompactExerciseCard';
import { ContentSection, Card, FlexContainer } from './styled';

const ExerciseDashboard = (): React.ReactElement => {
  console.log('ExerciseDashboard: Component starting...');
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const { workout, logs, loading, error, refresh: refreshWorkout } = useWorkoutByDate(selectedDate);
  const { dates, refresh: refreshDates } = useWorkoutDates();
  const {
    exerciseFormData,
    handleSetChange,
    markAsCompleted,
    autoSave
  } = useExerciseForm(workout, logs);


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

  

  
  
  if (loading) {
    return (
      <ContentSection>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          color: '#64748b'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>Loading workout data...</p>
          </div>
        </div>
      </ContentSection>
    );
  }
  
  if (error) {
    return (
      <ContentSection style={{
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        border: '1px solid #fecaca'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          color: '#dc2626'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Error loading workout data</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>{error}</p>
          </div>
        </div>
      </ContentSection>
    );
  }
  
  try {
    return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px' }}>
      
      <CompactDateNavigation
        selectedDate={selectedDate}
        availableDates={dates || []}
        onPreviousDay={goToPreviousDay}
        onNextDay={goToNextDay}
      />
      
      {/* Workout Display */}
      {workout ? (
        <>
          <CompactWorkoutHeader workoutName={workout.name} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {workout.exercises && workout.exercises.length > 0 ? (
              workout.exercises
                .sort((a, b) => a.order - b.order)
                .map(exercise => {
                  const formData = exerciseFormData[exercise.id];
                  if (!formData) return null;
                  
                  return (
                    <CompactExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      formData={formData}
                      onSetChange={(setIndex, field, value) => 
                        handleSetChange(exercise.id, setIndex, field, value)
                      }
                      onMarkAsCompleted={() => 
                        markAsCompleted(exercise.id)
                      }
                      onSetCompleted={(setIndex) => 
                        console.log(`Exercise ${exercise.id}, Set ${setIndex + 1} completed`)
                      }
                    />
                  );
                })
            ) : (
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '16px',
                background: '#fff',
                textAlign: 'center',
                fontSize: '0.85rem',
                color: '#666'
              }}>
                No exercises in this workout
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '16px',
          background: '#fff',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#666'
        }}>
          📊 No workout planned for this date
        </div>
      )}

    </div>
    );
  } catch (renderError) {
    return (
      <ContentSection style={{
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        border: '1px solid #fecaca'
      }}>
        <div style={{ color: '#dc2626', textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚫</div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 600 }}>Render Error</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Error: {renderError instanceof Error ? renderError.message : String(renderError)}</p>
        </div>
      </ContentSection>
    );
  }
};

export default ExerciseDashboard;
