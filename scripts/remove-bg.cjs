// Script to remove black background from ZD logo image
// Makes black pixels transparent, keeps white elements
const sharp = require('sharp');
const path = require('path');

async function removeBlackBackground(inputPath, outputPath) {
  // Get raw pixel data
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixelCount = width * height;

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];

    // Calculate "darkness" - the closer to black the more transparent
    const brightness = (r + g + b) / 3;

    // Black/dark pixels become transparent, white/bright pixels stay opaque
    // Use a smooth threshold for nice edges
    if (brightness < 30) {
      // Very dark = fully transparent
      data[offset + 3] = 0;
    } else if (brightness < 100) {
      // Semi-dark = semi-transparent (smooth edge)
      data[offset + 3] = Math.round((brightness - 30) / 70 * 255);
    } else {
      // Bright = fully opaque, keep as white
      data[offset + 3] = 255;
      // Ensure it's white
      data[offset] = 255;
      data[offset + 1] = 255;
      data[offset + 2] = 255;
    }
  }

  await sharp(data, {
    raw: { width, height, channels }
  })
    .png()
    .toFile(outputPath);

  console.log(`✅ Done! Saved to: ${outputPath}`);
}

const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath.replace(/\.[^/.]+$/, '_transparent.png');

if (!inputPath) {
  console.error('Usage: node remove-bg.cjs <input> [output]');
  process.exit(1);
}

removeBlackBackground(inputPath, outputPath).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
