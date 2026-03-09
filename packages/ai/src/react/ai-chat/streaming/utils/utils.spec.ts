import { getChunkTrimmed, isCompleteCodeBlock } from './utils';

describe('getChunkTrimed', () => {
  it('trim the end of a string by default', () => {
    expect(getChunkTrimmed('hello world  ')).toBe('  ');
  });

  it('trim the start of a string when direction is left', () => {
    expect(getChunkTrimmed('  hello world', { direction: 'left' })).toBe('  ');
  });

  it('returns the empty string if no trimming is needed', () => {
    expect(getChunkTrimmed('hello world')).toBe('');
    expect(getChunkTrimmed('hello world', { direction: 'left' })).toBe('');
  });

  it(String.raw`handles \n`, () => {
    expect(getChunkTrimmed('hello world\n')).toBe('\n');
    expect(getChunkTrimmed('hello world\n', { direction: 'left' })).toBe('');
    expect(getChunkTrimmed('\nhello world')).toBe('');
    expect(getChunkTrimmed(' \nhello world', { direction: 'left' })).toBe(
      ' \n'
    );
  });

  it('handle empty strings', () => {
    expect(getChunkTrimmed('')).toBe('');
    expect(getChunkTrimmed('', { direction: 'left' })).toBe('');
  });

  it('handle strings with only whitespace', () => {
    expect(getChunkTrimmed('   ')).toBe('   ');
    expect(getChunkTrimmed('   ', { direction: 'left' })).toBe('   ');
  });
});

describe('isCompleteCodeBlock', () => {
  it('returns true for a complete code block', () => {
    expect(isCompleteCodeBlock('```js\nconsole.log("hello");\n```')).toBe(true);
  });

  it('returns true for an empty code block', () => {
    expect(isCompleteCodeBlock('```\n```')).toBe(true);
  });

  it('returns false for an incomplete code block', () => {
    expect(isCompleteCodeBlock('```js\nconsole.log("hello");')).toBe(false);
  });

  it('returns false for a string that only starts with code block', () => {
    expect(isCompleteCodeBlock('```js\nconsole.log("hello");')).toBe(false);
  });

  it('returns false for a string that only ends with code block', () => {
    expect(isCompleteCodeBlock('console.log("hello");\n```')).toBe(false);
  });

  it('returns false for a string with no code block markers', () => {
    expect(isCompleteCodeBlock('console.log("hello");')).toBe(false);
  });

  it('handle strings with surrounding whitespace', () => {
    expect(isCompleteCodeBlock('  ```\ncode\n```  ')).toBe(true);
  });
});
