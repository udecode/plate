/** @jsx jsx */

import { renderHook } from '@testing-library/react-hooks';
import { getSlateClass } from '@udecode/plate-core';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { useFindReplacePlugin } from '../../../../../decorators/find-replace/src/useFindReplacePlugin';
import { createSoftBreakPlugin } from '../../../../../editor/break/src/soft-break/createSoftBreakPlugin';
import { createAlignPlugin } from '../../../../../elements/alignment/src/createAlignPlugin';
import { createBlockquotePlugin } from '../../../../../elements/block-quote/src/createBlockquotePlugin';
import { ELEMENT_CODE_LINE } from '../../../../../elements/code-block/src/constants';
import { createCodeBlockPlugin } from '../../../../../elements/code-block/src/createCodeBlockPlugin';
import { createHeadingPlugin } from '../../../../../elements/heading/src/createHeadingPlugin';
import { createImagePlugin } from '../../../../../elements/image/src/createImagePlugin';
import { createLinkPlugin } from '../../../../../elements/link/src/createLinkPlugin';
import { createListPlugin } from '../../../../../elements/list/src/createListPlugin';
import { createMediaEmbedPlugin } from '../../../../../elements/media-embed/src/createMediaEmbedPlugin';
import { createParagraphPlugin } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { createTablePlugin } from '../../../../../elements/table/src/createTablePlugin';
import { createBoldPlugin } from '../../../../../marks/basic-marks/src/createBoldPlugin';
import { createCodePlugin } from '../../../../../marks/basic-marks/src/createCodePlugin';
import { createItalicPlugin } from '../../../../../marks/basic-marks/src/createItalicPlugin';
import { createStrikethroughPlugin } from '../../../../../marks/basic-marks/src/createStrikethroughPlugin';
import { createSubscriptPlugin } from '../../../../../marks/basic-marks/src/createSubscriptPlugin';
import { createSuperscriptPlugin } from '../../../../../marks/basic-marks/src/createSuperscriptPlugin';
import { createUnderlinePlugin } from '../../../../../marks/basic-marks/src/createUnderlinePlugin';
import { createHighlightPlugin } from '../../../../../marks/highlight/src/createHighlightPlugin';
import { createKbdPlugin } from '../../../../../marks/kbd/src/createKbdPlugin';
import { createPlateUIEditor } from '../../../../../plate/src/utils/createPlateUIEditor';
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
    `<pre><code><div class="${getSlateClass(
      ELEMENT_CODE_LINE
    )}">code 1</div><div class="${getSlateClass(
      ELEMENT_CODE_LINE
    )}">code 2</div></code></pre>`,
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
        <ha url="http://google.com">a</ha>
      </hp>
      <hcodeblock>
        <text>code 1</text>
        <text>code 2</text>
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
      useFindReplacePlugin().plugin,
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
