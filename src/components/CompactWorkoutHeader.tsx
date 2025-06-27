import React from 'react';

interface CompactWorkoutHeaderProps {
  workoutName: string;
}

const CompactWorkoutHeader: React.FC<CompactWorkoutHeaderProps> = ({ workoutName }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '8px 12px',
      background: '#fff',
      marginBottom: '8px',
      textAlign: 'center'
    }}>
      <div style={{
        fontWeight: 600,
        fontSize: '1rem',
        color: '#333'
      }}>
        {workoutName}
      </div>
    </div>
  );
};

export default CompactWorkoutHeader;