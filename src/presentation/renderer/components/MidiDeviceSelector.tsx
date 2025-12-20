import React, { useState, useEffect } from 'react';

interface MidiDevice {
  name: string;
  id: string;
}

interface MidiDeviceSelectorProps {
  onDeviceSelected?: () => void;
  onDeviceDisconnected?: () => void;
}

const MidiDeviceSelector: React.FC<MidiDeviceSelectorProps> = ({ onDeviceSelected, onDeviceDisconnected }) => {
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
    // Don't auto-select any device on startup - let user choose
    // This prevents blocking MIDI devices on Windows
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const result = await window.api.midi.getDevices();
      if (result.success) {
        setDevices(result.value.devices);
        
        // Handle both old API (currentDevice: string) and new API (currentDevices: string[])
        let devices: string[] = [];
        if (result.value.currentDevices && Array.isArray(result.value.currentDevices)) {
          devices = result.value.currentDevices;
        } else if ((result.value as any).currentDevice) {
          // Old API - convert single device to array
          devices = [(result.value as any).currentDevice];
        }
        
        setSelectedDevices(devices);
      }
    } catch (error) {
      console.error('Failed to load MIDI devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!value) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await window.api.midi.selectDevice({ deviceName: value });
      
      if (result.success) {
        onDeviceSelected?.();
        await loadDevices(); // Reload to get updated device list
      } else {
        // Show error message - device might be blocked by another application
        const errorMsg = result.error || 'Failed to open device';
        setError(errorMsg.includes('Failed to open') 
          ? 'Device is unavailable. It may be in use by another application.' 
          : errorMsg);
        // Reload devices to reset the selection
        await loadDevices();
      }
    } catch (error) {
      console.error('Failed to select MIDI device:', error);
      setError('Failed to select device. It may be in use by another application.');
      await loadDevices();
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);
    try {
      // Close all devices by selecting nothing (we need a new IPC for this)
      const result = await window.api.midi.selectDevice({ deviceName: '' });
      if (result.success) {
        setSelectedDevices([]);
        onDeviceDisconnected?.();
      }
      await loadDevices();
    } catch (error) {
      console.error('Failed to disconnect MIDI device:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine display value for select
  let displayValue = '';
  if (selectedDevices && selectedDevices.length > 0) {
    if (selectedDevices.length > 1) {
      displayValue = 'all';  // Multiple devices = "All Devices"
    } else {
      displayValue = selectedDevices[0];
    }
  }

  const hasDeviceSelected = selectedDevices && selectedDevices.length > 0;

  return (
    <div>
      <select
        className="select"
        value={displayValue}
        onChange={handleDeviceChange}
        disabled={loading}
        style={{ width: '100%' }}
      >
        <option value="" disabled={hasDeviceSelected}>
          Select MIDI device...
        </option>
        {devices.map((device) => (
          <option key={device.id} value={device.id === 'all' ? 'all' : device.name}>
            {device.name}
          </option>
        ))}
      </select>
      
      {error && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#f87171', padding: '0.5rem', backgroundColor: 'rgba(248, 113, 113, 0.1)', borderRadius: '4px' }}>
          ⚠ {error}
        </div>
      )}
      
      {hasDeviceSelected && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4ade80' }}>
          ✓ Connected: {selectedDevices.length === 1 ? selectedDevices[0] : `${selectedDevices.length} devices`}
        </div>
      )}
      
      {!hasDeviceSelected && !error && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#888' }}>
          No device selected. Select a device to start listening for MIDI.
        </div>
      )}
      
      {devices.length <= 1 && !loading && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#888' }}>
          No MIDI devices found
        </p>
      )}
      
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button
          className="btn btn-secondary"
          onClick={loadDevices}
          style={{ flex: 1 }}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
        {hasDeviceSelected && (
          <button
            className="btn btn-secondary"
            onClick={handleDisconnect}
            style={{ flex: 1 }}
            disabled={loading}
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
};

export default MidiDeviceSelector;

