import { type EmbedUrlParser, parseMediaUrl } from '../../lib/media/parseMediaUrl';

describe('parseMediaUrl', () => {
  const parsersWithoutFallback: EmbedUrlParser[] = [
    (url) => (url.startsWith('https://a.com') ? { id: 'A', url } : undefined),
    (url) => (url.endsWith('b') ? { id: 'B', url } : undefined),
  ];

  const parsersWithFallback: EmbedUrlParser[] = [
    ...parsersWithoutFallback,
    (url) => ({ id: 'C', url }),
  ];

  it('returns undefined if no parsers match', () => {
    const embed = parseMediaUrl('https://x.com', {
      urlParsers: parsersWithoutFallback,
    });
    expect(embed).toBeUndefined();
  });

  it('uses the first matching parser', () => {
    const embed1 = parseMediaUrl('https://a.com/b', {
      urlParsers: parsersWithoutFallback,
    });
    expect(embed1?.id).toBe('A');

    const embed2 = parseMediaUrl('https://x.com/b', {
      urlParsers: parsersWithoutFallback,
    });
    expect(embed2?.id).toBe('B');
  });

  it('uses fallback parser if present', () => {
    const embed = parseMediaUrl('https://alert.com', {
      urlParsers: parsersWithFallback,
    });
    expect(embed?.id).toBe('C');
  });

  it('does not allow javascript: URLs', () => {
    const embed = parseMediaUrl('javascript://alert.com', {
      urlParsers: parsersWithFallback,
    });
    expect(embed).toBeUndefined();
  });
});
