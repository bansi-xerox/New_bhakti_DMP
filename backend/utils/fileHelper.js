const sanitizeName = (str) => {
  if (!str) return '';

  return str
    .trim()
    .replace(/[^a-zA-Z0-9_\s-]/g, '')
    .replace(/\s+/g, '_');
};

const getNextSequenceNumber = (existingPaths, safeMain, safeSub) => {
  const existingNumbers = new Set();

  const prefix = `${safeMain}-${safeSub}-`;

  existingPaths.forEach((filePath) => {
    if (!filePath) return;

    const fileName = filePath.split('/').pop();

    if (!fileName) return;

    const escapedPrefix = prefix.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

    const regex = new RegExp(
      `^${escapedPrefix}(\\d+)(?:\\.[a-zA-Z0-9]+)?$`
    );

    const match = fileName.match(regex);

    if (match) {
      existingNumbers.add(
        parseInt(match[1], 10)
      );
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