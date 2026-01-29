/**
 * Create a download link for a blob
 *
 * @param {Blob} blob The blob to download
 * @param {string} name The name of the file
 * @param {string} extension The extension of the file
 */
export const createDownload = (blob, name, extension) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.${extension}`;
  a.click();
};

/**
 * Generate a filename safe string
 *
 * @param {string} currentName The current name of the file
 * @returns {string} The cleaned name
 */
export const cleanName = (currentName) => {
  if (currentName.toLowerCase().endsWith('.docx') || currentName.toLowerCase().endsWith('.pdf')) {
    return currentName.slice(0, -5);
  }
  return currentName;
};
