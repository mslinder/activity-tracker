import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  disabled,
  style,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none'
        };
      case 'secondary':
        return {
          backgroundColor: '#757575',
          color: 'white',
          border: 'none'
        };
      case 'success':
        return {
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none'
        };
      case 'warning':
        return {
          backgroundColor: '#ff9800',
          color: 'white',
          border: 'none'
        };
      case 'danger':
        return {
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none'
        };
      default:
        return {
          backgroundColor: '#2196f3',
          color: 'white',
          border: 'none'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '6px 12px',
          fontSize: '12px'
        };
      case 'medium':
        return {
          padding: '8px 16px',
          fontSize: '14px'
        };
      case 'large':
        return {
          padding: '12px 24px',
          fontSize: '16px'
        };
      default:
        return {
          padding: '8px 16px',
          fontSize: '14px'
        };
    }
  };

  const baseStyles = {
    borderRadius: '4px',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    transition: 'all 0.2s ease',
    fontWeight: 'normal' as const,
    ...getVariantStyles(),
    ...getSizeStyles()
  };

  return (
    <button
      style={{ ...baseStyles, ...style }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;