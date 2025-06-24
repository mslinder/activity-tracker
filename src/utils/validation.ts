import type { SetEntry } from '../services/exerciseService';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateSetEntry(set: SetEntry, setIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate reps
  if (set.reps !== undefined) {
    if (set.reps < 0) {
      errors.push({
        field: `set${setIndex}.reps`,
        message: 'Reps cannot be negative'
      });
    }
    if (set.reps > 999) {
      errors.push({
        field: `set${setIndex}.reps`,
        message: 'Reps cannot exceed 999'
      });
    }
  }
  
  // Validate weight
  if (set.weight !== undefined && set.weight.trim() !== '') {
    const weightPattern = /^[\d.]+\s*(lbs?|kg|pounds?)?$/i;
    if (!weightPattern.test(set.weight.trim())) {
      errors.push({
        field: `set${setIndex}.weight`,
        message: 'Weight must be a number optionally followed by lbs/kg'
      });
    }
  }
  
  // Validate duration
  if (set.duration !== undefined && set.duration.trim() !== '') {
    const durationPattern = /^(\d+:)?\d{1,2}:\d{2}$|^\d+\s*(s|sec|seconds?|m|min|minutes?|h|hr|hours?)$/i;
    if (!durationPattern.test(set.duration.trim())) {
      errors.push({
        field: `set${setIndex}.duration`,
        message: 'Duration must be in format MM:SS, HH:MM:SS, or number with unit (e.g., 30s, 5min)'
      });
    }
  }
  
  return errors;
}

export function validateExerciseForm(sets: SetEntry[], comments: string): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate all sets
  sets.forEach((set, index) => {
    errors.push(...validateSetEntry(set, index));
  });
  
  // Validate comments length
  if (comments.length > 500) {
    errors.push({
      field: 'comments',
      message: 'Comments cannot exceed 500 characters'
    });
  }
  
  // Check if at least one set has meaningful data
  const hasAnyData = sets.some(set => 
    set.reps !== undefined || 
    (set.duration !== undefined && set.duration.trim() !== '') ||
    (set.weight !== undefined && set.weight.trim() !== '')
  );
  
  if (!hasAnyData && comments.trim() === '') {
    errors.push({
      field: 'form',
      message: 'Please enter at least one set or add comments'
    });
  }
  
  return errors;
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  return `Multiple errors:\n${errors.map(e => `• ${e.message}`).join('\n')}`;
}