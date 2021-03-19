/** @jsx jsx */

import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { useAlignPlugin } from '../../../../elements/align/useAlignPlugin';
import { useBlockquotePlugin } from '../../../../elements/blockquote/useBlockquotePlugin';
import { useCodeBlockPlugin } from '../../../../elements/code-block/useCodeBlockPlugin';
import { useHeadingPlugin } from '../../../../elements/heading/useHeadingPlugin';
import { useImagePlugin } from '../../../../elements/image/useImagePlugin';
import { useLinkPlugin } from '../../../../elements/link/useLinkPlugin';
import { useListPlugin } from '../../../../elements/list/useListPlugin';
import { useMediaEmbedPlugin } from '../../../../elements/media-embed/useMediaEmbedPlugin';
import { useMentionPlugin } from '../../../../elements/mention/useMentionPlugin';
import { useParagraphPlugin } from '../../../../elements/paragraph/useParagraphPlugin';
import { useTablePlugin } from '../../../../elements/table/useTablePlugin';
import {
  CLASS_TODO_LIST,
  CLASS_TODO_LIST_CHECKED,
} from '../../../../elements/todo-list/constants';
import { useTodoListPlugin } from '../../../../elements/todo-list/useTodoListPlugin';
import { useDeserializeBold } from '../../../../marks/bold/useDeserializeBold';
import { useDeserializeCode } from '../../../../marks/code/useDeserializeCode';
import { useDeserializeHighlight } from '../../../../marks/highlight/useDeserializeHighlight';
import { useDeserializeItalic } from '../../../../marks/italic/useDeserializeItalic';
import { useDeserializeKbd } from '../../../../marks/kbd/useDeserializeKbd';
import { useDeserializeStrikethrough } from '../../../../marks/strikethrough/useDeserializeStrikethrough';
import { useDeserializeSubscript } from '../../../../marks/subsupscript/subscript/useDeserializeSubscript';
import { useDeserializeSuperscript } from '../../../../marks/subsupscript/superscript/useDeserializeSuperscript';
import { useDeserializeUnderline } from '../../../../marks/underline/useDeserializeUnderline';
import { useSoftBreakPlugin } from '../../../../plugins/soft-break/useSoftBreakPlugin';
import { useSearchHighlightPlugin } from '../../../../widgets/search-highlight/useSearchHighlightPlugin';
import { deserializeHTMLElement } from '../../../index';

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
  `<span data-slate-value="mention" class="slate-mention" />`,
];

const elementTags = [
  '<pre><code><div class="slate-code-line">code 1</div><div class="slate-code-line">code 2</div></code></pre>',
  '<ul><li><p>ul-li-p</p></li></ul>',
  '<ol><li><p>ol-li-p</p></li></ol>',
  '<img alt="" src="https://i.imgur.com/removed.png" />',
  '<table><tr><td>table</td></tr></table>',
  `<div class="${CLASS_TODO_LIST} ${CLASS_TODO_LIST_CHECKED}">checked</div>`,
  `<div class="${CLASS_TODO_LIST}">unchecked</div>`,
  `<div class="slate-align-center">center</div>`,
  `<iframe src="https://player.vimeo.com/video/26689853" />`,
];

const html = `<html><body><p>${textTags.join('')}</p><p>${inlineTags.join(
  ''
)}</p>${elementTags.join('')}</body></html>`;

const input1 = [
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
];
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
    <hTodoList checked>checked</hTodoList>
    <hTodoList checked={false}>unchecked</hTodoList>
    <hcenter>center</hcenter>
    <hembed url="https://player.vimeo.com/video/26689853">
      {'</body></html>'}
    </hembed>
  </editor>
) as any;

it('should be', () => {
  expect(
    deserializeHTMLElement({
      plugins: input1,
      element: input2,
    })
  ).toEqual(output.children);
});
