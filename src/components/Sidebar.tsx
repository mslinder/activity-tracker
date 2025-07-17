import React from 'react';
import Logo from './Logo';

interface SidebarProps {
  currentView: 'exercises' | 'admin';
  onViewChange: (view: 'exercises' | 'admin') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const navItems = [
    { key: 'exercises', label: 'Exercises', icon: '💪' },
    { key: 'admin', label: 'Admin', icon: '⚙️' }
  ] as const;

  if (isCollapsed) {
    // Compact header bar with logo
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <button
          onClick={onToggleCollapse}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          title="Expand menu"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Logo size={28} />
          <span style={{
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#1f2937'
          }}>
            Activity Tracker
          </span>
        </button>
      </div>
    );
  }

  // Expanded state - full overlay sidebar
  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999
        }}
        onClick={onToggleCollapse}
      />
      
      {/* Sidebar */}
      <div style={{
        width: '250px',
        height: '100vh',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1000,
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
        overflowY: 'auto'
      }}>
        {/* Header with Logo and Title */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Logo size={32} />
            <span style={{
              fontSize: '1.2rem',
              fontWeight: 600,
              color: '#1f2937'
            }}>
              Activity Tracker
            </span>
          </div>
          
          <button
            onClick={onToggleCollapse}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              color: '#6b7280',
              fontSize: '1.2rem',
              transition: 'background-color 0.2s ease'
            }}
            title="Collapse menu"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{
          flex: 1,
          padding: '20px 0'
        }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onViewChange(item.key);
                onToggleCollapse(); // Auto-close after selection
              }}
              style={{
                width: '100%',
                padding: '16px 20px',
                border: 'none',
                backgroundColor: currentView === item.key ? '#f3f4f6' : 'transparent',
                color: currentView === item.key ? '#2196F3' : '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '1rem',
                fontWeight: currentView === item.key ? 600 : 400,
                borderLeft: currentView === item.key ? '4px solid #2196F3' : '4px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (currentView !== item.key) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== item.key) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;