# Ableton OSC MIDI Mapper

A professional MIDI to OSC mapper for Ableton Live, built with Clean Architecture principles.

## Features

- Map MIDI inputs (notes, CC, program change) to any Ableton OSC command
- System tray application (runs in background on Windows/macOS)
- Learn mode for easy MIDI button mapping
- Track name resolution (map to track names instead of indices)
- Comprehensive OSC command catalog
- Persistent configuration
- Modern, intuitive UI

## Prerequisites

- Ableton Live 11+ with [AbletonOSC](https://github.com/ideoforms/AbletonOSC) installed
- Node.js 18+
- MIDI controller

## Installation

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Package for distribution
npm run package:mac  # macOS
npm run package:win  # Windows
```

## Usage

1. Install and enable AbletonOSC in Ableton Live
2. Launch the MIDI Mapper application
3. Select your MIDI input device
4. Browse OSC commands in the right panel
5. Click "Learn" on any command, then press a MIDI button to create a mapping
6. Mappings are saved automatically

## Architecture

Built following Clean Architecture principles:

- **Domain Layer**: Pure business logic (entities, value objects, interfaces)
- **Application Layer**: Use cases orchestrating domain operations
- **Infrastructure Layer**: External service implementations (MIDI, OSC, persistence)
- **Presentation Layer**: Electron main process and React UI

## Technologies

- Electron + TypeScript
- React for UI
- InversifyJS for dependency injection
- Zod for validation
- easymidi for MIDI
- node-osc for OSC communication
- electron-store for persistence

## License

MIT

