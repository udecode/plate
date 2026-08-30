import {
  parseIframeUrl,
  parseMediaUrl,
  parseTwitterUrl,
  parseVideoUrl,
} from './parseMediaUrl';

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

describe('parseIframeUrl', () => {
  it('extracts iframe and allowlisted Twitter URLs', () => {
    expect(
      parseIframeUrl(
        '<iframe src="https://www.youtube.com/embed/M7lc1UVf-VE"></iframe>'
      )
    ).toBe('https://www.youtube.com/embed/M7lc1UVf-VE');
    expect(
      parseIframeUrl(
        '<blockquote class="twitter-tweet"><a href="https://x.com/platejs/status/1234567890"></a></blockquote><script async src="https://platform.twitter.com/widgets.js"></script>'
      )
    ).toBe('https://x.com/platejs/status/1234567890');
  });

  it('leaves plain URLs and unsupported markup unchanged', () => {
    expect(parseIframeUrl('https://platejs.org/embed')).toBe(
      'https://platejs.org/embed'
    );
    expect(parseIframeUrl('<iframe title="missing-src"></iframe>')).toBe(
      '<iframe title="missing-src"></iframe>'
    );

    const scriptEmbed =
      '<script async src="https://example.com/widgets.js"></script>';

    expect(parseIframeUrl(scriptEmbed)).toBe(scriptEmbed);
  });
});

describe('parseTwitterUrl', () => {
  it('parses Twitter and X status URLs', () => {
    expect(
      parseTwitterUrl('https://twitter.com/platejs/status/1234567890')
    ).toEqual({
      id: '1234567890',
      provider: 'twitter',
      sourceKind: 'url',
      url: 'https://twitter.com/platejs/status/1234567890',
    });
    expect(parseTwitterUrl('https://x.com/platejs/statuses/987654321')).toEqual(
      {
        id: '987654321',
        provider: 'twitter',
        sourceKind: 'url',
        url: 'https://x.com/platejs/statuses/987654321',
      }
    );
  });

  it('returns undefined for non-status URLs', () => {
    expect(parseTwitterUrl('https://platejs.org/docs')).toBeUndefined();
  });
});

describe('parseVideoUrl', () => {
  it('parses YouTube URL variants', () => {
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

  it('parses Vimeo URL variants', () => {
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

  it('parses supported non-YouTube providers and variants', () => {
    const cases = [
      [
        'https://www.dailymotion.com/video/x7tgcz',
        {
          id: 'x7tgcz',
          provider: 'dailymotion',
          sourceKind: 'url',
          sourceUrl: 'https://www.dailymotion.com/video/x7tgcz',
          url: 'https://www.dailymotion.com/embed/video/x7tgcz',
        },
      ],
      [
        'https://dai.ly/x1e2b95',
        {
          id: 'x1e2b95',
          provider: 'dailymotion',
          sourceKind: 'url',
          sourceUrl: 'https://dai.ly/x1e2b95',
          url: 'https://www.dailymotion.com/embed/video/x1e2b95',
        },
      ],
      [
        'https://v.youku.com/v_show/id_XMzI1NjYxNTI=.html',
        {
          id: 'XMzI1NjYxNTI',
          provider: 'youku',
          sourceKind: 'url',
          sourceUrl: 'https://v.youku.com/v_show/id_XMzI1NjYxNTI=.html',
          url: 'https://player.youku.com/embed/XMzI1NjYxNTI',
        },
      ],
      [
        'https://player.youku.com/player.php/sid/XMTQ3OTM4MzMxMg==/v.swf',
        {
          id: 'XMTQ3OTM4MzMxMg',
          provider: 'youku',
          sourceKind: 'url',
          sourceUrl:
            'https://player.youku.com/player.php/sid/XMTQ3OTM4MzMxMg==/v.swf',
          url: 'https://player.youku.com/embed/XMTQ3OTM4MzMxMg',
        },
      ],
      [
        'https://static.youku.com/v1.0.0638/v/swf/loader.swf?VideoIDS=XMTQ3OTM4MzMxMg%3D%3D',
        {
          id: 'XMTQ3OTM4MzMxMg',
          provider: 'youku',
          sourceKind: 'url',
          sourceUrl:
            'https://static.youku.com/v1.0.0638/v/swf/loader.swf?VideoIDS=XMTQ3OTM4MzMxMg%3D%3D',
          url: 'https://player.youku.com/embed/XMTQ3OTM4MzMxMg',
        },
      ],
      [
        'https://coub.com/view/abc123',
        {
          id: 'abc123',
          provider: 'coub',
          sourceKind: 'url',
          sourceUrl: 'https://coub.com/view/abc123',
          url: 'https://coub.com/embed/abc123',
        },
      ],
      [
        'https://coub.com/embed/by7sm',
        {
          id: 'by7sm',
          provider: 'coub',
          sourceKind: 'url',
          sourceUrl: undefined,
          url: 'https://coub.com/embed/by7sm',
        },
      ],
    ] as const;

    for (const [url, expected] of cases) {
      expect(parseVideoUrl(url)).toEqual(expected);
    }
  });

  it('strips Dailymotion slugs', () => {
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

  it('returns undefined for non-URLs', () => {
    expect(parseVideoUrl('not a url')).toBeUndefined();
  });
});
