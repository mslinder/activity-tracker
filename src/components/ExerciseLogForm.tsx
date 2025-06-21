import { useState } from 'react';
import type { Exercise, ExerciseLog } from '../services/exerciseService';
import { exerciseService } from '../services/exerciseService';

interface ExerciseLogFormProps {
  exercise: Exercise;
  workoutId: string;
  existingLog?: ExerciseLog;
  onClose: () => void;
  onSave: () => void;
}

const ExerciseLogForm: React.FC<ExerciseLogFormProps> = ({
  exercise,
  workoutId,
  existingLog,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<{
    setsRepsDuration: string;
    weight: string;
    comments: string;
  }>({
    setsRepsDuration: existingLog?.actual.setsRepsDuration || '',
    weight: existingLog?.actual.weight || '',
    comments: existingLog?.comments || ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, saveAndNext: boolean = false) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (existingLog) {
        // Update existing log
        await exerciseService.updateExerciseLog(existingLog.id!, {
          actual: {
            sets: [], // Add empty sets array to satisfy type requirement
            setsRepsDuration: formData.setsRepsDuration,
            weight: formData.weight
          },
          comments: formData.comments
        });
      } else {
        // Create new log
        await exerciseService.logExercise({
          exerciseId: exercise.id,
          workoutId,
          loggedAt: new Date(),
          actual: {
            sets: [], // Add empty sets array to satisfy type requirement
            setsRepsDuration: formData.setsRepsDuration,
            weight: formData.weight
          },
          comments: formData.comments
        });
      }
      
      onSave();
      
      // If saveAndNext, find the next exercise to log
      if (saveAndNext) {
        // This would need to be implemented with a callback to the parent component
        // For now, we'll just close the form
      }
    } catch (err) {
      console.error('Error saving exercise log:', err);
      setError('Failed to save exercise log');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ marginTop: 0 }}>{exercise.name}</h3>
        
        {exercise.description && (
          <div style={{ 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '0.9rem'
          }}>
            {exercise.description}
          </div>
        )}
        
        <div style={{ 
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: '#e0f7fa',
          borderRadius: '4px'
        }}>
          <div><strong>Planned:</strong> {exercise.planned.setsRepsDuration}</div>
          {exercise.planned.weight && (
            <div><strong>Planned Weight:</strong> {exercise.planned.weight}</div>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Actual Sets/Reps:
              <input
                type="text"
                name="setsRepsDuration"
                value={formData.setsRepsDuration}
                onChange={handleChange}
                placeholder="e.g., 3 x 10 reps"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Actual Weight:
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g., 10 lb dumbbell"
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              Comments:
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="How did it feel? Any notes?"
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  resize: 'vertical'
                }}
              />
            </label>
          </div>
          
          {error && (
            <div style={{ 
              color: 'red', 
              marginBottom: '15px',
              padding: '8px',
              backgroundColor: '#ffebee',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '8px 15px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={saving}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Save & Next
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExerciseLogForm;
