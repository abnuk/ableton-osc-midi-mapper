import React, { useState, useEffect } from 'react';
import { OscCommandCatalog, OscCommandDef } from '../../../infrastructure/osc/OscCommandCatalog';

const CATEGORIES = ['all', 'song', 'track', 'clip_slot', 'clip', 'scene', 'device', 'view', 'application'];

const OscCommandBrowser: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [commands, setCommands] = useState<OscCommandDef[]>([]);

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

  const handleLearnCommand = async (command: OscCommandDef) => {
    try {
      const parameters = command.parameters.map((p: any) => p.defaultValue ?? 0);

      const result = await window.api.learn.start({
        commandAddress: command.address,
        commandParameters: parameters,
        parameterMappings: []
      });

      if (!result.success) {
        alert('Failed to start learn mode: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to start learn mode:', error);
      alert('Failed to start learn mode');
    }
  };

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
            <button
              className="btn btn-primary"
              onClick={() => handleLearnCommand(command)}
              style={{ marginTop: '0.5rem' }}
            >
              Learn
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

