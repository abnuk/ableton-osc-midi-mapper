#!/bin/bash

# Installation script for Ableton OSC MIDI Mapper

echo "=== Ableton OSC MIDI Mapper Installation ==="
echo ""

# Check Node.js version
NODE_VERSION=$(node -v 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "Node.js version: $NODE_VERSION"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo ""
echo "=== Installation Complete! ==="
echo ""
echo "To run the application:"
echo "  Development: npm run dev"
echo "  Build:       npm run build"
echo "  Package:     npm run package:mac (or package:win)"
echo ""
echo "Make sure AbletonOSC is installed and enabled in Ableton Live!"
echo "Download from: https://github.com/ideoforms/AbletonOSC"
echo ""

