import { expect, it } from 'bun:test';

import { createStaticEditor, EditorStatic } from 'platejs/static';
import * as React from 'react';
import ReactDOMServer from 'react-dom/server';

import { BaseMediaKit } from './media-static';

it('renders completed media with the media-only kit', () => {
  const editor = createStaticEditor({
    plugins: BaseMediaKit,
    initialValue: [
      {
        children: [{ text: '' }],
        type: 'image',
        url: 'https://example.test/image.png',
      },
    ],
  });
  const html = ReactDOMServer.renderToStaticMarkup(
    <EditorStatic editor={editor} />
  );

  expect(html).toContain('https://example.test/image.png');
});
