/** @jsx jsx */

import { getHtmlDocument } from '__test-utils__/getHtmlDocument';
import { jsx } from '__test-utils__/jsx';
import { htmlDeserialize } from 'deserializers';
import { ActionItemPlugin } from 'elements/action-item';
import { BlockquotePlugin } from 'elements/blockquote';
import { CodePlugin } from 'elements/code';
import { HeadingPlugin } from 'elements/heading';
import { ImagePlugin } from 'elements/image';
import { LinkPlugin } from 'elements/link';
import { ListPlugin } from 'elements/list';
import { MentionPlugin } from 'elements/mention';
import { ParagraphPlugin } from 'elements/paragraph';
import { TablePlugin } from 'elements/table';
import { VideoPlugin } from 'elements/video';
import { BoldPlugin } from 'marks/bold';
import { InlineCodePlugin } from 'marks/inline-code';
import { ItalicPlugin } from 'marks/italic';
import { SubscriptPlugin } from 'marks/subscript';
import { SuperscriptPlugin } from 'marks/superscript';
import { UnderlinePlugin } from 'marks/underline';
import { SearchHighlightPlugin } from 'search-highlight';
import { SoftBreakPlugin } from 'soft-break';

const html = `<html><body><pre><code>test</code></pre><ul><li><p><strong>test</strong></p></li></ul></body></html>`;
const input1 = [
  BlockquotePlugin(),
  ActionItemPlugin(),
  HeadingPlugin(),
  ImagePlugin(),
  LinkPlugin(),
  ListPlugin(),
  MentionPlugin(),
  ParagraphPlugin(),
  TablePlugin(),
  VideoPlugin(),
  CodePlugin(),
  BoldPlugin(),
  InlineCodePlugin(),
  ItalicPlugin(),
  SearchHighlightPlugin(),
  UnderlinePlugin(),
  SoftBreakPlugin(),
  SubscriptPlugin(),
  SuperscriptPlugin(),
];
const input2 = getHtmlDocument(html).body;

const output = (
  <editor>
    <code>
      <txt>test</txt>
    </code>
    <ul>
      <li>
        <p>
          <txt bold>test</txt>
        </p>
      </li>
    </ul>
  </editor>
) as any;

it('should be', () => {
  expect(htmlDeserialize(input1)(input2)).toEqual(output.children);
});
