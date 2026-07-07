/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlatePlugin } from 'platejs';
import { createSlateEditor } from 'platejs';
import { ParagraphPlugin } from 'platejs/react';

import type { TriggerComboboxPluginOptions } from './types';

import { withTriggerCombobox } from './withTriggerCombobox';

const ExampleComboboxPlugin = createSlatePlugin<
  string,
  TriggerComboboxPluginOptions
>({
  key: 'exampleCombobox',
  plugins: [
    createSlatePlugin({
      key: 'mention_input',
      node: { isElement: true, isInline: true, isVoid: true },
    }),
  ],
}).overrideEditor(withTriggerCombobox);

const plugins = [
  ParagraphPlugin,

  ExampleComboboxPlugin.extend<TriggerComboboxPluginOptions>({
    key: 'exampleCombobox1',
    options: {
      trigger: ['@', '#'],
      triggerPreviousCharPattern: /^$|^[\s"']$/,
      createComboboxInput: (trigger: string) => ({
        children: [{ text: '' }],
        trigger,
        type: 'mention_input',
      }),
    },
  }),

  ExampleComboboxPlugin.extend<TriggerComboboxPluginOptions>({
    key: 'exampleCombobox2',
    options: {
      trigger: ':',
      triggerPreviousCharPattern: /^\s?$/,
      createComboboxInput: () => ({
        children: [{ text: '' }],
        trigger: ':',
        type: 'mention_input',
      }),
    },
  }),
];

const RegexComboboxPlugin =
  ExampleComboboxPlugin.extend<TriggerComboboxPluginOptions>({
    key: 'regexCombobox',
    options: {
      trigger: /[@#]/,
      triggerPreviousCharPattern: /^$|^[\s"']$/,
    },
  });

const QueryComboboxPlugin =
  ExampleComboboxPlugin.extend<TriggerComboboxPluginOptions>({
    key: 'queryCombobox',
    options: {
      trigger: '@',
      triggerPreviousCharPattern: /^$|^[\s"']$/,
      createComboboxInput: () => ({
        children: [{ text: '' }],
        trigger: '@',
        type: 'mention_input',
      }),
      triggerQuery: () => false,
    },
  });

const createEditorWithCombobox = (chidren: any, editorPlugins = plugins) => {
  const editor = (<editor>{chidren}</editor>) as any;

  return createSlateEditor({
    plugins: editorPlugins,
    selection: editor.selection,
    value: editor.children,
  } as any);
};

jsxt;

describe('withTriggerCombobox', () => {
  ['@', '#', ':'].forEach((trigger) => {
    describe(`when typing "${trigger}"`, () => {
      it('insert a combobox input when the trigger is inserted between words', () => {
        const editor = createEditorWithCombobox(
          <hp>
            hello <cursor /> world
          </hp>
        );

        editor.tf.insertText(trigger);

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

      it('insert a combobox input when the trigger is inserted at line beginning followed by a whitespace', () => {
        const editor = createEditorWithCombobox(
          <hp>
            <cursor /> hello world
          </hp>
        );

        editor.tf.insertText(trigger);

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

      it('insert a combobox input when the trigger is inserted at line end preceded by a whitespace', () => {
        const editor = createEditorWithCombobox(
          <hp>
            hello world <cursor />
          </hp>
        );

        editor.tf.insertText(trigger);

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

      it('insert the trigger as text when the trigger is appended to a word', () => {
        const editor = createEditorWithCombobox(
          <hp>
            hello
            <cursor />
          </hp>
        );

        editor.tf.insertText(trigger);

        expect(editor.children).toEqual([
          <hp>
            hello{trigger}
            <cursor />
          </hp>,
        ]);
      });

      it('insert a combobox input when the trigger is prepended to a word', () => {
        const editor = createEditorWithCombobox(
          <hp>
            <cursor />
            hello
          </hp>
        );

        editor.tf.insertText(trigger);

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

      it('insert the trigger as text when the trigger is inserted into a word', () => {
        const editor = createEditorWithCombobox(
          <hp>
            hel
            <cursor />
            lo
          </hp>
        );

        editor.tf.insertText(trigger);

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

  it('insert text when not trigger', () => {
    const editor = createEditorWithCombobox(
      <hp>
        <cursor />
      </hp>
    );

    editor.tf.insertText('a');

    expect(editor.children).toEqual([<hp>a</hp>]);
  });

  it('insert a combobox input when the trigger is inserted after the specified pattern', () => {
    const editor = createEditorWithCombobox(
      <hp>
        hello "<cursor />"
      </hp>
    );

    editor.tf.insertText('@');

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

  it('insert the default combobox node and forwards userId when a regex trigger matches', () => {
    const editor = createEditorWithCombobox(
      <hp>
        <cursor />
      </hp>,
      [ParagraphPlugin, RegexComboboxPlugin]
    );

    editor.meta.userId = 'user-1';
    editor.tf.insertText('@');

    expect(editor.children).toEqual([
      <hp>
        <htext />
      </hp>,
      {
        children: [{ text: '' }],
        type: 'exampleCombobox',
        userId: 'user-1',
      },
    ]);
  });

  it('insert plain text when triggerQuery vetoes the combobox', () => {
    const editor = createEditorWithCombobox(
      <hp>
        <cursor />
      </hp>,
      [ParagraphPlugin, QueryComboboxPlugin]
    );

    editor.tf.insertText('@');

    expect(editor.children).toEqual([<hp>@</hp>]);
  });

  it('insert plain text when insertion uses an explicit at location', () => {
    const editor = createEditorWithCombobox(<hp>hello</hp>);

    editor.tf.insertText('@', {
      at: { offset: 0, path: [0, 0] },
    });

    expect(editor.children).toEqual([<hp>@hello</hp>]);
  });
});
