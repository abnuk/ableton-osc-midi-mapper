import React, { useState, useEffect } from 'react';

interface Mapping {
  id: string;
  name: string;
  enabled: boolean;
  trigger: any;
  command: any;
}

const MappingList: React.FC = () => {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMappings();
    
    // Listen for learn mode completion
    const unsubscribe = window.api.learn.onComplete(() => {
      console.log('=== UI: Learn mode completed, reloading mappings ===');
      loadMappings();
    });
    
    return () => unsubscribe();
  }, []);

  const loadMappings = async () => {
    setLoading(true);
    try {
      const result = await window.api.mappings.getAll();
      if (result.success) {
        setMappings(result.value.mappings);
      }
    } catch (error) {
      console.error('Failed to load mappings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnabled = async (mappingId: string, currentEnabled: boolean) => {
    try {
      const result = await window.api.mappings.update({
        mappingId,
        enabled: !currentEnabled
      });

      if (result.success) {
        await loadMappings();
      } else {
        alert('Failed to update mapping: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to toggle mapping:', error);
    }
  };

  const handleDelete = async (mappingId: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) {
      return;
    }

    try {
      const result = await window.api.mappings.delete({ mappingId });
      if (result.success) {
        await loadMappings();
      } else {
        alert('Failed to delete mapping: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete mapping:', error);
    }
  };

  if (loading) {
    return <div>Loading mappings...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Mappings ({mappings.length})</h2>
        <button className="btn btn-primary" onClick={loadMappings}>
          Refresh
        </button>
      </div>

      {mappings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
          <p>No mappings yet</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Select an OSC command and press "Learn" to create your first mapping
          </p>
        </div>
      ) : (
        mappings.map((mapping) => (
          <div key={mapping.id} className={`mapping-item ${!mapping.enabled ? 'disabled' : ''}`}>
            <div className="mapping-header">
              <span className="mapping-name">{mapping.name}</span>
              <div className="mapping-actions">
                <button
                  className={`btn ${mapping.enabled ? 'btn-secondary' : 'btn-success'}`}
                  onClick={() => handleToggleEnabled(mapping.id, mapping.enabled)}
                >
                  {mapping.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(mapping.id)}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mapping-details">
              <div>{mapping.command.address}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MappingList;

