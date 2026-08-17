const fs = require('fs');
const path = require('path');

// Convert spaces to underscores
const sanitizeName = (str) => {
  return str.trim().replace(/\s+/g, '_');
};

// Calculate lowest available sequence number and create folder if needed
const getNextSequenceNumber = (dirPath, safeMain, safeSub) => {
  // If the folder (e.g., uploads/2026/guru_purnima/photos) doesn't exist, create it
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return 1;
  }

  const existingFiles = fs.readdirSync(dirPath);
  const existingNumbers = new Set();

  // Regex to match the naming format: 2026-guru_purnima-1.jpg
  const regex = new RegExp(`^${safeMain}-${safeSub}-(\\d+)\\.[a-zA-Z0-9]+$`);

  existingFiles.forEach((file) => {
    const match = file.match(regex);
    if (match) {
      existingNumbers.add(parseInt(match[1], 10));
    }
  });

  // Find the lowest missing sequence number
  let seq = 1;
  while (existingNumbers.has(seq)) {
    seq++;
  }

  return seq;
};

module.exports = {
  sanitizeName,
  getNextSequenceNumber
};