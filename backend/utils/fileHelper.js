const fs = require('fs');
const path = require('path');

const sanitizeName = (str) => {
  if (!str) return '';
  return str
    .trim()
    .replace(/[^a-zA-Z0-9_\s-]/g, '')
    .replace(/\s+/g, '_');
};

const getNextSequenceNumber = (dirPath, safeMain, safeSub) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return 1;
  }

  const existingFiles = fs.readdirSync(dirPath);
  const existingNumbers = new Set();

  const prefix = `${safeMain}-${safeSub}-`;
  const regex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)\\.[a-zA-Z0-9]+$`);

  existingFiles.forEach((file) => {
    const match = file.match(regex);
    if (match) {
      existingNumbers.add(parseInt(match[1], 10));
    }
  });

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