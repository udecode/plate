import { createPlateEditor } from '@platejs/core/react';

import { LinkPlugin } from './LinkPlugin';

const editor = createPlateEditor({ plugins: [LinkPlugin] });

describe('LinkPlugin.api.decodeUrl', () => {
  it('decodes URL', () => {
    const url = 'https://example.com/path?query=%E3%81%82';
    expect(editor.plugin(LinkPlugin).api.decodeUrl(url)).toEqual(
      'https://example.com/path?query=あ'
    );
  });

  it('handles malformed URI sequence', () => {
    const url = 'https://example.com/path?query=%';
    expect(editor.plugin(LinkPlugin).api.decodeUrl(url)).toEqual(url);
  });
});

describe('LinkPlugin.api.encodeUrl', () => {
  it('does not transform a URL containing no special characters', () => {
    const url =
      'https://username:password@example.com:1234/path?query=value#fragment';
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(url);
  });

  it('does not transform a URL containing encoded characters', () => {
    const url =
      'https://example.com/path%20with%20spaces?query=value%2Bencoded';
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(url);
  });

  it('does not transform a URL containing encoded and special characters', () => {
    const url = 'https://example.com/path%20with%20spaces?query=あ';
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(url);
  });

  it('encodes a URL containing special characters', () => {
    const url = 'https://example.com/path?query=あ';
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(
      'https://example.com/path?query=%E3%81%82'
    );
  });

  it.each([
    'https://example.com/%',
    '',
  ])('preserves malformed or empty input %j', (url) => {
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(url);
  });

  it('encodes a non-URI string', () => {
    const url = 'Just a random string without URI format';
    expect(editor.plugin(LinkPlugin).api.encodeUrl(url)).toEqual(
      'Just%20a%20random%20string%20without%20URI%20format'
    );
  });
});
