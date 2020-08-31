/** @jsx jsx */

import { getHtmlDocument } from '../../../../__test-utils__/getHtmlDocument';
import { jsx } from '../../../../__test-utils__/jsx';
import { AlignPlugin } from '../../../../elements/align/AlignPlugin';
import { BlockquotePlugin } from '../../../../elements/blockquote/index';
import { CodeBlockPlugin } from '../../../../elements/code-block/index';
import { HeadingPlugin } from '../../../../elements/heading/index';
import { ImagePlugin } from '../../../../elements/image/index';
import { LinkPlugin } from '../../../../elements/link/index';
import { ListPlugin } from '../../../../elements/list/index';
import { MediaEmbedPlugin } from '../../../../elements/media-embed/index';
import { MentionPlugin } from '../../../../elements/mention/index';
import { ParagraphPlugin } from '../../../../elements/paragraph/index';
import { TablePlugin } from '../../../../elements/table/index';
import {
  CLASS_TODO_LIST,
  CLASS_TODO_LIST_CHECKED,
  TodoListPlugin,
} from '../../../../elements/todo-list/index';
import { SoftBreakPlugin } from '../../../../handlers/soft-break/index';
import { deserializeBold } from '../../../../marks/bold/deserializeBold';
import { deserializeCode } from '../../../../marks/code/index';
import { deserializeHighlight } from '../../../../marks/highlight/deserializeHighlight';
import { deserializeItalic } from '../../../../marks/italic/deserializeItalic';
import { deserializeKbd } from '../../../../marks/kbd/index';
import { deserializeStrikethrough } from '../../../../marks/strikethrough/deserializeStrikethrough';
import { deserializeSubscript } from '../../../../marks/subsupscript/subscript/deserializeSubscript';
import { deserializeSuperscript } from '../../../../marks/subsupscript/superscript/deserializeSuperscript';
import { deserializeUnderline } from '../../../../marks/underline/deserializeUnderline';
import { SearchHighlightPlugin } from '../../../../widgets/search-highlight/index';
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
  expect(deserializeHTMLElement(input1)(input2)).toEqual(output.children);
});
