import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';

import {
  createEditor,
  defineEditorSchema,
  definePropertyPolicy,
  DocumentChange,
  type EditorDocumentValue,
  type Element,
  NodeApi,
  property,
  schema,
  target,
} from '@platejs/plite';

import {
  ChangeSet,
  DocumentChangeBuilder,
  IndexedDocument,
  type JsonEditorValue,
} from '../src/core/document-change';
import {
  ensureElementOwnedRootIndex,
  getElementOwnedRootGrammarBindings,
  getElementOwnedRootPathMappingStats,
  inspectElementOwnedRootChangedNodes,
  rebaseElementOwnedRootIndex,
  resolveElementOwnedRootPath,
} from '../src/core/element-owned-root-index';
import { getCompiledEditorSchemaFromApi } from '../src/core/editor-schema';
import { getEditorSchema } from '../src/core/editor-runtime';

const paragraph = (text: string): Element => ({
  children: [{ text }],
  type: 'paragraph',
});
const paragraphWithText = (
  text: string,
  properties: Readonly<Record<string, unknown>> = {}
): Element => ({
  children: [{ ...properties, text }],
  type: 'paragraph',
});
const section = (children: Element[]): Element => ({
  children,
  type: 'section',
});
const createValidationEditor = () =>
  createEditor({
    extensions: [
      defineEditorSchema({
        elements: {
          heading: {
            content: schema.content.text({ default: 'text', min: 1 }),
          } as const,
          paragraph: {
            content: schema.content.text({
              default: 'text',
              max: 2,
              min: 1,
            }),
          } as const,
          section: {
            content: schema.content.group('block', {
              default: { type: 'paragraph' },
              max: 3,
              min: 1,
            }),
          } as const,
        },
        id: 'incremental-validation-laws',
        properties: [
          schema.textProperty('bold', property.boolean(), {
            target: { kind: 'type', type: 'paragraph' },
          }),
        ],
        root: {
          content: schema.content.types(['paragraph', 'section'], {
            default: { type: 'paragraph' },
            max: 3,
            min: 1,
          }),
        } as const,
        roots: {
          header: {
            content: schema.content.type('heading', {
              default: { type: 'heading' },
              min: 1,
            }),
          } as const,
        },
        unknown: 'reject',
        version: 1,
      }),
    ],
    initialValue: {
      children: [section([paragraph('alpha'), paragraph('beta')])],
      roots: {
        header: [{ children: [{ text: 'title' }], type: 'heading' }],
      },
    },
  });

const OWNED_ROOT = 'owned:shared';
const ownedRootExtension = defineEditorSchema({
  elements: {
    container: {
      content: schema.content.types(['heading-owner', 'paragraph-owner'], {
        default: { type: 'paragraph-owner' },
        min: 1,
      }),
    } as const,
    heading: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    'heading-owner': {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: schema.content.type('heading', { min: 1 }),
      },
    } as const,
    'paragraph-owner': {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: schema.content.type('paragraph', { min: 1 }),
      },
    } as const,
  },
  id: 'incremental-owned-root-index',
  root: {
    content: schema.content.types([
      'container',
      'heading-owner',
      'paragraph',
      'paragraph-owner',
    ]),
  } as const,
  unknown: 'reject',
  version: 1,
});
const ownedRootElement = (
  type: 'heading-owner' | 'paragraph-owner',
  root = OWNED_ROOT,
  text = ''
): Element => ({
  childRoots: { body: root },
  children: [{ text }],
  type,
});
const createOwnedRootEditor = () =>
  createEditor({
    extensions: [ownedRootExtension],
    initialValue: {
      children: [
        {
          children: [ownedRootElement('paragraph-owner')],
          type: 'container',
        },
        paragraph('tail'),
      ],
      roots: { [OWNED_ROOT]: [paragraph('projected')] },
    },
  });

const errorMessage = (run: () => void) => {
  try {
    run();
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
};

const isEditorDocumentValue = (
  value: JsonEditorValue
): value is JsonEditorValue & EditorDocumentValue =>
  value.children.every(NodeApi.isDescendant) &&
  Object.values(value.roots ?? {}).every((children) =>
    children.every(NodeApi.isDescendant)
  );

const freezeDocument = (value: EditorDocumentValue) => {
  const freezeNode = (node: Element | { text: string }) => {
    if (NodeApi.isElement(node)) {
      for (const child of node.children) freezeNode(child);
      Object.freeze(node.children);
    }
    Object.freeze(node);
  };

  for (const child of value.children) freezeNode(child);
  Object.freeze(value.children);
  for (const children of Object.values(value.roots ?? {})) {
    for (const child of children) freezeNode(child);
    Object.freeze(children);
  }
  if (value.roots) Object.freeze(value.roots);
  Object.freeze(value);
};

const validateWithBuilder = (
  before: JsonEditorValue,
  change: DocumentChange,
  schemaApi: ReturnType<typeof getEditorSchema>
) => {
  const builder = new DocumentChangeBuilder(before, {
    indexConstructedRoot: schemaApi.indexConstructedRoot,
    validateConstructed: (input) => {
      if (
        !isEditorDocumentValue(input.after) ||
        !isEditorDocumentValue(input.before)
      ) {
        throw new Error('Constructed test document is not an editor value.');
      }

      schemaApi.validateDocumentChange({
        ...input,
        after: input.after,
        before: input.before,
      });
    },
  });

  builder.apply(change);
  builder.finalize();

  return builder.value;
};

describe('incremental schema validation', () => {
  it('validates each changed node property once per transaction', () => {
    type Trace = Readonly<{
      kind: 'element' | 'text';
    }>;
    const visits = { element: 0, text: 0 };
    const policy = definePropertyPolicy<Trace>({
      id: 'incremental-validation-locality',
      validate: (value): value is Trace => {
        if (
          typeof value !== 'object' ||
          value === null ||
          !('kind' in value) ||
          (value.kind !== 'element' && value.kind !== 'text')
        ) {
          return false;
        }

        visits[value.kind] += 1;

        return true;
      },
      version: 1,
    });
    const descriptor = property.json({ policy });
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            paragraph: {
              content: schema.content.text(),
              properties: { trace: descriptor },
            } as const,
          },
          id: 'incremental-validation-locality',
          properties: [
            schema.textProperty('trace', descriptor, {
              target: target.type('paragraph'),
            }),
          ],
          root: {
            content: schema.content.type('paragraph', { min: 1 }),
          } as const,
          unknown: 'reject',
          version: 1,
        }),
      ],
      initialValue: {
        children: [
          {
            children: [{ text: 'x', trace: { kind: 'text' } }],
            trace: { kind: 'element' },
            type: 'paragraph',
          },
        ],
      },
    });

    visits.element = 0;
    visits.text = 0;

    editor.update((tx) =>
      tx.text.insert('!', { at: { offset: 1, path: [0, 0] } })
    );

    assert.deepEqual(visits, { element: 1, text: 1 });
  });

  it('prunes descendant validation without confusing sibling path prefixes', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
          },
          id: 'incremental-validation-siblings',
          properties: [
            schema.textProperty('bold', property.boolean(), {
              target: { kind: 'type', type: 'paragraph' },
            }),
          ],
          root: {
            content: schema.content.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          } as const,
          unknown: 'reject',
          version: 1,
        }),
      ],
      initialValue: { children: [paragraph('seed')] },
    });
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();
    const children = Array.from({ length: 512 }, (_, index) =>
      paragraphWithText(`sibling-${index}`, {
        bold: index === 511 ? 'invalid' : true,
      })
    );
    const change = DocumentChange.between(before, { children });
    const after = change.apply(before);
    const full = errorMessage(() => schemaApi.validateDocument(after));
    const incremental = errorMessage(() =>
      validateWithBuilder(before, change, schemaApi)
    );

    assert.match(full ?? '', /boolean/i);
    assert.equal(incremental, full);
  });

  it('matches full validation for changed descendants, ancestors, and roots', () => {
    const editor = createValidationEditor();
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();

    schemaApi.validateDocument(before);

    const candidates: EditorDocumentValue[] = [
      {
        ...before,
        children: [section([paragraph('changed'), paragraph('beta')])],
      },
      {
        ...before,
        children: [],
      },
      {
        ...before,
        children: [section([])],
      },
      {
        ...before,
        children: [
          {
            children: [paragraph('nested')],
            type: 'paragraph',
          },
        ],
      },
      {
        ...before,
        children: [
          section([{ children: [{ text: 'unknown' }], type: 'unknown' }]),
        ],
      },
      {
        ...before,
        children: [section([paragraphWithText('invalid', { bold: 'yes' })])],
      },
      {
        ...before,
        roots: {
          ...before.roots,
          header: [],
        },
      },
      {
        ...before,
        children: [
          section([
            paragraph('alpha'),
            paragraph('beta'),
            paragraph('gamma'),
            paragraph('overflow'),
          ]),
        ],
      },
    ];

    for (const candidate of candidates) {
      const change = DocumentChange.between(before, candidate);
      const after = change.apply(before);
      const full = errorMessage(() => schemaApi.validateDocument(after));
      const incremental = errorMessage(() =>
        validateWithBuilder(before, change, schemaApi)
      );

      assert.equal(
        incremental === null,
        full === null,
        `${JSON.stringify(candidate)}\nfull: ${full}\nincremental: ${incremental}`
      );
    }
  });

  it('matches full validation across generated structural and property edits', () => {
    const editor = createValidationEditor();
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();

    schemaApi.validateDocument(before);

    fc.assert(
      fc.property(
        fc.string({ maxLength: 24 }),
        fc.oneof(fc.boolean(), fc.integer(), fc.string({ maxLength: 8 })),
        fc.integer({ max: 4, min: 0 }),
        (text, bold, paragraphCount) => {
          const candidate: EditorDocumentValue = {
            ...before,
            children: [
              section(
                Array.from({ length: paragraphCount }, (_, index) =>
                  paragraphWithText(`${text}${index}`, { bold })
                )
              ),
            ],
          };
          const change = DocumentChange.between(before, candidate);
          const after = change.apply(before);
          const full = errorMessage(() => schemaApi.validateDocument(after));
          const incremental = errorMessage(() =>
            validateWithBuilder(before, change, schemaApi)
          );

          assert.equal(incremental === null, full === null);
        }
      ),
      { numRuns: 64, seed: 20_260_721 }
    );
  });

  it('requires explicit boundary validation for detached baselines', () => {
    const editor = createValidationEditor();
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();
    const change = DocumentChange.between(before, {
      ...before,
      children: [section([paragraph('changed'), paragraph('beta')])],
    });
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record: (event: { id: string }) => void;
      };
    };
    const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const events: string[] = [];

    schemaApi.validateDocument(before);
    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
      record: ({ id }) => events.push(id),
    };

    try {
      validateWithBuilder(before, change, schemaApi);
      assert.equal(
        events.filter((id) => id === 'schema-validation-incremental-hit')
          .length,
        1
      );
      assert.equal(
        events.filter((id) => id === 'schema-validation-full-document-boundary')
          .length,
        0
      );

      events.length = 0;
      const detached = structuredClone(before);
      freezeDocument(detached);
      assert.equal(Object.isFrozen(detached.children), true);
      const detachedChange = DocumentChange.between(detached, {
        ...detached,
        children: [section([paragraph('detached'), paragraph('beta')])],
      });

      assert.throws(
        () => validateWithBuilder(detached, detachedChange, schemaApi),
        /explicitly validated immutable baseline/u
      );
      assert.equal(
        events.filter((id) => id === 'schema-validation-full-document-boundary')
          .length,
        0
      );

      schemaApi.validateDocument(detached);
      validateWithBuilder(detached, detachedChange, schemaApi);
      assert.equal(
        events.filter((id) => id === 'schema-validation-full-document-boundary')
          .length,
        1
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
    }
  });

  it('never full-scans an ordinary live update', () => {
    const editor = createValidationEditor();
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record: (event: { id: string }) => void;
      };
    };
    const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const events: string[] = [];

    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
      record: ({ id }) => events.push(id),
    };

    try {
      editor.update((tx) =>
        tx.text.insert('!', { at: { offset: 5, path: [0, 0, 0] } })
      );

      assert.equal(
        events.filter((id) => id === 'schema-validation-incremental-hit')
          .length,
        1
      );
      assert.equal(
        events.filter((id) => id === 'schema-validation-full-document-boundary')
          .length,
        0
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
    }
  });

  it('stamps an explicit document when initial extension publication is empty', () => {
    const editor = createEditor({
      extensions: [],
      initialValue: [paragraph('alpha')],
    });
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record: (event: { id: string }) => void;
      };
    };
    const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const events: string[] = [];

    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
      record: ({ id }) => events.push(id),
    };

    try {
      editor.update((tx) =>
        tx.text.insert('!', { at: { offset: 5, path: [0, 0] } })
      );

      assert.equal(
        events.filter((id) => id === 'schema-validation-incremental-hit')
          .length,
        1
      );
      assert.equal(
        events.filter((id) => id === 'schema-validation-full-document-boundary')
          .length,
        0
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
    }
  });

  it('rebases element-owned root grammar and live lookup through one change', () => {
    const editor = createOwnedRootEditor();
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();
    const candidate: EditorDocumentValue = {
      ...before,
      children: [
        {
          children: [ownedRootElement('heading-owner')],
          type: 'container',
        },
        paragraph('tail'),
      ],
      roots: {
        [OWNED_ROOT]: [{ children: [{ text: 'projected' }], type: 'heading' }],
      },
    };
    const change = DocumentChange.between(before, candidate);
    const after = validateWithBuilder(before, change, schemaApi);
    const content = schemaApi.getRootContent(
      OWNED_ROOT,
      after as EditorDocumentValue
    );

    assert.equal(content?.allowedElementTypes.has('heading'), true);
    assert.equal(content?.allowedElementTypes.has('paragraph'), false);
  });

  it('keeps omitted-value root lookup and local edits sparse at 50k owners', () => {
    const ownerCount = 50_000;
    const editor = createEditor({
      extensions: [ownedRootExtension],
      initialValue: {
        children: Array.from({ length: ownerCount }, (_, index) =>
          ownedRootElement('paragraph-owner', OWNED_ROOT, `${index}`)
        ),
        roots: { [OWNED_ROOT]: [paragraph('projected')] },
      },
    });
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record: (event: { id: string }) => void;
      };
    };
    const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const events: string[] = [];

    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
      record: ({ id }) => events.push(id),
    };

    try {
      const content = getEditorSchema(editor).getRootContent(OWNED_ROOT);

      assert.equal(content?.allowedElementTypes.has('paragraph'), true);
      assert.equal(content?.allowedElementTypes.has('heading'), false);
      editor.update((tx) =>
        tx.text.insert('!', {
          at: { offset: 1, path: [Math.floor(ownerCount / 2), 0] },
        })
      );

      assert.equal(
        events.filter((id) => id === 'schema-root-ownership-index-owner-visit')
          .length,
        0,
        JSON.stringify(
          Object.fromEntries(
            [...new Set(events)].map((id) => [
              id,
              events.filter((event) => event === id).length,
            ])
          )
        )
      );
      assert.equal(
        events.filter((id) => id === 'schema-root-ownership-index-build')
          .length,
        0
      );
      assert.equal(
        events.filter((id) => id === 'schema-validation-global-root-fallback')
          .length,
        0
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
    }
  });

  it('deletes 10k sibling owners with linear prefix work', () => {
    const editor = createOwnedRootEditor();
    const compiled = getCompiledEditorSchemaFromApi(getEditorSchema(editor));

    assert.ok(compiled);
    const before = IndexedDocument.fromValue(
      Array.from({ length: 12_000 }, (_, index) =>
        ownedRootElement('paragraph-owner', OWNED_ROOT, `${index}`)
      )
    );

    ensureElementOwnedRootIndex(compiled, 'main', before);
    const change = ChangeSet.create(before, [
      {
        from: before.nodeRange([1000]).from,
        to: before.nodeRange([10_999]).to,
      },
    ]);
    const changed = inspectElementOwnedRootChangedNodes(
      before,
      before.nodeRange([1000]).from,
      before.nodeRange([10_999]).to
    );

    assert.equal(changed.candidates.length, 10_000);
    assert.equal(changed.touching, 20_002);
    assert.equal(changed.prefixNodes, 10_001);
    assert.equal(changed.prefixSteps, 20_001);
    const after = change.apply(before);
    const startedAt = performance.now();
    const incremental = rebaseElementOwnedRootIndex(
      compiled,
      'main',
      change,
      before,
      after
    );
    const duration = performance.now() - startedAt;
    const full = ensureElementOwnedRootIndex(
      compiled,
      'main',
      IndexedDocument.fromValue(structuredClone(after.value))
    );
    const summarize = (index: typeof incremental) =>
      getElementOwnedRootGrammarBindings(index, OWNED_ROOT).map(
        ({ content, count }) => ({
          allowsHeading: content.allowedElementTypes.has('heading'),
          allowsParagraph: content.allowedElementTypes.has('paragraph'),
          count,
        })
      );

    assert.deepEqual(summarize(incremental), summarize(full));
    assert.deepEqual(summarize(incremental), [
      { allowsHeading: false, allowsParagraph: true, count: 2000 },
    ]);
    // The exact prefix-work assertions above are the primary complexity gate.
    // This generous wall-clock guard only catches catastrophic regressions.
    assert.ok(
      duration < 1500,
      `10k sibling-owner deletion exceeded the environment guard: ${duration.toFixed(1)}ms`
    );
  });

  it('preserves contained-before-boundary selection and nested dedup', () => {
    const editor = createOwnedRootEditor();
    const compiled = getCompiledEditorSchemaFromApi(getEditorSchema(editor));

    assert.ok(compiled);
    const nested = {
      children: [
        {
          children: [ownedRootElement('paragraph-owner')],
          type: 'container',
        },
      ],
      type: 'container',
    } as Element;
    const before = IndexedDocument.fromValue([
      paragraph('left'),
      ownedRootElement('paragraph-owner'),
      nested,
      paragraph('right'),
    ]);

    ensureElementOwnedRootIndex(compiled, 'main', before);
    const outer = before.nodeRange([2]);
    const containedOwner = before.nodeRange([2, 0, 0]);
    const partial = inspectElementOwnedRootChangedNodes(
      before,
      outer.from,
      containedOwner.to
    );

    assert.deepEqual(partial.candidates, [
      { path: [2, 0, 0], recursive: true },
      { path: [2], recursive: false },
    ]);
    const removed = before.nodeRange([2]);
    const changed = inspectElementOwnedRootChangedNodes(
      before,
      removed.from,
      removed.to
    );

    assert.deepEqual(changed.candidates, [{ path: [2], recursive: true }]);
    const change = ChangeSet.create(before, [
      { from: removed.from, to: removed.to },
    ]);
    const after = change.apply(before);
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record: (event: { id: string }) => void;
      };
    };
    const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const events: string[] = [];

    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
      record: ({ id }) => events.push(id),
    };

    try {
      const incremental = rebaseElementOwnedRootIndex(
        compiled,
        'main',
        change,
        before,
        after
      );
      const incrementalOwnerVisits = events.filter(
        (id) => id === 'schema-root-ownership-index-owner-visit'
      ).length;
      const full = ensureElementOwnedRootIndex(
        compiled,
        'main',
        IndexedDocument.fromValue(structuredClone(after.value))
      );

      assert.equal(
        getElementOwnedRootGrammarBindings(incremental, OWNED_ROOT)[0]?.count,
        1
      );
      assert.deepEqual(
        getElementOwnedRootGrammarBindings(incremental, OWNED_ROOT).map(
          ({ count }) => count
        ),
        getElementOwnedRootGrammarBindings(full, OWNED_ROOT).map(
          ({ count }) => count
        )
      );
      assert.equal(incrementalOwnerVisits, 1);
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
    }
  });

  it('rebases moved nested-owner provenance without visiting its subtree', () => {
    const editor = createOwnedRootEditor();
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record: (event: { id: string }) => void;
      };
    };
    const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const events: string[] = [];

    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
      record: ({ id }) => events.push(id),
    };

    try {
      editor.update.nodes.move({ at: [0], to: [2] });
      assert.equal(
        events.filter((id) => id === 'schema-root-ownership-index-owner-visit')
          .length,
        0,
        JSON.stringify(
          Object.fromEntries(
            [...new Set(events)].map((id) => [
              id,
              events.filter((event) => event === id).length,
            ])
          )
        )
      );

      events.length = 0;
      const before = editor.read.value();
      const candidate: EditorDocumentValue = {
        ...before,
        children: [...before.children, ownedRootElement('heading-owner')],
      };
      const conflict = errorMessage(() =>
        validateWithBuilder(
          before,
          DocumentChange.between(before, candidate),
          getEditorSchema(editor)
        )
      );

      assert.match(conflict ?? '', /\[1,0\].*paragraph-owner\.body/i);
      assert.match(conflict ?? '', /\[2\].*heading-owner\.body/i);
      assert.equal(
        events.filter(
          (id) => id === 'schema-root-ownership-index-location-fallback'
        ).length,
        0
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
    }
  });

  it('maps cloned-owner provenance through later sibling shifts', () => {
    const editor = createEditor({
      extensions: [ownedRootExtension],
      initialValue: {
        children: [
          paragraph('left'),
          ownedRootElement('paragraph-owner', OWNED_ROOT, 'owner'),
          paragraph('right'),
        ],
        roots: { [OWNED_ROOT]: [paragraph('projected')] },
      },
    });
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record: (event: { id: string }) => void;
      };
    };
    const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const events: string[] = [];

    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
      record: ({ id }) => events.push(id),
    };

    try {
      editor.update((tx) =>
        tx.text.insert('!', { at: { offset: 1, path: [1, 0] } })
      );
      editor.update.nodes.insert(paragraph('prefix'), { at: [0] });
      events.length = 0;
      const before = editor.read.value();
      const candidate: EditorDocumentValue = {
        ...before,
        children: [...before.children, ownedRootElement('heading-owner')],
      };
      const conflict = errorMessage(() =>
        validateWithBuilder(
          before,
          DocumentChange.between(before, candidate),
          getEditorSchema(editor)
        )
      );

      assert.match(conflict ?? '', /\[2\].*paragraph-owner\.body/i);
      assert.match(conflict ?? '', /\[4\].*heading-owner\.body/i);
      assert.equal(
        events.filter(
          (id) => id === 'schema-root-ownership-index-location-fallback'
        ).length,
        0
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
    }
  });

  it('compacts 10k owner-path moves into logarithmic lookup history', () => {
    const editor = createOwnedRootEditor();
    const compiled = getCompiledEditorSchemaFromApi(getEditorSchema(editor));

    assert.ok(compiled);
    let document = IndexedDocument.fromValue(editor.read.children());
    let index = ensureElementOwnedRootIndex(compiled, 'main', document);
    const iterations = 10_000;

    for (let iteration = 0; iteration < iterations; iteration += 1) {
      const target = IndexedDocument.fromValue(
        Object.freeze([document.value[1]!, document.value[0]!])
      );
      const change = ChangeSet.between(document, target);
      const after = change.apply(document);

      index = rebaseElementOwnedRootIndex(
        compiled,
        'main',
        change,
        document,
        after
      );
      document = after;
    }

    const binding = getElementOwnedRootGrammarBindings(index, OWNED_ROOT)[0]
      ?.owner;

    assert.ok(binding);
    assert.deepEqual(resolveElementOwnedRootPath(index, binding), [
      iterations % 2,
      0,
    ]);
    const stats = getElementOwnedRootPathMappingStats(index);

    assert.equal(stats.mappedChanges, iterations);
    assert.equal(stats.origins, 1);
    assert.ok(stats.segments <= 16, JSON.stringify(stats));
    assert.ok(stats.retainedDocuments <= 32, JSON.stringify(stats));
  });

  it('matches full validation across generated element-owned root edits', () => {
    const editor = createOwnedRootEditor();
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();
    const ownerArbitrary = fc.record({
      root: fc.constantFrom('owned:a', 'owned:b'),
      type: fc.constantFrom<'heading-owner' | 'paragraph-owner'>(
        'heading-owner',
        'paragraph-owner'
      ),
    });
    const rootContentArbitrary = fc.option(
      fc.constantFrom('heading', 'paragraph'),
      { nil: undefined }
    );

    fc.assert(
      fc.property(
        fc.array(ownerArbitrary, { maxLength: 6 }),
        rootContentArbitrary,
        rootContentArbitrary,
        (owners, rootA, rootB) => {
          const roots = Object.fromEntries(
            [
              ['owned:a', rootA],
              ['owned:b', rootB],
            ].flatMap(([root, type]) =>
              type
                ? [
                    [
                      root,
                      [
                        {
                          children: [{ text: root }],
                          type,
                        },
                      ],
                    ],
                  ]
                : []
            )
          );
          const candidate = {
            children: owners.map(({ root, type }) =>
              ownedRootElement(type, root)
            ),
            roots,
          } as EditorDocumentValue;
          const change = DocumentChange.between(before, candidate);
          const after = change.apply(before);
          const incremental = errorMessage(() =>
            validateWithBuilder(before, change, schemaApi)
          );
          const full = errorMessage(() => schemaApi.validateDocument(after));

          assert.equal(
            incremental === null,
            full === null,
            `${JSON.stringify(candidate)}\nfull: ${full}\nincremental: ${incremental}`
          );
        }
      ),
      { numRuns: 96, seed: 20_260_721 }
    );
  });

  it('does not trust an invalid ownership index cached by full validation', () => {
    const editor = createOwnedRootEditor();
    const schemaApi = getEditorSchema(editor);
    const before = editor.read.value();
    const candidate: EditorDocumentValue = {
      children: [ownedRootElement('heading-owner', 'owned:missing')],
      roots: {},
    };
    const change = DocumentChange.between(before, candidate);
    const after = change.apply(before);

    assert.match(
      errorMessage(() => schemaApi.validateDocument(after)) ?? '',
      /content root "owned:missing" is missing/i
    );
    assert.match(
      errorMessage(() => validateWithBuilder(before, change, schemaApi)) ?? '',
      /content root "owned:missing" is missing/i
    );
  });
});
