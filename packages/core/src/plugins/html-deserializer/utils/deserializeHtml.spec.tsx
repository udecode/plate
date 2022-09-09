/** @jsx jsx */

import { renderHook } from '@testing-library/react-hooks';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createFindReplacePlugin } from '../../../../../decorators/find-replace/src/createFindReplacePlugin';
import { createSoftBreakPlugin } from '../../../../../editor/break/src/soft-break/createSoftBreakPlugin';
import { createImagePlugin } from '../../../../../media/src/image/createImagePlugin';
import { createMediaEmbedPlugin } from '../../../../../media/src/media-embed/createMediaEmbedPlugin';
import { createAlignPlugin } from '../../../../../nodes/alignment/src/createAlignPlugin';
import { createBoldPlugin } from '../../../../../nodes/basic-marks/src/createBoldPlugin';
import { createCodePlugin } from '../../../../../nodes/basic-marks/src/createCodePlugin';
import { createItalicPlugin } from '../../../../../nodes/basic-marks/src/createItalicPlugin';
import { createStrikethroughPlugin } from '../../../../../nodes/basic-marks/src/createStrikethroughPlugin';
import { createSubscriptPlugin } from '../../../../../nodes/basic-marks/src/createSubscriptPlugin';
import { createSuperscriptPlugin } from '../../../../../nodes/basic-marks/src/createSuperscriptPlugin';
import { createUnderlinePlugin } from '../../../../../nodes/basic-marks/src/createUnderlinePlugin';
import { createBlockquotePlugin } from '../../../../../nodes/block-quote/src/createBlockquotePlugin';
import { createCodeBlockPlugin } from '../../../../../nodes/code-block/src/createCodeBlockPlugin';
import { createHeadingPlugin } from '../../../../../nodes/heading/src/createHeadingPlugin';
import { createHighlightPlugin } from '../../../../../nodes/highlight/src/createHighlightPlugin';
import { createKbdPlugin } from '../../../../../nodes/kbd/src/createKbdPlugin';
import { createLinkPlugin } from '../../../../../nodes/link/src/createLinkPlugin';
import { createListPlugin } from '../../../../../nodes/list/src/createListPlugin';
import { createParagraphPlugin } from '../../../../../nodes/paragraph/src/createParagraphPlugin';
import { createTablePlugin } from '../../../../../nodes/table/src/createTablePlugin';
import { createPlateUIEditor } from '../../../../../ui/plate/src/utils/createPlateUIEditor';
import { deserializeHtml } from './deserializeHtml';
import { deserializeHtmlElement } from './deserializeHtmlElement';

jsx;

describe('when stripWhitespace is false', () => {
  const html = `<blockquote>test \n code</blockquote>`;
  const element = getHtmlDocument(html).body.innerHTML;

  const expectedOutput = [{ text: 'test \n code' }];

  it('should have the break line', () => {
    const convertedDocumentFragment = deserializeHtml(createPlateUIEditor(), {
      element,
      stripWhitespace: false,
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
      deserializeHtml(createPlateUIEditor(), {
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
        createPlateUIEditor({
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
      deserializeHtml(createPlateUIEditor(), {
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
        createPlateUIEditor({
          plugins,
        }),
        element
      )
    ).toEqual(output.children);
  });
});
