/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { renderHook } from '@testing-library/react-hooks';
import { getSlateClass } from '@udecode/slate-plugins-core';
import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { getSoftBreakPlugin } from '../../../../../../break/src/soft-break/getSoftBreakPlugin';
import { ELEMENT_ALIGN_CENTER } from '../../../../../../elements/alignment/src/defaults';
import { getAlignPlugin } from '../../../../../../elements/alignment/src/getAlignPlugin';
import { getBlockquotePlugin } from '../../../../../../elements/block-quote/src/getBlockquotePlugin';
import { ELEMENT_CODE_LINE } from '../../../../../../elements/code-block/src/defaults';
import { getCodeBlockPlugin } from '../../../../../../elements/code-block/src/getCodeBlockPlugin';
import { getHeadingPlugin } from '../../../../../../elements/heading/src/getHeadingPlugin';
import { getImagePlugin } from '../../../../../../elements/image/src/getImagePlugin';
import { getLinkPlugin } from '../../../../../../elements/link/src/getLinkPlugin';
import { getListPlugin } from '../../../../../../elements/list/src/getListPlugin';
import { CLASS_TODO_LIST_CHECKED } from '../../../../../../elements/list/src/todo-list/constants';
import { ELEMENT_TODO_LI } from '../../../../../../elements/list/src/todo-list/defaults';
import { getTodoListPlugin } from '../../../../../../elements/list/src/todo-list/getTodoListPlugin';
import { getMediaEmbedPlugin } from '../../../../../../elements/media-embed/src/getMediaEmbedPlugin';
import { ELEMENT_MENTION } from '../../../../../../elements/mention/src/defaults';
import { useMentionPlugin } from '../../../../../../elements/mention/src/useMentionPlugin';
import { getParagraphPlugin } from '../../../../../../elements/paragraph/src/getParagraphPlugin';
import { getTablePlugin } from '../../../../../../elements/table/src/getTablePlugin';
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
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
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
  `<div class="${getSlateClass(ELEMENT_ALIGN_CENTER)}">center</div>`,
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
    <hcenter>center</hcenter>
    <hmediaembed url="https://player.vimeo.com/video/26689853">
      {'</body></html>'}
    </hmediaembed>
  </editor>
) as any;

it('should be', () => {
  const plugins = renderHook(() => [
    getBlockquotePlugin(),
    getTodoListPlugin(),
    getHeadingPlugin({ levels: 1 }),
    getImagePlugin(),
    getLinkPlugin(),
    getListPlugin(),
    useMentionPlugin().plugin,
    getParagraphPlugin(),
    getCodeBlockPlugin(),
    getTablePlugin(),
    getMediaEmbedPlugin(),
    useFindReplacePlugin().plugin,
    getSoftBreakPlugin(),
    getAlignPlugin(),
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
