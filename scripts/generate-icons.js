import sharp from 'sharp';
import path from 'path';

async function generate() {
  const publicDir = path.resolve('public');
  const inputImage = path.join(publicDir, 'icon.jpg'); // <- la tua immagine sorgente (PNG/JPG, meglio se quadrata e ad alta risoluzione, es. 1024x1024)

  await sharp(inputImage).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(inputImage).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(inputImage).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Maskable: ridimensiona più piccola e aggiungi un margine di sicurezza
  await sharp(inputImage)
      .resize(410, 410)
      .extend({ top: 51, bottom: 51, left: 51, right: 51, background: '#0f172a' })
      .png()
      .toFile(path.join(publicDir, 'icon-maskable-512.png'));

  console.log('Icons generated successfully!');
}

generate().catch(console.error);
