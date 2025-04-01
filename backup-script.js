/**
 * Simple backup script to run before file deletion
 * You can run this with Node.js to backup files before deleting them
 */
const fs = require('fs');
const path = require('path');

// Files to backup
const filesToBackup = [
  './src/AshaWorkerLogin.js',
  './src/AshaWorkerSignup.js',
  './src/AshaWorkerDashboard.js',
  './src/Navbar.js',
  './src/styles/AshaWorkerDashboard.css',
];

// Create backup folder
const backupFolder = './backup-' + new Date().toISOString().replace(/[:.]/g, '-');
if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder, { recursive: true });
}

// Backup files
filesToBackup.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      const fileName = path.basename(filePath);
      const destPath = path.join(backupFolder, fileName);
      
      // Create nested directories if needed
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      // Copy the file
      fs.copyFileSync(filePath, destPath);
      console.log(`Backed up: ${filePath} -> ${destPath}`);
    } else {
      console.log(`File not found: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error backing up ${filePath}:`, err);
  }
});

console.log(`Backup completed in: ${backupFolder}`);
