/**
 * Icon Generator for Ableton OSC MIDI Mapper
 * Creates a PNG icon that represents MIDI mapping/control
 * Uses pure JavaScript with Buffer manipulation (no external dependencies)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create a distinctive icon representing MIDI control/mapping
function createIconData(size) {
  const data = Buffer.alloc(size * size * 4);
  
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Color scheme - Ableton-inspired with purple accent
  const bgColor = { r: 26, g: 26, b: 26 }; // #1a1a1a - dark background
  const primaryColor = { r: 139, g: 92, b: 246 }; // Purple - primary accent
  const secondaryColor = { r: 236, g: 72, b: 153 }; // Pink/Magenta - secondary
  const accentColor = { r: 34, g: 197, b: 94 }; // Green - active indicator
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const index = (y * size + x) * 4;
      
      // Circular app icon boundary with rounded look
      const cornerRadius = size * 0.48;
      
      if (distance <= cornerRadius) {
        // Background
        data[index] = bgColor.r;
        data[index + 1] = bgColor.g;
        data[index + 2] = bgColor.b;
        data[index + 3] = 255;
        
        // Draw a MIDI knob/dial representation
        const knobRadius = size * 0.35;
        const knobInner = size * 0.25;
        const indicatorWidth = size * 0.04;
        
        // Outer ring (gradient from purple to pink)
        if (distance >= knobInner && distance <= knobRadius) {
          const angle = Math.atan2(dy, dx);
          const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
          
          // Gradient around the knob
          const t = normalizedAngle;
          const r = Math.round(primaryColor.r + (secondaryColor.r - primaryColor.r) * t);
          const g = Math.round(primaryColor.g + (secondaryColor.g - primaryColor.g) * t);
          const b = Math.round(primaryColor.b + (secondaryColor.b - primaryColor.b) * t);
          
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
          data[index + 3] = 255;
        }
        
        // Inner circle (knob center)
        if (distance < knobInner) {
          // Subtle gradient for depth
          const centerFade = distance / knobInner;
          const shade = Math.round(40 + centerFade * 15);
          data[index] = shade;
          data[index + 1] = shade;
          data[index + 2] = shade + 5;
          data[index + 3] = 255;
        }
        
        // Draw indicator line (pointing up-right, like at 2 o'clock position)
        const indicatorAngle = -Math.PI / 4; // 45 degrees from top
        const indicatorStartRadius = size * 0.08;
        const indicatorEndRadius = size * 0.22;
        
        // Check if pixel is on the indicator line
        const angleToCurrent = Math.atan2(dy, dx);
        const angleDiff = Math.abs(angleToCurrent - indicatorAngle);
        const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
        
        if (distance >= indicatorStartRadius && distance <= indicatorEndRadius) {
          // Calculate perpendicular distance from the indicator line
          const lineX = Math.cos(indicatorAngle);
          const lineY = Math.sin(indicatorAngle);
          const perpDist = Math.abs(dx * lineY - dy * lineX);
          
          if (perpDist < indicatorWidth && 
              dx * Math.cos(indicatorAngle) + dy * Math.sin(indicatorAngle) > 0) {
            // Glowing indicator
            const glowIntensity = 1 - (perpDist / indicatorWidth);
            data[index] = Math.round(accentColor.r * glowIntensity * 0.8 + 255 * 0.2);
            data[index + 1] = Math.round(accentColor.g * glowIntensity * 0.8 + 255 * 0.2);
            data[index + 2] = Math.round(accentColor.b * glowIntensity * 0.8 + 255 * 0.2);
            data[index + 3] = 255;
          }
        }
        
        // Add small dots around the ring to represent scale/markers
        const dotRadius = size * 0.02;
        const markerRadius = size * 0.42;
        const numMarkers = 11;
        const startAngle = Math.PI * 0.75; // Start at bottom-left
        const endAngle = Math.PI * 2.25; // End at bottom-right
        
        for (let i = 0; i <= numMarkers; i++) {
          const markerAngle = startAngle + (endAngle - startAngle) * (i / numMarkers);
          const markerX = centerX + Math.cos(markerAngle) * markerRadius;
          const markerY = centerY + Math.sin(markerAngle) * markerRadius;
          const distToMarker = Math.sqrt((x - markerX) ** 2 + (y - markerY) ** 2);
          
          if (distToMarker < dotRadius) {
            const intensity = 1 - (distToMarker / dotRadius);
            const baseColor = i > 7 ? secondaryColor : primaryColor; // Last 3 dots are pink
            data[index] = Math.round(baseColor.r * intensity * 0.6 + 60);
            data[index + 1] = Math.round(baseColor.g * intensity * 0.6 + 60);
            data[index + 2] = Math.round(baseColor.b * intensity * 0.6 + 60);
            data[index + 3] = 255;
          }
        }
        
      } else {
        // Outside - transparent
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
        data[index + 3] = 0;
      }
    }
  }
  
  return data;
}

// PNG encoding helpers
function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPNGChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const crcData = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([length, typeBytes, data, crc]);
}

function createPNG(width, height, rgbaData) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createPNGChunk('IHDR', ihdr);
  
  // IDAT chunk (image data)
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type for this row (none)
    for (let x = 0; x < width; x++) {
      const srcOffset = (y * width + x) * 4;
      rawData[offset++] = rgbaData[srcOffset];     // R
      rawData[offset++] = rgbaData[srcOffset + 1]; // G
      rawData[offset++] = rgbaData[srcOffset + 2]; // B
      rawData[offset++] = rgbaData[srcOffset + 3]; // A
    }
  }
  
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createPNGChunk('IDAT', compressed);
  
  // IEND chunk
  const iendChunk = createPNGChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate icons at multiple sizes for better quality
const { execSync } = require('child_process');

async function generateIcons() {
  const buildDir = path.join(__dirname, '..', 'build');
  
  // Ensure build directory exists
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }
  
  // Generate 512x512 PNG for fallback
  const macSize = 512;
  const macIconData = createIconData(macSize);
  const macPngBuffer = createPNG(macSize, macSize, macIconData);
  const pngPath = path.join(buildDir, 'icon.png');
  fs.writeFileSync(pngPath, macPngBuffer);
  console.log(`✅ PNG icon generated: ${pngPath} (${macSize}x${macSize})`);
  
  // Generate macOS .icns file using iconutil
  // macOS requires specific sizes: 16, 32, 64, 128, 256, 512, 1024 (and @2x variants)
  const iconsetPath = path.join(buildDir, 'icon.iconset');
  
  // Create iconset directory
  if (!fs.existsSync(iconsetPath)) {
    fs.mkdirSync(iconsetPath, { recursive: true });
  }
  
  // Required icon sizes for macOS iconset
  const iconSizes = [
    { size: 16, name: 'icon_16x16.png' },
    { size: 32, name: 'icon_16x16@2x.png' },
    { size: 32, name: 'icon_32x32.png' },
    { size: 64, name: 'icon_32x32@2x.png' },
    { size: 128, name: 'icon_128x128.png' },
    { size: 256, name: 'icon_128x128@2x.png' },
    { size: 256, name: 'icon_256x256.png' },
    { size: 512, name: 'icon_256x256@2x.png' },
    { size: 512, name: 'icon_512x512.png' },
    { size: 1024, name: 'icon_512x512@2x.png' },
  ];
  
  console.log('📁 Generating macOS iconset...');
  for (const { size, name } of iconSizes) {
    const iconData = createIconData(size);
    const pngBuffer = createPNG(size, size, iconData);
    const iconPath = path.join(iconsetPath, name);
    fs.writeFileSync(iconPath, pngBuffer);
    console.log(`   ✅ ${name} (${size}x${size})`);
  }
  
  // Convert iconset to icns using macOS iconutil
  try {
    const icnsPath = path.join(buildDir, 'icon.icns');
    execSync(`iconutil -c icns "${iconsetPath}" -o "${icnsPath}"`, { 
      stdio: 'pipe' 
    });
    console.log(`✅ ICNS icon generated: ${icnsPath}`);
    
    // Clean up iconset directory
    fs.rmSync(iconsetPath, { recursive: true, force: true });
    console.log('   🧹 Cleaned up temporary iconset folder');
  } catch (error) {
    console.error('❌ Failed to generate ICNS:', error.message);
    console.log('   Note: iconutil is only available on macOS.');
    console.log('   The PNG will be used as fallback.');
  }
  
  // Generate 256x256 PNG for ICO conversion (Windows)
  const winSize = 256;
  const winIconData = createIconData(winSize);
  const winPngBuffer = createPNG(winSize, winSize, winIconData);
  const winPngPath = path.join(buildDir, 'icon-256.png');
  fs.writeFileSync(winPngPath, winPngBuffer);
  console.log(`✅ PNG icon generated: ${winPngPath} (${winSize}x${winSize} for Windows ICO)`);
  
  // Generate ICO for Windows using CLI
  try {
    const icoPath = path.join(buildDir, 'icon.ico');
    execSync(`npx png-to-ico "${winPngPath}" > "${icoPath}"`, { 
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe' 
    });
    console.log(`✅ ICO icon generated: ${icoPath}`);
    
    // Clean up temporary 256px PNG
    fs.unlinkSync(winPngPath);
  } catch (error) {
    console.error('❌ Failed to generate ICO:', error.message);
    console.log('   You can manually convert the PNG to ICO using online tools.');
  }
  
  console.log('\n🎉 Icons ready for electron-builder!');
  console.log('\nIcon files location:');
  console.log(`  ICNS: ${path.join(buildDir, 'icon.icns')} (macOS)`);
  console.log(`  ICO:  ${path.join(buildDir, 'icon.ico')} (Windows)`);
  console.log(`  PNG:  ${path.join(buildDir, 'icon.png')} (fallback)`);
}

generateIcons().catch(console.error);

