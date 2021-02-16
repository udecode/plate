/** @jsx jsx */

import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { AlignPlugin } from '../../../../elements/align/AlignPlugin';
import { BlockquotePlugin } from '../../../../elements/blockquote/BlockquotePlugin';
import { CodeBlockPlugin } from '../../../../elements/code-block/CodeBlockPlugin';
import { HeadingPlugin } from '../../../../elements/heading/HeadingPlugin';
import { ImagePlugin } from '../../../../elements/image/ImagePlugin';
import { LinkPlugin } from '../../../../elements/link/LinkPlugin';
import { ListPlugin } from '../../../../elements/list/ListPlugin';
import { MediaEmbedPlugin } from '../../../../elements/media-embed/MediaEmbedPlugin';
import { MentionPlugin } from '../../../../elements/mention/MentionPlugin';
import { ParagraphPlugin } from '../../../../elements/paragraph/ParagraphPlugin';
import { TablePlugin } from '../../../../elements/table/TablePlugin';
import {
  CLASS_TODO_LIST,
  CLASS_TODO_LIST_CHECKED,
} from '../../../../elements/todo-list/constants';
import { TodoListPlugin } from '../../../../elements/todo-list/TodoListPlugin';
import { SoftBreakPlugin } from '../../../../handlers/soft-break/SoftBreakPlugin';
import { deserializeBold } from '../../../../marks/bold/deserializeBold';
import { deserializeCode } from '../../../../marks/code/deserializeCode';
import { deserializeHighlight } from '../../../../marks/highlight/deserializeHighlight';
import { deserializeItalic } from '../../../../marks/italic/deserializeItalic';
import { deserializeKbd } from '../../../../marks/kbd/deserializeKbd';
import { deserializeStrikethrough } from '../../../../marks/strikethrough/deserializeStrikethrough';
import { deserializeSubscript } from '../../../../marks/subsupscript/subscript/deserializeSubscript';
import { deserializeSuperscript } from '../../../../marks/subsupscript/superscript/deserializeSuperscript';
import { deserializeUnderline } from '../../../../marks/underline/deserializeUnderline';
import { SearchHighlightPlugin } from '../../../../widgets/search-highlight/SearchHighlightPlugin';
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
  '<pre><code>code</code></pre>',
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
  BlockquotePlugin(),
  TodoListPlugin(),
  HeadingPlugin({ levels: 1 }),
  ImagePlugin(),
  LinkPlugin(),
  ListPlugin(),
  MentionPlugin(),
  ParagraphPlugin(),
  CodeBlockPlugin(),
  TablePlugin(),
  MediaEmbedPlugin(),
  SearchHighlightPlugin(),
  SoftBreakPlugin(),
  AlignPlugin(),
  { deserialize: deserializeBold() },
  { deserialize: deserializeHighlight() },
  { deserialize: deserializeCode() },
  { deserialize: deserializeKbd() },
  { deserialize: deserializeItalic() },
  { deserialize: deserializeStrikethrough() },
  { deserialize: deserializeSubscript() },
  { deserialize: deserializeSuperscript() },
  { deserialize: deserializeUnderline() },
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
      <htext>code</htext>
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
