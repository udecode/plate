/** @jsx jsxt */

import { BaseHighlightPlugin } from '@platejs/basic-nodes';
import { BaseCodeBlockPlugin } from '@platejs/code-block';
import { createSlateEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { AutoformatKit } from '@/registry/components/editor/plugins/autoformat-kit';

jsxt;

const createCurrentKitEditor = ({
  plugins = [],
  selection,
  value,
}: {
  plugins?: any[];
  selection?: any;
  value: any;
}) =>
  createSlateEditor({
    plugins: [...plugins, ...AutoformatKit],
    selection,
    value,
  } as any);

describe('AutoformatKit current contract', () => {
  it('applies arrow substitution in the shipped kit surface', () => {
    const input = (
      <fragment>
        <hp>
          -
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>→</hp>
      </fragment>
    ) as any;

    const editor = createCurrentKitEditor({
      value: input,
    });

    editor.tf.insertText('>');

    expect(input.children).toEqual(output.children);
  });

  it('lets highlight mark autoformat win before equality text substitution', () => {
    const input = (
      <fragment>
        <hp>
          ==hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          <htext highlight>hello</htext>
        </hp>
      </fragment>
    ) as any;

    const editor = createCurrentKitEditor({
      plugins: [BaseHighlightPlugin],
      value: input,
    });

    editor.tf.insertText('=');
    editor.tf.insertText('=');

    expect(input.children).toEqual(output.children);
  });

  it('keeps shorthand literal inside code blocks because the kit gates autoformat there', () => {
    const input = (
      <fragment>
        <hcodeblock>
          <hcodeline>
            -
            <cursor />
          </hcodeline>
        </hcodeblock>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hcodeblock>
          <hcodeline>--</hcodeline>
        </hcodeblock>
      </fragment>
    ) as any;

    const editor = createCurrentKitEditor({
      plugins: [BaseCodeBlockPlugin],
      value: input,
    });

    editor.tf.insertText('-');

    expect(input.children).toEqual(output.children);
  });
});
