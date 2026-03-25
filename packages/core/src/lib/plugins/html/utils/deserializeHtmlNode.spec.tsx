/** @jsx jsxt */

import { getHtmlDocument, jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../../editor';
import { deserializeHtmlNode } from './deserializeHtmlNode';

jsxt;

describe('when element has a br', () => {
  const editor = createSlateEditor({ plugins: [] });

  const html = '<html><body>test<br /></body></html>';
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <htext>test{'\n'}</htext>
    </editor>
  ) as any;

  it('converts br tags to newlines', () => {
    expect(deserializeHtmlNode(editor)(element)).toEqual(output.children);
  });
});

describe('deserializeHtmlNode standalone br handling', () => {
  const editor = createSlateEditor({ plugins: [] });

  it('converts standalone br tags into empty paragraphs', () => {
    const element = getHtmlDocument(
      '<html><body><div><br /></div></body></html>'
    ).querySelector('br')!;

    expect(deserializeHtmlNode(editor)(element as any)).toEqual({
      children: [{ text: '' }],
      type: editor.getType('p'),
    });
  });

  it('drops Apple interchange newline br tags', () => {
    const element = getHtmlDocument(
      '<html><body><br class="Apple-interchange-newline" /></body></html>'
    ).querySelector('br')!;

    expect(deserializeHtmlNode(editor)(element as any)).toBeNull();
  });

  it('keeps br tags as line breaks when they have direct adjacent text siblings', () => {
    const element = getHtmlDocument(
      '<html><body><div>before<br />after</div></body></html>'
    ).querySelector('br')!;

    expect(deserializeHtmlNode(editor)(element as any)).toEqual('\n');
  });
});
