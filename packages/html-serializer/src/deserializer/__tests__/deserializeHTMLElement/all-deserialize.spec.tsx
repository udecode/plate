/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { renderHook } from '@testing-library/react-hooks';
import { getSlateClass } from '@udecode/slate-plugins-common';
import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { createEditorPlugins } from '../../../../../slate-plugins/src/__fixtures__/editor.fixtures';
import { ELEMENT_ALIGN_CENTER } from '../../../../../slate-plugins/src/elements/align/defaults';
import { useAlignPlugin } from '../../../../../slate-plugins/src/elements/align/useAlignPlugin';
import { useBlockquotePlugin } from '../../../../../slate-plugins/src/elements/blockquote/useBlockquotePlugin';
import { ELEMENT_CODE_LINE } from '../../../../../slate-plugins/src/elements/code-block/defaults';
import { useCodeBlockPlugin } from '../../../../../slate-plugins/src/elements/code-block/useCodeBlockPlugin';
import { useHeadingPlugin } from '../../../../../slate-plugins/src/elements/heading/useHeadingPlugin';
import { useImagePlugin } from '../../../../../slate-plugins/src/elements/image/useImagePlugin';
import { useLinkPlugin } from '../../../../../slate-plugins/src/elements/link/useLinkPlugin';
import { useListPlugin } from '../../../../../slate-plugins/src/elements/list/useListPlugin';
import { useMediaEmbedPlugin } from '../../../../../slate-plugins/src/elements/media-embed/useMediaEmbedPlugin';
import { ELEMENT_MENTION } from '../../../../../slate-plugins/src/elements/mention/defaults';
import { useMentionPlugin } from '../../../../../slate-plugins/src/elements/mention/useMentionPlugin';
import { useParagraphPlugin } from '../../../../../slate-plugins/src/elements/paragraph/useParagraphPlugin';
import { useTablePlugin } from '../../../../../slate-plugins/src/elements/table/useTablePlugin';
import { CLASS_TODO_LIST_CHECKED } from '../../../../../slate-plugins/src/elements/todo-list/constants';
import { ELEMENT_TODO_LI } from '../../../../../slate-plugins/src/elements/todo-list/defaults';
import { useTodoListPlugin } from '../../../../../slate-plugins/src/elements/todo-list/useTodoListPlugin';
import { useDeserializeBold } from '../../../../../slate-plugins/src/marks/bold/useDeserializeBold';
import { useDeserializeCode } from '../../../../../slate-plugins/src/marks/code/useDeserializeCode';
import { useDeserializeHighlight } from '../../../../../slate-plugins/src/marks/highlight/useDeserializeHighlight';
import { useDeserializeItalic } from '../../../../../slate-plugins/src/marks/italic/useDeserializeItalic';
import { useDeserializeKbd } from '../../../../../slate-plugins/src/marks/kbd/useDeserializeKbd';
import { useDeserializeStrikethrough } from '../../../../../slate-plugins/src/marks/strikethrough/useDeserializeStrikethrough';
import { useDeserializeSubscript } from '../../../../../slate-plugins/src/marks/subsupscript/subscript/useDeserializeSubscript';
import { useDeserializeSuperscript } from '../../../../../slate-plugins/src/marks/subsupscript/superscript/useDeserializeSuperscript';
import { useDeserializeUnderline } from '../../../../../slate-plugins/src/marks/underline/useDeserializeUnderline';
import { useSoftBreakPlugin } from '../../../../../slate-plugins/src/plugins/soft-break/useSoftBreakPlugin';
import { useSearchHighlightPlugin } from '../../../../../slate-plugins/src/widgets/search-highlight/useSearchHighlightPlugin';
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
    <hcode>
      <hcodeline>code 1</hcodeline>
      <hcodeline>code 2</hcodeline>
    </hcode>
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
    <htodolist checked>checked</htodolist>
    <htodolist checked={false}>unchecked</htodolist>
    <hcenter>center</hcenter>
    <hembed url="https://player.vimeo.com/video/26689853">
      {'</body></html>'}
    </hembed>
  </editor>
) as any;

it('should be', () => {
  const plugins = renderHook(() => [
    useBlockquotePlugin(),
    useTodoListPlugin(),
    useHeadingPlugin({ levels: 1 }),
    useImagePlugin(),
    useLinkPlugin(),
    useListPlugin(),
    useMentionPlugin(),
    useParagraphPlugin(),
    useCodeBlockPlugin(),
    useTablePlugin(),
    useMediaEmbedPlugin(),
    useSearchHighlightPlugin(),
    useSoftBreakPlugin(),
    useAlignPlugin(),
    { deserialize: useDeserializeBold() },
    { deserialize: useDeserializeHighlight() },
    { deserialize: useDeserializeCode() },
    { deserialize: useDeserializeKbd() },
    { deserialize: useDeserializeItalic() },
    { deserialize: useDeserializeStrikethrough() },
    { deserialize: useDeserializeSubscript() },
    { deserialize: useDeserializeSuperscript() },
    { deserialize: useDeserializeUnderline() },
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
