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
