import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  className, 
  style, 
  padding = 'medium' 
}) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: '0' };
      case 'small':
        return { padding: '8px' };
      case 'medium':
        return { padding: '15px' };
      case 'large':
        return { padding: '24px' };
      default:
        return { padding: '15px' };
    }
  };

  const baseStyles: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e0e0e0',
    ...getPaddingStyles()
  };

  return (
    <div 
      className={className}
      style={{ ...baseStyles, ...style }}
    >
      {title && (
        <h4 style={{ 
          marginTop: 0, 
          marginBottom: '15px', 
          color: '#000',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          {title}
        </h4>
      )}
      {children}
    </div>
  );
};

export default Card;