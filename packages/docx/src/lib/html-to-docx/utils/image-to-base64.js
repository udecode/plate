/* biome-ignore-all lint: legacy code */
/**
 * Browser-compatible image to base64 converter
 * Fetches remote images and converts them to base64
 */

/**
 * Convert an image URL to base64 string
 * @param {string} imageUrl - URL of the image to convert
 * @returns {Promise<string>} Base64 encoded string (without data URI prefix)
 */
export async function imageToBase64(imageUrl) {
  // Check if it's a valid URL
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Invalid URL provided');
    }
  } catch {
    throw new Error('Invalid URL provided');
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert to base64
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }

  return btoa(binary);
}

export default imageToBase64;
