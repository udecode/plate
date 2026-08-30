/** @jsx jsxt */

import { jsxt } from '@platejs/test';
import {
  BaseHighlightPlugin,
  BaseCodeBlockPlugin,
  createEditor,
} from 'platejs';

import { AutoformatKit } from '@/registry/components/editor/autoformat';

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
  createEditor({
    plugins: [BaseCodeBlockPlugin, ...plugins, ...AutoformatKit],
    selection,
    initialValue: value,
  } as any);

const insertText = (
  editor: ReturnType<typeof createCurrentKitEditor>,
  text: string
) => {
  editor.update.text.insert(text);
};

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

    insertText(editor, '>');

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

    insertText(editor, '=');
    insertText(editor, '=');

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
      value: input,
    });

    insertText(editor, '-');

    expect(input.children).toEqual(output.children);
  });
});
