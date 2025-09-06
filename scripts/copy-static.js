echo "const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'manifest.json',
  'sw.js',
  'icon-192x192.png',
  'icon-512x512.png'
];

const distDir = path.join(__dirname, '../dist');

// Crear carpeta dist si no existe
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Copiar archivos
files.forEach(file => {
  const src = path.join(__dirname, `../${file}`);
  const dest = path.join(distDir, file);
  
  try {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copiado: ${file} -> dist/${file}`);
  } catch (err) {
    console.error(`✗ Error copiando ${file}:`, err);
    process.exit(1);
  }
});" > scripts\copy-static.js