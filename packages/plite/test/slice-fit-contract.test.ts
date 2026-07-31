import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  type Descendant,
  DocumentChange,
  type Element,
  ElementApi,
  property,
  schema,
  SelectionApi,
  type Value,
} from '@platejs/plite';

import {
  bindCanonicalFitPreparation,
  canonicalizeRootChildren,
  constructCanonicalDocumentChange,
  prepareCanonicalFitSlice,
} from '../src/core/representation';
import {
  createDetachedContentSlice,
  encodeContentSlice,
  encodeContentSliceContent,
  isDetachedContentSlice,
} from '../src/core/content-slice';
import { getInternalDocumentChangeEntries } from '../src/core/change/document-change';
import { DocumentIndex } from '../src/core/change/document-index';
import { RootChange } from '../src/core/change/root-change';
import {
  PreparedTokenSlice,
  hasMaterializedDocumentSliceTokens,
} from '../src/core/change/tokens';
import { createTestDocumentChange } from './support/document-change';

const paragraph = (text: string, children?: Descendant[]) => ({
  type: 'paragraph',
  children: children ?? [{ text }],
});

const SliceFitSchema = defineEditorSchema({
  elements: {
    caption: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    divider: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    heading: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { level: property.number() },
    } as const,
    link: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    } as const,
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    section: {
      content: schema.content.types(
        ['divider', 'heading', 'paragraph', 'section'],
        {
          default: { type: 'paragraph' },
          min: 1,
        }
      ),
    } as const,
  },
  id: 'slice-fit-contract',
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.content.types(['divider', 'heading', 'paragraph', 'section'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const createSchemaEditor = (initialValue: Element[]) =>
  createEditor({ extensions: [SliceFitSchema], initialValue });

const CoveredDeletionSchema = defineEditorSchema({
  elements: {
    defaultReplace: {
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    } as const,
    explicitReplace: {
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      slice: { preserveContext: true, replaceWhenCovered: true },
    } as const,
    explicitRetain: {
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      slice: { replaceWhenCovered: false },
    } as const,
    heading: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    preservedRetain: {
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      slice: { preserveContext: true },
    } as const,
  },
  id: 'covered-deletion-contract',
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const createCoveredDeletionEditor = (initialValue: Element[]) =>
  createEditor({ extensions: [CoveredDeletionSchema], initialValue });

const CoveredReplacementSchema = defineEditorSchema({
  elements: {
    heading: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    isolatedParagraphs: {
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      isolating: true,
    } as const,
    outer: {
      content: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    } as const,
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    } as const,
    paragraphOnly: {
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    } as const,
    preservedParagraphs: {
      content: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      slice: { preserveContext: true },
    } as const,
    widget: {
      void: 'block',
    } as const,
  },
  id: 'covered-replacement-contract',
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const createCoveredReplacementEditor = (initialValue: Element[]) =>
  createEditor({ extensions: [CoveredReplacementSchema], initialValue });

const defineMentionSchema = (id: string) =>
  defineEditorSchema({
    elements: {
      mention: {
        properties: { character: property.string() },
        void: 'markable-inline',
      } as const,
      paragraph: {
        content: schema.content.any(
          [schema.content.text(), schema.content.type('mention')],
          { default: 'text', min: 1 }
        ),
      } as const,
    },
    id,
    properties: [schema.textProperty('bold', property.boolean())],
    root: schema.content.type('paragraph', {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
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

  it('claims internal detached slice identities at most once', () => {
    const text = Object.freeze({ text: 'owned' });
    const children: Descendant[] = [text];
    const block: Element = { children, type: 'paragraph' };
    const content: Descendant[] = [block];

    Object.freeze(children);
    Object.freeze(block);
    Object.freeze(content);
    const slice = createDetachedContentSlice(content, 1, 1);
    const editor = createSchemaEditor([paragraph(''), paragraph('')]);

    assert.throws(
      () =>
        createDetachedContentSlice(
          Object.freeze([
            Object.freeze({
              children: [{ text: 'mutable' }],
              type: 'paragraph',
            }),
          ]),
          1,
          1
        ),
      /deeply frozen/i
    );
    assert.equal(slice.content, content);
    assert.equal(isDetachedContentSlice(slice), true);

    editor.update((tx) => {
      assert.equal(
        tx.slice.replace(slice, { at: { offset: 0, path: [0, 0] } }),
        true
      );
    });
    editor.update((tx) => {
      assert.equal(
        tx.slice.replace(slice, { at: { offset: 0, path: [1, 0] } }),
        true
      );
    });

    const after = editor.read.children();

    assert.equal(after[0], block);
    assert.equal(after[0]!.children[0], text);
    assert.notEqual(after[1], block);
    assert.notEqual(after[1]!.children[0], text);
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
        container: {
          content: schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        } as const,
        isolated: {
          content: schema.content.text({ default: 'text', min: 1 }),
          isolating: true,
        } as const,
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
        preserved: {
          content: schema.content.text({ default: 'text', min: 1 }),
          slice: { preserveContext: true },
        } as const,
      },
      id: 'slice-context-barrier',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
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
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
        section: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        } as const,
      },
      id: 'bounded-slice-fit-candidate',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        max: 1,
        min: 1,
      }),
      unknown: 'reject',
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

  it('lowers a prepared open block slice through the shared fitter', () => {
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
    let commits = 0;

    editor.subscribeCommit(() => commits++);
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
    assert.equal(children[4], committedBefore[2]);
    assert.equal(commits, 1);
  });

  it('keeps detached fit specs equivalent to transactional replacement', () => {
    const slice = ContentSlice.fromJSON({
      content: [paragraph('one'), paragraph('two')],
      openEnd: 1,
      openStart: 1,
    });
    const at = {
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    };
    const detached = createSchemaEditor([paragraph('leftright')]);
    const transactional = createSchemaEditor([paragraph('leftright')]);
    const fitted = detached.read.slice.fit(slice, { at });

    assert.ok(fitted);
    const expected = fitted.changes.apply(detached.read.value());

    transactional.update((tx) => {
      assert.equal(tx.slice.replace(slice, { at }), true);
    });

    assert.deepEqual(transactional.read.value(), expected);
    assert.deepEqual(
      transactional.read.selection(),
      fitted.selection?.value ?? null
    );
  });

  it('publishes nothing when transactional slice fitting declines', () => {
    const editor = createSchemaEditor([paragraph('target')]);
    const before = editor.read.runtime.snapshot();
    let commits = 0;
    let replaced = true;

    editor.subscribeCommit(() => commits++);
    editor.update((tx) => {
      replaced = tx.slice.replace(
        ContentSlice.closed([
          { type: 'unknown', children: [{ text: 'invalid vocabulary' }] },
        ]),
        {
          at: {
            anchor: { offset: 3, path: [0, 0] },
            focus: { offset: 3, path: [0, 0] },
          },
        }
      );
    });

    assert.equal(replaced, false);
    const after = editor.read.runtime.snapshot();

    assert.equal(after.version, before.version);
    assert.equal(after.children, before.children);
    assert.equal(editor.read.lastCommit(), null);
    assert.equal(commits, 0);
  });

  it('splits an active inline around a closed inline slice', () => {
    const extension = defineEditorSchema({
      elements: {
        link: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        } as const,
        paragraph: {
          content: schema.content.any(
            [schema.content.text(), schema.content.type('link')],
            { default: 'text', min: 1 }
          ),
        } as const,
      },
      id: 'closed-inline-split',
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const value = {
      children: [
        paragraph('', [
          { text: '' },
          { children: [{ text: 'word' }], type: 'link' },
          { text: '' },
        ]),
      ],
    };
    const editor = createEditor({
      extensions: [extension],
      initialValue: value.children,
    });
    const fitted = editor.read.slice.fit(
      ContentSlice.closed([{ children: [{ text: 'fragment' }], type: 'link' }]),
      {
        at: {
          anchor: { offset: 2, path: [0, 1, 0] },
          focus: { offset: 2, path: [0, 1, 0] },
        },
      }
    );

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      paragraph('', [
        { text: '' },
        { children: [{ text: 'wo' }], type: 'link' },
        { text: '' },
        { children: [{ text: 'fragment' }], type: 'link' },
        { text: '' },
        { children: [{ text: 'rd' }], type: 'link' },
        { text: '' },
      ]),
    ]);
    assert.deepEqual(fitted.selection?.value, {
      anchor: { offset: 8, path: [0, 3, 0] },
      focus: { offset: 8, path: [0, 3, 0] },
      kind: 'text',
    });
  });

  it('fits a nested leading spine without consuming its target suffix', () => {
    const extension = defineEditorSchema({
      elements: {
        container: {
          content: schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        } as const,
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
      },
      id: 'nested-leading-spine',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const container = (children: Descendant[]) => ({
      children,
      type: 'container',
    });
    const active = container([paragraph('')]);
    const suffix = container([paragraph('tail')]);
    const value = {
      children: [container([container([container([active, suffix])])])],
    };
    const slice = ContentSlice.closed([
      container([
        container([
          container([container([paragraph('1')]), container([paragraph('2')])]),
        ]),
      ]),
    ]);
    const editor = createEditor({
      extensions: [extension],
      initialValue: value.children,
    });
    const fitted = editor.read.slice.fit(slice, {
      at: {
        anchor: { offset: 0, path: [0, 0, 0, 0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0, 0, 0, 0] },
      },
    });

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      container([
        container([
          container([
            container([paragraph('1'), container([paragraph('2')])]),
            suffix,
          ]),
        ]),
      ]),
    ]);
    assert.deepEqual(fitted.selection?.value, {
      anchor: { offset: 1, path: [0, 0, 0, 0, 1, 0, 0] },
      focus: { offset: 1, path: [0, 0, 0, 0, 1, 0, 0] },
      kind: 'text',
    });
  });

  it('keeps detached open block fitting on one prepared materialization', () => {
    const slice = ContentSlice.fromJSON({
      content: [paragraph('one'), paragraph('two')],
      openEnd: 1,
      openStart: 1,
    });
    const fullInsert = encodeContentSliceContent(slice);
    const editor = createSchemaEditor([paragraph('leftright')]);
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const events: string[] = [];
    let fitted: ReturnType<typeof editor.read.slice.fit>;

    assert.equal(isDetachedContentSlice(slice), true);
    assert.equal(hasMaterializedDocumentSliceTokens(fullInsert), false);

    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind === 'core-time') events.push(event.id);
        },
      };
      fitted = editor.read.slice.fit(slice, {
        at: {
          anchor: { offset: 4, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        },
      });
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    assert.ok(fitted);
    const semanticInsert = [...getInternalDocumentChangeEntries(fitted.changes)]
      .flatMap(([, change]) => change.data)
      .find(
        (data): data is PreparedTokenSlice => data instanceof PreparedTokenSlice
      );

    assert.ok(semanticInsert);
    assert.equal(hasMaterializedDocumentSliceTokens(fullInsert), false);
    assert.equal(hasMaterializedDocumentSliceTokens(semanticInsert), false);
    assert.deepEqual(fitted.changes.apply(editor.read.value()).children, [
      paragraph('leftone'),
      paragraph('tworight'),
    ]);
    assert.deepEqual(fitted.selection?.value, {
      anchor: { offset: 3, path: [1, 0] },
      focus: { offset: 3, path: [1, 0] },
      kind: 'text',
    });
    assert.equal(
      events.filter((id) => id === 'slice-fit-canonicalize').length,
      1
    );
    assert.equal(events.filter((id) => id === 'slice-fit-variants').length, 0);
    assert.equal(
      events.filter((id) => id === 'change-set-local-splice').length,
      1
    );
    assert.equal(
      events.filter((id) => id === 'slice-fit-canonical-change-finalize')
        .length,
      0
    );
    assert.equal(
      events.filter((id) => id === 'slice-fit-canonical-change-map').length,
      0
    );
    assert.equal(
      events.filter((id) => id === 'schema-root-ownership-index-rebase').length,
      0
    );
  });

  it('preserves both split sides and runtime identity without decoding the slice', () => {
    const slice = ContentSlice.fromJSON({
      content: [paragraph('one'), paragraph('two')],
      openEnd: 1,
      openStart: 1,
    });
    const fullInsert = encodeContentSliceContent(slice);
    const editor = createSchemaEditor([paragraph('leftright')]);
    const blockId = editor.read.runtime.idAt([0]);
    const textId = editor.read.runtime.idAt([0, 0]);
    const prefix = editor.anchor(
      {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      { association: 'inward', deletion: 'drop' }
    );
    const suffix = editor.anchor(
      {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 8, path: [0, 0] },
      },
      { association: 'inward', deletion: 'drop' }
    );

    editor.update((tx) => {
      assert.equal(
        tx.slice.replace(slice, { at: { offset: 4, path: [0, 0] } }),
        true
      );
    });

    const commit = editor.read.lastCommit();

    assert.ok(commit);
    const semanticInsert = [...getInternalDocumentChangeEntries(commit.changes)]
      .flatMap(([, change]) => change.data)
      .find(
        (data): data is PreparedTokenSlice => data instanceof PreparedTokenSlice
      );

    assert.ok(semanticInsert);
    assert.equal(hasMaterializedDocumentSliceTokens(fullInsert), false);
    assert.equal(hasMaterializedDocumentSliceTokens(semanticInsert), false);
    assert.deepEqual(prefix.release(), {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
    assert.deepEqual(suffix.release(), {
      anchor: { offset: 4, path: [1, 0] },
      focus: { offset: 7, path: [1, 0] },
    });
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 3, path: [1, 0] },
      focus: { offset: 3, path: [1, 0] },
      kind: 'text',
    });
    assert.equal(editor.read.runtime.idAt([0]), blockId);
    assert.equal(editor.read.runtime.idAt([0, 0]), textId);
    assert.notEqual(editor.read.runtime.idAt([1]), blockId);
    assert.notEqual(editor.read.runtime.idAt([1, 0]), textId);
  });

  it('classifies a prepared open block fit only when commit queries need it', () => {
    const slice = ContentSlice.fromJSON({
      content: [paragraph('one'), paragraph('two')],
      openEnd: 1,
      openStart: 1,
    });
    const editor = createSchemaEditor([paragraph('leftright')]);

    editor.update((tx) => {
      assert.equal(
        tx.slice.replace(slice, {
          at: {
            anchor: { offset: 4, path: [0, 0] },
            focus: { offset: 4, path: [0, 0] },
          },
        }),
        true
      );
    });

    const commit = editor.read.lastCommit();

    assert.ok(commit);
    assert.equal(commit.changes.primaryClassification, null);
    assert.equal(commit.changed.has('structure'), true);
    assert.equal(commit.changes.primaryClassification, null);
  });

  it('classifies a prepared open block fit before registered corrections run', () => {
    const slice = ContentSlice.fromJSON({
      content: [paragraph('one'), paragraph('two')],
      openEnd: 1,
      openStart: 1,
    });
    const editor = createSchemaEditor([paragraph('leftright')]);
    const events: string[] = [];
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        record?: (event: { id: string; kind: string }) => void;
      };
    };
    const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    let correctionVisits = 0;

    editor.extend({
      corrections: [
        {
          event: 'content',
          correct() {
            correctionVisits++;
          },
        },
      ],
      name: 'prepared-open-block-correction',
    });

    try {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        record(event) {
          if (event.kind === 'core-time') events.push(event.id);
        },
      };
      editor.update((tx) => {
        assert.equal(
          tx.slice.replace(slice, {
            at: {
              anchor: { offset: 4, path: [0, 0] },
              focus: { offset: 4, path: [0, 0] },
            },
          }),
          true
        );
      });
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
    }

    assert.equal(events.includes('transaction-active-change'), true);
    assert.equal(correctionVisits > 0, true);
  });

  it('never adopts live nodes from an extracted open block slice', () => {
    const editor = createEditor({
      initialValue: [paragraph('one'), paragraph('two'), paragraph('')],
    });
    const before = editor.read.children();
    const firstRuntimeId = editor.read.runtime.idAt([0]);
    const secondRuntimeId = editor.read.runtime.idAt([1]);
    const slice = editor.read.slice.get({
      at: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [1, 0] },
      },
    });

    assert.equal(isDetachedContentSlice(slice), false);
    editor.update((tx) => {
      assert.equal(
        tx.slice.replace(slice, { at: { offset: 0, path: [2, 0] } }),
        true
      );
    });

    const after = editor.read.children();

    assert.deepEqual(after, [
      paragraph('one'),
      paragraph('two'),
      paragraph('one'),
      paragraph('two'),
    ]);
    assert.equal(after[0], before[0]);
    assert.equal(after[1], before[1]);
    assert.notEqual(after[0], after[2]);
    assert.notEqual(after[1], after[3]);
    assert.notEqual(after[2]!.children[0], after[0]!.children[0]);
    assert.notEqual(after[3]!.children[0], after[1]!.children[0]);
    assert.equal(editor.read.runtime.idAt([0]), firstRuntimeId);
    assert.equal(editor.read.runtime.idAt([1]), secondRuntimeId);
    assert.notEqual(
      editor.read.runtime.idAt([0]),
      editor.read.runtime.idAt([2])
    );
    assert.notEqual(
      editor.read.runtime.idAt([1]),
      editor.read.runtime.idAt([3])
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

  it('opens a closed nested slice against matching target ancestors', () => {
    const value: { children: Value } = {
      children: [
        {
          children: [
            {
              children: [
                { children: [{ text: '' }], type: 'table-cell' },
                {
                  children: [{ bold: true, text: 'Human' }],
                  type: 'table-cell',
                },
                { children: [{ bold: true, text: 'Dog' }], type: 'table-cell' },
              ],
              type: 'table-row',
            },
          ],
          type: 'table',
        },
      ],
    };
    const editor = createEditor({ initialValue: value.children });
    const fitted = editor.read.slice.fit(
      ContentSlice.closed([
        {
          children: [
            {
              children: [
                { children: [{ text: 'New 1' }], type: 'table-cell' },
                { children: [{ text: 'New 2' }], type: 'table-cell' },
              ],
              type: 'table-row',
            },
          ],
          type: 'table',
        },
      ]),
      {
        at: {
          anchor: { offset: 5, path: [0, 0, 1, 0] },
          focus: { offset: 5, path: [0, 0, 1, 0] },
        },
      }
    );

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value).children, [
      {
        children: [
          {
            children: [
              { children: [{ text: '' }], type: 'table-cell' },
              {
                children: [{ bold: true, text: 'Human' }, { text: 'New 1' }],
                type: 'table-cell',
              },
              { children: [{ text: 'New 2' }], type: 'table-cell' },
              { children: [{ bold: true, text: 'Dog' }], type: 'table-cell' },
            ],
            type: 'table-row',
          },
        ],
        type: 'table',
      },
    ]);
    assert.deepEqual(fitted.selection?.value, {
      anchor: { offset: 5, path: [0, 0, 2, 0] },
      focus: { offset: 5, path: [0, 0, 2, 0] },
      kind: 'text',
    });
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
    const document = DocumentIndex.fromValue(before.children);
    const change = createTestDocumentChange({
      primary: RootChange.create(document, {
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
        bucket: {
          content: schema.content.group('item', {
            default: { type: 'item' },
            max: 1,
            min: 1,
          }),
        } as const,
        item: {
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['item'],
        } as const,
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
      },
      groups: {
        item: {} as const,
      },
      id: 'slice-wrapper-maximum',
      root: schema.content.types(['bucket', 'paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
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
        item: {
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['item'],
        } as const,
        pair: {
          content: schema.content.group('item', {
            default: { type: 'item' },
            max: 2,
            min: 2,
          }),
        } as const,
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
      },
      groups: {
        item: {} as const,
      },
      id: 'slice-wrapper-minimum',
      root: schema.content.types(['pair', 'paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
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
        heading: {
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['heading'],
        } as const,
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
      },
      groups: {
        heading: {} as const,
      },
      id: 'named-root-slice-fit',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      roots: {
        header: schema.content.group('heading', {
          default: { type: 'heading' },
          min: 1,
        }),
      },
      unknown: 'reject',
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
        heading: {
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['header'],
        } as const,
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
          groups: ['body'],
        } as const,
      },
      groups: {
        body: {} as const,
        header: {} as const,
      },
      id: 'target-root-slice-fit',
      root: schema.content.group('body', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      roots: {
        header: schema.content.group('header', {
          default: { type: 'heading' },
          min: 1,
        }),
      },
      unknown: 'reject',
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
            caption: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
            figure: {
              content: schema.content.type('caption', {
                default: { type: 'caption' },
                min: 1,
              }),
            } as const,
            section: {
              content: schema.content.type('figure', {
                default: { type: 'figure' },
                min: 1,
              }),
            } as const,
          },
          id: 'root-fit-selection-provenance',
          root: schema.content.type('section', {
            default: { type: 'section' },
            min: 1,
          }),
          unknown: 'reject',
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

  it('maps a selection from a merged text leaf to retained fitted content', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
          },
          id: 'root-fit-merged-selection-provenance',
          root: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          unknown: 'reject',
          version: 1,
        }),
      ],
    });

    editor.update.value.replace({
      children: [
        {
          children: [{ text: 'keep' }, { text: 'drop' }],
          type: 'paragraph',
        },
      ],
      selection: {
        anchor: { offset: 2, path: [0, 1] },
        focus: { offset: 2, path: [0, 1] },
        kind: 'text',
      },
    });

    assert.deepEqual(editor.read.children(), [
      { children: [{ text: 'keepdrop' }], type: 'paragraph' },
    ]);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 6, path: [0, 0] },
      focus: { offset: 6, path: [0, 0] },
      kind: 'text',
    });
  });

  it('preserves an inline spacer selected through its adjacent inline', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema({
          elements: {
            link: {
              content: schema.content.text({ default: 'text', min: 1 }),
              inline: true,
            } as const,
            paragraph: {
              content: schema.content.any(
                [schema.content.text(), schema.content.type('link')],
                { default: 'text', min: 1 }
              ),
            } as const,
          },
          id: 'root-fit-selected-spacer-provenance',
          root: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          unknown: 'reject',
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

  it('rejects raw top-level inline content through the derived schema', () => {
    const editor = createEditor({ initialValue: [paragraph('safe')] });
    const before = { children: editor.read.children() };
    const malformed = DocumentChange.between(before, {
      children: [...before.children, { text: 'raw top-level text' }],
    });

    assert.throws(
      () => editor.update((tx) => tx.changes.apply(malformed)),
      /primary root cannot contain "text"/i
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
        link: {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        } as const,
        paragraph: {
          content: schema.content.any(
            [schema.content.text(), schema.content.type('link')],
            { default: 'text', min: 1 }
          ),
        } as const,
      },
      id: 'selected-inline-boundary-schema',
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
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
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
      },
      id: 'bounded-representation-construction',
      properties: [schema.textProperty('mark', property.number())],
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
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
