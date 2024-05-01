/** @jsx jsx */

import { renderHook } from '@testing-library/react-hooks';
import { createAlignPlugin } from '@udecode/plate-alignment';
import {
  createBoldPlugin,
  createCodePlugin,
  createItalicPlugin,
  createStrikethroughPlugin,
  createSubscriptPlugin,
  createSuperscriptPlugin,
  createUnderlinePlugin,
} from '@udecode/plate-basic-marks';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createSoftBreakPlugin } from '@udecode/plate-break';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createPlateEditor } from '@udecode/plate-common';
import { createFindReplacePlugin } from '@udecode/plate-find-replace';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createHighlightPlugin } from '@udecode/plate-highlight';
import { createKbdPlugin } from '@udecode/plate-kbd';
import { createLinkPlugin } from '@udecode/plate-link';
import { createListPlugin } from '@udecode/plate-list';
import {
  createImagePlugin,
  createMediaEmbedPlugin,
} from '@udecode/plate-media';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createTablePlugin } from '@udecode/plate-table';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';

import { deserializeHtml } from './deserializeHtml';
import { deserializeHtmlElement } from './deserializeHtmlElement';

jsx;

describe('when collapseWhitespace is false', () => {
  const html = '<blockquote>test \n code</blockquote>';
  const element = getHtmlDocument(html).body.innerHTML;

  const expectedOutput = [{ text: 'test \n code' }];

  it('should have the break line', () => {
    const convertedDocumentFragment = deserializeHtml(createPlateEditor(), {
      collapseWhiteSpace: false,
      element,
    });

    expect(convertedDocumentFragment).toEqual(expectedOutput);
  });
});

describe('when element is a div', () => {
  const html = '<div>test</div>';
  const element = getHtmlDocument(html).body;

  const output = (
    <fragment>
      <htext>test</htext>
    </fragment>
  ) as any;

  it('should be a fragment of text', () => {
    expect(
      deserializeHtml(createPlateEditor(), {
        element,
      })
    ).toEqual(output);
  });
});

describe('when element is 2 p', () => {
  const output = (
    <fragment>
      <hp>first</hp>
      <hp>second</hp>
    </fragment>
  ) as any;

  it('should be a fragment of 2 paragraph nodes', () => {
    expect(
      deserializeHtml(
        createPlateEditor({
          plugins: [createParagraphPlugin()],
        }),
        {
          element: '<p>first</p><p>second</p>',
        }
      )
    ).toEqual(output);
  });
});

describe('when html is a text without tags', () => {
  const html = 'test';
  const element = getHtmlDocument(html).body;

  const output = (
    <fragment>
      <htext>test</htext>
    </fragment>
  ) as any;

  it('should be a fragment of text', () => {
    expect(
      deserializeHtml(createPlateEditor(), {
        element,
      })
    ).toEqual(output);
  });
});

describe('when deserializing all plugins', () => {
  const textTags = [
    '<span>span</span>',
    '<strong>strong</strong>',
    '<span style="font-weight: 600">style</span>',
    '<i>i</i>',
    '<em>em</em>',
    '<span style="font-style: italic">style</span>',
    '<u>u</u>',
    '<span style="text-decoration: underline">style</span>',
    '<del>del</del>',
    '<s>s</s>',
    '<span style="text-decoration: line-through">style</span>',
    '<code>code</code>',
    '<kbd>kbd</kbd>',
    '<sub>sub</sub>',
    '<sup>sup</sup>',
  ];

  const inlineTags = ['<a href="http://google.com">a</a>'];

  const elementTags = [
    `<pre><code><div>code 1</div><div>code 2</div></code></pre>`,
    '<ul><li><p>ul-li-p</p></li></ul>',
    '<ol><li><p>ol-li-p</p></li></ol>',
    '<img alt="" src="https://i.imgur.com/removed.png" />',
    '<table><tr><td>table</td></tr></table>',
    `<iframe src="https://player.vimeo.com/video/26689853" />`,
  ];

  const html = `<html><body><p>${textTags.join('')}</p><p>${inlineTags.join(
    ''
  )}</p>${elementTags.join('')}</body></html>`;

  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <hp>
        <htext>span</htext>
        <htext bold>strong</htext>
        <htext bold>style</htext>
        <htext italic>i</htext>
        <htext italic>em</htext>
        <htext italic>style</htext>
        <htext underline>u</htext>
        <htext underline>style</htext>
        <htext strikethrough>del</htext>
        <htext strikethrough>s</htext>
        <htext strikethrough>style</htext>
        <htext code>code</htext>
        <htext kbd>kbd</htext>
        <htext subscript>sub</htext>
        <htext superscript>sup</htext>
      </hp>
      <hp>
        <ha target="_blank" url="http://google.com">
          a
        </ha>
      </hp>
      <hcodeblock>
        <hcodeline>code 1code 2</hcodeline>
      </hcodeblock>
      <hul>
        <hli>
          <hp>ul-li-p</hp>
        </hli>
      </hul>
      <hol>
        <hli>
          <hp>ol-li-p</hp>
        </hli>
      </hol>
      <himg url="https://i.imgur.com/removed.png">
        <htext />
      </himg>
      <htable>
        <htr>
          <htd>table</htd>
        </htr>
      </htable>
      <hmediaembed url="https://player.vimeo.com/video/26689853">
        {'</body></html>'}
      </hmediaembed>
    </editor>
  ) as any;

  it('should be', () => {
    const plugins = renderHook(() => [
      createBlockquotePlugin(),
      createHeadingPlugin({ options: { levels: 1 } }),
      createImagePlugin(),
      createLinkPlugin(),
      createListPlugin(),
      createParagraphPlugin(),
      createCodeBlockPlugin(),
      createTablePlugin(),
      createMediaEmbedPlugin(),
      createFindReplacePlugin(),
      createSoftBreakPlugin(),
      createAlignPlugin(),
      createBoldPlugin(),
      createHighlightPlugin(),
      createCodePlugin(),
      createKbdPlugin(),
      createItalicPlugin(),
      createStrikethroughPlugin(),
      createSubscriptPlugin(),
      createSuperscriptPlugin(),
      createUnderlinePlugin(),
    ]).result.current;

    expect(
      deserializeHtmlElement(
        createPlateEditor({
          plugins,
        }),
        element
      )
    ).toEqual(output.children);
  });
});
