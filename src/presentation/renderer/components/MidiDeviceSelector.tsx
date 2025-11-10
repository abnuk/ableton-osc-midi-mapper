import React, { useState, useEffect } from 'react';

interface MidiDevice {
  name: string;
  id: string;
}

interface MidiDeviceSelectorProps {
  onDeviceSelected?: () => void;
}

const MidiDeviceSelector: React.FC<MidiDeviceSelectorProps> = ({ onDeviceSelected }) => {
  const [devices, setDevices] = useState<MidiDevice[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDevices();
    // Auto-select "All Devices" on first load
    autoSelectAllDevices();
  }, []);

  const autoSelectAllDevices = async () => {
    try {
      console.log('=== UI: autoSelectAllDevices called ===');
      const result = await window.api.midi.getDevices();
      console.log('=== UI: getDevices result ===', result);
      
      if (result.success) {
        // Get current devices array
        let currentDevices: string[] = [];
        if (Array.isArray(result.value.currentDevices)) {
          currentDevices = result.value.currentDevices;
        } else if ((result.value as any).currentDevice) {
          currentDevices = [(result.value as any).currentDevice];
        }
        
        console.log('=== UI: currentDevices ===', currentDevices);
        
        // If no devices are currently connected, auto-select "All Devices"
        if (currentDevices.length === 0) {
          console.log('=== UI: Auto-selecting all devices... ===');
          const selectResult = await window.api.midi.selectDevice({ deviceName: 'all' });
          console.log('=== UI: selectDevice result ===', selectResult);
          
          if (selectResult.success) {
            console.log('=== UI: All devices selected successfully ===');
            await loadDevices();
          } else {
            console.error('=== UI: Failed to auto-select all devices ===', selectResult.error);
          }
        } else {
          console.log('=== UI: Devices already connected, skipping auto-select ===');
        }
      }
    } catch (error) {
      console.error('=== UI: Failed to auto-select all devices ===', error);
    }
  };

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
    try {
      const result = await window.api.midi.selectDevice({ deviceName: value });
      
      if (result.success) {
        onDeviceSelected?.();
        await loadDevices(); // Reload to get updated device list
      } else {
        alert('Failed to select device: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to select MIDI device:', error);
      alert('Failed to select device');
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

  return (
    <div>
      <select
        className="select"
        value={displayValue}
        onChange={handleDeviceChange}
        disabled={loading}
        style={{ width: '100%' }}
      >
        {devices.map((device) => (
          <option key={device.id} value={device.id === 'all' ? 'all' : device.name}>
            {device.name}
          </option>
        ))}
      </select>
      {selectedDevices && selectedDevices.length > 0 && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#4ade80' }}>
          ✓ Connected: {selectedDevices.length === 1 ? selectedDevices[0] : `${selectedDevices.length} devices`}
        </div>
      )}
      {devices.length === 1 && !loading && (
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#888' }}>
          No MIDI devices found
        </p>
      )}
      <button
        className="btn btn-secondary"
        onClick={loadDevices}
        style={{ marginTop: '0.5rem', width: '100%' }}
        disabled={loading}
      >
        {loading ? 'Refreshing...' : 'Refresh Devices'}
      </button>
    </div>
  );
};

export default MidiDeviceSelector;

