import React from 'react';

interface CompactQuickActionsProps {
  onOpenCoffeeModal: () => void;
  onOpenAnxietyModal: () => void;
}

const CompactQuickActions: React.FC<CompactQuickActionsProps> = ({
  onOpenCoffeeModal,
  onOpenAnxietyModal
}) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '12px',
      background: '#fff',
      marginBottom: '8px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px'
      }}>
        <button
          onClick={onOpenCoffeeModal}
          style={{
            padding: '6px 8px',
            fontSize: '0.8rem',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          ☕ Add Coffee
        </button>
        <button
          onClick={onOpenAnxietyModal}
          style={{
            padding: '6px 8px',
            fontSize: '0.8rem',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          💭 Add Thought
        </button>
      </div>
    </div>
  );
};

export default CompactQuickActions;