import React from 'react';
import type { Activity, CoffeeActivity, AnxietyActivity } from '../firebase';

interface CompactActivityListProps {
  activities: Activity[];
}

const CompactActivityList: React.FC<CompactActivityListProps> = ({ activities }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      background: '#fff'
    }}>
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #eee',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#333'
      }}>
        Today's Activities ({activities.length})
      </div>
      
      {activities.length === 0 ? (
        <div style={{
          padding: '16px',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.85rem'
        }}>
          No activities logged today
        </div>
      ) : (
        <div>
          {activities.map((activity) => (
            <div key={activity.id} style={{
              padding: '8px 12px',
              borderBottom: activities.indexOf(activity) < activities.length - 1 ? '1px solid #f5f5f5' : 'none',
              display: 'grid',
              gridTemplateColumns: '20px 1fr auto',
              gap: '8px',
              alignItems: 'center'
            }}>
              {activity.type === 'coffee' && (
                <>
                  <span style={{ fontSize: '0.9rem' }}>☕</span>
                  <div>
                    <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                      {(activity as CoffeeActivity).data.coffeeType}
                    </span>
                    <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '4px' }}>
                      ({(activity as CoffeeActivity).data.amount})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {activity.timestamp.toLocaleTimeString('en-US', { 
                      timeZone: 'America/Los_Angeles',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </>
              )}
              {activity.type === 'anxiety' && (
                <>
                  <span style={{ fontSize: '0.9rem' }}>😰</span>
                  <div>
                    <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>Anxiety</span>
                    <span style={{ 
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontSize: '0.7rem',
                      marginLeft: '4px'
                    }}>
                      {(activity as AnxietyActivity).data.intensity}/5
                    </span>
                    {(activity as AnxietyActivity).data.thought && (
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: '#666',
                        marginTop: '2px',
                        fontStyle: 'italic'
                      }}>
                        "{(activity as AnxietyActivity).data.thought.substring(0, 50)}
                        {(activity as AnxietyActivity).data.thought.length > 50 ? '...' : ''}"
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {activity.timestamp.toLocaleTimeString('en-US', { 
                      timeZone: 'America/Los_Angeles',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </>
              )}
              {activity.type === 'exercise' && (
                <>
                  <span style={{ fontSize: '0.9rem' }}>💪</span>
                  <div>
                    <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>Exercise</span>
                    <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '4px' }}>
                      ({activity.data.name})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {activity.timestamp.toLocaleTimeString('en-US', { 
                      timeZone: 'America/Los_Angeles',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompactActivityList;