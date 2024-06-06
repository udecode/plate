export interface FilterWordsOptions {
  prefixMode?: 'all-words' | 'last-word' | 'none';
  wordBoundary?: RegExp;
  wordQuantifier?: 'match-all' | 'match-any';
}

export const filterWords = (
  haystack: string,
  needle: string,
  {
    prefixMode = 'last-word',
    wordBoundary = /\s+/,
    wordQuantifier = 'match-all',
  }: FilterWordsOptions = {}
): boolean => {
  const haystackWords = haystack.trim().split(wordBoundary);
  const needleWords = needle.trim().split(wordBoundary);

  const quantifier = wordQuantifier === 'match-all' ? 'every' : 'some';

  return needleWords[quantifier]((needleWord, i) => {
    const allowPrefix = (() => {
      switch (prefixMode) {
        case 'none': {
          return false;
        }
        case 'all-words': {
          return true;
        }
        case 'last-word': {
          return i === needleWords.length - 1;
        }
      }
    })();

    return haystackWords.some((unslicedHaystackWord) => {
      const haystackWord = allowPrefix
        ? unslicedHaystackWord.slice(0, needleWord.length)
        : unslicedHaystackWord;

      return (
        haystackWord.localeCompare(needleWord, undefined, {
          sensitivity: 'base',
          usage: 'search',
        }) === 0
      );
    });
  });
};
