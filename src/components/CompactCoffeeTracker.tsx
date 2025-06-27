import React from 'react';

interface CompactCoffeeTrackerProps {
  coffeeForm: {
    coffeeType: 'Espresso' | 'Cold Brew' | 'Pour Over';
    amount: number;
    timestamp: Date;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onDateTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  error: string;
  formatDateTimeForInput: (date: Date) => string;
}

const CompactCoffeeTracker: React.FC<CompactCoffeeTrackerProps> = ({
  coffeeForm,
  onFormChange,
  onDateTimeChange,
  onSubmit,
  onClose,
  error,
  formatDateTimeForInput
}) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      padding: '12px',
      marginBottom: '8px',
      background: '#fff'
    }}>
      <h3 style={{ 
        margin: '0 0 12px 0',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#333'
      }}>
        Add Coffee
      </h3>
      
      <form onSubmit={onSubmit}>
        {/* Single row for main inputs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 80px 1fr',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <select 
            name="coffeeType" 
            value={coffeeForm.coffeeType}
            onChange={onFormChange}
            style={{ 
              padding: '4px',
              fontSize: '0.85rem',
              border: '1px solid #ddd',
              borderRadius: '2px',
              height: '28px'
            }}
          >
            <option value="Espresso">Espresso</option>
            <option value="Cold Brew">Cold Brew</option>
            <option value="Pour Over">Pour Over</option>
          </select>
          
          <input 
            type="number" 
            name="amount" 
            value={coffeeForm.amount}
            min="1"
            placeholder="Amount"
            onChange={onFormChange}
            style={{ 
              padding: '4px',
              fontSize: '0.85rem',
              border: '1px solid #ddd',
              borderRadius: '2px',
              height: '28px'
            }}
          />
          
          <input 
            type="datetime-local" 
            value={formatDateTimeForInput(coffeeForm.timestamp)}
            onChange={onDateTimeChange}
            style={{ 
              padding: '4px',
              fontSize: '0.85rem',
              border: '1px solid #ddd',
              borderRadius: '2px',
              height: '28px'
            }}
          />
        </div>
        
        {error && <div style={{ color: 'red', fontSize: '0.8rem', marginBottom: '8px' }}>{error}</div>}
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{
              padding: '4px 8px',
              fontSize: '0.8rem',
              backgroundColor: '#ccc',
              color: '#333',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit"
            style={{
              padding: '4px 8px',
              fontSize: '0.8rem',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompactCoffeeTracker;