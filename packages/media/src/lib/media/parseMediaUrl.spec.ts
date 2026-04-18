import { parseMediaUrl } from './parseMediaUrl';

describe('parseMediaUrl', () => {
  it('returns the first parser match', () => {
    const result = parseMediaUrl('https://example.com/video', {
      urlParsers: [
        (): undefined => {},
        () => ({
          provider: 'video',
          sourceUrl: 'https://example.com/video',
          url: 'https://cdn.example.com/embed/1',
        }),
        () => ({ provider: 'ignored', url: 'https://cdn.example.com/embed/2' }),
      ],
    });

    expect(result).toEqual({
      provider: 'video',
      sourceUrl: 'https://example.com/video',
      url: 'https://cdn.example.com/embed/1',
    });
  });

  it('blocks non-http protocols from parser output', () => {
    const result = parseMediaUrl('javascript:alert(1)', {
      urlParsers: [() => ({ provider: 'bad', url: 'javascript:alert(1)' })],
    });

    expect(result).toBeUndefined();
  });

  it('warns and returns undefined when a parser emits an invalid url', () => {
    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});

    const result = parseMediaUrl('bad', {
      urlParsers: [() => ({ provider: 'bad', url: 'not a url' })],
    });

    expect(result).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith('Could not parse URL: not a url');
  });

  it('returns undefined when no parser matches', () => {
    const result = parseMediaUrl('https://example.com', {
      urlParsers: [(): undefined => {}],
    });

    expect(result).toBeUndefined();
  });
});
