import { expect, it } from 'bun:test';

import * as React from 'react';
import ReactDOMServer from 'react-dom/server';

import { createStaticEditor, EditorStatic } from '../../../static';
import { BaseUploadPlugin } from './BaseUploadPlugin';

it('omits unresolved upload drafts from static output', () => {
  const editor = createStaticEditor({
    plugins: [BaseUploadPlugin],
    initialValue: [
      { children: [{ text: 'before' }], type: 'paragraph' },
      { children: [{ text: '' }], kind: 'image', type: 'upload' },
      { children: [{ text: 'after' }], type: 'paragraph' },
    ],
  });
  const html = ReactDOMServer.renderToStaticMarkup(
    <EditorStatic editor={editor} />
  );

  expect(html).toContain('before');
  expect(html).toContain('after');
  expect(html).not.toContain('data-editor-path="1"');
});
