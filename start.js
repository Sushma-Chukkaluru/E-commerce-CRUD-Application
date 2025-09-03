// Script to start the application and ensure directories exist
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsDir);
}

// Start the application
console.log('Starting E-commerce CRUD App...');
console.log('Press Ctrl+C to stop the server');
console.log('------------------------------');

spawn('node', ['app.js'], { stdio: 'inherit' });