import { matchWords, MatchWordsOptions } from './matchWords';

describe('matchWords', () => {
  describe('with default options', () => {
    describe('single word', () => {
      it('matches simple prefix', () => {
        expect(matchWords('hello', 'he')).toBe(true);
      });

      it('does not match non-prefix', () => {
        expect(matchWords('hello', 'lo')).toBe(false);
      });

      it('is case-insensitive', () => {
        expect(matchWords('hello', 'HE')).toBe(true);
      });

      it('is diacritic-insensitive', () => {
        expect(matchWords('hello', 'hé')).toBe(true);
      });
    });

    describe('multiple words', () => {
      it('matches when all words in query match', () => {
        expect(matchWords('hello world', 'world hello')).toBe(true);
        expect(matchWords('hello world', 'world')).toBe(true);
      });

      it('does not match when not all words in query match', () => {
        expect(matchWords('hello world', 'hello other')).toBe(false);
      });

      it('allows prefix for last word', () => {
        expect(matchWords('hello world', 'world he')).toBe(true);
      });

      it('does not allow prefix for non-last word', () => {
        expect(matchWords('hello world', 'wor hello')).toBe(false);
      });
    });
  });

  describe('with prefix mode disabled', () => {
    const options: MatchWordsOptions = { prefixMode: 'none' };

    it('only matches whole words', () => {
      expect(matchWords('hello world', 'wor', options)).toBe(false);
      expect(matchWords('hello world', 'world', options)).toBe(true);
    });
  });

  describe('with prefix mode set to all words', () => {
    const options: MatchWordsOptions = { prefixMode: 'all-words' };

    it('allows prefix for all words', () => {
      expect(matchWords('hello world', 'wor hel', options)).toBe(true);
    });
  });

  describe('with word quantifier set to match any', () => {
    const options: MatchWordsOptions = { wordQuantifier: 'match-any' };

    it('matches when any word in query matches', () => {
      expect(matchWords('hello world', 'other hello', options)).toBe(true);
    });

    it('does not match when no word in query matches', () => {
      expect(matchWords('hello world', 'other other', options)).toBe(false);
    });
  });
});
