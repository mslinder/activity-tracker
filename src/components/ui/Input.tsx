import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  variant = 'default',
  label,
  error,
  fullWidth = false,
  style,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          border: '1px solid #4caf50',
          borderColor: '#4caf50'
        };
      case 'warning':
        return {
          border: '1px solid #ff9800',
          borderColor: '#ff9800'
        };
      case 'error':
        return {
          border: '1px solid #f44336',
          borderColor: '#f44336'
        };
      default:
        return {
          border: '1px solid #ccc',
          borderColor: '#ccc'
        };
    }
  };

  const baseStyles = {
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontSize: '14px',
    width: fullWidth ? '100%' : undefined,
    ...getVariantStyles()
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
      {label && (
        <label style={{ 
          fontSize: '14px', 
          fontWeight: 'bold', 
          color: '#000' 
        }}>
          {label}
        </label>
      )}
      <input
        style={{ ...baseStyles, ...style }}
        {...props}
      />
      {error && (
        <span style={{ 
          fontSize: '12px', 
          color: '#f44336',
          marginTop: '2px'
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;