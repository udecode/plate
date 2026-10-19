/** @jsx jsxt */

import { jsxt } from '@platejs/test';
import {
  BaseHighlightPlugin,
  BaseCodeBlockPlugin,
  createEditor,
} from 'platejs';

import { AutoformatKit } from '@/registry/components/editor/autoformat';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';

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

  it('turns each compound negated symbol into its single configured symbol [plate#5202]', () => {
    const editor = createCurrentKitEditor({
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        kind: 'text',
      },
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    for (const char of '!>= !<= !~=') insertText(editor, char);

    expect(editor.read.children()).toEqual([
      { children: [{ text: '≱ ≰ ≉' }], type: 'paragraph' },
    ]);
  });

  it('applies bold and italic to typed triple asterisks while double asterisks stay bold only [plate#5203]', () => {
    const editor = createCurrentKitEditor({
      plugins: [...BasicMarksKit],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        kind: 'text',
      },
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    for (const char of '***both*** **bold**') insertText(editor, char);

    expect(editor.read.children()).toEqual([
      {
        children: [
          { bold: true, italic: true, text: 'both' },
          { text: ' ' },
          { bold: true, text: 'bold' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('highlights typed ==word== even though its opening == turns into ≡ first [plate#5201]', () => {
    const editor = createCurrentKitEditor({
      plugins: [...BasicMarksKit],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        kind: 'text',
      },
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    for (const char of '==yellow== x') insertText(editor, char);

    expect(editor.read.children()).toEqual([
      {
        children: [{ highlight: true, text: 'yellow' }, { text: ' x' }],
        type: 'paragraph',
      },
    ]);
  });

  it('applies subscript and superscript to typed ~2~ and ^2^ instead of unicode digits [plate#5204]', () => {
    const editor = createCurrentKitEditor({
      plugins: [...BasicMarksKit],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        kind: 'text',
      },
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    for (const char of 'a ~2~ b ^2^ c') insertText(editor, char);

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'a ' },
          { script: 'sub', text: '2' },
          { text: ' b ' },
          { script: 'sup', text: '2' },
          { text: ' c' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('applies subscript and superscript to typed H~2~O X^2^ inside words [plate#5204] [EDIT-PROFILE-AUTOFMT-MARK-002]', () => {
    const editor = createCurrentKitEditor({
      plugins: [...BasicMarksKit],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        kind: 'text',
      },
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    for (const char of 'H~2~O X^2^') insertText(editor, char);

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: 'H' },
          { script: 'sub', text: '2' },
          { text: 'O X' },
          { script: 'sup', text: '2' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('keeps typed a`b and `x^2^ literal where a backtick would close inline code over it [plate#5204] [EDIT-PROFILE-AUTOFMT-MARK-004]', () => {
    const editor = createCurrentKitEditor({
      plugins: [...BasicMarksKit],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        kind: 'text',
      },
      value: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    for (const char of 'a`b and `x^2^') insertText(editor, char);

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'a`b and `x^2^' }], type: 'paragraph' },
    ]);
  });

  it('keeps shorthand literal inside code blocks because the kit gates autoformat there', () => {
    const input = (
      <fragment>
        <hcodeblock>
          -
          <cursor />
        </hcodeblock>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hcodeblock>--</hcodeblock>
      </fragment>
    ) as any;

    const editor = createCurrentKitEditor({
      value: input,
    });

    insertText(editor, '-');

    expect(input.children).toEqual(output.children);
  });
});
