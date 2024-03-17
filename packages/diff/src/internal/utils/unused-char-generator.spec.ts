import { unusedCharGenerator } from './unused-char-generator';

describe('unusedCharGenerator', () => {
  it('should generate unique chars that are not skipped', () => {
    const generator = unusedCharGenerator({
      skipChars: 'DO NOT USE ANY OF THESE CHARS',
    });

    const chars = Array.from({ length: 10 }, () => generator.next().value);
    expect(chars).toEqual(['B', 'G', 'I', 'J', 'K', 'L', 'M', 'P', 'Q', 'V']);
  });
});
