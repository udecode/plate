export const getChunkTrimmed = (
  chunk: string,
  {
    direction = 'right',
  }: {
    direction?: 'left' | 'right';
  } = {}
) => {
  const str = direction === 'right' ? chunk.trimEnd() : chunk.trimStart();

  if (direction === 'right') {
    return chunk.slice(str.length);
  } else {
    return chunk.slice(0, chunk.length - str.length);
  }
};

export function isCompleteCodeBlock(str: string) {
  const trimmed = str.trim();

  const startsWithCodeBlock = trimmed.startsWith('```');
  const endsWithCodeBlock = trimmed.endsWith('```');

  return startsWithCodeBlock && endsWithCodeBlock;
}

export function isCompleteMath(str: string) {
  const trimmed = str.trim();

  const startsWithMath = trimmed.startsWith('$$');
  const endsWithMath = trimmed.endsWith('$$');

  return startsWithMath && endsWithMath;
}
