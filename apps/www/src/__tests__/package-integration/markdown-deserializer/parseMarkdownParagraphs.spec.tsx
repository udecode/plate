/** @jsx jsxt */

import { jsxt } from '@platejs/test';
import { BaseBlockquotePlugin, createEditor } from 'platejs';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  ScriptPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from 'platejs/react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { MarkdownPlugin } from '../../../../../../packages/platejs/src/markdown/lib/MarkdownPlugin';

jsxt;

const markdownPlugin = MarkdownPlugin.configure({
  initialState: {
    remarkPlugins: [remarkMath, remarkGfm],
  },
});

const createTestEditor = () =>
  createEditor({
    plugins: [
      markdownPlugin,
      BaseBlockquotePlugin,
      BoldPlugin,
      CodePlugin,
      ItalicPlugin,
      StrikethroughPlugin,
      ScriptPlugin,
      UnderlinePlugin,
    ],
  });

const editor = createTestEditor();
const parseMarkdown = (source: string) => {
  const result = editor.api.markdown.parse(source);

  if (!result.ok) throw new Error(result.diagnostics[0].message);

  return result.document;
};

describe('editor.api.markdown.parse - paragraph', () => {
  it('parse paragraph with one linebreak', () => {
    const input = `
Paragaph with two new Lines\\
<br />`;

    const output = (
      <fragment>
        <hp>
          <htext>Paragaph with two new Lines</htext>
          <htext>{'\n'}</htext>
        </hp>
      </fragment>
    );

    expect(parseMarkdown(input)).toEqual({
      children: output,
    });
  });

  it('parse paragraph with two leading linebreaks', () => {
    const input = `
Paragaph with two new Lines\\
\\
<br />`;

    const output = (
      <fragment>
        <hp>
          <htext>Paragaph with two new Lines</htext>
          <htext>{'\n'}</htext>
          <htext>{'\n'}</htext>
        </hp>
      </fragment>
    );

    expect(parseMarkdown(input)).toEqual({
      children: output,
    });
  });

  it('parse paragraph with leading linebreaks in the middle', () => {
    const input = `
Paragaph with two new Lines\\
\\
followed by text`;

    const output = (
      <fragment>
        <hp>
          <htext>Paragaph with two new Lines</htext>
          <htext>{'\n'}</htext>
          <htext>{'\n'}</htext>
          <htext>followed by text</htext>
        </hp>
      </fragment>
    );

    expect(parseMarkdown(input)).toEqual({
      children: output,
    });
  });

  it('parse leading empty paragraphts as <br />', () => {
    const input = `
Paragaph followed by two empty paragraphts

<br />

<br />`;

    const output = (
      <fragment>
        <hp>Paragaph followed by two empty paragraphts</hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext />
        </hp>
      </fragment>
    );

    expect(parseMarkdown(input)).toEqual({
      children: output,
    });
  });

  it('collapse leading linebreak - collapsing break', () => {
    const input = `
> Blockquote followed by emtpy lines
>
>`;

    const output = (
      <fragment>
        <hblockquote>
          <hp>Blockquote followed by emtpy lines</hp>
        </hblockquote>
      </fragment>
    );

    expect(parseMarkdown(input)).toEqual({
      children: output,
    });
  });
});
