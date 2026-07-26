import { getNextWord } from './getNextWord';

describe('getNextWord', () => {
  describe('English text', () => {
    it('get first word with no spaces', () => {
      expect(getNextWord({ text: 'hello world' })).toEqual({
        firstWord: 'hello',
        remainingText: ' world',
      });
    });

    it('handle leading spaces', () => {
      expect(getNextWord({ text: '   hello world' })).toEqual({
        firstWord: '   hello',
        remainingText: ' world',
      });
    });

    it('handle single word', () => {
      expect(getNextWord({ text: 'hello' })).toEqual({
        firstWord: 'hello',
        remainingText: '',
      });
    });
  });

  describe('CJK characters', () => {
    it('handle Chinese characters', () => {
      expect(getNextWord({ text: '你好 世界' })).toEqual({
        firstWord: '你',
        remainingText: '好 世界',
      });
    });

    it('handle Chinese character followed by punctuation', () => {
      expect(getNextWord({ text: '你。好 世界' })).toEqual({
        firstWord: '你。',
        remainingText: '好 世界',
      });
    });

    it('handle various CJK punctuation marks', () => {
      expect(getNextWord({ text: '你、好 世界' })).toEqual({
        firstWord: '你、',
        remainingText: '好 世界',
      });

      expect(getNextWord({ text: '你！世界' })).toEqual({
        firstWord: '你！',
        remainingText: '世界',
      });

      expect(getNextWord({ text: '你？好' })).toEqual({
        firstWord: '你？',
        remainingText: '好',
      });

      expect(getNextWord({ text: 'hello? world' })).toEqual({
        firstWord: 'hello?',
        remainingText: ' world',
      });
    });

    it('handle Japanese Hiragana', () => {
      expect(getNextWord({ text: 'こんにちは 世界' })).toEqual({
        firstWord: 'こ',
        remainingText: 'んにちは 世界',
      });
    });

    it('handle Korean characters', () => {
      expect(getNextWord({ text: '안녕하세요 세계' })).toEqual({
        firstWord: '안',
        remainingText: '녕하세요 세계',
      });
    });

    it('handle CJK with leading spaces', () => {
      expect(getNextWord({ text: '  你好 世界' })).toEqual({
        firstWord: '  你',
        remainingText: '好 世界',
      });
    });
  });

  describe('mixed content', () => {
    it('handle mix of English and CJK', () => {
      expect(getNextWord({ text: 'hello 你好' })).toEqual({
        firstWord: 'hello',
        remainingText: ' 你好',
      });
    });

    it('handle English words directly adjacent to Chinese characters', () => {
      expect(getNextWord({ text: 'React是nice框架' })).toEqual({
        firstWord: 'React',
        remainingText: '是nice框架',
      });
    });

    it('handle CJK followed by English', () => {
      expect(getNextWord({ text: '你 hello' })).toEqual({
        firstWord: '你',
        remainingText: ' hello',
      });
    });
  });
});
