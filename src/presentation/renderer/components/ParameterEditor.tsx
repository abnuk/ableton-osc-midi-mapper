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
  const getDefaultValue = (paramType: OscParameterType): number | string | boolean => {
    switch (paramType) {
      case OscParameterType.BOOLEAN:
        return false;
      case OscParameterType.STRING:
        return '';
      default:
        return 0;
    }
  };

  // Initialize mappings with defaults for all parameters
  const initializeMappings = (existingMappings: ParameterMapping[]): ParameterMapping[] => {
    const result: ParameterMapping[] = [];
    
    for (let i = 0; i < parameters.length; i++) {
      const existing = existingMappings.find(m => m.parameterIndex === i);
      if (existing) {
        result.push(existing);
      } else {
        // Create default mapping with STATIC_VALUE
        result.push({
          parameterIndex: i,
          substitution: ParameterSubstitution.STATIC_VALUE,
          staticValue: getDefaultValue(parameters[i].type)
        });
      }
    }
    
    return result;
  };

  const [mappings, setMappings] = useState<ParameterMapping[]>(() => 
    initializeMappings(parameterMappings)
  );

  useEffect(() => {
    const initialized = initializeMappings(parameterMappings);
    setMappings(initialized);
    // Notify parent of initialized mappings if they were missing
    if (parameterMappings.length === 0 && initialized.length > 0) {
      onChange(initialized);
    }
  }, [parameterMappings, parameters]);

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
    switch (paramType) {
      case OscParameterType.INTEGER:
      case OscParameterType.BOOLEAN:
        return [
          ParameterSubstitution.STATIC_VALUE,
          ParameterSubstitution.VELOCITY
        ];
      
      case OscParameterType.FLOAT:
        return [
          ParameterSubstitution.STATIC_VALUE,
          ParameterSubstitution.VELOCITY,
          ParameterSubstitution.VELOCITY_NORMALIZED
        ];
      
      case OscParameterType.STRING:
        return [
          ParameterSubstitution.STATIC_VALUE
        ];
      
      default:
        return [
          ParameterSubstitution.STATIC_VALUE,
          ParameterSubstitution.VELOCITY
        ];
    }
  };

  const getSubstitutionLabel = (sub: ParameterSubstitution): string => {
    const labels: Record<ParameterSubstitution, string> = {
      [ParameterSubstitution.NONE]: 'None',
      [ParameterSubstitution.VELOCITY]: 'MIDI Velocity/Value',
      [ParameterSubstitution.VELOCITY_NORMALIZED]: 'MIDI Velocity (0-1)',
      [ParameterSubstitution.STATIC_VALUE]: 'Static Value'
    };
    return labels[sub] || sub;
  };

  const renderValueInput = (paramIndex: number, param: OscParameterDef, mapping: ParameterMapping | undefined) => {
    if (!mapping || mapping.substitution !== ParameterSubstitution.STATIC_VALUE) {
      return null;
    }

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
            placeholder="Enter value..."
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
            placeholder="Enter value..."
          />
        )}
      </div>
    );
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
              value={mapping?.substitution ?? substitutionOptions[0]}
              onChange={(e) => {
                const newSubstitution = e.target.value as ParameterSubstitution;
                const updates: Partial<ParameterMapping> = { 
                  substitution: newSubstitution 
                };
                
                // Initialize default value for static value
                if (newSubstitution === ParameterSubstitution.STATIC_VALUE && mapping?.staticValue === undefined) {
                  updates.staticValue = param.type === OscParameterType.BOOLEAN ? false : 
                                        param.type === OscParameterType.STRING ? '' : 0;
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

