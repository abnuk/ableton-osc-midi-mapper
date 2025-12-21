import React, { useState, useEffect, useRef } from 'react';
import { MidiMonitorMessage } from '../../preload/index';

interface MidiLogEntry extends MidiMonitorMessage {
  id: number;
  timestamp: Date;
}

const MAX_LOG_ENTRIES = 100;

const MidiMonitor: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logEntries, setLogEntries] = useState<MidiLogEntry[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const entryIdRef = useRef(0);

  useEffect(() => {
    if (!isMonitoring) return;

    const unsubscribe = window.api.midi.onMessage((message: MidiMonitorMessage) => {
      const entry: MidiLogEntry = {
        ...message,
        id: entryIdRef.current++,
        timestamp: new Date()
      };

      setLogEntries(prev => {
        const newEntries = [entry, ...prev];
        return newEntries.slice(0, MAX_LOG_ENTRIES);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [isMonitoring]);

  useEffect(() => {
    // Auto-scroll to top (newest entries are at top)
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logEntries]);

  const handleClear = () => {
    setLogEntries([]);
  };

  const toggleMonitoring = () => {
    setIsMonitoring(prev => !prev);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    } as Intl.DateTimeFormatOptions);
  };

  const getMidiTypeLabel = (type: string): string => {
    switch (type) {
      case 'note': return 'Note';
      case 'cc': return 'CC';
      case 'program_change': return 'PC';
      default: return type;
    }
  };

  const getMidiTypeClass = (type: string): string => {
    switch (type) {
      case 'note': return 'midi-type-note';
      case 'cc': return 'midi-type-cc';
      case 'program_change': return 'midi-type-pc';
      default: return '';
    }
  };

  const getNumber = (entry: MidiLogEntry): string => {
    switch (entry.type) {
      case 'note': return entry.data.note?.toString() ?? '-';
      case 'cc': return entry.data.controller?.toString() ?? '-';
      case 'program_change': return entry.data.program?.toString() ?? '-';
      default: return '-';
    }
  };

  const getValue = (entry: MidiLogEntry): string => {
    switch (entry.type) {
      case 'note': return entry.data.velocity?.toString() ?? '-';
      case 'cc': return entry.data.value?.toString() ?? '-';
      case 'program_change': return '-';
      default: return '-';
    }
  };

  return (
    <div className={`midi-monitor ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="midi-monitor-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="midi-monitor-title">
          <span className={`midi-monitor-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
          <span>MIDI Monitor</span>
          {!isExpanded && logEntries.length > 0 && (
            <span className="midi-monitor-badge">{logEntries.length}</span>
          )}
        </div>
        <div className="midi-monitor-controls" onClick={e => e.stopPropagation()}>
          <button
            className={`btn btn-sm ${isMonitoring ? 'btn-success' : 'btn-secondary'}`}
            onClick={toggleMonitoring}
          >
            {isMonitoring ? 'Recording' : 'Paused'}
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={handleClear}
            disabled={logEntries.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="midi-monitor-content">
          <div className="midi-monitor-table-header">
            <div className="col-time">Time</div>
            <div className="col-device">Device</div>
            <div className="col-channel">Ch</div>
            <div className="col-type">Type</div>
            <div className="col-number">Num</div>
            <div className="col-value">Value</div>
            <div className="col-osc">OSC Command</div>
            <div className="col-passthrough">Pass-through</div>
          </div>
          <div className="midi-monitor-log" ref={logContainerRef}>
            {logEntries.length === 0 ? (
              <div className="midi-monitor-empty">
                {isMonitoring ? 'Waiting for MIDI input...' : 'Monitoring paused'}
              </div>
            ) : (
              logEntries.map(entry => (
                <div key={entry.id} className="midi-monitor-row">
                  <div className="col-time">{formatTime(entry.timestamp)}</div>
                  <div className="col-device" title={entry.sourceDevice}>
                    {entry.sourceDevice}
                  </div>
                  <div className="col-channel">{entry.data.channel}</div>
                  <div className={`col-type ${getMidiTypeClass(entry.type)}`}>
                    {getMidiTypeLabel(entry.type)}
                  </div>
                  <div className="col-number">{getNumber(entry)}</div>
                  <div className="col-value">{getValue(entry)}</div>
                  <div className="col-osc" title={entry.oscCommands.join(', ')}>
                    {entry.oscCommands.length > 0 ? entry.oscCommands.join(', ') : '-'}
                  </div>
                  <div className="col-passthrough" title={entry.passthroughDevice || ''}>
                    {entry.passthroughDevice || '-'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MidiMonitor;

