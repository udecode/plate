import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';
import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  ElementApi,
  property,
  schema,
  target,
  type Descendant,
  type Element,
} from 'plitejs';

const paragraph = (
  text = '',
  children: Descendant[] = [{ text }]
): Element => ({
  children,
  type: 'paragraph',
});

const caption = (text = ''): Element => ({
  children: [{ text }],
  type: 'caption',
});

const cell = (children: Descendant[] = [paragraph()]): Element => ({
  children,
  type: 'cell',
});

const matrixBounded = (children: Descendant[] = [paragraph()]): Element => ({
  children,
  type: 'matrixBounded',
});

const matrixCell = (children: Descendant[] = [paragraph()]): Element => ({
  children,
  type: 'matrixCell',
});

const detachedContentSchema = defineEditorSchema(
  'schema:detached-content-fit',
  {
    elements: {
      bounded: {
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          max: 1,
          min: 1,
        }),
      } as const,
      caption: {
        content: schema.content.text({ default: 'text', min: 1 }),
      } as const,
      cell: {
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      } as const,
      matrixBounded: {
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          max: 1,
          min: 1,
        }),
        slice: { preserveContext: true },
      } as const,
      matrixCell: {
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        slice: { preserveContext: true },
      } as const,
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      } as const,
      preserved: {
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        slice: { preserveContext: true },
      } as const,
      isolated: {
        content: schema.content.group('block', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        isolating: true,
      } as const,
      row: {
        content: schema.content.type('strictCell', {
          default: { type: 'strictCell' },
          min: 1,
        }),
      } as const,
      strictCell: {
        content: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      } as const,
    },
    id: 'detached-content-fit',
    properties: [
      schema.elementProperty('rowOnly', property.boolean(), {
        target: target.and(
          target.type('cell'),
          target.parent(target.type('row'))
        ),
      }),
      schema.textProperty('commentOnly', property.boolean(), {
        target: target.root('comments'),
      }),
    ],
    root: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
    roots: {
      comments: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
    unknown: 'reject',
    version: 1,
  }
);

const createSchemaEditor = () =>
  createEditor({
    extensions: [detachedContentSchema],
    initialValue: {
      children: [{ children: [{ text: 'document' }], type: 'paragraph' }],
      roots: {
        comments: [{ children: [{ text: 'comment' }], type: 'paragraph' }],
      },
    },
  });

describe('detached slice content fitting', () => {
  it('fits content under a detached parent without publishing editor state', () => {
    const editor = createSchemaEditor();
    const parent = { ...cell([paragraph('old')]), rowOnly: true };
    const childrenBefore = editor.read.children();
    const commitBefore = editor.read.lastCommit();
    let commits = 0;

    editor.subscribeCommit(() => (commits += 1) - 1);

    const fitted = editor.read.slice.fitContent(
      ContentSlice.closed([{ text: 'hello' }]),
      { parent }
    );

    assert.deepEqual(fitted, [paragraph('hello')]);
    assert.deepEqual(parent, { ...cell([paragraph('old')]), rowOnly: true });
    assert.equal(editor.read.children(), childrenBefore);
    assert.equal(editor.read.lastCommit(), commitBefore);
    assert.equal(commits, 0);
    assert.equal(Object.isFrozen(fitted), true);
    assert.equal(Object.isFrozen(fitted?.[0]), true);
    assert.doesNotThrow(() =>
      editor.read.schema.assertFragment([
        { children: [...fitted], type: 'cell' },
      ])
    );
  });

  it('fits open cell content and supplies required defaults', () => {
    const editor = createSchemaEditor();
    const parent = cell([paragraph('old')]);
    const open = ContentSlice.fromJSON({
      content: [cell([paragraph('open')])],
      openEnd: 1,
      openStart: 1,
    });

    assert.deepEqual(editor.read.slice.fitContent(open, { parent }), [
      paragraph('open'),
    ]);
    assert.deepEqual(
      editor.read.slice.fitContent(
        ContentSlice.fromJSON({
          content: [caption('open caption')],
          openEnd: 1,
          openStart: 1,
        }),
        { parent }
      ),
      [paragraph('open caption')]
    );
    assert.deepEqual(
      editor.read.slice.fitContent(ContentSlice.closed([caption('closed')]), {
        parent,
      }),
      [caption('closed')]
    );
    assert.deepEqual(
      editor.read.slice.fitContent(ContentSlice.empty, { parent }),
      [paragraph()]
    );
  });

  it('shares compiled openness barriers with document fitting', () => {
    const editor = createSchemaEditor();
    const parent = cell([paragraph('old')]);
    const openPreserved = ContentSlice.fromJSON({
      content: [
        {
          children: [paragraph('preserved')],
          type: 'preserved',
        },
      ],
      openEnd: 1,
      openStart: 1,
    });

    assert.equal(editor.read.slice.fitContent(openPreserved, { parent }), null);
  });

  it('returns null when no grammar-preserving detached fit exists', () => {
    const editor = createSchemaEditor();
    const parent: Element = {
      children: [{ children: [paragraph()], type: 'strictCell' }],
      type: 'row',
    };

    assert.equal(
      editor.read.slice.fitContent(
        ContentSlice.closed([
          {
            children: [paragraph('no fit')],
            type: 'preserved',
          },
        ]),
        { parent }
      ),
      null
    );
  });

  it('uses named-root context for compiled property placement', () => {
    const editor = createSchemaEditor();
    const parent = cell();
    const slice = ContentSlice.closed([{ commentOnly: true, text: 'valid' }]);
    const primaryRoot: string = 'main';

    assert.equal(editor.read.slice.fitContent(slice, { parent }), null);
    assert.deepEqual(
      editor.read.slice.fitContent(slice, { parent, root: 'comments' }),
      [paragraph('', [{ commentOnly: true, text: 'valid' }])]
    );
    assert.throws(
      () =>
        editor.read.slice.fitContent(slice, {
          parent,
          root: primaryRoot,
        }),
      /omit root|primary/i
    );
  });

  it('inherits named-root context from a root-scoped view', () => {
    const runtime = createEditor({
      extensions: [detachedContentSchema],
      initialValue: {
        children: [paragraph('document')],
        roots: { comments: [paragraph('comment')] },
      },
    });
    const comments = createEditorView(runtime, { root: 'comments' });

    assert.deepEqual(
      comments.read.slice.fitContent(
        ContentSlice.closed([{ commentOnly: true, text: 'valid' }]),
        { parent: cell() }
      ),
      [paragraph('', [{ commentOnly: true, text: 'valid' }])]
    );
  });

  it('is deterministic and idempotent for detached content', () => {
    const editor = createSchemaEditor();
    const parent = cell();
    const slice = ContentSlice.closed([{ text: 'repeat' }]);
    const first = editor.read.slice.fitContent(slice, { parent });
    const second = editor.read.slice.fitContent(slice, { parent });

    assert.deepEqual(first, second);
    assert.ok(first);
    assert.deepEqual(
      editor.read.slice.fitContent(ContentSlice.closed(first), { parent }),
      first
    );
  });

  it('matches real-parent fitting across a generated structural matrix', () => {
    const cases = [
      {
        accepted: true,
        id: 'closed-wrapper',
        parent: () => matrixCell([paragraph('old')]),
        slice: (text: string) => ContentSlice.closed([{ text }]),
      },
      {
        accepted: true,
        id: 'closed-structure',
        parent: () => matrixCell([caption('old')]),
        slice: (text: string) => ContentSlice.closed([caption(text)]),
      },
      {
        accepted: true,
        id: 'open-depth-one',
        parent: () => matrixCell([paragraph('old')]),
        slice: (text: string) =>
          ContentSlice.fromJSON({
            content: [caption(text)],
            openEnd: 1,
            openStart: 1,
          }),
      },
      {
        accepted: true,
        id: 'open-depth-two',
        parent: () => matrixCell([paragraph('old')]),
        slice: (text: string) =>
          ContentSlice.fromJSON({
            content: [cell([caption(text)])],
            openEnd: 2,
            openStart: 2,
          }),
      },
      {
        accepted: true,
        id: 'minimum-default',
        parent: () => matrixCell([paragraph('old')]),
        slice: () => ContentSlice.empty,
      },
      {
        accepted: false,
        id: 'maximum-rejection',
        parent: () => matrixBounded([paragraph('old')]),
        slice: (text: string) =>
          ContentSlice.closed([paragraph(text), paragraph(`${text}!`)]),
      },
      {
        accepted: false,
        id: 'preserve-context-barrier',
        parent: () => matrixCell([paragraph('old')]),
        slice: (text: string) =>
          ContentSlice.fromJSON({
            content: [{ children: [paragraph(text)], type: 'preserved' }],
            openEnd: 1,
            openStart: 1,
          }),
      },
      {
        accepted: false,
        id: 'isolating-barrier',
        parent: () => matrixCell([paragraph('old')]),
        slice: (text: string) =>
          ContentSlice.fromJSON({
            content: [{ children: [paragraph(text)], type: 'isolated' }],
            openEnd: 1,
            openStart: 1,
          }),
      },
      {
        accepted: true,
        id: 'named-root-property',
        parent: () => matrixCell([paragraph('old')]),
        root: 'comments' as const,
        slice: (text: string) =>
          ContentSlice.closed([{ commentOnly: true, text }]),
      },
    ] as const;

    for (const [caseIndex, testCase] of cases.entries()) {
      fc.assert(
        fc.property(fc.string({ maxLength: 16, minLength: 1 }), (text) => {
          const parent = testCase.parent();
          const root = 'root' in testCase ? testCase.root : undefined;
          const editor = createEditor({
            extensions: [detachedContentSchema],
            initialValue:
              root === 'comments'
                ? {
                    children: [paragraph('document')],
                    roots: { comments: [parent] },
                  }
                : {
                    children: [parent],
                    roots: { comments: [paragraph('comment')] },
                  },
          });
          const slice = testCase.slice(text);
          const detached = editor.read.slice.fitContent(slice, {
            parent,
            ...(root ? { root } : {}),
          });
          const before = editor.read.value();
          const pointRoot = root ? { root } : {};
          const fitted = editor.read.slice.fit(slice, {
            at: {
              anchor: { offset: 0, path: [0, 0, 0], ...pointRoot },
              focus: { offset: 3, path: [0, 0, 0], ...pointRoot },
            },
          });
          const after = fitted ? fitted.changes.apply(before) : null;
          const actualParent = after
            ? root === 'comments'
              ? after.roots?.comments?.[0]
              : after.children[0]
            : null;
          const actual =
            actualParent && ElementApi.isElement(actualParent)
              ? actualParent.children
              : null;

          if (testCase.accepted) {
            assert.ok(detached, `${testCase.id} must fit`);
          } else {
            assert.equal(detached, null, `${testCase.id} must reject`);
          }

          assert.deepEqual(
            actual,
            detached,
            `${testCase.id} must share the real-parent fitter`
          );
        }),
        { numRuns: 8, seed: 20_260_721 + caseIndex }
      );
    }
  });

  it('canonicalizes and validates one detached winner exactly once', () => {
    const editor = createSchemaEditor();
    const profilerGlobal = globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: {
        acceptsCoreDuration: (id: string) => boolean;
        record: (event: { id: string }) => void;
      };
    };
    const previous = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
    const events: string[] = [];

    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
      acceptsCoreDuration: (id) =>
        id === 'slice-fit-canonicalize' ||
        id === 'slice-fit-content-validation',
      record: ({ id }) => events.push(id),
    };

    try {
      assert.deepEqual(
        editor.read.slice.fitContent(
          ContentSlice.closed([{ text: 'winner' }]),
          { parent: cell([paragraph('old')]) }
        ),
        [paragraph('winner')]
      );
      assert.equal(
        events.filter((id) => id === 'slice-fit-canonicalize').length,
        1
      );
      assert.equal(
        events.filter((id) => id === 'slice-fit-content-validation').length,
        1
      );
    } finally {
      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previous;
    }
  });
});
