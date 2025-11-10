import React, { useState, useEffect } from 'react';

interface ParameterMapping {
  parameterIndex: number;
  substitution: string;
  trackIndex?: number;
  clipIndex?: number;
  sceneIndex?: number;
  deviceIndex?: number;
  staticValue?: number | string | boolean;
}

interface Mapping {
  id: string;
  name: string;
  enabled: boolean;
  trigger: any;
  command: any;
  parameterMappings?: ParameterMapping[];
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

  const getSubstitutionLabel = (substitution: string): string => {
    const labels: Record<string, string> = {
      'none': 'None',
      'velocity': 'MIDI Velocity',
      'velocity_normalized': 'MIDI Velocity (0-1)',
      'track_index': 'Track Index',
      'clip_index': 'Clip Index',
      'scene_index': 'Scene Index',
      'device_index': 'Device Index',
      'static_value': 'Static Value'
    };
    return labels[substitution] || substitution;
  };

  const renderParameterValue = (paramMapping: ParameterMapping): string => {
    switch (paramMapping.substitution) {
      case 'track_index':
        return paramMapping.trackIndex !== undefined ? paramMapping.trackIndex.toString() : '?';
      case 'clip_index':
        return paramMapping.clipIndex !== undefined ? paramMapping.clipIndex.toString() : '?';
      case 'scene_index':
        return paramMapping.sceneIndex !== undefined ? paramMapping.sceneIndex.toString() : '?';
      case 'device_index':
        return paramMapping.deviceIndex !== undefined ? paramMapping.deviceIndex.toString() : '?';
      case 'static_value':
        return paramMapping.staticValue !== undefined ? String(paramMapping.staticValue) : '?';
      default:
        return '';
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
              <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {mapping.command.address}
              </div>

              {mapping.parameterMappings && mapping.parameterMappings.length > 0 && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  backgroundColor: '#1a1a1a',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#888' }}>
                    Parameter Mappings:
                  </div>
                  {mapping.parameterMappings.map((pm, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        gap: '0.5rem', 
                        padding: '0.25rem 0',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ color: '#4CAF50', fontWeight: 'bold', minWidth: '50px' }}>
                        Param {pm.parameterIndex}:
                      </span>
                      <span style={{ color: '#2196F3' }}>
                        {getSubstitutionLabel(pm.substitution)}
                      </span>
                      {pm.substitution !== 'none' && pm.substitution !== 'velocity' && pm.substitution !== 'velocity_normalized' && (
                        <span style={{ color: '#FFC107', fontFamily: 'monospace' }}>
                          = {renderParameterValue(pm)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MappingList;

