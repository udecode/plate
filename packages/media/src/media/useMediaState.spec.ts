import { type EmbedUrlParser, parseMediaUrl } from './useMediaState';

describe('parseMediaUrl', () => {
  const parsersWithoutFallback: EmbedUrlParser[] = [
    (url) => (url.startsWith('a') ? { id: 'A' } : undefined),
    (url) => (url.endsWith('b') ? { id: 'B' } : undefined),
  ];

  const parsersWithFallback: EmbedUrlParser[] = [
    ...parsersWithoutFallback,
    () => ({ id: 'C' }),
  ];

  it('returns undefined if no parsers match', () => {
    const embed = parseMediaUrl('x', { urlParsers: parsersWithoutFallback });
    expect(embed).toBeUndefined();
  });

  it('uses the first matching parser', () => {
    const embed = parseMediaUrl('ab', { urlParsers: parsersWithoutFallback });
    expect(embed?.id).toBe('A');
  });

  it('uses fallback parser if present', () => {
    const embed = parseMediaUrl('javascript', {
      urlParsers: parsersWithFallback,
    });
    expect(embed?.id).toBe('C');
  });

  it('does not allow javascript: URLs', () => {
    const embed = parseMediaUrl('javascript:', {
      urlParsers: parsersWithFallback,
    });
    expect(embed).toBeUndefined();
  });
});
