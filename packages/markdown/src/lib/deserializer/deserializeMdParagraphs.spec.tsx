/** @jsx jsxt */

import { BasicMarksPlugin } from '@platejs/basic-nodes/react';
import { BaseSuggestionPlugin } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { deserializeMd } from './deserializeMd';

jsxt;

const markdownPlugin = MarkdownPlugin.configure({
  options: {
    disallowedNodes: [SuggestionPlugin.key],
    remarkPlugins: [remarkMath, remarkGfm],
  },
});

const createTestEditor = (plugins: any[] = []) =>
  createSlateEditor({
    plugins: [
      markdownPlugin,
      BaseSuggestionPlugin,
      BasicMarksPlugin,
      ...plugins,
    ],
  });

const editor = createTestEditor();

describe('deserializeMd - paragraph', () => {
  it('should deserialize paragraph with one linebreak', () => {
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

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize paragraph with two leading linebreaks', () => {
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

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize paragraph with leading linebreaks in the middle', () => {
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

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize paragraph with leading linebreaks in the middle', () => {
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

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize leading empty paragraphts as <br />', () => {
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

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should collapse leading linebreak - collapsing break', () => {
    const input = `
> Blockquote followed by emtpy lines
>
>`;

    const output = (
      <fragment>
        <hblockquote>
          <htext>Blockquote followed by emtpy lines</htext>
        </hblockquote>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });
});
