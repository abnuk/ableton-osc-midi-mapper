import React, { useState, useEffect } from 'react';
import MidiDeviceSelector from './components/MidiDeviceSelector';
import MidiPassthrough from './components/MidiPassthrough';
import MappingList from './components/MappingList';
import OscCommandBrowser from './components/OscCommandBrowser';
import MidiMonitor from './components/MidiMonitor';

const App: React.FC = () => {
  const [oscConnected, setOscConnected] = useState(false);
  const [midiConnected, setMidiConnected] = useState(false);
  const [midiPassthroughActive, setMidiPassthroughActive] = useState(false);
  const [learnMode, setLearnMode] = useState(false);

  useEffect(() => {
    // Connect to OSC on startup
    window.api.osc.connect().then((result) => {
      if (result.success) {
        setOscConnected(true);
      }
    });

    // Check MIDI connection
    window.api.midi.getDevices().then((result) => {
      if (result.success) {
        const devices = result.value.currentDevices || (result.value as any).currentDevice ? [((result.value as any).currentDevice)] : [];
        if (devices.length > 0) {
          setMidiConnected(true);
        }
      }
    });

    // Check MIDI passthrough status
    window.api.midi.getPassthroughStatus().then((result) => {
      if (result.success) {
        setMidiPassthroughActive(result.value.enabled);
      }
    });

    // Listen for learn mode changes
    const checkLearnMode = setInterval(async () => {
      const isActive = await window.api.learn.isActive();
      setLearnMode(isActive);
    }, 500);

    return () => clearInterval(checkLearnMode);
  }, []);

  const handleTestConnection = async () => {
    const result = await window.api.osc.test();
    if (result.success) {
      setOscConnected(true);
      alert('OSC connection successful!');
    } else {
      setOscConnected(false);
      alert('OSC connection failed: ' + result.error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Ableton OSC MIDI Mapper</h1>
        <div className="connection-status">
          <div className="status-indicator">
            <span className={`status-dot ${oscConnected ? 'connected' : 'disconnected'}`}></span>
            <span>OSC {oscConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="status-indicator">
            <span className={`status-dot ${midiConnected ? 'connected' : 'disconnected'}`}></span>
            <span>MIDI {midiConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {midiPassthroughActive && (
            <div className="status-indicator" style={{ background: '#164e3a' }}>
              <span className="status-dot connected"></span>
              <span>Pass-through</span>
            </div>
          )}
          <button className="btn btn-secondary" onClick={handleTestConnection}>
            Test OSC
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <div className="sidebar-section">
            <h2>MIDI Input</h2>
            <MidiDeviceSelector 
              onDeviceSelected={() => setMidiConnected(true)} 
              onDeviceDisconnected={() => setMidiConnected(false)}
            />
          </div>
          <div className="sidebar-section">
            <h2>MIDI Pass-through</h2>
            <MidiPassthrough 
              onStatusChange={(enabled) => setMidiPassthroughActive(enabled)}
            />
          </div>
        </aside>

        <main className="main-content">
          {learnMode && (
            <div className="learn-mode">
              <h3>Learn Mode Active</h3>
              <p>Press any MIDI button or control to create a mapping</p>
              <button
                className="btn btn-secondary"
                onClick={() => window.api.learn.stop()}
                style={{ marginTop: '0.5rem' }}
              >
                Cancel
              </button>
            </div>
          )}
          <MappingList />
        </main>

        <aside className="command-browser">
          <OscCommandBrowser />
        </aside>
      </div>

      <MidiMonitor />
    </div>
  );
};

export default App;

