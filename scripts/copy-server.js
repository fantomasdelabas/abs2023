import fs from 'fs';
import path from 'path';

const sourceDir = path.join(process.cwd(), 'server');
const targetDir = path.join(process.cwd(), 'dist', 'server');

// Create target directory
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy server files
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursiveSync(sourceDir, targetDir);

// Also copy data directory
const dataSourceDir = path.join(process.cwd(), 'data');
const dataTargetDir = path.join(process.cwd(), 'dist', 'data');

if (fs.existsSync(dataSourceDir)) {
  copyRecursiveSync(dataSourceDir, dataTargetDir);
}

console.log('Server files copied successfully');