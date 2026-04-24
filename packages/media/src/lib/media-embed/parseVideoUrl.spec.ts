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

  it('parses youtube url variants into embed data', () => {
    const urls = [
      'https://youtu.be/HRb7B9fPhfA',
      'https://m.youtube.com/details?v=HRb7B9fPhfA',
      'https://www.youtube.com/embed/HRb7B9fPhfA?start=30',
      'https://www.youtube.com/v/HRb7B9fPhfA',
      'https://gdata.youtube.com/feeds/api/videos/HRb7B9fPhfA/related',
    ];

    for (const url of urls) {
      expect(parseVideoUrl(url)).toEqual({
        id: 'HRb7B9fPhfA',
        provider: 'youtube',
        sourceKind: 'url',
        sourceUrl: url,
        url: 'https://www.youtube.com/embed/HRb7B9fPhfA',
      });
    }
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

  it('parses vimeo url variants into embed data', () => {
    const urls = [
      'https://vimeo.com/channels/staffpicks/97276391',
      'https://vimeo.com/album/2903155/video/97276391',
      'https://vimeo.com/groups/shortfilms/videos/97276391',
      'https://vimeo.com/showcase/12345/video/97276391',
      'https://vimeopro.com/staff/frame/video/97276391',
    ];

    for (const url of urls) {
      expect(parseVideoUrl(url)).toEqual({
        id: '97276391',
        provider: 'vimeo',
        sourceKind: 'url',
        sourceUrl: url,
        url: 'https://player.vimeo.com/video/97276391',
      });
    }

    expect(parseVideoUrl('https://player.vimeo.com/video/97276391')).toEqual({
      id: '97276391',
      provider: 'vimeo',
      sourceKind: 'url',
      sourceUrl: undefined,
      url: 'https://player.vimeo.com/video/97276391',
    });
  });

  it('parses supported non-youtube video providers into embed data', () => {
    expect(parseVideoUrl('https://www.dailymotion.com/video/x7tgcz')).toEqual({
      id: 'x7tgcz',
      provider: 'dailymotion',
      sourceKind: 'url',
      sourceUrl: 'https://www.dailymotion.com/video/x7tgcz',
      url: 'https://www.dailymotion.com/embed/video/x7tgcz',
    });

    expect(
      parseVideoUrl('https://v.youku.com/v_show/id_XMzI1NjYxNTI=.html')
    ).toEqual({
      id: 'XMzI1NjYxNTI',
      provider: 'youku',
      sourceKind: 'url',
      sourceUrl: 'https://v.youku.com/v_show/id_XMzI1NjYxNTI=.html',
      url: 'https://player.youku.com/embed/XMzI1NjYxNTI',
    });

    expect(parseVideoUrl('https://coub.com/view/abc123')).toEqual({
      id: 'abc123',
      provider: 'coub',
      sourceKind: 'url',
      sourceUrl: 'https://coub.com/view/abc123',
      url: 'https://coub.com/embed/abc123',
    });
  });

  it('parses supported non-youtube provider variants into embed data', () => {
    expect(
      parseVideoUrl(
        'https://www.dailymotion.com/video/x1e2b95_bruce-lee-nin-kayip-kedisi_animals'
      )
    ).toEqual({
      id: 'x1e2b95',
      provider: 'dailymotion',
      sourceKind: 'url',
      sourceUrl:
        'https://www.dailymotion.com/video/x1e2b95_bruce-lee-nin-kayip-kedisi_animals',
      url: 'https://www.dailymotion.com/embed/video/x1e2b95',
    });

    expect(parseVideoUrl('https://dai.ly/x1e2b95')).toEqual({
      id: 'x1e2b95',
      provider: 'dailymotion',
      sourceKind: 'url',
      sourceUrl: 'https://dai.ly/x1e2b95',
      url: 'https://www.dailymotion.com/embed/video/x1e2b95',
    });

    expect(
      parseVideoUrl(
        'https://player.youku.com/player.php/sid/XMTQ3OTM4MzMxMg==/v.swf'
      )
    ).toEqual({
      id: 'XMTQ3OTM4MzMxMg',
      provider: 'youku',
      sourceKind: 'url',
      sourceUrl:
        'https://player.youku.com/player.php/sid/XMTQ3OTM4MzMxMg==/v.swf',
      url: 'https://player.youku.com/embed/XMTQ3OTM4MzMxMg',
    });

    expect(
      parseVideoUrl(
        'https://static.youku.com/v1.0.0638/v/swf/loader.swf?VideoIDS=XMTQ3OTM4MzMxMg%3D%3D'
      )
    ).toEqual({
      id: 'XMTQ3OTM4MzMxMg',
      provider: 'youku',
      sourceKind: 'url',
      sourceUrl:
        'https://static.youku.com/v1.0.0638/v/swf/loader.swf?VideoIDS=XMTQ3OTM4MzMxMg%3D%3D',
      url: 'https://player.youku.com/embed/XMTQ3OTM4MzMxMg',
    });

    expect(parseVideoUrl('https://coub.com/embed/by7sm')).toEqual({
      id: 'by7sm',
      provider: 'coub',
      sourceKind: 'url',
      sourceUrl: undefined,
      url: 'https://coub.com/embed/by7sm',
    });
  });

  it('does not backtrack on invalid time parameters', () => {
    const url = `https://www.youtube.com/watch?v=M7lc1UVf-VE&t=${'1'.repeat(25)}x`;
    const start = performance.now();

    expect(parseVideoUrl(url)).toEqual({
      id: 'M7lc1UVf-VE',
      provider: 'youtube',
      sourceKind: 'url',
      sourceUrl: url,
      url: 'https://www.youtube.com/embed/M7lc1UVf-VE',
    });

    expect(performance.now() - start).toBeLessThan(100);
  });

  it('returns undefined for non-urls', () => {
    expect(parseVideoUrl('not a url')).toBeUndefined();
  });
});
