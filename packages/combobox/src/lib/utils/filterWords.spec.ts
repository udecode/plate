import { type FilterWordsOptions, filterWords } from './filterWords';

describe('filterWords', () => {
  describe('with default options', () => {
    describe('single word', () => {
      it('matches simple prefix', () => {
        expect(filterWords('hello', 'he')).toBe(true);
      });

      it('does not match non-prefix', () => {
        expect(filterWords('hello', 'lo')).toBe(false);
      });

      it('is case-insensitive', () => {
        expect(filterWords('hello', 'HE')).toBe(true);
      });

      it('is diacritic-insensitive', () => {
        expect(filterWords('hello', 'hé')).toBe(true);
      });
    });

    describe('multiple words', () => {
      it('matches when all words in query match', () => {
        expect(filterWords('hello world', 'world hello')).toBe(true);
        expect(filterWords('hello world', 'world')).toBe(true);
      });

      it('does not match when not all words in query match', () => {
        expect(filterWords('hello world', 'hello other')).toBe(false);
      });

      it('allows prefix for last word', () => {
        expect(filterWords('hello world', 'world he')).toBe(true);
      });

      it('does not allow prefix for non-last word', () => {
        expect(filterWords('hello world', 'wor hello')).toBe(false);
      });
    });
  });

  describe('with prefix mode disabled', () => {
    const options: FilterWordsOptions = { prefixMode: 'none' };

    it('only matches whole words', () => {
      expect(filterWords('hello world', 'wor', options)).toBe(false);
      expect(filterWords('hello world', 'world', options)).toBe(true);
    });
  });

  describe('with prefix mode set to all words', () => {
    const options: FilterWordsOptions = { prefixMode: 'all-words' };

    it('allows prefix for all words', () => {
      expect(filterWords('hello world', 'wor hel', options)).toBe(true);
    });
  });

  describe('with word quantifier set to match any', () => {
    const options: FilterWordsOptions = { wordQuantifier: 'match-any' };

    it('matches when any word in query matches', () => {
      expect(filterWords('hello world', 'other hello', options)).toBe(true);
    });

    it('does not match when no word in query matches', () => {
      expect(filterWords('hello world', 'other other', options)).toBe(false);
    });
  });
});
