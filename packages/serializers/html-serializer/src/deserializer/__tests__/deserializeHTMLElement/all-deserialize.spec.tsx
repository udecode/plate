/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { renderHook } from '@testing-library/react-hooks';
import { getSlateClass } from '@udecode/plate-core';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createSoftBreakPlugin } from '../../../../../../break/src/soft-break/createSoftBreakPlugin';
import { createAlignPlugin } from '../../../../../../elements/alignment/src/createAlignPlugin';
import { createBlockquotePlugin } from '../../../../../../elements/block-quote/src/createBlockquotePlugin';
import { createCodeBlockPlugin } from '../../../../../../elements/code-block/src/createCodeBlockPlugin';
import { ELEMENT_CODE_LINE } from '../../../../../../elements/code-block/src/defaults';
import { createHeadingPlugin } from '../../../../../../elements/heading/src/createHeadingPlugin';
import { createImagePlugin } from '../../../../../../elements/image/src/createImagePlugin';
import { createLinkPlugin } from '../../../../../../elements/link/src/createLinkPlugin';
import { createListPlugin } from '../../../../../../elements/list/src/createListPlugin';
import { CLASS_TODO_LIST_CHECKED } from '../../../../../../elements/list/src/todo-list/constants';
import { createTodoListPlugin } from '../../../../../../elements/list/src/todo-list/createTodoListPlugin';
import { ELEMENT_TODO_LI } from '../../../../../../elements/list/src/todo-list/defaults';
import { createMediaEmbedPlugin } from '../../../../../../elements/media-embed/src/createMediaEmbedPlugin';
import { createMentionPlugin } from '../../../../../../elements/mention/src/createMentionPlugin';
import { ELEMENT_MENTION } from '../../../../../../elements/mention/src/defaults';
import { createParagraphPlugin } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import { createTablePlugin } from '../../../../../../elements/table/src/createTablePlugin';
import { useFindReplacePlugin } from '../../../../../../find-replace/src/useFindReplacePlugin';
import { getBoldDeserialize } from '../../../../../../marks/basic-marks/src/bold/getBoldDeserialize';
import { getCodeDeserialize } from '../../../../../../marks/basic-marks/src/code/getCodeDeserialize';
import { getItalicDeserialize } from '../../../../../../marks/basic-marks/src/italic/getItalicDeserialize';
import { getStrikethroughDeserialize } from '../../../../../../marks/basic-marks/src/strikethrough/getStrikethroughDeserialize';
import { getSubscriptDeserialize } from '../../../../../../marks/basic-marks/src/subscript/getSubscriptDeserialize';
import { getSuperscriptDeserialize } from '../../../../../../marks/basic-marks/src/superscript/getSuperscriptDeserialize';
import { getUnderlineDeserialize } from '../../../../../../marks/basic-marks/src/underline/getUnderlineDeserialize';
import { getHighlightDeserialize } from '../../../../../../marks/highlight/src/getHighlightDeserialize';
import { getKbdDeserialize } from '../../../../../../marks/kbd/src/getKbdDeserialize';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { deserializeHTMLElement } from '../../utils/deserializeHTMLElement';

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

const inlineTags = [
  '<a href="http://google.com">a</a>',
  `<span data-slate-value="mention" class="${getSlateClass(
    ELEMENT_MENTION
  )}" />`,
];

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
  `<div class="${getSlateClass(
    ELEMENT_TODO_LI
  )} ${CLASS_TODO_LIST_CHECKED}">checked</div>`,
  `<div class="${getSlateClass(ELEMENT_TODO_LI)}">unchecked</div>`,
  `<iframe src="https://player.vimeo.com/video/26689853" />`,
];

const html = `<html><body><p>${textTags.join('')}</p><p>${inlineTags.join(
  ''
)}</p>${elementTags.join('')}</body></html>`;

const input2 = getHtmlDocument(html).body;

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
      <hmention value="mention">
        <htext />
      </hmention>
    </hp>
    <hcodeblock>
      <hcodeline>code 1</hcodeline>
      <hcodeline>code 2</hcodeline>
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
    <htodoli checked>checked</htodoli>
    <htodoli checked={false}>unchecked</htodoli>
    <hmediaembed url="https://player.vimeo.com/video/26689853">
      {'</body></html>'}
    </hmediaembed>
  </editor>
) as any;

it('should be', () => {
  const plugins = renderHook(() => [
    createBlockquotePlugin(),
    createTodoListPlugin(),
    createHeadingPlugin({ levels: 1 }),
    createImagePlugin(),
    createLinkPlugin(),
    createListPlugin(),
    createMentionPlugin(),
    createParagraphPlugin(),
    createCodeBlockPlugin(),
    createTablePlugin(),
    createMediaEmbedPlugin(),
    useFindReplacePlugin().plugin,
    createSoftBreakPlugin(),
    createAlignPlugin(),
    { deserialize: getBoldDeserialize() },
    { deserialize: getHighlightDeserialize() },
    { deserialize: getCodeDeserialize() },
    { deserialize: getKbdDeserialize() },
    { deserialize: getItalicDeserialize() },
    { deserialize: getStrikethroughDeserialize() },
    { deserialize: getSubscriptDeserialize() },
    { deserialize: getSuperscriptDeserialize() },
    { deserialize: getUnderlineDeserialize() },
  ]).result.current;

  expect(
    deserializeHTMLElement(
      createEditorPlugins({
        plugins,
      }),
      {
        plugins,
        element: input2,
      }
    )
  ).toEqual(output.children);
});
