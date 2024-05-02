export interface FilterWordsOptions {
  prefixMode?: 'none' | 'all-words' | 'last-word';
  wordQuantifier?: 'match-all' | 'match-any';
}

export const filterWords = (
  haystack: string,
  needle: string,
  {
    prefixMode = 'last-word',
    wordQuantifier = 'match-all',
  }: FilterWordsOptions = {}
): boolean => {
  const haystackWords = haystack.trim().split(/\s+/);
  const needleWords = needle.trim().split(/\s+/);

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
          usage: 'search',
          sensitivity: 'base',
        }) === 0
      );
    });
  });
};
