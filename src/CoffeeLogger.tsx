import React from 'react';

interface CoffeeLoggerProps {
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

const CoffeeLogger: React.FC<CoffeeLoggerProps> = ({
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
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '5px',
        width: '300px',
        maxWidth: '90%'
      }}>
        <h2 style={{ color: '#000' }}>Add Coffee</h2>
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#000', fontWeight: 'bold' }}>
              Coffee Type:
              <select 
                name="coffeeType" 
                value={coffeeForm.coffeeType}
                onChange={onFormChange}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #757575',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Espresso">Espresso</option>
                <option value="Cold Brew">Cold Brew</option>
                <option value="Pour Over">Pour Over</option>
              </select>
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#000', fontWeight: 'bold' }}>
              Amount:
              <input 
                type="number" 
                name="amount" 
                value={coffeeForm.amount}
                min="1"
                onChange={onFormChange}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #757575',
                  backgroundColor: '#ffffff'
                }}
              />
            </label>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#000', fontWeight: 'bold' }}>
              Time:
              <input 
                type="datetime-local" 
                value={formatDateTimeForInput(coffeeForm.timestamp)}
                onChange={onDateTimeChange}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #757575',
                  backgroundColor: '#ffffff'
                }}
              />
            </label>
          </div>
          
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                padding: '8px 15px',
                backgroundColor: '#e0e0e0',
                border: '1px solid #757575',
                color: '#000',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                padding: '8px 15px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoffeeLogger;
