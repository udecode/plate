/** @jsxRuntime classic */
/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import {
  createEditor,
  definePlugin,
  NodeApi,
  schema,
  SelectionApi,
} from '../../../core';
import { parseHtmlSliceContent } from '../../../internal/testing/parseHtmlSliceContent';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseHighlightPlugin,
  BaseItalicPlugin,
  BaseKbdPlugin,
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

type MarkPlugin =
  | typeof BaseBoldPlugin
  | typeof BaseCodePlugin
  | typeof BaseHighlightPlugin
  | typeof BaseItalicPlugin
  | typeof BaseKbdPlugin
  | typeof BaseScriptPlugin
  | typeof BaseStrikethroughPlugin
  | typeof BaseUnderlinePlugin;

const getMarkKey = (
  editor: ReturnType<typeof createEditor>,
  plugin: MarkPlugin
) => {
  switch (plugin.name) {
    case BaseBoldPlugin.name: {
      return editor.plugin(BaseBoldPlugin).schema.key;
    }
    case BaseCodePlugin.name: {
      return editor.plugin(BaseCodePlugin).schema.key;
    }
    case BaseHighlightPlugin.name: {
      return editor.plugin(BaseHighlightPlugin).schema.key;
    }
    case BaseItalicPlugin.name: {
      return editor.plugin(BaseItalicPlugin).schema.key;
    }
    case BaseKbdPlugin.name: {
      return editor.plugin(BaseKbdPlugin).schema.key;
    }
    case BaseScriptPlugin.name: {
      return editor.plugin(BaseScriptPlugin).schema.key;
    }
    case BaseStrikethroughPlugin.name: {
      return editor.plugin(BaseStrikethroughPlugin).schema.key;
    }
    case BaseUnderlinePlugin.name: {
      return editor.plugin(BaseUnderlinePlugin).schema.key;
    }
  }

  return undefined;
};

const getDecodedMarkReader = (plugin: MarkPlugin) => {
  const editor = createEditor({
    plugins: [plugin],
  });

  return (element: HTMLElement) => {
    const fragment = parseHtmlSliceContent(editor, element);
    const key = getMarkKey(editor, plugin);

    if (!fragment || key === undefined) return false;

    return Array.from(NodeApi.texts({ children: fragment, type: 'root' })).some(
      ([text]) => text[key]
    );
  };
};

const parseElement = (html: string) => {
  const element = new DOMParser().parseFromString(html, 'text/html').body
    .firstElementChild;

  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected HTMLElement for ${html}`);
  }

  return element;
};

describe('BaseMarkPlugins', () => {
  it('registers and parses bold as a schema-owned text property', () => {
    const editor = createEditor({
      plugins: [BaseBoldPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });
    const bold = editor.read.schema
      .getVocabulary()
      .propertyIds.find((propertyId) => propertyId.startsWith('text:bold@'));
    const data = new DataTransfer();

    data.setData('text/html', '<p><strong>bold</strong></p>');

    expect(bold).toBeDefined();
    expect(editor.api.dom.clipboard.insertData(data)).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ bold: true, text: 'bold' }], type: 'paragraph' },
    ]);
  });

  it.each([
    [
      'bold',
      BaseBoldPlugin,
      '<strong><span style="font-weight: normal">text</span></strong>',
    ],
    [
      'italic',
      BaseItalicPlugin,
      '<em><span style="font-style: normal">text</span></em>',
    ],
    [
      'underline',
      BaseUnderlinePlugin,
      '<u><span style="text-decoration: none">text</span></u>',
    ],
    [
      'strikethrough',
      BaseStrikethroughPlugin,
      '<s><span style="text-decoration: none">text</span></s>',
    ],
  ])(
    'vetoes %s parsing when a descendant resets the style',
    (_label, plugin, html) => {
      const hasDecodedMark = getDecodedMarkReader(plugin);

      expect(hasDecodedMark(parseElement(html))).toBe(false);
    }
  );

  it('skips inline code parsing inside pre blocks and paragraphs styled as code', () => {
    const hasDecodedCode = getDecodedMarkReader(BaseCodePlugin);

    expect(
      hasDecodedCode(parseElement('<pre><code>const a = 1;</code></pre>'))
    ).toBe(false);
    expect(
      hasDecodedCode(
        parseElement(
          '<p style="font-family: Consolas"><code>const b = 2;</code></p>'
        )
      )
    ).toBe(false);
  });

  it.each([
    [
      'bold',
      BaseBoldPlugin,
      'bold',
      true,
      '<span style="font-weight: 700">text</span>',
      'strong',
    ],
    ['code', BaseCodePlugin, 'code', true, '<code>text</code>', 'code'],
    [
      'highlight',
      BaseHighlightPlugin,
      'highlight',
      true,
      '<mark>text</mark>',
      'mark',
    ],
    [
      'italic',
      BaseItalicPlugin,
      'italic',
      true,
      '<span style="font-style: italic">text</span>',
      'em',
    ],
    ['keyboard', BaseKbdPlugin, 'kbd', true, '<kbd>text</kbd>', 'kbd'],
    [
      'strikethrough',
      BaseStrikethroughPlugin,
      'strikethrough',
      true,
      '<del>text</del>',
      's',
    ],
    [
      'subscript',
      BaseScriptPlugin,
      'script',
      'sub',
      '<span style="vertical-align: sub">text</span>',
      'sub',
    ],
    [
      'superscript',
      BaseScriptPlugin,
      'script',
      'sup',
      '<span style="vertical-align: super">text</span>',
      'sup',
    ],
    [
      'underline',
      BaseUnderlinePlugin,
      'underline',
      true,
      '<span style="text-decoration: underline">text</span>',
      'u',
    ],
  ] as const)(
    'decodes and encodes the %s HTML claim',
    (_label, plugin, markKey, value, input, outputTag) => {
      const editor = createEditor({
        plugins: [plugin],
        initialValue: [
          {
            children: [{ [markKey]: value, text: 'text' }],
            type: 'paragraph',
          },
        ],
      });
      const decoded = parseHtmlSliceContent(editor, `<p>${input}</p>`);
      const decodedText = decoded
        ? Array.from(NodeApi.texts({ children: decoded, type: 'root' }))[0]?.[0]
        : undefined;
      const data = new DataTransfer();

      expect(decodedText).toMatchObject({
        [markKey]: value,
        text: 'text',
      });

      editor.update.selection.set(SelectionApi.nodes([[0]], { mode: 'block' }));
      editor.api.dom.clipboard.writeSelection(data);

      const { body } = new DOMParser().parseFromString(
        data.getData('text/html'),
        'text/html'
      );

      expect(body.querySelector(`p > ${outputTag}`)?.textContent).toBe('text');
    }
  );

  it('composes product mark wrappers without losing claims', () => {
    const editor = createEditor({
      plugins: [BaseBoldPlugin, BaseItalicPlugin, BaseUnderlinePlugin],
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
      initialValue: [
        {
          children: [
            {
              bold: true,
              italic: true,
              underline: true,
              text: 'text',
            },
          ],
          type: 'paragraph',
        },
      ],
    });
    const decoded = parseHtmlSliceContent(
      editor,
      '<p><strong><em><u>text</u></em></strong></p>'
    );
    const decodedText = decoded
      ? Array.from(NodeApi.texts({ children: decoded, type: 'root' }))[0]?.[0]
      : undefined;
    const data = new DataTransfer();

    expect(decodedText).toMatchObject({
      bold: true,
      italic: true,
      underline: true,
      text: 'text',
    });

    editor.api.dom.clipboard.writeSelection(data);

    const { body } = new DOMParser().parseFromString(
      data.getData('text/html'),
      'text/html'
    );

    expect(body.querySelector('strong')?.textContent).toBe('text');
    expect(body.querySelector('em')?.textContent).toBe('text');
    expect(body.querySelector('u')?.textContent).toBe('text');
  });

  it('toggles the code mark', () => {
    const editor = createEditor({
      plugins: [BaseCodePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    editor.update.code.toggle();

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      code: true,
      text: 'text',
    });
  });

  it('toggles basic marks through typed tx groups', () => {
    const bold = createEditor({
      plugins: [BaseBoldPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });
    const italic = createEditor({
      plugins: [BaseItalicPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });
    const underline = createEditor({
      plugins: [BaseUnderlinePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });
    const strikethrough = createEditor({
      plugins: [BaseStrikethroughPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    bold.update.bold.toggle();
    italic.update.italic.toggle();
    underline.update.underline.toggle();
    strikethrough.update.strikethrough.toggle();

    expect(bold.read.children()[0]?.children[0]).toMatchObject({ bold: true });
    expect(italic.read.children()[0]?.children[0]).toMatchObject({
      italic: true,
    });
    expect(underline.read.children()[0]?.children[0]).toMatchObject({
      underline: true,
    });
    expect(strikethrough.read.children()[0]?.children[0]).toMatchObject({
      strikethrough: true,
    });
  });
});

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

    const editor = createEditor({
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
    const editor = createEditor({
      plugins: [
        ...basicMarkPlugins.filter(
          (candidate) => candidate.name !== plugin.name
        ),
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
