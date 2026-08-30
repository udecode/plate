/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import { createEditor, NodeApi, SelectionApi } from '../../../core';
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
    const fragment = editor.api.html.deserialize({ element });
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
      const decoded = editor.api.html.deserialize({
        element: `<p>${input}</p>`,
      });
      const decodedText = decoded
        ? Array.from(NodeApi.texts({ children: decoded, type: 'root' }))[0]?.[0]
        : undefined;
      const data = new DataTransfer();

      expect(decodedText).toMatchObject({
        [markKey]: value,
        text: 'text',
      });

      editor.update.selection.set(SelectionApi.nodes([[0]]));
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
      selection: SelectionApi.nodes([[0]]),
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
    const decoded = editor.api.html.deserialize({
      element: '<p><strong><em><u>text</u></em></strong></p>',
    });
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
