import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  type Descendant,
  DocumentChange,
  element,
  type Element,
  ElementApi,
  property,
  schema,
  SelectionApi,
} from '@platejs/plite';

import {
  bindCanonicalFitPreparation,
  canonicalizeRootChildren,
  constructCanonicalDocumentChange,
  prepareCanonicalFitSlice,
} from '../src/core/representation';
import { encodeContentSlice } from '../src/core/content-slice';
import { ChangeSet, IndexedDocument } from '../src/core/document-change';

const paragraph = (text: string, children?: Descendant[]) => ({
  type: 'paragraph',
  children: children ?? [{ text }],
});

const SliceFitSchema = defineEditorSchema({
  elements: {
    caption: element({
      content: schema.content.text({ default: 'text', min: 1 }),
    }),
    divider: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
    }),
    heading: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
      properties: { level: property.number() },
    }),
    link: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    }),
    paragraph: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
    }),
    section: element({
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      groups: ['block'],
    }),
  },
  id: 'slice-fit-contract',
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.root({
    content: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
  }),
  version: 1,
});

const createSchemaEditor = (initialValue: Element[]) =>
  createEditor({ extensions: [SliceFitSchema], initialValue });

const CoveredDeletionSchema = defineEditorSchema({
  elements: {
    defaultReplace: element({
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      groups: ['block'],
    }),
    explicitReplace: element({
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      groups: ['block'],
      slice: { preserveContext: true, replaceWhenCovered: true },
    }),
    explicitRetain: element({
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      groups: ['block'],
      slice: { replaceWhenCovered: false },
    }),
    heading: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
    }),
    paragraph: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
    }),
    preservedRetain: element({
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      groups: ['block'],
      slice: { preserveContext: true },
    }),
  },
  id: 'covered-deletion-contract',
  root: schema.root({
    content: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
  }),
  version: 1,
});

const createCoveredDeletionEditor = (initialValue: Element[]) =>
  createEditor({ extensions: [CoveredDeletionSchema], initialValue });

const CoveredReplacementSchema = defineEditorSchema({
  elements: {
    heading: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
    }),
    isolatedParagraphs: element({
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      groups: ['block'],
      isolating: true,
    }),
    outer: element({
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      groups: ['block'],
    }),
    paragraph: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
    }),
    paragraphOnly: element({
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      groups: ['block'],
    }),
    preservedParagraphs: element({
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      groups: ['block'],
      slice: { preserveContext: true },
    }),
    widget: element({
      content: schema.content.text({ default: 'text', min: 1 }),
      groups: ['block'],
      void: 'block',
    }),
  },
  id: 'covered-replacement-contract',
  root: schema.root({
    content: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
  }),
  version: 1,
});

const createCoveredReplacementEditor = (initialValue: Element[]) =>
  createEditor({ extensions: [CoveredReplacementSchema], initialValue });

const defineMentionSchema = (id: string) =>
  defineEditorSchema({
    elements: {
      mention: element({
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: { character: property.string() },
        void: 'markable-inline',
      }),
      paragraph: element({
        content: schema.content.any(
          [schema.content.text(), schema.content.type('mention')],
          { default: 'text', min: 1 }
        ),
      }),
    },
    id,
    properties: [schema.textProperty('bold', property.boolean())],
    root: schema.root({
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    }),
    version: 1,
  });

describe('contextual schema slice fitting', () => {
  it('snapshots slice content as immutable detached input', () => {
    const source = [paragraph('before')];
    const slice = ContentSlice.closed(source);

    source[0]!.children[0] = { text: 'after' };

    assert.deepEqual(slice.content, [paragraph('before')]);
    assert.equal(Object.isFrozen(slice.content), true);
    assert.equal(Object.isFrozen(slice.content[0]), true);
    assert.throws(
      () => ContentSlice.closed(null as never),
      /content must be an array/i
    );
    assert.throws(
      () => ContentSlice.closed([{} as never]),
      /exactly one structural field/i
    );
    const cyclic = { children: [] as Descendant[], type: 'paragraph' };

    cyclic.children.push(cyclic);
    assert.throws(
      () => ContentSlice.closed([cyclic]),
      /cannot be repeated or cyclic|JSON-compatible data/i
    );
    assert.throws(
      () =>
        ContentSlice.closed([
          { ...paragraph('invalid'), payload: new Date(0) } as never,
        ]),
      /JSON-compatible data/
    );
    for (const payload of [-0, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(
        () =>
          ContentSlice.closed([{ ...paragraph('invalid'), payload } as never]),
        /JSON-compatible data/
      );
    }
    const sparse = Array.from({ length: 1 }) as Descendant[];

    delete sparse[0];
    assert.throws(() => ContentSlice.closed(sparse), /JSON-compatible data/);

    const accessor = paragraph('invalid') as Record<string, unknown>;
    const symbolKey = paragraph('invalid') as Record<PropertyKey, unknown>;
    const customNode = Object.assign(
      Object.create({ inherited: true }) as Record<string, unknown>,
      paragraph('invalid')
    );

    Object.defineProperty(accessor, 'payload', {
      enumerable: true,
      get: () => 'value',
    });
    symbolKey[Symbol('hidden')] = true;

    for (const node of [accessor, symbolKey, customNode]) {
      assert.throws(
        () => ContentSlice.closed([node as never]),
        /JSON-compatible data/
      );
    }
  });

  it('reads canonical slices with their structural edges intact', () => {
    const editor = createSchemaEditor([paragraph('abc'), paragraph('def')]);
    const partial = editor.read.slice.get({
      at: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 2, path: [1, 0] },
      },
    });
    const completeText = editor.read.slice.get({
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });

    assert.deepEqual(partial, {
      content: [paragraph('bc'), paragraph('de')],
      openEnd: 1,
      openStart: 1,
    });
    assert.deepEqual(completeText, {
      content: [paragraph('abc')],
      openEnd: 1,
      openStart: 1,
    });
    assert.equal(Object.isFrozen(partial), true);
    assert.equal(Object.isFrozen(partial.content), true);
  });

  it('keeps compiled context barriers closed across extraction and fitting', () => {
    const extension = defineEditorSchema({
      elements: {
        container: element({
          content: schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          groups: ['block'],
        }),
        isolated: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['block'],
          isolating: true,
        }),
        paragraph: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['block'],
        }),
        preserved: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['block'],
          slice: { preserveContext: true },
        }),
      },
      id: 'slice-context-barrier',
      root: schema.root({
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      }),
      version: 1,
    });

    for (const type of ['preserved', 'isolated']) {
      const source = createEditor({
        extensions: [extension],
        initialValue: [{ children: [{ text: 'hello' }], type }],
      });
      const slice = source.read.slice.get({
        at: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
      });
      const target = createEditor({
        extensions: [extension],
        initialValue: [paragraph('')],
      });
      const fitted = target.read.slice.fit(slice, {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
      });

      assert.deepEqual(slice, {
        content: [{ children: [{ text: 'ell' }], type }],
        openEnd: 0,
        openStart: 0,
      });
      assert.ok(fitted);
      assert.deepEqual(fitted.changes.apply(target.read.value()).children, [
        { children: [{ text: 'ell' }], type },
      ]);
    }

    const nestedSource = createEditor({
      extensions: [extension],
      initialValue: [
        {
          children: [{ children: [{ text: 'hello' }], type: 'preserved' }],
          type: 'container',
        },
      ],
    });
    const cases = [
      { end: 4, openEnd: 1, openStart: 1, start: 1, text: 'ell' },
      { end: 4, openEnd: 1, openStart: 1, start: 0, text: 'hell' },
      { end: 5, openEnd: 1, openStart: 1, start: 1, text: 'ello' },
      { end: 5, openEnd: 1, openStart: 1, start: 0, text: 'hello' },
    ];

    for (const testCase of cases) {
      const slice = nestedSource.read.slice.get({
        at: {
          anchor: { offset: testCase.start, path: [0, 0, 0] },
          focus: { offset: testCase.end, path: [0, 0, 0] },
        },
      });
      const roundTrip = ContentSlice.fromJSON(
        JSON.parse(JSON.stringify(slice))
      );

      assert.deepEqual(slice, {
        content: [
          {
            children: [
              {
                children: [{ text: testCase.text }],
                type: 'preserved',
              },
            ],
            type: 'container',
          },
        ],
        openEnd: testCase.openEnd,
        openStart: testCase.openStart,
      });
      assert.deepEqual(roundTrip, slice);
    }

    const extracted = nestedSource.read.slice.get({
      at: {
        anchor: { offset: 1, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
    });
    const target = createEditor({
      extensions: [extension],
      initialValue: [paragraph('')],
    });
    const fitted = target.read.slice.fit(extracted, {
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(target.read.value()).children, [
      {
        children: [{ children: [{ text: 'ell' }], type: 'preserved' }],
        type: 'container',
      },
    ]);
  });

  it('moves closed block content before and after a text block', () => {
    const value = {
      children: [{ type: 'heading', level: 2, children: [{ text: 'abc' }] }],
    };
    const editor = createSchemaEditor(value.children);
    const divider = ContentSlice.closed([
      { type: 'divider', children: [{ text: '' }] },
    ]);
    const before = editor.read.slice.fit(divider, {
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });
    const after = editor.read.slice.fit(divider, {
      at: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });

    assert.ok(before);
    assert.ok(after);
    assert.equal(Object.isFrozen(before.selection), true);
    assert.equal(Object.isFrozen(before.selection?.value), true);
    assert.equal(Object.isFrozen(before.selection?.value?.anchor), true);
    assert.equal(Object.isFrozen(before.selection?.value?.anchor.path), true);
    assert.deepEqual(before.changes.apply(value).children, [
      { type: 'divider', children: [{ text: '' }] },
      { type: 'heading', level: 2, children: [{ text: 'abc' }] },
    ]);
    assert.deepEqual(after.changes.apply(value).children, [
      { type: 'heading', level: 2, children: [{ text: 'abc' }] },
      { type: 'divider', children: [{ text: '' }] },
    ]);
  });

  it('selects a grammar-valid candidate before one canonical lowering', () => {
    const extension = defineEditorSchema({
      elements: {
        paragraph: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['block'],
        }),
        section: element({
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          groups: ['block'],
        }),
      },
      id: 'bounded-slice-fit-candidate',
      root: schema.root({
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          max: 1,
          min: 1,
        }),
      }),
      version: 1,
    });
    const value = { children: [paragraph('left')] };
    const editor = createEditor({
      extensions: [extension],
      initialValue: value.children,
    });
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    let canonicalized = 0;
    let materialized = 0;
    let fitted: ReturnType<typeof editor.read.slice.fit>;

    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind !== 'core-time') return;
          if (event.id === 'slice-fit-canonicalize') canonicalized++;
          if (event.id === 'slice-fit-variant-materialize') materialized++;
        },
      };
      fitted = editor.read.slice.fit(
        ContentSlice.closed([
          { children: [paragraph('right')], type: 'section' },
        ]),
        {
          at: {
            anchor: { offset: 4, path: [0, 0] },
            focus: { offset: 4, path: [0, 0] },
          },
        }
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    assert.ok(fitted);
    assert.ok(materialized > 1, 'the first scored candidate must be rejected');
    assert.equal(canonicalized, 1);
    assert.deepEqual(fitted.changes.apply(value).children, [
      paragraph('leftright'),
    ]);
  });

  it('lowers a prepared open block slice directly at one top-level text leaf', () => {
    const before = paragraph('before');
    const target = paragraph('', [
      { bold: true, text: 'aa' },
      { text: 'bb' },
      { bold: true, text: 'cc' },
    ]);
    const after = paragraph('after');
    const slice = ContentSlice.fromJSON({
      content: [
        paragraph('', [{ bold: true, text: 'X' }]),
        paragraph('middle'),
        paragraph('Y'),
      ],
      openEnd: 1,
      openStart: 1,
    });
    const editor = createSchemaEditor([before, target, after]);
    const committedBefore = editor.read.children();
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const profiledIds: string[] = [];
    let commits = 0;

    editor.subscribeCommit(() => commits++);

    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind === 'core-time') profiledIds.push(event.id);
        },
      };
      editor.update((tx) => {
        assert.equal(
          tx.slice.replace(slice, {
            at: {
              anchor: { offset: 1, path: [1, 1] },
              focus: { offset: 1, path: [1, 1] },
            },
          }),
          true
        );
      });
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    const children = editor.read.children();

    assert.deepEqual(children, [
      before,
      paragraph('', [
        { bold: true, text: 'aa' },
        { text: 'b' },
        { bold: true, text: 'X' },
      ]),
      paragraph('middle'),
      paragraph('', [{ text: 'Yb' }, { bold: true, text: 'cc' }]),
      after,
    ]);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 1, path: [3, 0] },
      focus: { offset: 1, path: [3, 0] },
      kind: 'text',
    });
    assert.equal(children[0], committedBefore[0]);
    assert.equal(children[2], slice.content[1]);
    assert.equal(children[4], committedBefore[2]);
    assert.equal(commits, 1);
    assert.equal(profiledIds.includes('slice-fit-candidate-scoring'), false);
    assert.equal(
      profiledIds.includes('slice-fit-canonical-preparation'),
      false
    );
    assert.equal(
      profiledIds.includes('slice-fit-structural-candidates'),
      false
    );
    assert.equal(profiledIds.includes('slice-fit-canonicalize'), false);
    assert.equal(profiledIds.includes('slice-fit-direct-proof'), true);
    assert.equal(profiledIds.includes('slice-fit-direct-index-splice'), true);
    assert.equal(profiledIds.includes('slice-fit-direct-adopt-index'), true);
    assert.equal(
      profiledIds.includes('slice-fit-vocabulary-validation'),
      false
    );
  });

  it('falls back when an open block slice is not canonically prepared', () => {
    const value = { children: [paragraph('xy')] };
    const editor = createSchemaEditor(value.children);
    const fitted = editor.read.slice.fit(
      ContentSlice.fromJSON({
        content: [
          paragraph('', [{ text: 'a' }, { text: 'b' }]),
          paragraph('c'),
        ],
        openEnd: 1,
        openStart: 1,
      }),
      {
        at: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
      }
    );

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      paragraph('xab'),
      paragraph('cy'),
    ]);
    assert.deepEqual(fitted.selection?.value, {
      anchor: { offset: 1, path: [1, 0] },
      focus: { offset: 1, path: [1, 0] },
      kind: 'text',
    });
  });

  it('explores deep open spines without a Cartesian variant grid', () => {
    const depth = 64;
    let content: Descendant = paragraph('deep');

    for (let index = 0; index < depth; index++) {
      content = { children: [content], type: 'section' };
    }

    const slice = ContentSlice.fromJSON({
      content: [content],
      openEnd: depth + 1,
      openStart: depth + 1,
    });
    const editor = createSchemaEditor([paragraph('')]);
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    let materialized = 0;
    let fitted: ReturnType<typeof editor.read.slice.fit>;

    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (
            event.kind === 'core-time' &&
            event.id === 'slice-fit-variant-materialize'
          ) {
            materialized++;
          }
        },
      };
      fitted = editor.read.slice.fit(slice, {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
      });
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    assert.ok(fitted);
    assert.ok(materialized < 8, `${materialized} materialized variants`);
  });

  it('canonicalizes closed slice interiors before sparse lowering', () => {
    const value = { children: [paragraph('')] };
    const editor = createSchemaEditor(value.children);
    const fitted = editor.read.slice.fit(
      ContentSlice.closed([
        {
          children: [paragraph('', [{ text: 'a' }, { text: 'b' }])],
          type: 'section',
        },
      ]),
      {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
      }
    );

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      {
        children: [paragraph('ab')],
        type: 'section',
      },
    ]);
  });

  it('keeps open edge spines in canonical boundary construction', () => {
    const value = { children: [paragraph('xy')] };
    const editor = createSchemaEditor(value.children);
    const fitted = editor.read.slice.fit(
      ContentSlice.fromJSON({
        content: [
          {
            children: [paragraph('', [{ text: 'a' }, { text: 'b' }])],
            type: 'section',
          },
        ],
        openEnd: 2,
        openStart: 2,
      }),
      {
        at: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
      }
    );

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [paragraph('xaby')]);
  });

  it('binds canonical fit proof to one insertion and schema revision', () => {
    const editor = createSchemaEditor([paragraph('')]);
    const firstRevision = {};
    const secondRevision = {};
    let currentRevision = firstRevision;
    const prepared = prepareCanonicalFitSlice(
      editor,
      firstRevision,
      ContentSlice.closed([paragraph('prepared')]),
      () => currentRevision
    );
    const insert = encodeContentSlice(prepared.slice);
    const before = { children: [paragraph('')] };
    const document = IndexedDocument.fromValue(before.children);
    const change = new DocumentChange({
      primary: ChangeSet.create(document, {
        from: 0,
        insert,
        to: document.length,
      }),
    });
    const after = change.apply(before);
    const proof = bindCanonicalFitPreparation(prepared.preparation, insert);
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    let proofHits = 0;
    const construct = (candidate: DocumentChange) => {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (
            event.kind === 'core-time' &&
            event.id === 'representation-fit-proof-hit'
          ) {
            proofHits++;
          }
        },
      };

      return constructCanonicalDocumentChange(editor, after, candidate, {
        fitPreparation: proof,
      });
    };

    try {
      construct(change);
      assert.equal(proofHits, 1);

      currentRevision = secondRevision;
      proofHits = 0;
      construct(change);
      assert.equal(proofHits, 0);

      currentRevision = firstRevision;
      proofHits = 0;
      const copiedInsert = DocumentChange.fromJSON(change.toJSON());

      construct(copiedInsert);
      assert.equal(proofHits, 0);
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }
  });

  it('preserves the surviving block type across an expanded deletion', () => {
    const value = {
      children: [
        paragraph('one'),
        { type: 'heading', level: 2, children: [{ text: 'two' }] },
      ],
    };
    const editor = createSchemaEditor(value.children);
    const fitted = editor.read.slice.fit(ContentSlice.closed([]), {
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [1, 0] },
      },
    });

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      { type: 'heading', level: 2, children: [{ text: 'wo' }] },
    ]);
  });

  it('lets covered-node policy dominate an otherwise valid retained wrapper', () => {
    const cases = [
      { replace: true, type: 'defaultReplace' },
      { replace: true, type: 'explicitReplace' },
      { replace: false, type: 'explicitRetain' },
      { replace: false, type: 'preservedRetain' },
    ] as const;

    for (const testCase of cases) {
      const wrapper = {
        children: [paragraph('one'), paragraph('two')],
        type: testCase.type,
      };
      const value = { children: [wrapper] };
      const editor = createCoveredDeletionEditor(value.children);
      const fitted = editor.read.slice.fit(ContentSlice.closed([]), {
        at: {
          anchor: { offset: 0, path: [0, 0, 0] },
          focus: { offset: 3, path: [0, 1, 0] },
        },
      });

      assert.ok(fitted);
      assert.deepEqual(
        fitted.changes.apply(value).children,
        testCase.replace
          ? [paragraph('')]
          : [{ ...wrapper, children: [paragraph('')] }]
      );
    }
  });

  it('expands an asymmetric deletion through a covered wrapper boundary', () => {
    const value = {
      children: [
        {
          children: [paragraph('one'), paragraph('two')],
          type: 'defaultReplace',
        },
        { children: [{ text: 'three' }], type: 'heading' },
      ],
    };
    const editor = createCoveredDeletionEditor(value.children);
    const fitted = editor.read.slice.fit(ContentSlice.closed([]), {
      at: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 2, path: [1, 0] },
      },
    });

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      { children: [{ text: 'ree' }], type: 'heading' },
    ]);
  });

  it('expands the innermost replaceable wrapper without crossing retained context', () => {
    const value = {
      children: [
        {
          children: [
            {
              children: [paragraph('one'), paragraph('two')],
              type: 'defaultReplace',
            },
          ],
          type: 'preservedRetain',
        },
      ],
    };
    const editor = createCoveredDeletionEditor(value.children);
    const fitted = editor.read.slice.fit(ContentSlice.closed([]), {
      at: {
        anchor: { offset: 0, path: [0, 0, 0, 0] },
        focus: { offset: 3, path: [0, 0, 1, 0] },
      },
    });

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      { children: [paragraph('')], type: 'preservedRetain' },
    ]);
  });

  it('keeps a target text block when closed bare text cannot replace it', () => {
    const value = {
      children: [{ children: [{ text: 'old' }], type: 'heading' }],
    };
    const editor = createCoveredReplacementEditor(value.children);
    const fitted = editor.read.slice.fit(
      ContentSlice.closed([{ text: 'new' }]),
      {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        },
      }
    );

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      { children: [{ text: 'new' }], type: 'heading' },
    ]);
  });

  it('replaces only the nearest covered wrapper that accepts source content', () => {
    const value = {
      children: [
        {
          children: [
            {
              children: [paragraph('one'), paragraph('two')],
              type: 'paragraphOnly',
            },
          ],
          type: 'outer',
        },
      ],
    };
    const editor = createCoveredReplacementEditor(value.children);
    const fitted = editor.read.slice.fit(
      ContentSlice.closed([
        { children: [{ text: 'replacement' }], type: 'widget' },
      ]),
      {
        at: {
          anchor: { offset: 0, path: [0, 0, 0, 0] },
          focus: { offset: 3, path: [0, 0, 1, 0] },
        },
      }
    );

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      {
        children: [{ children: [{ text: 'replacement' }], type: 'widget' }],
        type: 'outer',
      },
    ]);
  });

  it('does not cross preserve-context or isolating replacement barriers', () => {
    for (const type of ['isolatedParagraphs', 'preservedParagraphs']) {
      const value = {
        children: [
          {
            children: [
              {
                children: [paragraph('one'), paragraph('two')],
                type,
              },
            ],
            type: 'outer',
          },
        ],
      };
      const editor = createCoveredReplacementEditor(value.children);

      assert.equal(
        editor.read.slice.fit(
          ContentSlice.closed([
            { children: [{ text: 'replacement' }], type: 'widget' },
          ]),
          {
            at: {
              anchor: { offset: 0, path: [0, 0, 0, 0] },
              focus: { offset: 3, path: [0, 0, 1, 0] },
            },
          }
        ),
        false,
        type
      );
    }
  });

  it('returns null for every well-formed schema-incompatible slice', () => {
    const value = { children: [paragraph('target')] };
    const editor = createSchemaEditor(value.children);
    const at = {
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    };

    assert.equal(
      editor.read.slice.fit(
        ContentSlice.closed([
          { type: 'caption', children: [{ text: 'valid vocabulary' }] },
        ]),
        { at }
      ),
      false
    );
    assert.equal(
      editor.read.slice.fit(
        ContentSlice.closed([
          { type: 'unknown', children: [{ text: 'invalid vocabulary' }] },
        ]),
        { at }
      ),
      false
    );
    assert.equal(
      editor.read.slice.fit(
        ContentSlice.closed([{ bold: 'yes', text: 'invalid property' }]),
        { at }
      ),
      false
    );
  });

  it('splits synthesized wrapper groups without replacing the target block', () => {
    const wrappingSchema = defineEditorSchema({
      elements: {
        bucket: element({
          content: schema.content.group('item', {
            default: { type: 'item' },
            max: 1,
            min: 1,
          }),
          groups: ['block'],
        }),
        item: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['item'],
        }),
        paragraph: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['block'],
        }),
      },
      groups: {
        item: schema.group(),
      },
      id: 'slice-wrapper-maximum',
      root: schema.root({
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      }),
      version: 1,
    });
    const value = { children: [paragraph('target')] };
    const editor = createEditor({
      extensions: [wrappingSchema],
      initialValue: value.children,
    });
    const slice = ContentSlice.closed([
      { children: [{ text: 'a' }], type: 'item' },
      { children: [{ text: 'b' }], type: 'item' },
    ]);
    const fitted = editor.read.slice.fit(slice, {
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      paragraph(''),
      {
        children: [{ children: [{ text: 'a' }], type: 'item' }],
        type: 'bucket',
      },
      {
        children: [{ children: [{ text: 'b' }], type: 'item' }],
        type: 'bucket',
      },
      paragraph('target'),
    ]);
    assert.equal(
      editor.read.slice.fit(slice, {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 6, path: [0, 0] },
        },
      }),
      false
    );
  });

  it('fills synthesized wrapper minimum without replacing the target block', () => {
    const wrappingSchema = defineEditorSchema({
      elements: {
        item: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['item'],
        }),
        pair: element({
          content: schema.content.group('item', {
            default: { type: 'item' },
            max: 2,
            min: 2,
          }),
          groups: ['block'],
        }),
        paragraph: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['block'],
        }),
      },
      groups: {
        item: schema.group(),
      },
      id: 'slice-wrapper-minimum',
      root: schema.root({
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      }),
      version: 1,
    });
    const value = { children: [paragraph('target')] };
    const editor = createEditor({
      extensions: [wrappingSchema],
      initialValue: value.children,
    });
    const fitted = editor.read.slice.fit(
      ContentSlice.closed([{ children: [{ text: 'inserted' }], type: 'item' }]),
      {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
      }
    );

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      paragraph(''),
      {
        children: [
          { children: [{ text: 'inserted' }], type: 'item' },
          { children: [{ text: '' }], type: 'item' },
        ],
        type: 'pair',
      },
      paragraph('target'),
    ]);
  });

  it('applies one canonical replacement with mapped selection and stable ids', () => {
    const editor = createSchemaEditor([paragraph('abc'), paragraph('tail')]);
    const firstBlockId = editor.read.runtime.idAt([0]);
    const firstTextId = editor.read.runtime.idAt([0, 0]);
    const tailId = editor.read.runtime.idAt([1]);
    const tail = editor.read.children()[1];

    editor.update((tx) => {
      tx.slice.replace(ContentSlice.closed([{ text: 'X' }]), {
        at: {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
      });
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('aXc'),
      paragraph('tail'),
    ]);
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
    assert.equal(editor.read.runtime.idAt([0]), firstBlockId);
    assert.equal(editor.read.runtime.idAt([0, 0]), firstTextId);
    assert.equal(editor.read.runtime.idAt([1]), tailId);
    assert.equal(editor.read.children()[1], tail);
  });

  it('keeps named-root selection coordinates on fitted insertion', () => {
    const namedSchema = defineEditorSchema({
      elements: {
        heading: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['heading'],
        }),
        paragraph: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['block'],
        }),
      },
      groups: {
        heading: schema.group(),
      },
      id: 'named-root-slice-fit',
      root: schema.root({
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      }),
      roots: {
        header: schema.root({
          content: schema.content.group('heading', {
            default: { type: 'heading' },
            min: 1,
          }),
        }),
      },
      version: 1,
    });
    const editor = createEditor({
      extensions: [namedSchema],
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [{ type: 'heading', children: [{ text: 'title' }] }],
        },
      },
    });

    editor.update((tx) => {
      tx.slice.replace(ContentSlice.closed([{ text: '!' }]), {
        at: {
          anchor: { offset: 5, path: [0, 0], root: 'header' },
          focus: { offset: 5, path: [0, 0], root: 'header' },
        },
      });
    });

    assert.deepEqual(editor.read.root('header'), [
      { type: 'heading', children: [{ text: 'title!' }] },
    ]);
    assert.deepEqual(editor.read.selection(), {
      kind: 'text',
      anchor: { offset: 6, path: [0, 0], root: 'header' },
      focus: { offset: 6, path: [0, 0], root: 'header' },
    });
  });

  it('fits closed slices through the grammar of their target root', () => {
    const rootSchema = defineEditorSchema({
      elements: {
        heading: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['header'],
        }),
        paragraph: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['body'],
        }),
      },
      groups: {
        body: schema.group(),
        header: schema.group(),
      },
      id: 'target-root-slice-fit',
      root: schema.root({
        content: schema.content.group('body', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      }),
      roots: {
        header: schema.root({
          content: schema.content.group('header', {
            default: { type: 'heading' },
            min: 1,
          }),
        }),
      },
      version: 1,
    });
    const editor = createEditor({
      extensions: [rootSchema],
      initialValue: {
        children: [paragraph('body')],
        roots: {
          header: [{ children: [{ text: 'title' }], type: 'heading' }],
        },
      },
    });

    editor.update((tx) => {
      assert.equal(
        tx.slice.replace(ContentSlice.closed([paragraph(' from paragraph')]), {
          at: { offset: 5, path: [0, 0], root: 'header' },
        }),
        true
      );
      assert.equal(
        tx.slice.replace(
          ContentSlice.closed([
            { children: [{ text: ' from heading' }], type: 'heading' },
          ]),
          { at: { offset: 4, path: [0, 0] } }
        ),
        true
      );
    });

    assert.deepEqual(editor.read.children(), [paragraph('body from heading')]);
    assert.deepEqual(editor.read.root('header'), [
      { children: [{ text: 'title from paragraph' }], type: 'heading' },
    ]);
  });

  it('maps external root selections through synthesized wrappers', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            caption: element({
              content: schema.content.text({ default: 'text', min: 1 }),
            }),
            figure: element({
              content: schema.content.type('caption', {
                default: { type: 'caption' },
                min: 1,
              }),
            }),
            section: element({
              content: schema.content.type('figure', {
                default: { type: 'figure' },
                min: 1,
              }),
            }),
          },
          id: 'root-fit-selection-provenance',
          root: schema.root({
            content: schema.content.type('section', {
              default: { type: 'section' },
              min: 1,
            }),
          }),
          version: 1,
        }),
      ],
    });

    editor.update.value.replace({
      children: [{ children: [{ text: 'caption' }], type: 'caption' }] as any,
      selection: {
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
        kind: 'text',
      },
    });

    assert.deepEqual(editor.read.children(), [
      {
        children: [
          {
            children: [{ children: [{ text: 'caption' }], type: 'caption' }],
            type: 'figure',
          },
        ],
        type: 'section',
      },
    ]);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 4, path: [0, 0, 0, 0] },
      focus: { offset: 4, path: [0, 0, 0, 0] },
      kind: 'text',
    });
  });

  it('retains an initial selection in a wide unchanged root fit', () => {
    const target = 500;
    const editor = createEditor({
      extensions: [SliceFitSchema],
      initialSelection: SelectionApi.text({
        anchor: { offset: 3, path: [target, 0] },
        focus: { offset: 3, path: [target, 0] },
      }),
      initialValue: Array.from({ length: 1000 }, (_value, index) =>
        paragraph(`line ${index}`)
      ),
    });

    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 3, path: [target, 0] },
      focus: { offset: 3, path: [target, 0] },
      kind: 'text',
    });
  });

  it('maps a selection from dropped root text to retained fitted content', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            widget: element({ void: 'block' }),
          },
          id: 'root-fit-dropped-selection-provenance',
          root: schema.root({
            content: schema.content.type('widget', {
              default: { type: 'widget' },
              min: 1,
            }),
          }),
          version: 1,
        }),
      ],
    });

    editor.update.value.replace({
      children: [
        { text: 'drop' },
        { children: [{ text: 'keep' }], type: 'widget' },
      ] as any,
      selection: {
        anchor: { offset: 2, path: [0] },
        focus: { offset: 2, path: [0] },
        kind: 'text',
      },
    });

    assert.deepEqual(editor.read.children(), [
      { children: [{ text: 'keep' }], type: 'widget' },
    ]);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      kind: 'text',
    });
  });

  it('preserves an inline spacer selected through its adjacent inline', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            link: element({
              content: schema.content.text({ default: 'text', min: 1 }),
              inline: true,
            }),
            paragraph: element({
              content: schema.content.any(
                [schema.content.text(), schema.content.type('link')],
                { default: 'text', min: 1 }
              ),
            }),
          },
          id: 'root-fit-selected-spacer-provenance',
          root: schema.root({
            content: schema.content.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          }),
          version: 1,
        }),
      ],
      initialValue: [paragraph('old')],
    });
    const children = [
      paragraph('', [
        { text: 'first' },
        { children: [{ text: 'link' }], type: 'link' },
        { text: '' },
        { text: 'last' },
      ]),
    ];

    editor.update.value.replace({
      children,
      selection: {
        anchor: { offset: 1, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 1, 0] },
        kind: 'text',
      },
    });

    assert.deepEqual(editor.read.children(), children);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 1, path: [0, 1, 0] },
      focus: { offset: 1, path: [0, 1, 0] },
      kind: 'text',
    });
  });

  it('rejects malformed direct changes atomically', () => {
    const editor = createSchemaEditor([paragraph('safe')]);
    const before = { children: editor.read.children() };
    const malformed = {
      children: [
        paragraph('', [
          { bold: true, text: 'not ' },
          { bold: true, text: 'canonical' },
        ]),
      ],
    };
    const noncanonical = DocumentChange.between(before, malformed);
    const unknown = DocumentChange.between(before, {
      children: [{ type: 'unknown', children: [{ text: 'invalid' }] }],
    });
    let commits = 0;

    editor.subscribeCommit(() => commits++);
    assert.throws(
      () => editor.update((tx) => tx.changes.apply(noncanonical)),
      /canonical editor representation/i
    );
    assert.throws(
      () => editor.update((tx) => tx.changes.apply(unknown)),
      /unknown editor element type "unknown"/i
    );
    assert.deepEqual(editor.read.children(), before.children);
    assert.equal(commits, 0);
  });

  it('rejects raw top-level inline content without a closed schema', () => {
    const editor = createEditor({ initialValue: [paragraph('safe')] });
    const before = { children: editor.read.children() };
    const malformed = DocumentChange.between(before, {
      children: [...before.children, { text: 'raw top-level text' }],
    });

    assert.throws(
      () => editor.update((tx) => tx.changes.apply(malformed)),
      /canonical editor representation/i
    );
    assert.deepEqual(editor.read.children(), before.children);
  });

  it('does not invent inline spacers outside a bounded construction window', () => {
    const mention = (character: string): Descendant => ({
      character,
      children: [{ text: '' }],
      type: 'mention',
    });
    const editor = createEditor({
      extensions: [defineMentionSchema('bounded-inline-void-construction')],
      initialValue: [
        paragraph('', [
          { text: 'before' },
          mention('Ada'),
          { text: ' or ' },
          mention('Lin'),
          { text: '!' },
        ]),
      ],
    });
    const before = { children: editor.read.children() };
    const after = {
      children: [
        paragraph('before'),
        paragraph('', [
          { text: '' },
          mention('Ada'),
          { text: ' or ' },
          mention('Lin'),
          { text: '!' },
        ]),
      ],
    };
    const change = DocumentChange.between(before, after);

    assert.equal(
      constructCanonicalDocumentChange(editor, after, change).empty,
      true
    );
  });

  it('preserves explicit empty text at an inline boundary', () => {
    const inlineBoundarySchema = defineEditorSchema({
      elements: {
        link: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        }),
        paragraph: element({
          content: schema.content.any(
            [schema.content.text(), schema.content.type('link')],
            { default: 'text', min: 1 }
          ),
          groups: ['block'],
        }),
      },
      id: 'selected-inline-boundary-schema',
      root: schema.root({
        content: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      }),
      version: 1,
    });
    const editor = createEditor({
      extensions: [inlineBoundarySchema],
      initialSelection: {
        anchor: { offset: 1, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 1, 0] },
        kind: 'text',
      },
      initialValue: [
        paragraph('', [
          { text: 'first' },
          { children: [{ text: 'link' }], type: 'link' },
          { text: '' },
          { text: 'last' },
        ]),
      ],
    });

    assert.deepEqual(editor.read.children(), [
      paragraph('', [
        { text: 'first' },
        { children: [{ text: 'link' }], type: 'link' },
        { text: '' },
        { text: 'last' },
      ]),
    ]);
  });

  it('closes bounded inline construction across marked empty spacers', () => {
    const mention = (character: string): Descendant => ({
      character,
      children: [{ text: '' }],
      type: 'mention',
    });
    const inlineChildren: Descendant[] = [
      { text: '' },
      mention('A'),
      { text: '' },
      mention('B'),
      { bold: true, text: '' },
      { text: '' },
      mention('C'),
      { text: '' },
      mention('D'),
      { text: '' },
    ];
    const editor = createEditor({
      extensions: [defineMentionSchema('bounded-marked-spacer-construction')],
      initialValue: [paragraph('', inlineChildren)],
    });
    const before = { children: editor.read.children() };

    for (const removedIndex of [1, 8]) {
      const after = {
        children: [
          paragraph(
            '',
            inlineChildren.filter((_child, index) => index !== removedIndex)
          ),
        ],
      };
      const change = DocumentChange.between(before, after);
      const construction = constructCanonicalDocumentChange(
        editor,
        after,
        change
      );
      const candidate = construction.apply(after);
      const accumulated = change.compose(construction, before);

      assert.deepEqual(
        candidate.children,
        canonicalizeRootChildren(editor, after.children, null)
      );
      assert.equal(
        constructCanonicalDocumentChange(editor, candidate, accumulated).empty,
        true
      );
    }
  });

  it('constructs inline representation from a bounded child window', () => {
    const leafCount = 20_000;
    const target = Math.floor(leafCount / 2);
    const measuredSchema = defineEditorSchema({
      elements: {
        paragraph: element({
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['block'],
        }),
      },
      id: 'bounded-representation-construction',
      properties: [schema.textProperty('mark', property.number())],
      root: schema.root({
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      }),
      version: 1,
    });
    const editor = createEditor({
      extensions: [measuredSchema],
      initialValue: [
        paragraph(
          '',
          Array.from({ length: leafCount }, (_value, index) => ({
            mark: index % 2,
            text: 'x',
          }))
        ),
      ],
    });
    const before = editor.read.children()[0];

    assert.ok(ElementApi.isElement(before));
    const first = before.children[0];
    const last = before.children.at(-1);

    editor.update.nodes.set({ mark: 1 }, { at: [0, target] });

    const after = editor.read.children()[0];
    const commit = editor.read.lastCommit();
    let maximumChangedSpan = 0;

    assert.ok(ElementApi.isElement(after));
    commit?.changes.iterChangedRanges(
      (_root, _fromBefore, _toBefore, fromAfter, toAfter) => {
        maximumChangedSpan = Math.max(maximumChangedSpan, toAfter - fromAfter);
      }
    );
    assert.equal(after.children[0], first);
    assert.equal(after.children.at(-1), last);
    assert.equal(after.children.length, leafCount - 2);
    assert.ok(maximumChangedSpan < 32, `${maximumChangedSpan} changed tokens`);
  });

  it('keeps canonical construction local inside a wide top-level node', {
    timeout: 20_000,
  }, () => {
    const blockCount = 20_000;
    const target = Math.floor(blockCount / 2);
    const editor = createSchemaEditor([
      {
        type: 'section',
        children: Array.from({ length: blockCount }, (_value, index) =>
          index === target
            ? paragraph('', [
                { bold: true, text: 'left' },
                { bold: false, text: 'right' },
              ])
            : paragraph(`line ${index}`)
        ),
      },
    ]);
    const beforeSection = editor.read.children()[0];

    assert.ok(ElementApi.isElement(beforeSection));
    const first = beforeSection.children[0];
    const last = beforeSection.children.at(-1);

    editor.update.nodes.set({ bold: true }, { at: [0, target, 1] });

    const afterSection = editor.read.children()[0];
    const commit = editor.read.lastCommit();
    let maximumChangedSpan = 0;

    assert.ok(ElementApi.isElement(afterSection));
    commit?.changes.iterChangedRanges(
      (_root, _fromBefore, _toBefore, fromAfter, toAfter) => {
        maximumChangedSpan = Math.max(maximumChangedSpan, toAfter - fromAfter);
      }
    );
    assert.equal(afterSection.children[0], first);
    assert.equal(afterSection.children.at(-1), last);
    assert.deepEqual(afterSection.children[target], {
      type: 'paragraph',
      children: [{ bold: true, text: 'leftright' }],
    });
    assert.ok(maximumChangedSpan < 64, `${maximumChangedSpan} changed tokens`);
    assert.equal(
      constructCanonicalDocumentChange(
        editor,
        { children: editor.read.children() },
        commit!.changes
      ).empty,
      true
    );
  });

  it('keeps split selection mapping local in a wide root', {
    timeout: 20_000,
  }, () => {
    const blockCount = 20_000;
    const target = Math.floor(blockCount / 2);
    const initialValue = Array.from({ length: blockCount }, (_value, index) =>
      paragraph(`line ${index}`)
    );
    const editor = createEditor({
      extensions: [SliceFitSchema],
      initialSelection: SelectionApi.text({
        anchor: { offset: 2, path: [target, 0] },
        focus: { offset: 2, path: [target, 0] },
      }),
      initialValue,
    });
    const before = editor.read.children();
    const first = before[0];
    const last = before.at(-1);

    editor.update((tx) => tx.nodes.split());

    const after = editor.read.children();
    const commit = editor.read.lastCommit();
    let maximumChangedSpan = 0;

    commit?.changes.iterChangedRanges(
      (_root, _fromBefore, _toBefore, fromAfter, toAfter) => {
        maximumChangedSpan = Math.max(maximumChangedSpan, toAfter - fromAfter);
      }
    );
    assert.equal(after.length, blockCount + 1);
    assert.equal(after[0], first);
    assert.equal(after.at(-1), last);
    assert.deepEqual(
      editor.read.selection(),
      SelectionApi.text({
        anchor: { offset: 0, path: [target + 1, 0] },
        focus: { offset: 0, path: [target + 1, 0] },
      })
    );
    assert.ok(maximumChangedSpan < 32, `${maximumChangedSpan} changed tokens`);
  });
});
