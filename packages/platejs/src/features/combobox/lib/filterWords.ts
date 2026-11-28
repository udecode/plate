export type FilterWordsOptions = {
  prefixMode?: 'all-words' | 'last-word' | 'none';
  wordBoundary?: RegExp;
  wordQuantifier?: 'match-all' | 'match-any';
};

const DEFAULT_WORD_BOUNDARY = /\s+/;
const collator = new Intl.Collator(undefined, {
  sensitivity: 'base',
  usage: 'search',
});

export const filterWords = (
  haystack: string,
  needle: string,
  {
    prefixMode = 'last-word',
    wordBoundary = DEFAULT_WORD_BOUNDARY,
    wordQuantifier = 'match-all',
  }: FilterWordsOptions = {}
): boolean => {
  const haystackWords = haystack.trim().split(wordBoundary);
  const needleWords = needle.trim().split(wordBoundary);

  const quantifier = wordQuantifier === 'match-all' ? 'every' : 'some';

  return needleWords[quantifier]((needleWord, i) => {
    const allowPrefix =
      prefixMode === 'all-words' ||
      (prefixMode === 'last-word' && i === needleWords.length - 1);

    return haystackWords.some((unslicedHaystackWord) => {
      const haystackWord = allowPrefix
        ? unslicedHaystackWord.slice(0, needleWord.length)
        : unslicedHaystackWord;

      return collator.compare(haystackWord, needleWord) === 0;
    });
  });
};
