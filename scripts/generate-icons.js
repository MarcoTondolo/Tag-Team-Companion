import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
  const publicDir = path.resolve('public');
  const iconJpgPath = path.join(publicDir, 'icon.jpg');

  if (!fs.existsSync(iconJpgPath)) {
    console.error('public/icon.jpg not found!');
    process.exit(1);
  }

  // Generate 192x192 PNG
  await sharp(iconJpgPath)
    .resize(192, 192, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  // Generate 512x512 PNG
  await sharp(iconJpgPath)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  // Generate Apple Touch Icon (180x180)
  await sharp(iconJpgPath)
    .resize(180, 180, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Generate Maskable 512x512 with safe padding around the icon
  const resizedInner = await sharp(iconJpgPath)
    .resize(410, 410, { fit: 'cover' })
    .toBuffer();

  await sharp(resizedInner)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a
    })
    .png()
    .toFile(path.join(publicDir, 'icon-maskable-512.png'));

  // Generate 32x32 Favicon PNG
  await sharp(iconJpgPath)
    .resize(32, 32, { fit: 'cover' })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('PWA Icons generated successfully from public/icon.jpg!');
}

generate().catch(console.error);

