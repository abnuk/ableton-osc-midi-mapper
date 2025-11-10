import React, { useState, useEffect } from 'react';
import { ParameterMapping, ParameterSubstitution } from '../../../domain/entities/Mapping';
import { OscParameterDef, OscParameterType } from '../../../domain/entities/OscCommand';

interface ParameterEditorProps {
  parameters: OscParameterDef[];
  parameterMappings: ParameterMapping[];
  onChange: (mappings: ParameterMapping[]) => void;
}

const ParameterEditor: React.FC<ParameterEditorProps> = ({ 
  parameters, 
  parameterMappings, 
  onChange 
}) => {
  const [mappings, setMappings] = useState<ParameterMapping[]>(parameterMappings);

  useEffect(() => {
    setMappings(parameterMappings);
  }, [parameterMappings]);

  const getMapping = (paramIndex: number): ParameterMapping | undefined => {
    return mappings.find(m => m.parameterIndex === paramIndex);
  };

  const updateMapping = (paramIndex: number, updates: Partial<ParameterMapping>) => {
    const existingIndex = mappings.findIndex(m => m.parameterIndex === paramIndex);
    
    let newMappings: ParameterMapping[];
    
    if (existingIndex >= 0) {
      // Update existing mapping
      newMappings = [...mappings];
      newMappings[existingIndex] = {
        ...newMappings[existingIndex],
        ...updates,
        parameterIndex: paramIndex
      };
    } else {
      // Create new mapping
      newMappings = [
        ...mappings,
        {
          parameterIndex: paramIndex,
          substitution: ParameterSubstitution.NONE,
          ...updates
        }
      ];
    }

    setMappings(newMappings);
    onChange(newMappings);
  };

  const getSubstitutionOptions = (paramType: OscParameterType): ParameterSubstitution[] => {
    const baseOptions = [ParameterSubstitution.NONE, ParameterSubstitution.STATIC_VALUE];
    
    switch (paramType) {
      case OscParameterType.INTEGER:
        return [
          ...baseOptions,
          ParameterSubstitution.VELOCITY,
          ParameterSubstitution.TRACK_INDEX,
          ParameterSubstitution.CLIP_INDEX,
          ParameterSubstitution.SCENE_INDEX,
          ParameterSubstitution.DEVICE_INDEX
        ];
      
      case OscParameterType.FLOAT:
        return [
          ...baseOptions,
          ParameterSubstitution.VELOCITY,
          ParameterSubstitution.VELOCITY_NORMALIZED
        ];
      
      case OscParameterType.BOOLEAN:
        return [
          ...baseOptions,
          ParameterSubstitution.VELOCITY
        ];
      
      case OscParameterType.STRING:
        return [
          ...baseOptions
        ];
      
      default:
        return baseOptions;
    }
  };

  const getSubstitutionLabel = (sub: ParameterSubstitution): string => {
    const labels: Record<ParameterSubstitution, string> = {
      [ParameterSubstitution.NONE]: 'None',
      [ParameterSubstitution.VELOCITY]: 'MIDI Velocity/Value',
      [ParameterSubstitution.VELOCITY_NORMALIZED]: 'MIDI Velocity (0-1)',
      [ParameterSubstitution.TRACK_INDEX]: 'Track Index',
      [ParameterSubstitution.CLIP_INDEX]: 'Clip Index',
      [ParameterSubstitution.SCENE_INDEX]: 'Scene Index',
      [ParameterSubstitution.DEVICE_INDEX]: 'Device Index',
      [ParameterSubstitution.STATIC_VALUE]: 'Static Value'
    };
    return labels[sub] || sub;
  };

  const renderValueInput = (paramIndex: number, param: OscParameterDef, mapping: ParameterMapping | undefined) => {
    if (!mapping || mapping.substitution === ParameterSubstitution.NONE) {
      return null;
    }

    switch (mapping.substitution) {
      case ParameterSubstitution.STATIC_VALUE:
        return (
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
              Value:
            </label>
            {param.type === OscParameterType.BOOLEAN ? (
              <select
                className="select"
                value={String(mapping.staticValue ?? false)}
                onChange={(e) => updateMapping(paramIndex, { 
                  staticValue: e.target.value === 'true' 
                })}
              >
                <option value="false">False (0)</option>
                <option value="true">True (1)</option>
              </select>
            ) : param.type === OscParameterType.STRING ? (
              <input
                type="text"
                className="input"
                value={String(mapping.staticValue ?? '')}
                onChange={(e) => updateMapping(paramIndex, { 
                  staticValue: e.target.value 
                })}
              />
            ) : (
              <input
                type="number"
                className="input"
                value={Number(mapping.staticValue ?? 0)}
                min={param.min}
                max={param.max}
                step={param.type === OscParameterType.FLOAT ? '0.01' : '1'}
                onChange={(e) => updateMapping(paramIndex, { 
                  staticValue: param.type === OscParameterType.FLOAT 
                    ? parseFloat(e.target.value) 
                    : parseInt(e.target.value) 
                })}
              />
            )}
          </div>
        );

      case ParameterSubstitution.TRACK_INDEX:
        return (
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
              Track Index:
            </label>
            <input
              type="number"
              className="input"
              value={mapping.trackIndex !== undefined ? mapping.trackIndex : 0}
              min={0}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                updateMapping(paramIndex, { 
                  trackIndex: isNaN(value) ? 0 : value
                });
              }}
            />
          </div>
        );

      case ParameterSubstitution.CLIP_INDEX:
        return (
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
              Clip Index:
            </label>
            <input
              type="number"
              className="input"
              value={mapping.clipIndex !== undefined ? mapping.clipIndex : 0}
              min={0}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                updateMapping(paramIndex, { 
                  clipIndex: isNaN(value) ? 0 : value
                });
              }}
            />
          </div>
        );

      case ParameterSubstitution.SCENE_INDEX:
        return (
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
              Scene Index:
            </label>
            <input
              type="number"
              className="input"
              value={mapping.sceneIndex !== undefined ? mapping.sceneIndex : 0}
              min={0}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                updateMapping(paramIndex, { 
                  sceneIndex: isNaN(value) ? 0 : value
                });
              }}
            />
          </div>
        );

      case ParameterSubstitution.DEVICE_INDEX:
        return (
          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
              Device Index:
            </label>
            <input
              type="number"
              className="input"
              value={mapping.deviceIndex !== undefined ? mapping.deviceIndex : 0}
              min={0}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                updateMapping(paramIndex, { 
                  deviceIndex: isNaN(value) ? 0 : value
                });
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (parameters.length === 0) {
    return (
      <div style={{ padding: '1rem', color: '#888', textAlign: 'center' }}>
        This command has no parameters
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>
        Configure Parameters
      </h3>
      
      {parameters.map((param, index) => {
        const mapping = getMapping(index);
        const substitutionOptions = getSubstitutionOptions(param.type);

        return (
          <div 
            key={index} 
            style={{ 
              marginBottom: '1.5rem', 
              padding: '1rem', 
              border: '1px solid #333',
              borderRadius: '4px',
              backgroundColor: '#1a1a1a'
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>{param.name}</strong>
              <span style={{ 
                marginLeft: '0.5rem', 
                fontSize: '0.875rem', 
                color: '#888',
                fontFamily: 'monospace'
              }}>
                ({param.type})
              </span>
            </div>
            
            {param.description && (
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#aaa', 
                marginBottom: '0.5rem' 
              }}>
                {param.description}
              </div>
            )}

            {(param.min !== undefined || param.max !== undefined) && (
              <div style={{ 
                fontSize: '0.75rem', 
                color: '#888', 
                marginBottom: '0.5rem' 
              }}>
                Range: {param.min ?? '−∞'} to {param.max ?? '∞'}
              </div>
            )}

            <label style={{ 
              fontSize: '0.875rem', 
              display: 'block', 
              marginTop: '0.5rem',
              marginBottom: '0.25rem'
            }}>
              Source:
            </label>
            <select
              className="select"
              value={mapping?.substitution ?? ParameterSubstitution.NONE}
              onChange={(e) => {
                const newSubstitution = e.target.value as ParameterSubstitution;
                const updates: Partial<ParameterMapping> = { 
                  substitution: newSubstitution 
                };
                
                // Initialize default values for index types
                switch (newSubstitution) {
                  case ParameterSubstitution.TRACK_INDEX:
                    if (mapping?.trackIndex === undefined) {
                      updates.trackIndex = 0;
                    }
                    break;
                  case ParameterSubstitution.CLIP_INDEX:
                    if (mapping?.clipIndex === undefined) {
                      updates.clipIndex = 0;
                    }
                    break;
                  case ParameterSubstitution.SCENE_INDEX:
                    if (mapping?.sceneIndex === undefined) {
                      updates.sceneIndex = 0;
                    }
                    break;
                  case ParameterSubstitution.DEVICE_INDEX:
                    if (mapping?.deviceIndex === undefined) {
                      updates.deviceIndex = 0;
                    }
                    break;
                  case ParameterSubstitution.STATIC_VALUE:
                    if (mapping?.staticValue === undefined) {
                      updates.staticValue = param.type === OscParameterType.BOOLEAN ? false : 0;
                    }
                    break;
                }
                
                updateMapping(index, updates);
              }}
            >
              {substitutionOptions.map(option => (
                <option key={option} value={option}>
                  {getSubstitutionLabel(option)}
                </option>
              ))}
            </select>

            {renderValueInput(index, param, mapping)}
          </div>
        );
      })}
    </div>
  );
};

export default ParameterEditor;

