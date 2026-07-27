/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt } from '@platejs/test-utils';

import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
  BoldRules,
  CodeRules,
  HighlightRules,
  ItalicRules,
  MarkComboRules,
  ScriptRules,
  StrikethroughRules,
  UnderlineRules,
} from './index';

jsxt;

const basicMarkPlugins = [
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
] as const;

describe('basic mark input rules', () => {
  it('stays literal until markdown groups are explicitly enabled', () => {
    const input = (
      <editor>
        <hp>
          **hello*
          <cursor />
        </hp>
      </editor>
    );
    const output = (
      <editor>
        <hp>**hello**</hp>
      </editor>
    );

    const editor = createBaseEditor({
      plugins: [BaseBoldPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.insert('*');

    expect(editor.read.children()).toEqual(output.children);
  });

  it.each([
    {
      input: (
        <editor>
          <hp>
            __hello_
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext underline>hello</htext>
          </hp>
        </editor>
      ),
      plugin: BaseUnderlinePlugin.configure({
        inputRules: [UnderlineRules.markdown()],
      }),
      text: ['_'],
      title: 'formats underline delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            ==hello=
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext highlight>hello</htext>
          </hp>
        </editor>
      ),
      plugin: BaseHighlightPlugin.configure({
        inputRules: [HighlightRules.markdown({ variant: '==' })],
      }),
      text: ['='],
      title: 'formats highlight delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            ~hello
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext script="sub">hello</htext>
          </hp>
        </editor>
      ),
      plugin: BaseScriptPlugin.configure({
        inputRules: [ScriptRules.markdown({ value: 'sub' })],
      }),
      text: ['~'],
      title: 'formats subscript delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            ^hello
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext script="sup">hello</htext>
          </hp>
        </editor>
      ),
      plugin: BaseScriptPlugin.configure({
        inputRules: [ScriptRules.markdown({ value: 'sup' })],
      }),
      text: ['^'],
      title: 'formats superscript delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            **hello*
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext bold>hello</htext>
          </hp>
        </editor>
      ),
      plugin: BaseBoldPlugin.configure({
        inputRules: [BoldRules.markdown({ variant: '*' })],
      }),
      text: ['*'],
      title: 'formats strong delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            *hello
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext italic>hello</htext>
          </hp>
        </editor>
      ),
      plugin: BaseItalicPlugin.configure({
        inputRules: [ItalicRules.markdown({ variant: '*' })],
      }),
      text: ['*'],
      title: 'formats emphasis delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            `hello
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext code>hello</htext>
          </hp>
        </editor>
      ),
      plugin: BaseCodePlugin.configure({
        inputRules: [CodeRules.markdown()],
      }),
      text: ['`'],
      title: 'formats code delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            ~~hello~
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext strikethrough>hello</htext>
          </hp>
        </editor>
      ),
      plugin: BaseStrikethroughPlugin.configure({
        inputRules: [StrikethroughRules.markdown()],
      }),
      text: ['~'],
      title: 'formats strikethrough delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            **hello*
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext bold italic>
              hello
            </htext>
          </hp>
        </editor>
      ),
      plugin: BaseBoldPlugin.configure({
        inputRules: [MarkComboRules.markdown({ variant: 'boldItalic' })],
      }),
      text: ['*'],
      title: 'formats combined bold italic delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            __hello*
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext underline bold>
              hello
            </htext>
          </hp>
        </editor>
      ),
      plugin: BaseBoldPlugin.configure({
        inputRules: [MarkComboRules.markdown({ variant: 'boldUnderline' })],
      }),
      text: ['*'],
      title: 'formats combined bold underline delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            ___hello**
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext underline bold italic>
              hello
            </htext>
          </hp>
        </editor>
      ),
      plugin: BaseBoldPlugin.configure({
        inputRules: [
          MarkComboRules.markdown({ variant: 'boldItalicUnderline' }),
        ],
      }),
      text: ['*'],
      title: 'formats combined bold italic underline delimiters',
    },
    {
      input: (
        <editor>
          <hp>
            __hello*
            <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext underline italic>
              hello
            </htext>
          </hp>
        </editor>
      ),
      plugin: BaseBoldPlugin.configure({
        inputRules: [MarkComboRules.markdown({ variant: 'italicUnderline' })],
      }),
      text: ['*'],
      title: 'formats combined italic underline delimiters',
    },
  ])('$title', ({ input, output, plugin, text }) => {
    const editor = createBaseEditor({
      plugins: [
        ...basicMarkPlugins.filter((candidate) => candidate.key !== plugin.key),
        plugin,
      ],
      selection: input.selection,
      initialValue: input.children,
    });

    text.forEach((step) => {
      editor.update.text.insert(step);
    });

    expect(editor.read.children()).toEqual(output.children);
  });
});
