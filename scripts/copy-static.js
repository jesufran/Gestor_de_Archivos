const fs = require('fs');
const path = require('path');

// Archivos estáticos a copiar
const files = [
  'index.html',
  'manifest.json',
  'sw.js',
  'icon-192x192.png',
  'icon-512x512.png'
];

// Carpeta de destino
const distDir = path.join(__dirname, '../dist');

// Crear carpeta dist si no existe
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Función para copiar archivos
files.forEach(file => {
  const src = path.join(__dirname, `../${file}`);
  const dest = path.join(distDir, file);

  if (!fs.existsSync(src)) {
    console.warn(`⚠ Advertencia: archivo no encontrado ${file}`);
    return;
  }

  try {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copiado: ${file} -> dist/${file}`);
  } catch (err) {
    console.error(`✗ Error copiando ${file}:`, err);
    process.exit(1);
  }
});

console.log('✅ Todos los archivos estáticos se copiaron correctamente.');
