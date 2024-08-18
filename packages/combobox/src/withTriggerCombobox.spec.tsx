/** @jsx jsx */

import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@udecode/plate-combobox';
import { createSlatePlugin } from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

const ExampleComboboxPlugin = createSlatePlugin<
  string,
  TriggerComboboxPluginOptions
>({
  key: 'exampleCombobox',
  plugins: [
    createSlatePlugin({
      isElement: true,
      isInline: true,
      isVoid: true,
      key: 'mention_input',
    }),
  ],
  withOverrides: withTriggerCombobox,
});

const plugins = [
  ParagraphPlugin,

  ExampleComboboxPlugin.extend<TriggerComboboxPluginOptions>({
    key: 'exampleCombobox1',
    options: {
      createComboboxInput: (trigger) => ({
        children: [{ text: '' }],
        trigger,
        type: 'mention_input',
      }),
      trigger: ['@', '#'],
      triggerPreviousCharPattern: /^$|^[\s"']$/,
    },
  }),

  ExampleComboboxPlugin.extend<TriggerComboboxPluginOptions>({
    key: 'exampleCombobox2',
    options: {
      createComboboxInput: () => ({
        children: [{ text: '' }],
        trigger: ':',
        type: 'mention_input',
      }),
      trigger: ':',
      triggerPreviousCharPattern: /^\s?$/,
    },
  }),
];

const createEditorWithCombobox = (chidren: any) =>
  createPlateEditor({
    editor: (<editor>{chidren}</editor>) as any,
    plugins,
  });

jsx;

describe('withTriggerCombobox', () => {
  ['@', '#', ':'].forEach((trigger) => {
    describe(`when typing "${trigger}"`, () => {
      it('should insert a combobox input when the trigger is inserted between words', () => {
        const editor = createEditorWithCombobox(
          <hp>
            hello <cursor /> world
          </hp>
        );

        editor.insertText(trigger);

        expect(editor.children).toEqual([
          <hp>
            <htext>hello </htext>
            <hmentioninput trigger={trigger}>
              <htext />
              <cursor />
            </hmentioninput>
            <htext> world</htext>
          </hp>,
        ]);
      });

      it('should insert a combobox input when the trigger is inserted at line beginning followed by a whitespace', () => {
        const editor = createEditorWithCombobox(
          <hp>
            <cursor /> hello world
          </hp>
        );

        editor.insertText(trigger);

        expect(editor.children).toEqual([
          <hp>
            <htext />
            <hmentioninput trigger={trigger}>
              <htext />
              <cursor />
            </hmentioninput>
            <htext> hello world</htext>
          </hp>,
        ]);
      });

      it('should insert a combobox input when the trigger is inserted at line end preceded by a whitespace', () => {
        const editor = createEditorWithCombobox(
          <hp>
            hello world <cursor />
          </hp>
        );

        editor.insertText(trigger);

        expect(editor.children).toEqual([
          <hp>
            <htext>hello world </htext>
            <hmentioninput trigger={trigger}>
              <htext />
              <cursor />
            </hmentioninput>
            <htext />
          </hp>,
        ]);
      });

      it('should insert the trigger as text when the trigger is appended to a word', () => {
        const editor = createEditorWithCombobox(
          <hp>
            hello
            <cursor />
          </hp>
        );

        editor.insertText(trigger);

        expect(editor.children).toEqual([
          <hp>
            hello{trigger}
            <cursor />
          </hp>,
        ]);
      });

      it('should insert a combobox input when the trigger is prepended to a word', () => {
        const editor = createEditorWithCombobox(
          <hp>
            <cursor />
            hello
          </hp>
        );

        editor.insertText(trigger);

        expect(editor.children).toEqual([
          <hp>
            <htext />
            <hmentioninput trigger={trigger}>
              <htext />
              <cursor />
            </hmentioninput>
            hello
          </hp>,
        ]);
      });

      it('should insert the trigger as text when the trigger is inserted into a word', () => {
        const editor = createEditorWithCombobox(
          <hp>
            hel
            <cursor />
            lo
          </hp>
        );

        editor.insertText(trigger);

        expect(editor.children).toEqual([
          <hp>
            hel{trigger}
            <cursor />
            lo
          </hp>,
        ]);
      });
    });
  });

  it('should insert text when not trigger', () => {
    const editor = createEditorWithCombobox(
      <hp>
        <cursor />
      </hp>
    );

    editor.insertText('a');

    expect(editor.children).toEqual([<hp>a</hp>]);
  });

  it('should insert a combobox input when the trigger is inserted after the specified pattern', () => {
    const editor = createEditorWithCombobox(
      <hp>
        hello "<cursor />"
      </hp>
    );

    editor.insertText('@');

    expect(editor.children).toEqual([
      <hp>
        <htext>hello "</htext>
        <hmentioninput trigger="@">
          <htext />
          <cursor />
        </hmentioninput>
        <htext>"</htext>
      </hp>,
    ]);
  });
});
