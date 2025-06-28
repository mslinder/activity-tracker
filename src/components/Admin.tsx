import React, { useState } from 'react';
import WorkoutImporter from './WorkoutImporter';
import ActivityManager from './ActivityManager';

const Admin = (): React.ReactElement => {
  const [showWorkoutImporter, setShowWorkoutImporter] = useState(false);

  const handleImportComplete = () => {
    setShowWorkoutImporter(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      
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
            onImportComplete={handleImportComplete}
          />
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Activity Management</h3>
        <ActivityManager />
      </div>
    </div>
  );
};

export default Admin;