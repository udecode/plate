/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { BaseSuggestionPlugin } from '@udecode/plate-suggestion';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import { jsxt } from '@udecode/plate-test-utils';
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
  it('should deserialize empty paragraph with one soft linebreak', () => {
    const input = `
<p><br /></p>`;

    const output = (
      <fragment>
        <hp>
          <htext>{'\n'}</htext>
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize paragraph with one soft linebreak', () => {
    const input = `
Paragaph with one new Line<br />`;

    const output = (
      <fragment>
        <hp>
          <htext>Paragaph with one new Line</htext>
          <htext>{'\n'}</htext>
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize paragraph with two soft linebreak', () => {
    const input = `
Paragaph with two new Lines\\
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

  it('should deserialize paragraph with three soft linebreaks', () => {
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
          <htext>{'\n'}</htext>
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it('should deserialize paragraph with two soft linebreaks in the middle', () => {
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

  it('should deserialize paragraph with soft linebreaks in the middle', () => {
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
          <htext></htext>
        </hp>
        <hp>
          <htext></htext>
        </hp>
      </fragment>
    );

    expect(deserializeMd(editor, input)).toEqual(output);
  });

  it(String.raw`should collapse leading linebreak - collapsing break`, () => {
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
