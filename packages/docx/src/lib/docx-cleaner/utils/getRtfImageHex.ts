export const getRtfImageHex = (imageData: string): string | null => {
  const [, bliptagData = ''] = imageData.split('bliptag');
  const bracketSplit = bliptagData.split('}');

  if (bracketSplit.length < 2) {
    return null;
  }

  const [beforeBracket, afterBracket] = bracketSplit;

  if (bracketSplit.length > 2 && beforeBracket.includes('blipuid')) {
    return afterBracket.split(' ').join('');
  }

  const spaceSplit = beforeBracket.split(' ');

  if (spaceSplit.length < 2) {
    return null;
  }

  return spaceSplit.slice(1).join('');
};
