import React from 'react';
import Logo from './Logo';

interface SidebarProps {
  currentView: 'activities' | 'exercises' | 'admin';
  onViewChange: (view: 'activities' | 'exercises' | 'admin') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const sidebarWidth = isCollapsed ? '60px' : '200px';
  
  const navItems = [
    { key: 'activities', label: 'Activities', icon: '📊' },
    { key: 'exercises', label: 'Exercises', icon: '💪' },
    { key: 'admin', label: 'Admin', icon: '⚙️' }
  ] as const;

  return (
    <div style={{
      width: sidebarWidth,
      height: '100vh',
      backgroundColor: '#fff',
      borderRight: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      transition: 'width 0.3s ease',
      zIndex: 1000,
      boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
      overflowY: 'auto'
    }}>
      {/* Header with Logo and Toggle */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between'
      }}>
        <button
          onClick={onToggleCollapse}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px',
            borderRadius: '8px',
            transition: 'background-color 0.2s ease'
          }}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Logo size={28} />
          {!isCollapsed && (
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#1f2937'
            }}>
              Activity Tracker
            </span>
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav style={{
        flex: 1,
        padding: '16px 0'
      }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onViewChange(item.key)}
            style={{
              width: '100%',
              padding: isCollapsed ? '12px 0' : '12px 16px',
              border: 'none',
              backgroundColor: currentView === item.key ? '#f3f4f6' : 'transparent',
              color: currentView === item.key ? '#2196F3' : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              fontSize: '0.9rem',
              fontWeight: currentView === item.key ? 600 : 400,
              borderLeft: currentView === item.key ? '3px solid #2196F3' : '3px solid transparent',
              transition: 'all 0.2s ease'
            }}
            title={isCollapsed ? item.label : undefined}
          >
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

    </div>
  );
};

export default Sidebar;