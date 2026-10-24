/** @jsxRuntime classic */
/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import { createEditor, NodeApi, SelectionApi } from '../../../core';
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

  const pasteBoldLeaves = (html: string) => {
    const editor = createEditor({ plugins: [BaseBoldPlugin] });
    const data = new DataTransfer();

    data.setData('text/html', html);
    editor.api.dom.clipboard.insertData(data);

    return editor.read
      .children()
      .flatMap(
        (block) =>
          (block.children ?? []) as Array<{ bold?: boolean; text: string }>
      )
      .filter((leaf) => leaf.text !== '')
      .map((leaf) => [leaf.text, leaf.bold === true]);
  };

  it.each([
    [
      'a normal weight inside bold',
      '<p><b>a<span style="font-weight: 400">b</span>c</b></p>',
    ],
    [
      'an initial weight inside bold',
      '<p><b>a<span style="font-weight: initial">b</span>c</b></p>',
    ],
  ])(
    'pastes %s with only the reset text plain [EDIT-CLIPBOARD-HTML-MARK-001]',
    (_label, html) => {
      expect(pasteBoldLeaves(html)).toEqual([
        ['a', true],
        ['b', false],
        ['c', true],
      ]);
    }
  );

  it.each([
    [
      'heavy numbers and bolder',
      '<p><span style="font-weight: 800">a</span><span style="font-weight: 900">b</span><span style="font-weight: bolder">c</span></p>',
      [['abc', true]],
    ],
    [
      'bolder inside bolder',
      '<p><span style="font-weight: bolder"><span style="font-weight: bolder">x</span></span></p>',
      [['x', true]],
    ],
    [
      'a lighter strong',
      '<p><strong style="font-weight: lighter">x</strong></p>',
      [['x', false]],
    ],
    [
      'bold tags that state a light weight',
      '<p><b style="font-weight: 400">a</b><strong style="font-weight: 500">b</strong></p>',
      [['ab', false]],
    ],
    [
      'a strong inheriting normal text',
      '<p><span style="font-weight: 400"><strong style="font-weight: inherit">x</strong></span></p>',
      [['x', false]],
    ],
    [
      'a lighter strong inside black text',
      '<p><span style="font-weight: 900"><strong style="font-weight: lighter">x</strong></span></p>',
      [['x', true]],
    ],
    [
      'a lighter span inside a heading inside black text',
      '<div style="font-weight: 900"><h1><span style="font-weight: lighter">x</span></h1></div>',
      [['x', false]],
    ],
    [
      'the Google Docs wrapper',
      '<p><b style="font-weight: normal" id="docs-internal-guid-1">a<span style="font-weight: 700">b</span></b></p>',
      [
        ['a', false],
        ['b', true],
      ],
    ],
    [
      'a b inside light text',
      '<p><span style="font-weight: 300"><b>x</b></span></p>',
      [['x', true]],
    ],
    [
      'strong weights it cannot resolve',
      '<p><strong style="font-weight: revert">a</strong><strong style="font-weight: revert-layer">b</strong><strong style="font-weight: var(--w, 600)">c</strong></p>',
      [['abc', true]],
    ],
    [
      'inherit and unset inside bold',
      '<p><b>a<span style="font-weight: inherit">b</span><span style="font-weight: unset">c</span></b></p>',
      [['abc', true]],
    ],
    [
      'a strong inheriting a heading',
      '<h1><strong style="font-weight: inherit">x</strong></h1>',
      [['x', true]],
    ],
    [
      'bolder inside light text',
      '<p><span style="font-weight: 300"><span style="font-weight: bolder">x</span></span></p>',
      [['x', false]],
    ],
  ])('pastes %s with the weight CSS draws', (_label, html, leaves) => {
    expect(pasteBoldLeaves(html)).toEqual(leaves);
  });

  it.each(['400', 'lighter', 'inherit'])(
    'reads the DOM in work linear in the depth of nested %s spans',
    (weight) => {
      const style = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'style'
      )!;
      const outerHtml = Object.getOwnPropertyDescriptor(
        Element.prototype,
        'outerHTML'
      )!;
      let work = 0;
      const workAt = (depth: number) => {
        const editor = createEditor({ plugins: [BaseBoldPlugin] });

        work = 0;
        editor.api.html.parse(
          `<p>${`<span style="font-weight: ${weight}">x`.repeat(depth)}${'</span>'.repeat(depth)}</p>`
        );

        return work;
      };

      Object.defineProperty(HTMLElement.prototype, 'style', {
        ...style,
        get() {
          work += 1;

          return style.get!.call(this);
        },
      });
      Object.defineProperty(Element.prototype, 'outerHTML', {
        ...outerHtml,
        get() {
          const html = outerHtml.get!.call(this) as string;

          work += html.length;

          return html;
        },
      });
      try {
        const small = workAt(50);
        const large = workAt(200);

        expect(large).toBeLessThanOrEqual(small * 5);
      } finally {
        Object.defineProperty(HTMLElement.prototype, 'style', style);
        Object.defineProperty(Element.prototype, 'outerHTML', outerHtml);
      }
    }
  );

  it('parses a slice without storing the bold a normal weight turns off', () => {
    const editor = createEditor({ plugins: [BaseBoldPlugin] });
    const parsed = editor.api.html.parseSlice(
      '<p><b>a<span style="font-weight: 400">b</span></b></p>'
    );

    if (!parsed.ok) throw new Error(parsed.diagnostics[0].message);
    expect(parsed.slice.content).toEqual([
      {
        children: [{ bold: true, text: 'a' }, { text: 'b' }],
        type: 'paragraph',
      },
    ]);
  });

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

  it('formats code at a block start without joining the next block', () => {
    const input = (
      <editor>
        <hp>before</hp>
        <hp>
          `bug
          <cursor />
        </hp>
        <hp>after</hp>
      </editor>
    );
    const output = (
      <editor>
        <hp>before</hp>
        <hp>
          <htext code>bug</htext>
        </hp>
        <hp>after</hp>
      </editor>
    );

    const editor = createEditor({
      plugins: [
        BaseCodePlugin.configure({ inputRules: [CodeRules.markdown()] }),
      ],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.text.insert('`');

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
