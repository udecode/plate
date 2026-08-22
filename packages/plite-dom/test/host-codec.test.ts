import { expect, mock, test } from 'bun:test';

import {
  ContentSlice,
  createEditor,
  defineExtension,
  defineEditorSchema,
  defineExtensionSlot,
  editorCommands,
  NodeApi,
  property,
  schema,
  SelectionApi,
  target,
  type Descendant,
  type EditorLifecycleError,
  type EditorLifecycleErrorSink,
} from '@platejs/plite';

import {
  defineHostCodec,
  dom,
  hostCodecs,
  type HostCodec,
  writeHostFragmentData,
} from '../src';

class DataTransferStub {
  data = new Map<string, string>();
  files = [] as unknown as FileList;

  get types() {
    return [...this.data.keys()];
  }

  getData(format: string) {
    return this.data.get(format) ?? '';
  }

  setData(format: string, value: string) {
    this.data.set(format, value);
  }
}

const paragraph = (text: string): Descendant => ({
  children: [{ text }],
  type: 'paragraph',
});

const ParagraphBold = schema.textProperty('bold', property.boolean(), {
  target: target.type('paragraph'),
});
const HeadingBold = schema.textProperty('bold', property.boolean(), {
  target: target.type('heading'),
});
const DataAttribute = schema.elementProperty(
  schema.key.prefix('data_'),
  property.string(),
  { target: target.group('block') }
);

const hostSchema = defineEditorSchema('schema:host-codec-test', {
  elements: {
    heading: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  id: 'host-codec-test',
  properties: [ParagraphBold, HeadingBold, DataAttribute],
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const inlineHostSchema = defineEditorSchema('schema:host-codec-inline-test', {
  elements: {
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
      properties: {
        labels: property.set(property.string()),
        tone: property.string({ default: 'neutral' }),
        url: property.string(),
      },
    },
    paragraph: schema.element.textBlock(),
  },
  id: 'host-codec-inline-test',
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const createInlineCodecEditor = (
  capture: (slice: ContentSlice) => void,
  lifecycleErrorSink?: EditorLifecycleErrorSink
) =>
  createEditor({
    extensions: [
      inlineHostSchema,
      dom(),
      hostCodecs('inline-host-codecs', []),
      defineExtension('capture-inline-host-slice', {
        commands: ({ around }) => [
          around(editorCommands.replaceSlice, ({ input, next }) => {
            capture(input.slice);

            return next();
          }),
        ],
      }),
    ] as const,
    initialSelection: SelectionApi.text({
      anchor: { offset: 3, path: [0, 1, 0] },
      focus: { offset: 3, path: [0, 1, 0] },
    }),
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'link',
            labels: ['source'],
            tone: 'source',
            url: 'https://example.com',
            children: [{ text: 'before' }],
          },
          { text: '' },
        ],
      },
    ],
    lifecycleErrorSink,
  });

const createCodecEditor = (
  codecs: readonly HostCodec[],
  lifecycleErrorSink?: EditorLifecycleErrorSink
) =>
  createEditor({
    extensions: [
      hostSchema,
      dom(),
      hostCodecs('test-host-codecs', codecs),
    ] as const,
    initialSelection: SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    }),
    initialValue: [paragraph('')],
    lifecycleErrorSink,
  });

test('host codecs expose only immutable model and host read capabilities', () => {
  const inspect = mock(
    (context: Parameters<NonNullable<HostCodec['parse']>>[0]) => {
      expect(Object.isFrozen(context)).toBe(true);
      expect(Object.keys(context).sort()).toEqual([
        'data',
        'format',
        'source',
        'state',
      ]);
      expect(Object.isFrozen(context.source)).toBe(true);
      expect(Object.isFrozen(context.source.files)).toBe(true);
      expect(Object.isFrozen(context.state)).toBe(true);
      expect(Object.isFrozen(context.state.schema)).toBe(true);
      expect(Object.isFrozen(context.state.children())).toBe(true);
      expect(Object.isFrozen(context.state.children()[0])).toBe(true);
      expect('dataTransfer' in context).toBe(false);
      expect('editor' in context).toBe(false);
      expect('fit' in context).toBe(false);
      expect('setData' in context.source).toBe(false);
      expect('transaction' in context.state).toBe(false);
      expect(context.state.children()).toEqual([paragraph('')]);

      return ContentSlice.closed([paragraph('parsed')]);
    }
  );
  const editor = createCodecEditor([
    defineHostCodec({ format: 'text/html', key: 'html', parse: inspect }),
  ]);
  const data = new DataTransferStub();

  data.setData('text/html', '<p>parsed</p>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(inspect).toHaveBeenCalledTimes(1);
  expect(editor.read.text.string([])).toBe('parsed');
});

test('host codecs receive an ingress snapshot instead of the DataTransfer', () => {
  const data = new DataTransferStub();
  const editor = createCodecEditor([
    defineHostCodec({
      format: 'text/html',
      key: 'snapshot',
      parse: ({ data: html, source }) => {
        expect(html).toBe('<p>before</p>');
        expect(source.getData('text/html')).toBe('<p>before</p>');

        return ContentSlice.closed([paragraph('snapshot')]);
      },
      query: () => {
        data.setData('text/html', '<p>after</p>');

        return true;
      },
    }),
  ]);

  data.setData('text/html', '<p>before</p>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.text.string([])).toBe('snapshot');
});

test('host codec results cross one immutable slice boundary', () => {
  const parsed = { children: [{ text: 'parsed' }], type: 'paragraph' };
  const slice: ContentSlice = {
    content: [parsed],
    openEnd: 0,
    openStart: 0,
  };
  const editor = createCodecEditor([
    defineHostCodec({
      format: 'text/html',
      key: 'mutable-result',
      parse: () => slice,
    }),
  ]);
  const data = new DataTransferStub();

  data.setData('text/html', '<p>parsed</p>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  parsed.children[0] = { text: 'mutated after parse' };
  expect(editor.read.text.string([])).toBe('parsed');
  expect(Object.isFrozen(editor.read.children()[0])).toBe(true);
});

test('plain-text construction observes the active transaction without cloning properties into new blocks', () => {
  const editor = createCodecEditor([]);
  const data = new DataTransferStub();

  data.setData('text/plain', 'first\nsecond');

  editor.update((tx) => {
    tx.nodes.insert(
      {
        children: [{ text: '' }],
        data_owner: 'target',
        type: 'paragraph',
      },
      { at: [1], select: true }
    );

    expect(
      editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
    ).toBe(true);
  });

  expect(editor.read.children()[1]).toEqual({
    ...paragraph('first'),
    data_owner: 'target',
  });
  expect(editor.read.children()[2]).toEqual(paragraph('second'));
});

test('plain-text inline wrappers preserve validated properties and schema construction', () => {
  let captured: ContentSlice | null = null;
  const editor = createInlineCodecEditor((slice) => {
    captured = slice;
  });
  const data = new DataTransferStub();

  data.setData('text/plain', 'TEXT');

  editor.update((tx) => {
    tx.nodes.set({ labels: ['z', 'a', 'z'], tone: null } as never, {
      at: [0, 1],
    });

    expect(
      editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
    ).toBe(true);
  });

  expect(captured).toEqual({
    content: [
      {
        type: 'link',
        labels: ['a', 'z'],
        tone: 'neutral',
        url: 'https://example.com',
        children: [{ text: 'TEXT' }],
      },
    ],
    openEnd: 1,
    openStart: 1,
  });
});

test('plain-text inline wrappers reject undeclared closed-schema properties', () => {
  const diagnostics: EditorLifecycleError[] = [];
  let captures = 0;
  const editor = createInlineCodecEditor(
    () => (captures += 1) - 1,
    (diagnostic) => diagnostics.push(diagnostic)
  );
  const data = new DataTransferStub();

  data.setData('text/plain', 'TEXT');

  editor.update((tx) => {
    tx.nodes.set({ rogue: 'blocked' } as never, { at: [0, 1] });

    expect(
      editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
    ).toBe(false);

    tx.nodes.unset('rogue' as never, { at: [0, 1] });
  });

  expect(captures).toBe(0);
  expect(diagnostics).toHaveLength(1);
  expect(diagnostics[0]).toMatchObject({
    extensionName: 'plite-dom',
    format: 'text/plain',
    key: 'plite-plain-text',
    phase: 'parse',
    source: 'host-codec',
  });
  expect(
    diagnostics[0] && 'cause' in diagnostics[0]
      ? String(diagnostics[0].cause)
      : ''
  ).toContain('Unknown editor element property "rogue"');
});

test('host codec serialization observes the active transaction document', () => {
  const editor = createCodecEditor([
    defineHostCodec({
      format: 'text/html',
      key: 'draft-html',
      serialize: ({ state }) => `<p>${state.text.string([])}</p>`,
    }),
  ]);
  const data = new DataTransferStub();

  editor.update((tx) => {
    tx.text.insert('draft');
    writeHostFragmentData(
      editor,
      data,
      ContentSlice.closed([paragraph('payload')])
    );
  });

  expect(data.getData('text/html')).toBe('<p>draft</p>');
});

test('host codec configuration order is deterministic per format', () => {
  const editor = createCodecEditor([
    defineHostCodec({
      format: 'text/html',
      key: 'low-html',
      parse: () => ContentSlice.closed([paragraph('low')]),
      serialize: () => '<p>low</p>',
    }),
    defineHostCodec({
      format: 'text/html',
      key: 'high-html',
      parse: () => ContentSlice.closed([paragraph('high')]),
      serialize: () => '<p>high</p>',
    }),
    defineHostCodec({
      format: 'text/markdown',
      key: 'markdown',
      serialize: () => 'high',
    }),
  ]);
  const input = new DataTransferStub();
  const output = new DataTransferStub();

  input.setData('text/html', '<p>source</p>');
  editor.api.dom.clipboard.insertData(input);
  writeHostFragmentData(
    editor,
    output,
    ContentSlice.closed([paragraph('high')])
  );

  expect(editor.read.text.string([])).toBe('high');
  expect(output.getData('text/html')).toBe('<p>high</p>');
  expect(output.getData('text/markdown')).toBe('high');
});

test('later host codec registration runs first', () => {
  const editor = createCodecEditor([
    defineHostCodec({
      format: 'text/html',
      key: 'first',
      parse: () => ContentSlice.closed([paragraph('first')]),
    }),
    defineHostCodec({
      format: 'text/html',
      key: 'second',
      parse: () => ContentSlice.closed([paragraph('second')]),
    }),
  ]);
  const data = new DataTransferStub();

  data.setData('text/html', '<p>source</p>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.text.string([])).toBe('second');
});

test('plain text is the last compiled codec fallback', () => {
  const delegate = mock(() => null);
  const fallbackEditor = createCodecEditor([
    defineHostCodec({
      format: 'text/plain',
      key: 'delegating-plain-text',
      parse: delegate,
    }),
  ]);
  const fallbackData = new DataTransferStub();

  fallbackData.setData('text/plain', 'first\nsecond');

  expect(
    fallbackEditor.api.dom.clipboard.insertTextData(
      fallbackData as unknown as DataTransfer
    )
  ).toBe(true);
  expect(delegate).toHaveBeenCalledTimes(1);
  expect(fallbackEditor.read.children()).toEqual([
    paragraph('first'),
    paragraph('second'),
  ]);

  const overrideEditor = createCodecEditor([
    defineHostCodec({
      format: 'text/plain',
      key: 'overriding-plain-text',
      parse: () => ContentSlice.closed([paragraph('override')]),
    }),
  ]);
  const overrideData = new DataTransferStub();

  overrideData.setData('text/plain', 'ignored');

  expect(
    overrideEditor.api.dom.clipboard.insertTextData(
      overrideData as unknown as DataTransfer
    )
  ).toBe(true);
  expect(overrideEditor.read.children()).toEqual([paragraph('override')]);
});

test('host codec compilation follows configuration revisions and rolls back conflicts', () => {
  const original = defineHostCodec({
    format: 'text/html',
    key: 'original',
    serialize: () => '<p>original</p>',
  });
  const editor = createCodecEditor([original]);
  const slice = ContentSlice.closed([paragraph('value')]);
  const write = () => {
    const data = new DataTransferStub();

    writeHostFragmentData(editor, data, slice);

    return data.getData('text/html');
  };

  expect(write()).toBe('<p>original</p>');

  const cleanup = editor.install(
    hostCodecs('temporary-host-codec', [
      defineHostCodec({
        format: 'text/html',
        key: 'temporary',
        serialize: () => '<p>temporary</p>',
      }),
    ])
  );

  expect(write()).toBe('<p>temporary</p>');
  cleanup();
  expect(write()).toBe('<p>original</p>');

  expect(() =>
    editor.install(hostCodecs('conflicting-host-codec', [original]))
  ).toThrow(/use the same key "original"/);
  expect(write()).toBe('<p>original</p>');
});

test('host codec ownership resolves declaration semantics against the candidate schema revision', () => {
  const editor = createCodecEditor([]);
  const Italic = schema.textProperty('italic', property.boolean(), {
    target: target.type('paragraph'),
  });
  const equivalentItalicSchema = defineExtension('equivalent-italic-schema', {
    schema: {
      properties: [
        schema.textProperty('italic', property.boolean(), {
          target: target.type('paragraph'),
        }),
      ],
    },
  });
  const italic = defineHostCodec({
    format: 'text/html',
    key: 'italic',
    owns: [Italic],
    serialize: () => '<em>value</em>',
  });

  expect(() => editor.install(hostCodecs('italic-codec', [italic]))).toThrow(
    /owns schema property .* that is not installed/
  );

  const cleanup = editor.install([
    equivalentItalicSchema,
    hostCodecs('italic-codec', [italic]),
  ]);
  const data = new DataTransferStub();

  writeHostFragmentData(
    editor,
    data,
    ContentSlice.closed([paragraph('value')])
  );
  expect(data.getData('text/html')).toBe('<em>value</em>');
  cleanup();
});

test('schema reconfiguration recompiles codec claims and rolls back atomically', () => {
  const slot = defineExtensionSlot('host-codec-schema-revision');
  const articleSchema = (version: number, type: 'heading' | 'paragraph') =>
    defineEditorSchema('schema:host-codec-schema-revision', {
      elements: {
        [type]: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      id: 'host-codec-schema-revision',
      root: schema.content.type(type, {
        default: { type },
        min: 1,
      }),
      unknown: 'reject',
      version,
    });
  const editor = createEditor({
    extensions: [
      dom(),
      slot.of(articleSchema(1, 'paragraph')),
      hostCodecs('schema-revision-codec', [
        {
          format: 'text/html',
          key: 'paragraph-html',
          owns: [{ kind: 'element', type: 'paragraph' }],
          parse: () => ContentSlice.closed([paragraph('parsed')]),
        },
      ]),
    ] as const,
    initialValue: [paragraph('before')],
  });
  let commits = 0;

  editor.subscribeCommit(() => (commits += 1) - 1);

  expect(() =>
    editor.update.extensions.reconfigure(slot, articleSchema(2, 'heading'), {
      migrate({ document }) {
        return {
          ...document,
          children: document.children.map((node) => ({
            ...node,
            type: 'heading',
          })),
        };
      },
    })
  ).toThrow(/owns unknown schema element "paragraph"/);
  expect(editor.read.schema.identity()?.version).toBe(1);
  expect(editor.read.children()).toEqual([paragraph('before')]);
  expect(editor.read.lastCommit()).toBeNull();
  expect(commits).toBe(0);
});

test('query and parse faults report lifecycle errors then fall through', () => {
  const diagnostics: EditorLifecycleError[] = [];
  const editor = createCodecEditor(
    [
      defineHostCodec({
        format: 'text/html',
        key: 'fallback',
        parse: () => ContentSlice.closed([paragraph('fallback')]),
      }),
      defineHostCodec({
        format: 'text/html',
        key: 'malformed',
        parse: () => ({
          content: [paragraph('invalid')],
          openEnd: 2,
          openStart: 2,
        }),
      }),
      defineHostCodec({
        format: 'text/html',
        key: 'throwing-query',
        parse: () => ContentSlice.closed([paragraph('unreachable')]),
        query: () => {
          throw new Error('query failed');
        },
      }),
    ],
    (diagnostic) => diagnostics.push(diagnostic)
  );
  const data = new DataTransferStub();

  data.setData('text/html', '<p>invalid</p>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.text.string([])).toBe('fallback');
  expect(
    diagnostics.map((error) =>
      'format' in error
        ? {
            extension: error.extensionName,
            format: error.format,
            key: error.key,
            phase: error.phase,
            source: error.source,
          }
        : error
    )
  ).toEqual([
    {
      extension: 'test-host-codecs',
      format: 'text/html',
      key: 'throwing-query',
      phase: 'query',
      source: 'host-codec',
    },
    {
      extension: 'test-host-codecs',
      format: 'text/html',
      key: 'malformed',
      phase: 'parse',
      source: 'host-codec',
    },
  ]);
});

test('a failed codec invocation reports once and publishes nothing', () => {
  const diagnostics: EditorLifecycleError[] = [];
  const editor = createCodecEditor(
    [
      defineHostCodec({
        format: 'text/html',
        key: 'throwing-only',
        parse: () => {
          throw new Error('decode failed');
        },
      }),
    ],
    (diagnostic) => diagnostics.push(diagnostic)
  );
  const data = new DataTransferStub();
  let commits = 0;

  editor.subscribeCommit(() => (commits += 1) - 1);
  data.setData('text/html', '<p>invalid</p>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(false);
  expect(editor.read.children()).toEqual([paragraph('')]);
  expect(editor.read.lastCommit()).toBeNull();
  expect(commits).toBe(0);
  expect(
    diagnostics.map((error) =>
      'key' in error ? { key: error.key, phase: error.phase } : error
    )
  ).toEqual([{ key: 'throwing-only', phase: 'parse' }]);
});

test('serialization faults report lifecycle errors then fall through', () => {
  const diagnostics: EditorLifecycleError[] = [];
  const editor = createCodecEditor(
    [
      defineHostCodec({
        format: 'text/html',
        key: 'fallback',
        serialize: () => '<p>fallback</p>',
      }),
      defineHostCodec({
        format: 'text/html',
        key: 'throwing',
        serialize: () => {
          throw new Error('serialize failed');
        },
      }),
    ],
    (diagnostic) => diagnostics.push(diagnostic)
  );
  const data = new DataTransferStub();

  writeHostFragmentData(
    editor,
    data,
    ContentSlice.closed([paragraph('value')])
  );

  expect(data.getData('text/html')).toBe('<p>fallback</p>');
  expect(
    diagnostics.map((error) =>
      'key' in error ? { key: error.key, phase: error.phase } : error
    )
  ).toEqual([{ key: 'throwing', phase: 'serialize' }]);
});

test('host codecs preserve open slices and fit at the paste range', () => {
  const editor = createCodecEditor([
    defineHostCodec({
      format: 'text/html',
      key: 'open-html',
      parse: () =>
        ContentSlice.fromJSON({
          content: [paragraph('X')],
          openEnd: 1,
          openStart: 1,
        }),
    }),
  ]);
  const data = new DataTransferStub();

  editor.update.text.insert('before');
  editor.update.selection.set(
    SelectionApi.text({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    })
  );
  data.setData('text/html', '<span>X</span>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.text.string([])).toBe('befXore');
});

test('host codecs fit detached text properties into the target parent', () => {
  const editor = createCodecEditor([
    defineHostCodec({
      format: 'text/html',
      key: 'bold-leaf-html',
      parse: () => ContentSlice.closed([{ bold: true, text: 'X' }]),
    }),
  ]);
  const data = new DataTransferStub();

  data.setData('text/html', '<strong>X</strong>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.children()).toEqual([
    { children: [{ bold: true, text: 'X' }], type: 'paragraph' },
  ]);
});

test('codec keys and compiled schema ownership conflict atomically', () => {
  const codec = (key: string, ownedTargets?: HostCodec['owns']) =>
    defineHostCodec({
      format: 'text/html',
      key,
      ...(ownedTargets ? { owns: ownedTargets } : {}),
      parse: () => ContentSlice.closed([paragraph(key)]),
    });
  const duplicate = codec('duplicate');

  expect(() => createCodecEditor([duplicate, duplicate])).toThrow(
    /use the same key "duplicate"/
  );
  expect(() =>
    createCodecEditor([codec('first'), codec('second')])
  ).not.toThrow();
  expect(() =>
    createCodecEditor([
      codec('first-bold', [ParagraphBold]),
      codec('second-bold', [ParagraphBold]),
    ])
  ).toThrow(/both claim parse target/);
  expect(() =>
    createCodecEditor([
      codec('paragraph', [{ kind: 'element', type: 'paragraph' }]),
      codec('paragraph-bold', [ParagraphBold]),
    ])
  ).toThrow(/both claim parse target/);
  expect(() =>
    createCodecEditor([codec('data-prefix', [DataAttribute])])
  ).not.toThrow();
  expect(() =>
    createCodecEditor([
      codec('paragraph-bold', [ParagraphBold]),
      codec('heading-bold', [HeadingBold]),
    ])
  ).not.toThrow();
  expect(() =>
    createCodecEditor([
      codec('unknown', [{ kind: 'element', type: 'unknown' }]),
    ])
  ).toThrow(/owns unknown schema element "unknown"/);
  expect(() =>
    createCodecEditor([
      codec('unknown-property', [
        schema.textProperty('unknown', property.boolean(), {
          target: target.type('paragraph'),
        }),
      ]),
    ])
  ).toThrow(/owns schema property .* that is not installed/);
});

test('host codec property ownership stores normalized declarations', () => {
  const equivalentParagraphBold = schema.textProperty(
    'bold',
    property.boolean(),
    {
      target: target.type('paragraph'),
    }
  );
  const codec = defineHostCodec({
    format: 'text/html',
    key: 'semantic-property',
    owns: [equivalentParagraphBold],
    parse: () => null,
  });

  expect(codec.owns?.[0]).toEqual(equivalentParagraphBold);
  expect(codec.owns?.[0]).not.toBe(equivalentParagraphBold);
  expect(Object.isFrozen(codec.owns?.[0])).toBe(true);
  expect(() => createCodecEditor([codec])).not.toThrow();
});

test('parser and serializer ownership claims are independent', () => {
  expect(() =>
    createCodecEditor([
      defineHostCodec({
        format: 'text/html',
        key: 'parse-paragraph',
        owns: [{ kind: 'element', type: 'paragraph' }],
        parse: () => ContentSlice.closed([paragraph('parse')]),
      }),
      defineHostCodec({
        format: 'text/html',
        key: 'serialize-paragraph',
        owns: [{ kind: 'element', type: 'paragraph' }],
        serialize: () => '<p>serialize</p>',
      }),
    ])
  ).not.toThrow();
});

test('host codecs round-trip registered formats', () => {
  const serialize = mock(
    (context: Parameters<NonNullable<HostCodec['serialize']>>[0]) => {
      expect(Object.keys(context).sort()).toEqual(['format', 'slice', 'state']);
      expect('dataTransfer' in context).toBe(false);
      expect('editor' in context).toBe(false);
      expect('fit' in context).toBe(false);

      return JSON.stringify(context.slice.content);
    }
  );
  const json = defineHostCodec({
    format: 'application/x-test-rich-text',
    key: 'json-rich-text',
    parse({ data }) {
      try {
        const content = JSON.parse(data) as unknown;

        return Array.isArray(content) ? ContentSlice.closed(content) : null;
      } catch {
        return null;
      }
    },
    serialize,
  });
  const source = createCodecEditor([json]);
  const innerTarget = createCodecEditor([json]);
  const output = new DataTransferStub();
  const value = [
    { children: [{ bold: true, text: 'round trip' }], type: 'paragraph' },
  ];

  source.update.value.replace({ children: value });
  writeHostFragmentData(source, output, ContentSlice.closed(value));

  expect(
    innerTarget.api.dom.clipboard.insertData(output as unknown as DataTransfer)
  ).toBe(true);
  expect(innerTarget.read.children()).toEqual(value);
  expect(NodeApi.string(innerTarget.read.children()[0])).toBe('round trip');
  expect(serialize).toHaveBeenCalledTimes(1);
});
