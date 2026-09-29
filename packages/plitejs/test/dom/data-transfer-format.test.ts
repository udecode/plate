import { expect, mock, test } from 'bun:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  definePlugin,
  defineEditorSchema,
  definePluginSlot,
  editorCommands,
  NodeApi,
  property,
  schema,
  SelectionApi,
  target,
  type Descendant,
  type EditorLifecycleError,
  type EditorLifecycleErrorSink,
} from 'plitejs';

import {
  dom,
  dataTransferFormats,
  type DataTransferFormat,
  type DataTransferSchemaClaim,
  writeDataTransferFragment,
} from '../../src/dom';
import { getDOMClipboardFormatKey } from '../../src/dom/plugin/dom-clipboard-runtime';

class DataTransferStub {
  data = new Map<string, string>();
  files = [] as unknown as FileList;

  get types() {
    return [...this.data.keys()];
  }

  getData(mimeType: string) {
    return this.data.get(mimeType) ?? '';
  }

  setData(mimeType: string, value: string) {
    this.data.set(mimeType, value);
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

const hostSchema = defineEditorSchema('schema:data-transfer-format-test', {
  elements: {
    heading: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  id: 'data-transfer-format-test',
  properties: [ParagraphBold, HeadingBold, DataAttribute],
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const inlineHostSchema = defineEditorSchema(
  'schema:data-transfer-format-inline-test',
  {
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
    id: 'data-transfer-format-inline-test',
    root: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  }
);

const createInlineFormatEditor = (
  capture: (slice: ContentSlice) => void,
  lifecycleErrorSink?: EditorLifecycleErrorSink
) =>
  createEditor({
    plugins: [
      inlineHostSchema,
      dom(),
      dataTransferFormats('inline-data-transfer-formats', []),
      definePlugin('capture-inline-host-slice', {
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

const createFormatEditor = (
  formats: readonly DataTransferFormat[],
  lifecycleErrorSink?: EditorLifecycleErrorSink
) =>
  createEditor({
    plugins: [
      hostSchema,
      dom(),
      dataTransferFormats('test-data-transfer-formats', formats),
    ] as const,
    initialSelection: SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    }),
    initialValue: [paragraph('')],
    lifecycleErrorSink,
  });

test('DataTransfer formats expose only immutable model and host read capabilities', () => {
  const inspect = mock(
    (context: Parameters<NonNullable<DataTransferFormat['decode']>>[0]) => {
      expect(Object.isFrozen(context)).toBe(true);
      expect(Object.keys(context).sort()).toEqual([
        'data',
        'mimeType',
        'report',
        'snapshot',
        'state',
      ]);
      expect(Object.isFrozen(context.snapshot)).toBe(true);
      expect(Object.isFrozen(context.snapshot.files)).toBe(true);
      expect(Object.isFrozen(context.state)).toBe(true);
      expect(Object.isFrozen(context.state.schema)).toBe(true);
      expect(Object.isFrozen(context.state.children())).toBe(true);
      expect(Object.isFrozen(context.state.children()[0])).toBe(true);
      expect('dataTransfer' in context).toBe(false);
      expect('editor' in context).toBe(false);
      expect('fit' in context).toBe(false);
      expect('setData' in context.snapshot).toBe(false);
      expect('transaction' in context.state).toBe(false);
      expect(context.state.children()).toEqual([paragraph('')]);

      return ContentSlice.closed([paragraph('parsed')]);
    }
  );
  const editor = createFormatEditor([
    { mimeType: 'text/html', key: 'html', decode: inspect },
  ]);
  const data = new DataTransferStub();

  data.setData('text/html', '<p>parsed</p>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(inspect).toHaveBeenCalledTimes(1);
  expect(editor.read.text.string([])).toBe('parsed');
});

test('DataTransfer formats receive an ingress snapshot instead of the DataTransfer', () => {
  const data = new DataTransferStub();
  const editor = createFormatEditor([
    {
      mimeType: 'text/html',
      key: 'snapshot',
      decode: ({ data: html, snapshot }) => {
        expect(html).toBe('<p>before</p>');
        expect(snapshot.getData('text/html')).toBe('<p>before</p>');

        return ContentSlice.closed([paragraph('snapshot')]);
      },
      accept: () => {
        data.setData('text/html', '<p>after</p>');

        return true;
      },
    },
  ]);

  data.setData('text/html', '<p>before</p>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.text.string([])).toBe('snapshot');
});

test('DataTransfer format results cross one immutable slice boundary', () => {
  const parsed = { children: [{ text: 'parsed' }], type: 'paragraph' };
  const slice: ContentSlice = {
    content: [parsed],
    openEnd: 0,
    openStart: 0,
  };
  const editor = createFormatEditor([
    {
      mimeType: 'text/html',
      key: 'mutable-result',
      decode: () => slice,
    },
  ]);
  const data = new DataTransferStub();

  data.setData('text/html', '<p>parsed</p>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  parsed.children[0] = { text: 'mutated after decode' };
  expect(editor.read.text.string([])).toBe('parsed');
  expect(Object.isFrozen(editor.read.children()[0])).toBe(true);
});

test('plain-text construction observes the active transaction without cloning properties into new blocks', () => {
  const editor = createFormatEditor([]);
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

test('plain-text fallback starts new lines with the default block when the anchor block needs properties', () => {
  const requiredBlockSchema = defineEditorSchema(
    'schema:data-transfer-required-block-test',
    {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
        title: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { level: property.string({ required: true }) },
        },
      },
      id: 'data-transfer-required-block-test',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    }
  );
  const editor = createEditor({
    plugins: [requiredBlockSchema, dom()] as const,
    initialSelection: SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 4, path: [1, 0] },
    }),
    initialValue: [
      { children: [{ text: 'head' }], level: 'h2', type: 'title' },
      paragraph('tail'),
    ],
  });
  const data = new DataTransferStub();

  data.setData('text/plain', 'first\nsecond');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.children()).toEqual([
    { children: [{ text: 'first' }], level: 'h2', type: 'title' },
    paragraph('second'),
  ]);
});

test('plain-text inline wrappers preserve validated properties and schema construction', () => {
  let captured: ContentSlice | null = null;
  const editor = createInlineFormatEditor((slice) => {
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
  const editor = createInlineFormatEditor(
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
    pluginName: 'editor-dom',
    mimeType: 'text/plain',
    key: 'plite-plain-text',
    phase: 'decode',
    source: 'data-transfer-format',
  });
  expect(
    diagnostics[0] && 'cause' in diagnostics[0]
      ? String(diagnostics[0].cause)
      : ''
  ).toContain('Unknown editor element property "rogue"');
});

test('DataTransfer format serialization observes the active transaction document', () => {
  const editor = createFormatEditor([
    {
      mimeType: 'text/html',
      key: 'draft-html',
      encode: ({ state }) => `<p>${state.text.string([])}</p>`,
    },
  ]);
  const data = new DataTransferStub();

  editor.update((tx) => {
    tx.text.insert('draft');
    writeDataTransferFragment(
      editor,
      data,
      ContentSlice.closed([paragraph('payload')])
    );
  });

  expect(data.getData('text/html')).toBe('<p>draft</p>');
});

test('DataTransfer format configuration order is deterministic per mimeType', () => {
  const editor = createFormatEditor([
    {
      mimeType: 'text/html',
      key: 'low-html',
      decode: () => ContentSlice.closed([paragraph('low')]),
      encode: () => '<p>low</p>',
    },
    {
      mimeType: 'text/html',
      key: 'high-html',
      decode: () => ContentSlice.closed([paragraph('high')]),
      encode: () => '<p>high</p>',
    },
    {
      mimeType: 'text/markdown',
      key: 'markdown',
      encode: () => 'high',
    },
  ]);
  const input = new DataTransferStub();
  const output = new DataTransferStub();

  input.setData('text/html', '<p>source</p>');
  editor.api.dom.clipboard.insertData(input);
  writeDataTransferFragment(
    editor,
    output,
    ContentSlice.closed([paragraph('high')])
  );

  expect(editor.read.text.string([])).toBe('high');
  expect(output.getData('text/html')).toBe('<p>high</p>');
  expect(output.getData('text/markdown')).toBe('high');
});

test('later DataTransfer format registration runs first', () => {
  const editor = createFormatEditor([
    {
      mimeType: 'text/html',
      key: 'first',
      decode: () => ContentSlice.closed([paragraph('first')]),
    },
    {
      mimeType: 'text/html',
      key: 'second',
      decode: () => ContentSlice.closed([paragraph('second')]),
    },
  ]);
  const data = new DataTransferStub();

  data.setData('text/html', '<p>source</p>');

  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.text.string([])).toBe('second');
});

test('plain text is the last compiled format fallback', () => {
  const delegate = mock(() => null);
  const fallbackEditor = createFormatEditor([
    {
      mimeType: 'text/plain',
      key: 'delegating-plain-text',
      decode: delegate,
    },
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

  const overrideEditor = createFormatEditor([
    {
      mimeType: 'text/plain',
      key: 'overriding-plain-text',
      decode: () => ContentSlice.closed([paragraph('override')]),
    },
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

test('DataTransfer format compilation follows configuration revisions and rolls back conflicts', () => {
  const original: DataTransferFormat = {
    mimeType: 'text/html',
    key: 'original',
    encode: () => '<p>original</p>',
  };
  const editor = createFormatEditor([original]);
  const slice = ContentSlice.closed([paragraph('value')]);
  const write = () => {
    const data = new DataTransferStub();

    writeDataTransferFragment(editor, data, slice);

    return data.getData('text/html');
  };

  expect(write()).toBe('<p>original</p>');

  const cleanup = editor.install(
    dataTransferFormats('temporary-data-transfer-format', [
      {
        mimeType: 'text/html',
        key: 'temporary',
        encode: () => '<p>temporary</p>',
      },
    ])
  );

  expect(write()).toBe('<p>temporary</p>');
  cleanup();
  expect(write()).toBe('<p>original</p>');

  expect(() =>
    editor.install(
      dataTransferFormats('conflicting-data-transfer-format', [original])
    )
  ).toThrow(/use the same key "original"/);
  expect(write()).toBe('<p>original</p>');
});

test('DataTransfer format ownership resolves declaration semantics against the candidate schema revision', () => {
  const editor = createFormatEditor([]);
  const Italic = schema.textProperty('italic', property.boolean(), {
    target: target.type('paragraph'),
  });
  const equivalentItalicSchema = definePlugin('equivalent-italic-schema', {
    schema: {
      properties: [
        schema.textProperty('italic', property.boolean(), {
          target: target.type('paragraph'),
        }),
      ],
    },
  });
  const italic: DataTransferFormat = {
    mimeType: 'text/html',
    key: 'italic',
    claims: [Italic],
    encode: () => '<em>value</em>',
  };

  expect(() =>
    editor.install(dataTransferFormats('italic-format', [italic]))
  ).toThrow(/claims schema property .* that is not installed/);

  const cleanup = editor.install([
    equivalentItalicSchema,
    dataTransferFormats('italic-format', [italic]),
  ]);
  const data = new DataTransferStub();

  writeDataTransferFragment(
    editor,
    data,
    ContentSlice.closed([paragraph('value')])
  );
  expect(data.getData('text/html')).toBe('<em>value</em>');
  cleanup();
});

test('schema reconfiguration recompiles format claims and rolls back atomically', () => {
  const slot = definePluginSlot('data-transfer-format-schema-revision');
  const articleSchema = (version: number, type: 'heading' | 'paragraph') =>
    defineEditorSchema('schema:data-transfer-format-schema-revision', {
      elements: {
        [type]: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      id: 'data-transfer-format-schema-revision',
      root: schema.content.type(type, {
        default: { type },
        min: 1,
      }),
      unknown: 'reject',
      version,
    });
  const editor = createEditor({
    plugins: [
      dom(),
      slot.of(articleSchema(1, 'paragraph')),
      dataTransferFormats('schema-revision-format', [
        {
          mimeType: 'text/html',
          key: 'paragraph-html',
          claims: [{ kind: 'element', type: 'paragraph' }],
          decode: () => ContentSlice.closed([paragraph('parsed')]),
        },
      ]),
    ] as const,
    initialValue: [paragraph('before')],
  });
  let commits = 0;

  editor.subscribeCommit(() => (commits += 1) - 1);

  expect(() =>
    editor.update.plugins.reconfigure(slot, articleSchema(2, 'heading'), {
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
  ).toThrow(/claims unknown schema element "paragraph"/);
  expect(editor.read.schema.identity()?.version).toBe(1);
  expect(editor.read.children()).toEqual([paragraph('before')]);
  expect(editor.read.lastCommit()).toBeNull();
  expect(commits).toBe(0);
});

test('accept and decode faults report lifecycle errors then fall through', () => {
  const diagnostics: EditorLifecycleError[] = [];
  const editor = createFormatEditor(
    [
      {
        mimeType: 'text/html',
        key: 'fallback',
        decode: () => ContentSlice.closed([paragraph('fallback')]),
      },
      {
        mimeType: 'text/html',
        key: 'malformed',
        decode: () => ({
          content: [paragraph('invalid')],
          openEnd: 2,
          openStart: 2,
        }),
      },
      {
        mimeType: 'text/html',
        key: 'throwing-accept',
        decode: () => ContentSlice.closed([paragraph('unreachable')]),
        accept: () => {
          throw new Error('accept failed');
        },
      },
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
      'mimeType' in error
        ? {
            plugin: error.pluginName,
            mimeType: error.mimeType,
            key: error.key,
            phase: error.phase,
            source: error.source,
          }
        : error
    )
  ).toEqual([
    {
      plugin: 'test-data-transfer-formats',
      mimeType: 'text/html',
      key: 'throwing-accept',
      phase: 'accept',
      source: 'data-transfer-format',
    },
    {
      plugin: 'test-data-transfer-formats',
      mimeType: 'text/html',
      key: 'malformed',
      phase: 'decode',
      source: 'data-transfer-format',
    },
  ]);
});

test('a failed format invocation reports once and publishes nothing', () => {
  const diagnostics: EditorLifecycleError[] = [];
  const editor = createFormatEditor(
    [
      {
        mimeType: 'text/html',
        key: 'throwing-only',
        decode: () => {
          throw new Error('decode failed');
        },
      },
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
  ).toEqual([{ key: 'throwing-only', phase: 'decode' }]);
});

test('serialization faults report lifecycle errors then fall through', () => {
  const diagnostics: EditorLifecycleError[] = [];
  const editor = createFormatEditor(
    [
      {
        mimeType: 'text/html',
        key: 'fallback',
        encode: () => '<p>fallback</p>',
      },
      {
        mimeType: 'text/html',
        key: 'throwing',
        encode: () => {
          throw new Error('encode failed');
        },
      },
      {
        mimeType: 'text/html',
        key: 'non-string',
        encode: () => 42 as unknown as string,
      },
    ],
    (diagnostic) => diagnostics.push(diagnostic)
  );
  const data = new DataTransferStub();

  expect(
    writeDataTransferFragment(
      editor,
      data,
      ContentSlice.closed([paragraph('value')])
    )
  ).toEqual(['text/html']);
  expect(data.getData('text/html')).toBe('<p>fallback</p>');
  expect(
    diagnostics.map((error) =>
      'key' in error
        ? {
            cause: error.cause instanceof TypeError,
            key: error.key,
            phase: error.phase,
          }
        : error
    )
  ).toEqual([
    { cause: true, key: 'non-string', phase: 'encode' },
    { cause: false, key: 'throwing', phase: 'encode' },
  ]);
});

test('an unfit decoded slice falls through to the next format', () => {
  const lifecycleErrors: EditorLifecycleError[] = [];
  const editor = createFormatEditor(
    [
      {
        mimeType: 'text/html',
        key: 'fallback',
        decode: () => ContentSlice.closed([paragraph('fallback')]),
      },
      {
        mimeType: 'text/html',
        key: 'unfit',
        decode: () =>
          ContentSlice.closed([
            { children: [{ text: 'invalid' }], type: 'unknown' },
          ]),
      },
    ],
    (error) => lifecycleErrors.push(error)
  );
  const data = new DataTransferStub();

  data.setData('text/html', '<unknown>invalid</unknown>');
  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.children()).toEqual([paragraph('fallback')]);
  expect(lifecycleErrors).toEqual([]);
});

test('accept false and null decode delegate to the next format', () => {
  const skipped = mock(() => ContentSlice.closed([paragraph('unreachable')]));
  const delegating = mock(() => null);
  const formats: DataTransferFormat[] = [
    {
      mimeType: 'text/html',
      key: 'null',
      decode: delegating,
    },
    {
      mimeType: 'text/html',
      key: 'not-accepted',
      accept: () => false,
      decode: skipped,
    },
  ];
  const editor = createFormatEditor([
    {
      mimeType: 'text/plain',
      key: 'plain',
      decode: () => ContentSlice.closed([paragraph('plain')]),
    },
    ...formats,
  ]);
  const data = new DataTransferStub();

  data.setData('text/html', '<p>source</p>');
  data.setData('text/plain', 'source');
  expect(
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.children()).toEqual([paragraph('plain')]);
  expect(delegating).toHaveBeenCalledTimes(1);
  expect(skipped).not.toHaveBeenCalled();

  const unhandledEditor = createFormatEditor(formats);
  const htmlOnly = new DataTransferStub();

  htmlOnly.setData('text/html', '<p>source</p>');
  expect(
    unhandledEditor.api.dom.clipboard.insertData(
      htmlOnly as unknown as DataTransfer
    )
  ).toBe(false);
  expect(unhandledEditor.read.lastCommit()).toBeNull();
});

test('null encode delegates its mimeType to the next encoder', () => {
  const editor = createFormatEditor([
    {
      mimeType: 'text/html',
      key: 'fallback',
      encode: () => '<p>fallback</p>',
    },
    {
      mimeType: 'text/html',
      key: 'delegating',
      encode: () => null,
    },
    {
      mimeType: 'text/markdown',
      key: 'markdown',
      encode: () => 'fallback',
    },
  ]);
  const slice = ContentSlice.closed([paragraph('value')]);
  const data = new DataTransferStub();

  expect(writeDataTransferFragment(editor, data, slice)).toEqual([
    'text/markdown',
    'text/html',
  ]);
  expect(data.getData('text/html')).toBe('<p>fallback</p>');

  const excluded = new DataTransferStub();

  expect(
    writeDataTransferFragment(editor, excluded, slice, {
      excludeMimeTypes: ['text/html'],
    })
  ).toEqual(['text/markdown']);
  expect(excluded.types).toEqual(['text/markdown']);
});

test('DataTransfer formats preserve open slices and fit at the paste range', () => {
  const editor = createFormatEditor([
    {
      mimeType: 'text/html',
      key: 'open-html',
      decode: () =>
        ContentSlice.fromJSON({
          content: [paragraph('X')],
          openEnd: 1,
          openStart: 1,
        }),
    },
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

test('DataTransfer formats fit detached text properties into the target parent', () => {
  const editor = createFormatEditor([
    {
      mimeType: 'text/html',
      key: 'bold-leaf-html',
      decode: () => ContentSlice.closed([{ bold: true, text: 'X' }]),
    },
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

test('format keys and compiled schema ownership conflict atomically', () => {
  const format = (
    key: string,
    ownedTargets?: DataTransferFormat['claims']
  ): DataTransferFormat => ({
    mimeType: 'text/html',
    key,
    ...(ownedTargets ? { claims: ownedTargets } : {}),
    decode: () => ContentSlice.closed([paragraph(key)]),
  });
  const duplicate = format('duplicate');

  expect(() => createFormatEditor([duplicate, duplicate])).toThrow(
    /use the same key "duplicate"/
  );
  expect(() =>
    createFormatEditor([format('first'), format('second')])
  ).not.toThrow();
  expect(() =>
    createFormatEditor([
      format('first-bold', [ParagraphBold]),
      format('second-bold', [ParagraphBold]),
    ])
  ).toThrow(/both claim decode target/);
  expect(() =>
    createFormatEditor([
      format('paragraph', [{ kind: 'element', type: 'paragraph' }]),
      format('paragraph-bold', [ParagraphBold]),
    ])
  ).toThrow(/both claim decode target/);
  expect(() =>
    createFormatEditor([format('data-prefix', [DataAttribute])])
  ).not.toThrow();
  expect(() =>
    createFormatEditor([
      format('paragraph-bold', [ParagraphBold]),
      format('heading-bold', [HeadingBold]),
    ])
  ).not.toThrow();
  expect(() =>
    createFormatEditor([
      format('unknown', [{ kind: 'element', type: 'unknown' }]),
    ])
  ).toThrow(/claims unknown schema element "unknown"/);
  expect(() =>
    createFormatEditor([
      format('unknown-property', [
        schema.textProperty('unknown', property.boolean(), {
          target: target.type('paragraph'),
        }),
      ]),
    ])
  ).toThrow(/claims schema property .* that is not installed/);
});

test('DataTransfer format ownership snapshots declarations before installation', () => {
  const equivalentParagraphBold = schema.textProperty(
    'bold',
    property.boolean(),
    {
      target: target.type('paragraph'),
    }
  );
  const claims: DataTransferSchemaClaim[] = [equivalentParagraphBold];
  const format: DataTransferFormat = {
    mimeType: 'text/html',
    key: 'semantic-property',
    claims,
    decode: () => null,
  };
  const plugin = dataTransferFormats('snapshot-format', [format]);
  const editor = createFormatEditor([]);

  claims[0] = { kind: 'element', type: 'not-installed' };

  expect(() => editor.install(plugin)).not.toThrow();
  expect(() => createFormatEditor([format])).toThrow(
    /claims unknown schema element "not-installed"/
  );
});

test('parser and serializer ownership claims are independent', () => {
  expect(() =>
    createFormatEditor([
      {
        mimeType: 'text/html',
        key: 'decode-paragraph',
        claims: [{ kind: 'element', type: 'paragraph' }],
        decode: () => ContentSlice.closed([paragraph('decode')]),
      },
      {
        mimeType: 'text/html',
        key: 'encode-paragraph',
        claims: [{ kind: 'element', type: 'paragraph' }],
        encode: () => '<p>encode</p>',
      },
    ])
  ).not.toThrow();
});

test('DataTransfer formats round-trip registered mimeTypes', () => {
  const encode = mock(
    (context: Parameters<NonNullable<DataTransferFormat['encode']>>[0]) => {
      expect(Object.keys(context).sort()).toEqual([
        'mimeType',
        'slice',
        'state',
      ]);
      expect('dataTransfer' in context).toBe(false);
      expect('editor' in context).toBe(false);
      expect('fit' in context).toBe(false);

      return JSON.stringify(context.slice.content);
    }
  );
  const json: DataTransferFormat = {
    mimeType: 'application/x-test-rich-text',
    key: 'json-rich-text',
    decode({ data }) {
      try {
        const content = JSON.parse(data) as unknown;

        return Array.isArray(content) ? ContentSlice.closed(content) : null;
      } catch {
        return null;
      }
    },
    encode,
  };
  const source = createFormatEditor([json]);
  const innerTarget = createFormatEditor([json]);
  const output = new DataTransferStub();
  const value = [
    { children: [{ bold: true, text: 'round trip' }], type: 'paragraph' },
  ];

  source.update.value.replace({ children: value });
  writeDataTransferFragment(source, output, ContentSlice.closed(value));

  expect(
    innerTarget.api.dom.clipboard.insertData(output as unknown as DataTransfer)
  ).toBe(true);
  expect(innerTarget.read.children()).toEqual(value);
  expect(NodeApi.string(innerTarget.read.children()[0])).toBe('round trip');
  expect(encode).toHaveBeenCalledTimes(1);
});

test('views insert transfers and read the clipboard key of their runtime owner', () => {
  const editor = createEditor({
    plugins: [
      hostSchema,
      dom({ clipboardFormatKey: 'x-owner-fragment' }),
    ] as const,
    initialSelection: SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    }),
    initialValue: [paragraph('')],
  });
  const view = createEditorView(editor);
  const data = new DataTransferStub();

  data.setData('text/plain', 'pasted');

  expect(getDOMClipboardFormatKey(view)).toBe('x-owner-fragment');
  expect(
    view.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  ).toBe(true);
  expect(editor.read.text.string([])).toBe('pasted');
});
