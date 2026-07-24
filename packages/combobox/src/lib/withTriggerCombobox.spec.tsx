/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  type BasePluginInput,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { type Element, property } from '@platejs/plite';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import type { TriggerComboboxPluginOptions } from './types';

import { withTriggerCombobox } from './withTriggerCombobox';

const ExampleComboboxInputPlugin = createBasePlugin({
  key: 'mentionInput',
  schema: {
    element: {
      inline: true,
      properties: {
        trigger: property.string(),
        userId: property.string(),
      },
      void: 'inline',
    },
  },
  type: 'mention_input',
});

const createExampleComboboxPlugin = <const K extends string>(
  key: K,
  options: TriggerComboboxPluginOptions
) =>
  createBasePlugin({
    key,
    dependencies: [ExampleComboboxInputPlugin],
    options,
  }).extendExtension(withTriggerCombobox);

const readonlyTriggers = ['@', '#'] as const;

const plugins = [
  BaseParagraphPlugin,

  createExampleComboboxPlugin('exampleCombobox1', {
    trigger: readonlyTriggers,
    triggerPreviousCharPattern: /^$|^[\s"']$/,
    createComboboxInput: (trigger) => ({
      children: [{ text: '' }],
      trigger,
      type: 'mention_input',
    }),
  }),

  createExampleComboboxPlugin('exampleCombobox2', {
    trigger: ':',
    triggerPreviousCharPattern: /^\s?$/,
    createComboboxInput: () => ({
      children: [{ text: '' }],
      trigger: ':',
      type: 'mention_input',
    }),
  }),
];

const RegexComboboxPlugin = createBasePlugin({
  key: 'regexCombobox',
  dependencies: [ExampleComboboxInputPlugin],
  options: {
    trigger: /[@#]/,
    triggerPreviousCharPattern: /^$|^[\s"']$/,
  },
  schema: {
    element: {
      inline: true,
      properties: {
        trigger: property.string(),
        userId: property.string(),
      },
      void: 'inline',
    },
  },
  type: 'exampleCombobox',
}).extendExtension(withTriggerCombobox);

const QueryComboboxPlugin = createExampleComboboxPlugin('queryCombobox', {
  trigger: '@',
  triggerPreviousCharPattern: /^$|^[\s"']$/,
  createComboboxInput: () => ({
    children: [{ text: '' }],
    trigger: '@',
    type: 'mention_input',
  }),
  triggerQuery: () => false,
});

const createEditorWithCombobox = (
  children: Element,
  editorPlugins: readonly BasePluginInput[] = plugins
) => {
  const input = (<editor>{children}</editor>) as TestEditor;

  return createBaseEditor({
    plugins: editorPlugins,
    selection: input.selection,
    initialValue: input.children,
  });
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

        editor.update.text.insert(trigger);

        expect(editor.read.children()).toEqual([
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

        editor.update.text.insert(trigger);

        expect(editor.read.children()).toEqual([
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

        editor.update.text.insert(trigger);

        expect(editor.read.children()).toEqual([
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

        editor.update.text.insert(trigger);

        expect(editor.read.children()).toEqual([
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

        editor.update.text.insert(trigger);

        expect(editor.read.children()).toEqual([
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

        editor.update.text.insert(trigger);

        expect(editor.read.children()).toEqual([
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

    editor.update.text.insert('a');

    expect(editor.read.children()).toEqual([<hp>a</hp>]);
  });

  it('insert a combobox input when the trigger is inserted after the specified pattern', () => {
    const editor = createEditorWithCombobox(
      <hp>
        hello "<cursor />"
      </hp>
    );

    editor.update.text.insert('@');

    expect(editor.read.children()).toEqual([
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
      [BaseParagraphPlugin, RegexComboboxPlugin]
    );

    editor.runtime.userId = 'user-1';
    editor.update.text.insert('@');

    expect(editor.read.children()).toEqual([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            type: 'exampleCombobox',
            userId: 'user-1',
          },
          { text: '' },
        ],
        type: 'p',
      },
    ]);
  });

  it('insert plain text when triggerQuery vetoes the combobox', () => {
    const editor = createEditorWithCombobox(
      <hp>
        <cursor />
      </hp>,
      [BaseParagraphPlugin, QueryComboboxPlugin]
    );

    editor.update.text.insert('@');

    expect(editor.read.children()).toEqual([<hp>@</hp>]);
  });

  it('insert plain text when insertion uses an explicit at location', () => {
    const editor = createEditorWithCombobox(<hp>hello</hp>);

    editor.update.text.insert('@', {
      at: { offset: 0, path: [0, 0] },
    });

    expect(editor.read.children()).toEqual([<hp>@hello</hp>]);
  });
});
