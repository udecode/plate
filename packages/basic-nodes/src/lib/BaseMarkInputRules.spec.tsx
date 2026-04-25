/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
  BoldRules,
  CodeRules,
  HighlightRules,
  ItalicRules,
  MarkComboRules,
  StrikethroughRules,
  SubscriptRules,
  SuperscriptRules,
  UnderlineRules,
} from './index';

jsxt;

describe('basic mark input rules', () => {
  it('stays literal until markdown groups are explicitly enabled', () => {
    const input = (
      <fragment>
        <hp>
          **hello*
          <cursor />
        </hp>
      </fragment>
    ) as any;
    const output = (
      <fragment>
        <hp>**hello**</hp>
      </fragment>
    ) as any;

    const editor = createSlateEditor({
      plugins: [BaseBoldPlugin],
      value: input,
    } as any);

    editor.tf.insertText('*');

    expect(input.children).toEqual(output.children);
  });

  it.each([
    {
      input: (
        <fragment>
          <hp>
            __hello_
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext underline>hello</htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseUnderlinePlugin.configure({
        inputRules: [UnderlineRules.markdown()],
      }),
      text: ['_'],
      title: 'formats underline delimiters',
    },
    {
      input: (
        <fragment>
          <hp>
            ==hello=
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext highlight>hello</htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseHighlightPlugin.configure({
        inputRules: [HighlightRules.markdown({ variant: '==' })],
      }),
      text: ['='],
      title: 'formats highlight delimiters',
    },
    {
      input: (
        <fragment>
          <hp>
            ~hello
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext sub>hello</htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseSubscriptPlugin.configure({
        inputRules: [SubscriptRules.markdown()],
      }),
      text: ['~'],
      title: 'formats subscript delimiters',
    },
    {
      input: (
        <fragment>
          <hp>
            ^hello
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext sup>hello</htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseSuperscriptPlugin.configure({
        inputRules: [SuperscriptRules.markdown()],
      }),
      text: ['^'],
      title: 'formats superscript delimiters',
    },
    {
      input: (
        <fragment>
          <hp>
            **hello*
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext bold>hello</htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseBoldPlugin.configure({
        inputRules: [BoldRules.markdown({ variant: '*' })],
      }),
      text: ['*'],
      title: 'formats strong delimiters',
    },
    {
      input: (
        <fragment>
          <hp>
            *hello
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext italic>hello</htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseItalicPlugin.configure({
        inputRules: [ItalicRules.markdown({ variant: '*' })],
      }),
      text: ['*'],
      title: 'formats emphasis delimiters',
    },
    {
      input: (
        <fragment>
          <hp>
            `hello
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext code>hello</htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseCodePlugin.configure({
        inputRules: [CodeRules.markdown()],
      }),
      text: ['`'],
      title: 'formats code delimiters',
    },
    {
      input: (
        <fragment>
          <hp>
            ~~hello~
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext strikethrough>hello</htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseStrikethroughPlugin.configure({
        inputRules: [StrikethroughRules.markdown()],
      }),
      text: ['~'],
      title: 'formats strikethrough delimiters',
    },
    {
      input: (
        <fragment>
          <hp>
            **hello*
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext bold italic>
              hello
            </htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseBoldPlugin.configure({
        inputRules: [MarkComboRules.markdown({ variant: 'boldItalic' })],
      }),
      text: ['*'],
      title: 'formats combined bold italic delimiters',
    },
    {
      input: (
        <fragment>
          <hp>
            __hello*
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext underline bold>
              hello
            </htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseBoldPlugin.configure({
        inputRules: [MarkComboRules.markdown({ variant: 'boldUnderline' })],
      }),
      text: ['*'],
      title: 'formats combined bold underline delimiters',
    },
    {
      input: (
        <fragment>
          <hp>
            ___hello**
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext underline bold italic>
              hello
            </htext>
          </hp>
        </fragment>
      ) as any,
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
        <fragment>
          <hp>
            __hello*
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext underline italic>
              hello
            </htext>
          </hp>
        </fragment>
      ) as any,
      plugin: BaseBoldPlugin.configure({
        inputRules: [MarkComboRules.markdown({ variant: 'italicUnderline' })],
      }),
      text: ['*'],
      title: 'formats combined italic underline delimiters',
    },
  ])('$title', ({ input, output, plugin, text }) => {
    const editor = createSlateEditor({
      plugins: [plugin],
      value: input,
    } as any);

    text.forEach((step) => {
      editor.tf.insertText(step);
    });

    expect(input.children).toEqual(output.children);
  });
});
