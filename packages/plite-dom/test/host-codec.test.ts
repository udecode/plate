import { expect, mock, test } from 'bun:test';

import {
  ContentSlice,
  createEditor,
  defineEditorExtension,
  defineEditorSchema,
  defineExtensionSlot,
  element,
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

const hostSchema = defineEditorSchema({
  elements: {
    heading: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
    }),
    paragraph: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
    }),
  },
  id: 'host-codec-test',
  properties: [ParagraphBold, HeadingBold, DataAttribute],
  root: schema.root({
    content: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
  }),
  version: 1,
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

  expect(editor.api.clipboard.insertData(data as unknown as DataTransfer)).toBe(
    true
  );
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

  expect(editor.api.clipboard.insertData(data as unknown as DataTransfer)).toBe(
    true
  );
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

  expect(editor.api.clipboard.insertData(data as unknown as DataTransfer)).toBe(
    true
  );
  parsed.children[0] = { text: 'mutated after parse' };
  expect(editor.read.text.string([])).toBe('parsed');
  expect(Object.isFrozen(editor.read.children()[0])).toBe(true);
});

test('host codec parsing observes the active transaction document and selection', () => {
  const editor = createCodecEditor([]);
  const data = new DataTransferStub();

  data.setData('text/plain', 'pasted');

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
      editor.api.clipboard.insertData(data as unknown as DataTransfer)
    ).toBe(true);
  });

  expect(editor.read.children()[1]).toEqual({
    children: [{ text: 'pasted' }],
    data_owner: 'target',
    type: 'paragraph',
  });
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

test('host codec priority is deterministic per format', () => {
  const editor = createCodecEditor([
    defineHostCodec({
      format: 'text/html',
      key: 'low-html',
      parse: () => ContentSlice.closed([paragraph('low')]),
      priority: 1,
      serialize: () => '<p>low</p>',
    }),
    defineHostCodec({
      format: 'text/html',
      key: 'high-html',
      parse: () => ContentSlice.closed([paragraph('high')]),
      priority: 10,
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
  editor.api.clipboard.insertData(input as unknown as DataTransfer);
  writeHostFragmentData(
    editor,
    output,
    ContentSlice.closed([paragraph('high')])
  );

  expect(editor.read.text.string([])).toBe('high');
  expect(output.getData('text/html')).toBe('<p>high</p>');
  expect(output.getData('text/markdown')).toBe('high');
});

test('later registration wins a host codec priority tie', () => {
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

  expect(editor.api.clipboard.insertData(data as unknown as DataTransfer)).toBe(
    true
  );
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
    fallbackEditor.api.clipboard.insertTextData(
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
    overrideEditor.api.clipboard.insertTextData(
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

  const cleanup = editor.extend(
    hostCodecs('temporary-host-codec', [
      defineHostCodec({
        format: 'text/html',
        key: 'temporary',
        priority: 10,
        serialize: () => '<p>temporary</p>',
      }),
    ])
  );

  expect(write()).toBe('<p>temporary</p>');
  cleanup();
  expect(write()).toBe('<p>original</p>');

  expect(() =>
    editor.extend(hostCodecs('conflicting-host-codec', [original]))
  ).toThrow(/use the same key "original"/);
  expect(write()).toBe('<p>original</p>');
});

test('host codec claims compile against the candidate schema revision', () => {
  const editor = createCodecEditor([]);
  const Italic = schema.textProperty('italic', property.boolean(), {
    target: target.type('paragraph'),
  });
  const italic = defineHostCodec({
    format: 'text/html',
    key: 'italic',
    schema: [{ declaration: Italic, kind: 'property' }],
    serialize: () => '<em>value</em>',
  });
  const italicSchema = defineEditorExtension({
    name: 'italic-schema',
    schema: schema.contribution({
      properties: [Italic],
    }),
  });

  expect(() => editor.extend(hostCodecs('italic-codec', [italic]))).toThrow(
    /targets unknown schema property/
  );

  const cleanup = editor.extend([
    italicSchema,
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
    defineEditorSchema({
      elements: {
        [type]: element({
          content: schema.content.text({ default: 'text', min: 1 }),
        }),
      },
      id: 'host-codec-schema-revision',
      root: schema.root({
        content: schema.content.type(type, {
          default: { type },
          min: 1,
        }),
      }),
      version,
    });
  const editor = createEditor({
    extensions: [
      dom(),
      slot.of(articleSchema(1, 'paragraph')),
      hostCodecs('schema-revision-codec', [
        defineHostCodec({
          format: 'text/html',
          key: 'paragraph-html',
          parse: () => ContentSlice.closed([paragraph('parsed')]),
          schema: [{ kind: 'element', type: 'paragraph' }],
        }),
      ]),
    ] as const,
    initialValue: [paragraph('before')],
  });
  let commits = 0;

  editor.subscribeCommit(() => commits++);

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
  ).toThrow(/targets unknown schema element "paragraph"/);
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
        priority: 1,
      }),
      defineHostCodec({
        format: 'text/html',
        key: 'malformed',
        parse: () =>
          ({
            content: [paragraph('invalid')],
            openEnd: 2,
            openStart: 2,
          }) as ContentSlice,
        priority: 10,
      }),
      defineHostCodec({
        format: 'text/html',
        key: 'throwing-query',
        parse: () => ContentSlice.closed([paragraph('unreachable')]),
        priority: 20,
        query: () => {
          throw new Error('query failed');
        },
      }),
    ],
    (diagnostic) => diagnostics.push(diagnostic)
  );
  const data = new DataTransferStub();

  data.setData('text/html', '<p>invalid</p>');

  expect(editor.api.clipboard.insertData(data as unknown as DataTransfer)).toBe(
    true
  );
  expect(editor.read.text.string([])).toBe('fallback');
  expect(
    diagnostics.map((error) =>
      'format' in error
        ? {
            extension: error.extension,
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

  editor.subscribeCommit(() => commits++);
  data.setData('text/html', '<p>invalid</p>');

  expect(editor.api.clipboard.insertData(data as unknown as DataTransfer)).toBe(
    false
  );
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
        priority: 1,
        serialize: () => '<p>fallback</p>',
      }),
      defineHostCodec({
        format: 'text/html',
        key: 'throwing',
        priority: 10,
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

  expect(editor.api.clipboard.insertData(data as unknown as DataTransfer)).toBe(
    true
  );
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

  expect(editor.api.clipboard.insertData(data as unknown as DataTransfer)).toBe(
    true
  );
  expect(editor.read.children()).toEqual([
    { children: [{ bold: true, text: 'X' }], type: 'paragraph' },
  ]);
});

test('codec keys and compiled schema ownership conflict atomically', () => {
  const codec = (key: string, schemaTargets?: HostCodec['schema']) =>
    defineHostCodec({
      format: 'text/html',
      key,
      parse: () => ContentSlice.closed([paragraph(key)]),
      ...(schemaTargets ? { schema: schemaTargets } : {}),
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
      codec('first-bold', [{ declaration: ParagraphBold, kind: 'property' }]),
      codec('second-bold', [{ declaration: ParagraphBold, kind: 'property' }]),
    ])
  ).toThrow(/both claim parse target/);
  expect(() =>
    createCodecEditor([
      codec('paragraph', [{ kind: 'element', type: 'paragraph' }]),
      codec('paragraph-bold', [
        { declaration: ParagraphBold, kind: 'property' },
      ]),
    ])
  ).toThrow(/both claim parse target/);
  expect(() =>
    createCodecEditor([
      codec('data-prefix', [{ declaration: DataAttribute, kind: 'property' }]),
    ])
  ).not.toThrow();
  expect(() =>
    createCodecEditor([
      codec('paragraph-bold', [
        { declaration: ParagraphBold, kind: 'property' },
      ]),
      codec('heading-bold', [{ declaration: HeadingBold, kind: 'property' }]),
    ])
  ).not.toThrow();
  expect(() =>
    createCodecEditor([
      codec('unknown', [{ kind: 'element', type: 'unknown' }]),
    ])
  ).toThrow(/targets unknown schema element "unknown"/);
  expect(() =>
    createCodecEditor([
      codec('unknown-property', [
        {
          declaration: schema.textProperty('unknown', property.boolean()),
          kind: 'property',
        },
      ]),
    ])
  ).toThrow(/targets unknown schema property/);
});

test('host codec property claims require immutable schema definitions', () => {
  const mutable = {
    ...ParagraphBold,
    value: { ...ParagraphBold.value },
  };

  expect(() =>
    defineHostCodec({
      format: 'text/html',
      key: 'mutable-property',
      parse: () => null,
      schema: [
        {
          declaration: mutable,
          kind: 'property',
        },
      ],
    })
  ).toThrow(/must be an immutable schema definition/);

  const codec = defineHostCodec({
    format: 'text/html',
    key: 'immutable-property',
    parse: () => null,
    schema: [{ declaration: ParagraphBold, kind: 'property' }],
  });

  expect(codec.schema?.[0]).toEqual({
    declaration: ParagraphBold,
    kind: 'property',
  });
  expect(
    codec.schema?.[0]?.kind === 'property' &&
      codec.schema[0].declaration === ParagraphBold
  ).toBe(true);
});

test('parser and serializer schema claims are independent', () => {
  expect(() =>
    createCodecEditor([
      defineHostCodec({
        format: 'text/html',
        key: 'parse-paragraph',
        parse: () => ContentSlice.closed([paragraph('parse')]),
        schema: [{ kind: 'element', type: 'paragraph' }],
      }),
      defineHostCodec({
        format: 'text/html',
        key: 'serialize-paragraph',
        schema: [{ kind: 'element', type: 'paragraph' }],
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
  const target = createCodecEditor([json]);
  const output = new DataTransferStub();
  const value = [
    { children: [{ bold: true, text: 'round trip' }], type: 'paragraph' },
  ];

  source.update.value.replace({ children: value });
  writeHostFragmentData(source, output, ContentSlice.closed(value));

  expect(
    target.api.clipboard.insertData(output as unknown as DataTransfer)
  ).toBe(true);
  expect(target.read.children()).toEqual(value);
  expect(NodeApi.string(target.read.children()[0]!)).toBe('round trip');
  expect(serialize).toHaveBeenCalledTimes(1);
});
