/**
 * Convert object of Uint8Array to blob URL
 * @param {Object} media Object where keys are docx file names and values are Uint8Arrays
 * @returns {Object} Object where keys are docx file names and values are blob URLs
 */
export const getMediaObjectUrls = (media) => {
  const blobUrls = {};
  Object.keys(media).forEach((key) => {
    const uint8Array = media[key];
    const blob = new Blob([uint8Array], { type: 'text/plain' });
    const file = new File([blob], key, { type: blob.type });
    const imageUrl = URL.createObjectURL(file);
    blobUrls[key] = imageUrl;
  });
  return blobUrls;
};
