import React, { useState, useEffect } from 'react';
import { getAllActivities, deleteActivity, updateActivity } from '../firebase';
import type { Activity, CoffeeActivity, AnxietyActivity } from '../firebase';

const ActivityManager: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const loadActivities = async () => {
    try {
      setLoading(true);
      const allActivities = await getAllActivities();
      setActivities(allActivities);
      setError('');
    } catch (err) {
      setError('Failed to load activities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleDelete = async (activityId: string) => {
    if (!activityId) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this activity?');
    if (!confirmDelete) return;

    try {
      await deleteActivity(activityId);
      await loadActivities(); // Reload the list
    } catch (err) {
      setError('Failed to delete activity');
      console.error(err);
    }
  };

  const handleEdit = (activity: Activity) => {
    setEditingId(activity.id!);
    setEditForm({
      timestamp: activity.timestamp.toISOString().slice(0, 16), // For datetime-local input
      ...activity.data
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const activity = activities.find(a => a.id === editingId);
      if (!activity) return;

      const updates: Partial<Activity> = {
        timestamp: new Date(editForm.timestamp),
        data: {
          ...activity.data,
          ...editForm
        }
      };

      // Remove timestamp from data object
      delete (updates.data as any).timestamp;

      await updateActivity(editingId, updates);
      setEditingId(null);
      setEditForm({});
      await loadActivities(); // Reload the list
    } catch (err) {
      setError('Failed to update activity');
      console.error(err);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '16px',
        background: '#fff',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#666'
      }}>
        Loading activities...
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '4px',
      background: '#fff'
    }}>
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #eee',
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Manage Activities ({activities.length})</span>
        <button
          onClick={loadActivities}
          style={{
            padding: '4px 8px',
            fontSize: '0.75rem',
            backgroundColor: '#f5f5f5',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '2px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          fontSize: '0.8rem',
          borderBottom: '1px solid #eee'
        }}>
          {error}
        </div>
      )}

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {activities.length === 0 ? (
          <div style={{
            padding: '16px',
            textAlign: 'center',
            color: '#666',
            fontSize: '0.85rem'
          }}>
            No activities found
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} style={{
              padding: '8px 12px',
              borderBottom: activities.indexOf(activity) < activities.length - 1 ? '1px solid #f5f5f5' : 'none'
            }}>
              {editingId === activity.id ? (
                // Edit Mode
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#333' }}>
                    Editing {activity.type} activity
                  </div>
                  
                  {/* Date/Time Input */}
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#666' }}>Date & Time:</label>
                    <input
                      type="datetime-local"
                      value={editForm.timestamp || ''}
                      onChange={(e) => setEditForm({...editForm, timestamp: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ddd',
                        borderRadius: '2px'
                      }}
                    />
                  </div>

                  {/* Activity-specific inputs */}
                  {activity.type === 'coffee' && (
                    <>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#666' }}>Coffee Type:</label>
                        <select
                          value={editForm.coffeeType || ''}
                          onChange={(e) => setEditForm({...editForm, coffeeType: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ddd',
                            borderRadius: '2px'
                          }}
                        >
                          <option value="Espresso">Espresso</option>
                          <option value="Cold Brew">Cold Brew</option>
                          <option value="Pour Over">Pour Over</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#666' }}>Amount:</label>
                        <input
                          type="number"
                          min="1"
                          value={editForm.amount || ''}
                          onChange={(e) => setEditForm({...editForm, amount: parseInt(e.target.value)})}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ddd',
                            borderRadius: '2px'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {activity.type === 'anxiety' && (
                    <>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#666' }}>Intensity (1-5):</label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={editForm.intensity || ''}
                          onChange={(e) => setEditForm({...editForm, intensity: parseInt(e.target.value)})}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ddd',
                            borderRadius: '2px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', color: '#666' }}>Thought:</label>
                        <textarea
                          value={editForm.thought || ''}
                          onChange={(e) => setEditForm({...editForm, thought: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ddd',
                            borderRadius: '2px',
                            minHeight: '60px',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* Edit buttons */}
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        backgroundColor: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '2px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.75rem',
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
                </div>
              ) : (
                // View Mode
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '20px 1fr auto auto auto',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  {/* Icon */}
                  <span style={{ fontSize: '0.9rem' }}>
                    {activity.type === 'coffee' && '☕'}
                    {activity.type === 'anxiety' && '😰'}
                    {activity.type === 'exercise' && '💪'}
                  </span>

                  {/* Content */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      {activity.type === 'coffee' && (
                        <>
                          {(activity as CoffeeActivity).data.coffeeType}
                          <span style={{ color: '#666', marginLeft: '4px' }}>
                            ({(activity as CoffeeActivity).data.amount})
                          </span>
                        </>
                      )}
                      {activity.type === 'anxiety' && (
                        <>
                          Anxiety
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
                        </>
                      )}
                      {activity.type === 'exercise' && (
                        <span>Exercise: {activity.data.name}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                      {formatDate(activity.timestamp)}
                    </div>
                    {activity.type === 'anxiety' && (activity as AnxietyActivity).data.thought && (
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: '#666',
                        fontStyle: 'italic',
                        marginTop: '2px'
                      }}>
                        "{(activity as AnxietyActivity).data.thought.substring(0, 40)}
                        {(activity as AnxietyActivity).data.thought.length > 40 ? '...' : ''}"
                      </div>
                    )}
                  </div>

                  {/* ID for reference */}
                  <div style={{ 
                    fontSize: '0.7rem', 
                    color: '#999',
                    fontFamily: 'monospace'
                  }}>
                    {activity.id?.substring(0, 6)}...
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => handleEdit(activity)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                    title="Edit this activity"
                  >
                    ✏️
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(activity.id!)}
                    style={{
                      padding: '2px 6px',
                      fontSize: '0.7rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                    title="Delete this activity"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityManager;