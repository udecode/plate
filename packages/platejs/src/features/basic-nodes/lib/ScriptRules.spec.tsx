/** @jsxRuntime classic */
/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import { createEditor, definePlugin, schema } from '../../../core';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseScriptPlugin,
  BaseStrikethroughPlugin,
  BoldRules,
  CodeRules,
  ItalicRules,
  ScriptRules,
  StrikethroughRules,
} from './index';

jsxt;

const markdownMarkPlugins = [
  BaseBoldPlugin.configure({
    inputRules: [
      BoldRules.markdown({ variant: '*' }),
      BoldRules.markdown({ variant: '_' }),
    ],
  }),
  BaseItalicPlugin.configure({
    inputRules: [
      ItalicRules.markdown({ variant: '*' }),
      ItalicRules.markdown({ variant: '_' }),
    ],
  }),
  BaseCodePlugin.configure({ inputRules: [CodeRules.markdown()] }),
  BaseStrikethroughPlugin.configure({
    inputRules: [StrikethroughRules.markdown()],
  }),
  BaseScriptPlugin.configure({
    inputRules: [
      ScriptRules.markdown({ value: 'sub' }),
      ScriptRules.markdown({ value: 'sup' }),
    ],
  }),
];

const typeKeys = (
  keys: string,
  {
    input = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ),
    plugins = markdownMarkPlugins,
  }: { input?: any; plugins?: readonly any[] } = {}
) => {
  const editor = createEditor({
    plugins: [...plugins],
    selection: input.selection,
    initialValue: input.children,
  });

  for (const key of keys) editor.update.text.insert(key);

  return editor.read.children();
};

describe('script shorthand inside a word [plate#5204]', () => {
  it.each([
    {
      keys: 'H~2~',
      output: (
        <editor>
          <hp>
            H<htext script="sub">2</htext>
          </hp>
        </editor>
      ),
    },
    {
      keys: 'X^2^',
      output: (
        <editor>
          <hp>
            X<htext script="sup">2</htext>
          </hp>
        </editor>
      ),
    },
    {
      keys: '10^-3^',
      output: (
        <editor>
          <hp>
            10<htext script="sup">-3</htext>
          </hp>
        </editor>
      ),
    },
    {
      keys: 'Ca^2+^',
      output: (
        <editor>
          <hp>
            Ca<htext script="sup">2+</htext>
          </hp>
        </editor>
      ),
    },
    {
      keys: '(a+b)^2^',
      output: (
        <editor>
          <hp>
            (a+b)<htext script="sup">2</htext>
          </hp>
        </editor>
      ),
    },
    {
      keys: 'a ~foo bar~',
      output: (
        <editor>
          <hp>
            a <htext script="sub">foo bar</htext>
          </hp>
        </editor>
      ),
    },
    {
      keys: '``a^b^',
      output: (
        <editor>
          <hp>
            ``a<htext script="sup">b</htext>
          </hp>
        </editor>
      ),
    },
    {
      keys: '``a`b`` H~2~',
      output: (
        <editor>
          <hp>
            ``a`b`` H<htext script="sub">2</htext>
          </hp>
        </editor>
      ),
    },
    {
      keys: '`x` H~2~',
      output: (
        <editor>
          <hp>
            <htext code>x</htext> H<htext script="sub">2</htext>
          </hp>
        </editor>
      ),
    },
  ])('marks typed $keys', ({ keys, output }) => {
    expect(typeKeys(keys)).toEqual(output.children);
  });

  it.each([
    'a**word**',
    'a~~word~~',
    '\\~2~',
    'H~2\\~',
    'x^2+y^',
    '(^3^)',
    '3~5天，需要2~',
    '`a^b^',
    '\\` `a^b^',
    'a`b and `x^2^',
  ])('keeps typed %s literal [EDIT-PROFILE-AUTOFMT-MARK-004]', (keys) => {
    expect(typeKeys(keys)).toEqual(
      (
        <editor>
          <hp>{keys}</hp>
        </editor>
      ).children
    );
  });

  it.each([
    {
      input: (
        <editor>
          <hp>
            <htext code>`</htext>
            <htext>
              {' '}
              <cursor />
            </htext>
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            <htext code>`</htext> H<htext script="sub">2</htext>
          </hp>
        </editor>
      ),
      title: 'after a code leaf that holds a backtick',
    },
    {
      input: (
        <editor>
          <hp>
            Wrap ` here <cursor />
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            Wrap ` here H<htext script="sub">2</htext>
          </hp>
        </editor>
      ),
      title: 'after a bare backtick between spaces',
    },
    {
      input: (
        <editor>
          <hp>
            <cursor />
            {' then `'}
          </hp>
        </editor>
      ),
      output: (
        <editor>
          <hp>
            H<htext script="sub">2</htext>
            {' then `'}
          </hp>
        </editor>
      ),
      title: 'before a backtick later in the paragraph',
    },
  ])('marks H~2~ typed $title', ({ input, output }) => {
    expect(typeKeys('H~2~', { input })).toEqual(output.children);
  });

  it.each([
    {
      input: (
        <editor>
          <hp>
            <htext code>
              a<cursor />
            </htext>
          </hp>
        </editor>
      ),
      keys: '^b^',
      output: (
        <editor>
          <hp>
            <htext code>a^b^</htext>
          </hp>
        </editor>
      ),
      title: 'typed in a code leaf',
    },
    {
      input: (
        <editor>
          <hp>
            <htext code>a^b</htext>
            <htext>
              c<cursor />
            </htext>
          </hp>
        </editor>
      ),
      keys: '^',
      output: (
        <editor>
          <hp>
            <htext code>a^b</htext>c^
          </hp>
        </editor>
      ),
      title: 'whose opener sits in a code leaf',
    },
  ])('keeps a script shorthand $title literal', ({ input, keys, output }) => {
    expect(typeKeys(keys, { input })).toEqual(output.children);
  });

  it.each([
    {
      input: (
        <editor>
          <hp>
            <htext bold>a</htext>
            <htext>
              `x
              <cursor />
            </htext>
          </hp>
        </editor>
      ),
      keys: '^2^`',
      output: (
        <editor>
          <hp>
            <htext bold>a</htext>
            <htext code>x^2^</htext>
          </hp>
        </editor>
      ),
      title: 'opens a code span at the start of a text run',
    },
    {
      input: (
        <editor>
          <hp>
            <htext code>`x</htext>
            <htext>
              {' H'}
              <cursor />
            </htext>
          </hp>
        </editor>
      ),
      keys: '~2~',
      output: (
        <editor>
          <hp>
            <htext code>`x</htext> H~2~
          </hp>
        </editor>
      ),
      title: 'opens a code span inside a code leaf',
    },
    {
      input: (
        <editor>
          <hp>
            `x<htext code>`</htext>
            <htext>
              {' H'}
              <cursor />
            </htext>
          </hp>
        </editor>
      ),
      keys: '~2~',
      output: (
        <editor>
          <hp>
            `x<htext code>`</htext> H<htext script="sub">2</htext>
          </hp>
        </editor>
      ),
      title: 'cannot open before a space',
    },
    {
      input: (
        <editor>
          <hp>
            `x<htext code>`</htext>
            <htext>
              H<cursor />
            </htext>
          </hp>
        </editor>
      ),
      keys: '~2~',
      output: (
        <editor>
          <hp>
            `x<htext code>`</htext>H~2~
          </hp>
        </editor>
      ),
      title: 'opens a code span at a backtick inside a code leaf',
    },
  ])(
    'follows the code rule when its backtick $title',
    ({ input, keys, output }) => {
      expect(typeKeys(keys, { input })).toEqual(output.children);
    }
  );

  it.each([
    { closer: '~', text: ' H~2' },
    { closer: '^', text: ' X^2' },
  ])(
    'keeps a $closer shorthand literal when the code rule wraps it across a read-only inline element',
    ({ closer, text }) => {
      const ReadOnlyInlinePlugin = definePlugin('readOnlyInline', {
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
            inline: true,
            readOnly: true,
          },
        },
      });
      const editor = createEditor({
        plugins: [...markdownMarkPlugins, ReadOnlyInlinePlugin],
        selection: {
          anchor: { offset: text.length, path: [0, 2] },
          focus: { offset: text.length, path: [0, 2] },
          kind: 'text',
        },
        initialValue: [
          {
            children: [
              { text: '`a' },
              { children: [{ text: '`' }], type: 'readOnlyInline' },
              { text },
            ],
            type: 'paragraph',
          },
        ],
      });

      editor.update.text.insert(closer);

      expect(editor.read.children()[0].children.at(-1)).toEqual({
        text: text + closer,
      });
    }
  );

  it.each(['H~2~', 'X^2^'])(
    'types the closer of %s as code when code is toggled on before it',
    (keys) => {
      const editor = createEditor({
        plugins: [...markdownMarkPlugins],
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
          kind: 'text',
        },
        initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      });

      for (const key of keys.slice(0, -1)) editor.update.text.insert(key);
      editor.update.marks.add('code', true);
      editor.update.text.insert(keys.at(-1)!);

      expect(editor.read.children()).toEqual([
        {
          children: [
            { text: keys.slice(0, -1) },
            { code: true, text: keys.at(-1) },
          ],
          type: 'paragraph',
        },
      ]);
    }
  );

  it('keeps the character after the caret when italic completes mid-paragraph', () => {
    expect(
      typeKeys('*a*', {
        input: (
          <editor>
            <hp>
              <cursor />
              {' then'}
            </hp>
          </editor>
        ),
      })
    ).toEqual(
      (
        <editor>
          <hp>
            <htext italic>a</htext> then
          </hp>
        </editor>
      ).children
    );
  });

  it.each([
    { order: 'strikethrough first', reverse: false },
    { order: 'script first', reverse: true },
  ])('gives ~~strike~~ strikethrough with $order', ({ reverse }) => {
    const plugins = [
      BaseStrikethroughPlugin.configure({
        inputRules: [StrikethroughRules.markdown()],
      }),
      BaseScriptPlugin.configure({
        inputRules: [ScriptRules.markdown({ value: 'sub' })],
      }),
    ];

    expect(
      typeKeys('~~strike~~', {
        plugins: reverse ? plugins.reverse() : plugins,
      })
    ).toEqual(
      (
        <editor>
          <hp>
            <htext strikethrough>strike</htext>
          </hp>
        </editor>
      ).children
    );
  });
});
