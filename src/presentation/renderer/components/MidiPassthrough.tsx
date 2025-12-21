import React, { useState, useEffect } from 'react';

interface MidiOutputDevice {
  name: string;
  id: string;
}

interface MidiPassthroughProps {
  onStatusChange?: (enabled: boolean) => void;
}

const MidiPassthrough: React.FC<MidiPassthroughProps> = ({ onStatusChange }) => {
  const [devices, setDevices] = useState<MidiOutputDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [passthroughEnabled, setPassthroughEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
    loadPassthroughStatus();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const result = await window.api.midi.getOutputDevices();
      if (result.success) {
        setDevices(result.value.devices);
        setSelectedDevice(result.value.currentDevice);
      }
    } catch (error) {
      console.error('Failed to load MIDI output devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPassthroughStatus = async () => {
    try {
      const result = await window.api.midi.getPassthroughStatus();
      if (result.success) {
        setPassthroughEnabled(result.value.enabled);
        setSelectedDevice(result.value.deviceName);
      }
    } catch (error) {
      console.error('Failed to load passthrough status:', error);
    }
  };

  const handleDeviceChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setLoading(true);
    setError(null);

    try {
      const result = await window.api.midi.selectOutputDevice({ deviceName: value || '' });
      
      if (result.success) {
        setSelectedDevice(value || null);
        // If clearing device, also disable passthrough
        if (!value) {
          setPassthroughEnabled(false);
          onStatusChange?.(false);
        }
        await loadDevices();
      } else {
        const errorMsg = result.error || 'Failed to open output device';
        setError(errorMsg.includes('Failed to open') 
          ? 'Device is unavailable. It may be in use by another application.' 
          : errorMsg);
        await loadDevices();
      }
    } catch (error) {
      console.error('Failed to select MIDI output device:', error);
      setError('Failed to select output device.');
      await loadDevices();
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassthrough = async () => {
    if (!selectedDevice && !passthroughEnabled) {
      setError('Please select an output device first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await window.api.midi.setPassthrough({ enabled: !passthroughEnabled });
      
      if (result.success) {
        setPassthroughEnabled(!passthroughEnabled);
        onStatusChange?.(!passthroughEnabled);
      } else {
        setError(result.error || 'Failed to toggle passthrough');
      }
    } catch (error) {
      console.error('Failed to toggle passthrough:', error);
      setError('Failed to toggle passthrough.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label 
          htmlFor="midi-output-device" 
          style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontSize: '0.875rem', 
            color: '#888' 
          }}
        >
          Output Device
        </label>
        <select
          id="midi-output-device"
          className="select"
          value={selectedDevice || ''}
          onChange={handleDeviceChange}
          disabled={loading}
          style={{ width: '100%' }}
        >
          <option value="">Select output device...</option>
          {devices.map((device) => (
            <option key={device.id} value={device.name}>
              {device.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{ 
          marginBottom: '0.75rem', 
          fontSize: '0.875rem', 
          color: '#f87171', 
          padding: '0.5rem', 
          backgroundColor: 'rgba(248, 113, 113, 0.1)', 
          borderRadius: '4px' 
        }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          className={`btn ${passthroughEnabled ? 'btn-success' : 'btn-secondary'}`}
          onClick={handleTogglePassthrough}
          disabled={loading || (!selectedDevice && !passthroughEnabled)}
          style={{ flex: 1 }}
        >
          {loading ? 'Processing...' : passthroughEnabled ? '✓ Pass-through ON' : 'Enable Pass-through'}
        </button>
      </div>

      {passthroughEnabled && selectedDevice && (
        <div style={{ 
          marginTop: '0.75rem', 
          fontSize: '0.875rem', 
          color: '#4ade80',
          padding: '0.5rem',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          borderRadius: '4px'
        }}>
          ✓ Forwarding MIDI to: {selectedDevice}
        </div>
      )}

      {!passthroughEnabled && (
        <div style={{ 
          marginTop: '0.75rem', 
          fontSize: '0.75rem', 
          color: '#888',
          lineHeight: '1.4'
        }}>
          Pass-through forwards all MIDI input to the selected output device. 
          Useful on Windows where only one app can access a MIDI device.
        </div>
      )}

      <div style={{ marginTop: '0.75rem' }}>
        <button
          className="btn btn-secondary"
          onClick={loadDevices}
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Devices'}
        </button>
      </div>
    </div>
  );
};

export default MidiPassthrough;

