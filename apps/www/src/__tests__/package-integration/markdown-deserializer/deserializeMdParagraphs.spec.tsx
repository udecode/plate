/** @jsx jsxt */

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  ScriptPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { BaseBlockquotePlugin } from '@platejs/basic-nodes';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { jsxt } from '@platejs/test-utils';
import { createBaseEditor } from 'platejs';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { MarkdownPlugin } from '../../../../../../packages/markdown/src/lib/MarkdownPlugin';

jsxt;

const markdownPlugin = MarkdownPlugin.configure({
  initialState: {
    disallowedNodes: [SuggestionPlugin.name],
    remarkPlugins: [remarkMath, remarkGfm],
  },
});

const createTestEditor = () =>
  createBaseEditor({
    plugins: [
      markdownPlugin,
      BaseBlockquotePlugin,
      BaseSuggestionPlugin,
      BoldPlugin,
      CodePlugin,
      ItalicPlugin,
      StrikethroughPlugin,
      ScriptPlugin,
      UnderlinePlugin,
    ],
  });

const editor = createTestEditor();

describe('editor.api.markdown.deserialize - paragraph', () => {
  it('deserialize paragraph with one linebreak', () => {
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

    expect(editor.api.markdown.deserialize(input)).toEqual({
      children: output,
    });
  });

  it('deserialize paragraph with two leading linebreaks', () => {
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

    expect(editor.api.markdown.deserialize(input)).toEqual({
      children: output,
    });
  });

  it('deserialize paragraph with leading linebreaks in the middle', () => {
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

    expect(editor.api.markdown.deserialize(input)).toEqual({
      children: output,
    });
  });

  it('deserialize paragraph with leading linebreaks in the middle', () => {
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

    expect(editor.api.markdown.deserialize(input)).toEqual({
      children: output,
    });
  });

  it('deserialize leading empty paragraphts as <br />', () => {
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

    expect(editor.api.markdown.deserialize(input)).toEqual({
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

    expect(editor.api.markdown.deserialize(input)).toEqual({
      children: output,
    });
  });
});
