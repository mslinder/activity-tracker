import React from 'react';

interface CompactTabNavigationProps {
  currentView: 'activities' | 'exercises' | 'admin';
  onViewChange: (view: 'activities' | 'exercises' | 'admin') => void;
}

const CompactTabNavigation: React.FC<CompactTabNavigationProps> = ({
  currentView,
  onViewChange
}) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      background: '#fff',
      marginBottom: '8px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      overflow: 'hidden'
    }}>
      <button
        onClick={() => onViewChange('activities')}
        style={{
          padding: '8px',
          fontSize: '0.85rem',
          fontWeight: 500,
          backgroundColor: currentView === 'activities' ? '#2196F3' : '#f9f9f9',
          color: currentView === 'activities' ? 'white' : '#333',
          border: 'none',
          borderRight: '1px solid #ddd',
          cursor: 'pointer'
        }}
      >
        Activities
      </button>
      <button
        onClick={() => onViewChange('exercises')}
        style={{
          padding: '8px',
          fontSize: '0.85rem',
          fontWeight: 500,
          backgroundColor: currentView === 'exercises' ? '#2196F3' : '#f9f9f9',
          color: currentView === 'exercises' ? 'white' : '#333',
          border: 'none',
          borderRight: '1px solid #ddd',
          cursor: 'pointer'
        }}
      >
        Exercises
      </button>
      <button
        onClick={() => onViewChange('admin')}
        style={{
          padding: '8px',
          fontSize: '0.85rem',
          fontWeight: 500,
          backgroundColor: currentView === 'admin' ? '#2196F3' : '#f9f9f9',
          color: currentView === 'admin' ? 'white' : '#333',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Admin
      </button>
    </div>
  );
};

export default CompactTabNavigation;