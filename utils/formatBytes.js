function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

module.exports = formatBytes;