import { parseVideoUrl } from './parseVideoUrl';

describe('parseVideoUrl', () => {
  it('parses youtube urls into embed data', () => {
    expect(
      parseVideoUrl('https://www.youtube.com/watch?v=M7lc1UVf-VE')
    ).toEqual({
      id: 'M7lc1UVf-VE',
      provider: 'youtube',
      sourceKind: 'url',
      sourceUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });
  });

  it('parses vimeo urls into embed data', () => {
    expect(parseVideoUrl('https://vimeo.com/76979871')).toEqual({
      id: '76979871',
      provider: 'vimeo',
      sourceKind: 'url',
      sourceUrl: 'https://vimeo.com/76979871',
      url: 'https://player.vimeo.com/video/76979871',
    });
  });

  it('returns undefined for non-urls', () => {
    expect(parseVideoUrl('not a url')).toBeUndefined();
  });
});
