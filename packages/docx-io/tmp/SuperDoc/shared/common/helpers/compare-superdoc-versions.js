/**
 * Compare two versions of a superdoc.
 * @param {string} version1
 * @param {string} version2
 * @returns {number} 1 if version1 is greater, -1 if version2 is greater, 0 if equal
 */
export function compareVersions(version1, version2) {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;

    if (v1 > v2) return 1;
    if (v1 < v2) return -1;
  }
  return 0;
}
