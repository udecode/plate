import { parseTwitterUrl } from './parseTwitterUrl';

describe('parseTwitterUrl', () => {
  it('parses twitter status urls', () => {
    expect(
      parseTwitterUrl('https://twitter.com/platejs/status/1234567890')
    ).toEqual({
      id: '1234567890',
      provider: 'twitter',
      sourceKind: 'url',
      url: 'https://twitter.com/platejs/status/1234567890',
    });
  });

  it('parses x.com statuses urls', () => {
    expect(parseTwitterUrl('https://x.com/platejs/statuses/987654321')).toEqual(
      {
        id: '987654321',
        provider: 'twitter',
        sourceKind: 'url',
        url: 'https://x.com/platejs/statuses/987654321',
      }
    );
  });

  it('returns undefined for non-status urls', () => {
    expect(parseTwitterUrl('https://platejs.org/docs')).toBeUndefined();
  });
});
