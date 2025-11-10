import React, { useState, useEffect } from 'react';
import { OscCommandCatalog, OscCommandDef } from '../../../infrastructure/osc/OscCommandCatalog';
import ParameterEditor from './ParameterEditor';
import { ParameterMapping } from '../../../domain/entities/Mapping';

const CATEGORIES = ['all', 'song', 'track', 'clip_slot', 'clip', 'scene', 'device', 'view', 'application'];

const OscCommandBrowser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [commands, setCommands] = useState<OscCommandDef[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<OscCommandDef | null>(null);
  const [parameterMappings, setParameterMappings] = useState<ParameterMapping[]>([]);

  useEffect(() => {
    filterCommands();
  }, [searchTerm, selectedCategory]);

  const filterCommands = () => {
    let allCommands = OscCommandCatalog.getAllCommands();
    let filtered = [...allCommands];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((cmd) => cmd.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cmd.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setCommands(filtered);
  };

  const handleSelectCommand = (command: OscCommandDef) => {
    setSelectedCommand(command);
    // Initialize parameter mappings for this command
    setParameterMappings([]);
  };

  const handleParameterMappingsChange = (mappings: ParameterMapping[]) => {
    setParameterMappings(mappings);
  };

  const handleLearnCommand = async () => {
    if (!selectedCommand) return;

    try {
      const parameters = selectedCommand.parameters.map((p: any) => p.defaultValue ?? 0);

      const result = await window.api.learn.start({
        commandAddress: selectedCommand.address,
        commandParameters: parameters,
        parameterMappings: parameterMappings
      });

      if (!result.success) {
        alert('Failed to start learn mode: ' + result.error);
      } else {
        // Close parameter editor after starting learn mode
        setSelectedCommand(null);
        setParameterMappings([]);
      }
    } catch (error) {
      console.error('Failed to start learn mode:', error);
      alert('Failed to start learn mode');
    }
  };

  const handleBack = () => {
    setSelectedCommand(null);
    setParameterMappings([]);
  };

  if (selectedCommand) {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <button 
          className="btn" 
          onClick={handleBack}
          style={{ marginBottom: '1rem', alignSelf: 'flex-start' }}
        >
          ← Back to Commands
        </button>

        <div style={{ marginBottom: '1rem' }}>
          <span className="command-category">{selectedCommand.category}</span>
          <h2>{selectedCommand.name}</h2>
          <p style={{ color: '#aaa' }}>{selectedCommand.description}</p>
          <p style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#888' }}>
            {selectedCommand.address}
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          <ParameterEditor
            parameters={selectedCommand.parameters}
            parameterMappings={parameterMappings}
            onChange={handleParameterMappingsChange}
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleLearnCommand}
          style={{ padding: '0.75rem', fontSize: '1rem' }}
        >
          Start Learn Mode
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ marginBottom: '1rem' }}>OSC Commands</h2>

      <input
        type="text"
        className="input"
        placeholder="Search commands..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />

      <select
        className="select"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{ marginBottom: '1rem' }}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </option>
        ))}
      </select>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {commands.map((command) => (
          <div key={command.address} className="command-item">
            <span className="command-category">{command.category}</span>
            <h3>{command.name}</h3>
            <p>{command.description}</p>
            <p style={{ fontFamily: 'monospace', marginTop: '0.5rem', fontSize: '0.75rem' }}>
              {command.address}
            </p>
            {command.parameters.length > 0 && (
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                Parameters: {command.parameters.length}
              </p>
            )}
            <button
              className="btn btn-primary"
              onClick={() => handleSelectCommand(command)}
              style={{ marginTop: '0.5rem' }}
            >
              {command.parameters.length > 0 ? 'Configure & Learn' : 'Learn'}
            </button>
          </div>
        ))}
      </div>

      {commands.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
          No commands found
        </div>
      )}
    </div>
  );
};

export default OscCommandBrowser;

