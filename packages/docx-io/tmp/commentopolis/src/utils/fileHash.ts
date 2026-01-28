/**
 * Utility functions for hashing files to detect changes
 */

/**
 * Calculate SHA-256 hash of a file
 * @param file - File to hash
 * @returns Promise resolving to hex string hash
 */
export async function hashFile(file: File): Promise<string> {
  // Use arrayBuffer if available, otherwise fall back to FileReader for test compatibility
  let buffer: ArrayBuffer;
  
  if (file.arrayBuffer && typeof file.arrayBuffer === 'function') {
    buffer = await file.arrayBuffer();
  } else {
    // Fallback for test environments or older browsers
    const result = await new Promise<ArrayBuffer | string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
    
    // Handle the case where FileReader returns a string in test environments
    if (typeof result === 'string') {
      const encoder = new TextEncoder();
      buffer = encoder.encode(result).buffer;
    } else {
      buffer = result;
    }
  }
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Compare two file hashes
 * @param hash1 - First hash
 * @param hash2 - Second hash
 * @returns True if hashes match
 */
export function compareHashes(hash1: string, hash2: string): boolean {
  return hash1 === hash2;
}
