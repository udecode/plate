export const hexToBase64 = (hex: string): string => {
  const hexPairs = hex.match(/\w{2}/g) || [];
  const binary = hexPairs.map((hexPair) =>
    String.fromCharCode(parseInt(hexPair, 16))
  );
  return btoa(binary.join(''));
};
