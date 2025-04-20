import { getChunkTrimmed, isCompleteCodeBlock } from './utils';

describe('getChunkTrimed', () => {
  it('should trim the end of a string by default', () => {
    expect(getChunkTrimmed('hello world  ')).toBe('  ');
  });

  it('should trim the start of a string when direction is left', () => {
    expect(getChunkTrimmed('  hello world', { direction: 'left' })).toBe('  ');
  });

  it('should return the empty string if no trimming is needed', () => {
    expect(getChunkTrimmed('hello world')).toBe('');
    expect(getChunkTrimmed('hello world', { direction: 'left' })).toBe('');
  });

  it(String.raw`should handle \n`, () => {
    expect(getChunkTrimmed('hello world\n')).toBe('\n');
    expect(getChunkTrimmed('hello world\n', { direction: 'left' })).toBe('');
    expect(getChunkTrimmed('\nhello world')).toBe('');
    expect(getChunkTrimmed(' \nhello world', { direction: 'left' })).toBe(
      ' \n'
    );
  });

  it('should handle empty strings', () => {
    expect(getChunkTrimmed('')).toBe('');
    expect(getChunkTrimmed('', { direction: 'left' })).toBe('');
  });

  it('should handle strings with only whitespace', () => {
    expect(getChunkTrimmed('   ')).toBe('   ');
    expect(getChunkTrimmed('   ', { direction: 'left' })).toBe('   ');
  });
});

describe('isCompleteCodeBlock', () => {
  it('should return true for a complete code block', () => {
    expect(isCompleteCodeBlock('```js\nconsole.log("hello");\n```')).toBe(true);
  });

  it('should return true for an empty code block', () => {
    expect(isCompleteCodeBlock('```\n```')).toBe(true);
  });

  it('should return false for an incomplete code block', () => {
    expect(isCompleteCodeBlock('```js\nconsole.log("hello");')).toBe(false);
  });

  it('should return false for a string that only starts with code block', () => {
    expect(isCompleteCodeBlock('```js\nconsole.log("hello");')).toBe(false);
  });

  it('should return false for a string that only ends with code block', () => {
    expect(isCompleteCodeBlock('console.log("hello");\n```')).toBe(false);
  });

  it('should return false for a string with no code block markers', () => {
    expect(isCompleteCodeBlock('console.log("hello");')).toBe(false);
  });

  it('should handle strings with surrounding whitespace', () => {
    expect(isCompleteCodeBlock('  ```\ncode\n```  ')).toBe(true);
  });
});
