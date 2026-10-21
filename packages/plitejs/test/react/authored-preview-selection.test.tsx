import { act, render } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';

import { authored } from '../../src/authored';
import { createEditorView } from '../../src/editor-runtime-view';
import { defineEditorSchema, schema } from '../../src/index';
import type { Range } from '../../src/interfaces/range';
import { SelectionApi } from '../../src/interfaces/selection';
import { Editable } from '../../src/react/components/editable-text-blocks';
import { EditorRoot } from '../../src/react/components/plite';
import { writeRuntimeSelection } from '../../src/react/editable/runtime-mutation-state';
import { useEditorContext } from '../../src/react/hooks/use-editor-context';
import { createEditor } from '../../src/react/plugin/with-react';

const p = (text: string, marks?: readonly unknown[]) => ({
  ...(marks ? { authored: marks } : {}),
  children: [{ text }],
  type: 'paragraph',
});

const caret = (path: number[], offset: number, root?: string) => {
  const point = { offset, path, ...(root ? { root } : {}) };

  return { anchor: point, focus: point };
};

const sourceOf = (initialValue: unknown) =>
  createEditor({
    initialValue: initialValue as never,
    plugins: [authored({ authorId: 'alice' })],
  });

const mountPreview = (
  source: ReturnType<typeof sourceOf>,
  preview: 'accepted' | 'proposed',
  root?: string
) => {
  let view!: ReturnType<typeof useEditorContext>;
  const Capture = () => {
    view = useEditorContext();

    return <Editable aria-label="preview" />;
  };
  const mounted = render(
    <EditorRoot
      editor={source}
      authored={{ preview }}
      readOnly
      {...(root ? { root } : {})}
    >
      <Capture />
    </EditorRoot>
  );

  return { mounted, view };
};

const select = (view: ReturnType<typeof useEditorContext>, range: Range) => {
  act(() => {
    writeRuntimeSelection(view, SelectionApi.text(range));
  });
};

// A stored edit at the start of the document, so a preview maps its stored
// selection again instead of reading back what it lifted.
const editBefore = (source: ReturnType<typeof sourceOf>) => {
  act(() => {
    source.update((tx) => {
      tx.text.insert('!', { at: { offset: 0, path: [0, 0] } });
    });
  });
};

const struck = () => {
  const source = sourceOf([p('This extra sentence can go.')]);

  createEditorView(source, {
    authored: { intent: 'propose' },
  }).update.text.delete({
    at: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 11 },
    },
  });

  return source;
};

const withInsertedBlock = () => {
  const source = sourceOf([p('one'), p('two')]);

  createEditorView(source, { authored: { intent: 'propose' } }).update((tx) =>
    tx.nodes.insert(p('new') as never, { at: [0] })
  );

  return source;
};

const twoLines = schema.content.types(['paragraph'], {
  default: { type: 'paragraph' },
  min: 2,
});

const TwoLines = defineEditorSchema('preview-selection-two-lines', {
  elements: { paragraph: schema.element.textBlock() },
  id: 'preview-selection-two-lines',
  root: twoLines,
  unknown: 'reject',
  version: 1,
});

const JOINED = [
  p('ab'),
  p('cd', [{ at: 1, author: 'carol', change: 'carol:1', kind: 'join' }]),
];

const withPendingJoin = () =>
  createEditor({
    initialValue: JOINED as never,
    plugins: [TwoLines, authored({ authorId: 'alice' })],
  });

const Noted = defineEditorSchema('preview-selection-noted-lines', {
  elements: { paragraph: schema.element.textBlock() },
  id: 'preview-selection-noted-lines',
  root: twoLines,
  roots: { notes: twoLines },
  unknown: 'reject',
  version: 1,
});

const withNotesJoin = () =>
  createEditor({
    initialValue: { children: JOINED, roots: { notes: JOINED } } as never,
    plugins: [Noted, authored({ authorId: 'alice' })],
  });

const withReorderedJoin = () =>
  sourceOf([
    p('cd'),
    p('ab', [
      {
        at: 1,
        author: 'erin',
        change: '~edit:erin',
        follows: JSON.stringify(['carol:1', 1]),
        kind: 'insert',
      },
    ]),
    p('ef', [{ at: 1, author: 'carol', change: 'carol:1', kind: 'join' }]),
  ]);

const withPendingType = (from: string, to: string) => {
  const Clips = defineEditorSchema('preview-selection-clips', {
    elements: {
      clip: schema.element.textBlock({ object: true }),
      paragraph: schema.element.textBlock(),
    },
    id: 'preview-selection-clips',
    root: schema.content.types(['clip', 'paragraph'], {
      default: { type: 'paragraph' },
    }),
    unknown: 'reject',
    version: 1,
  });
  const source = createEditor({
    initialValue: [{ children: [{ text: 'clip' }], type: from }] as never,
    plugins: [Clips, authored({ authorId: 'alice' })],
  });

  createEditorView(source, { authored: { intent: 'propose' } }).update((tx) =>
    tx.nodes.set({ type: to } as never, { at: [0] })
  );

  return source;
};

test.each([
  ['accepted', 'This extra sentence can go.'],
  ['proposed', 'This sentence can go.'],
] as const)(
  'a native caret at the end of a read-only %s preview reads where it was placed',
  async (preview, shown) => {
    const source = struck();
    const { mounted, view } = mountPreview(source, preview);
    const root = mounted.getByLabelText('preview');
    const text = root.querySelector('[data-editor-string]')!.firstChild as Text;

    act(() => {
      root.focus();
      document
        .getSelection()!
        .setBaseAndExtent(text, text.data.length, text, text.data.length);
      document.dispatchEvent(new Event('selectionchange'));
    });

    const end = { path: [0, 0], offset: shown.length };
    const stored = { path: [0, 2], offset: 16 };

    await vi.waitFor(() => {
      expect(source.read.selection()).toMatchObject({
        anchor: stored,
        focus: stored,
      });
    });
    expect(view.read.selection()).toMatchObject({ anchor: end, focus: end });
  }
);

test.each([
  ['a path', [1]],
  ['a block node selection', SelectionApi.nodes([[1]], { mode: 'block' })],
] as const)(
  '%s in a read-only Accepted preview selects the block it shows',
  (_, target) => {
    const source = withInsertedBlock();
    const { view } = mountPreview(source, 'accepted');

    act(() => {
      writeRuntimeSelection(view, target);
    });

    expect(source.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [2, 0] },
      focus: { offset: 3, path: [2, 0] },
    });
  }
);

test('a place a read-only preview does not show clears the selection', () => {
  const source = withInsertedBlock();
  const { view } = mountPreview(source, 'accepted');

  source.update.selection.set(caret([1, 0], 1));
  select(view, caret([4, 0], 0));

  expect(source.read.selection()).toBeNull();
});

test('a caret in the line a pending join leaves empty reads on that line', () => {
  const { view } = mountPreview(withPendingJoin() as never, 'proposed');

  select(view, caret([1, 0], 0));

  expect(view.read.selection()).toMatchObject(caret([1, 0], 0));
});

test('a range into the line a pending join leaves empty keeps its ends', () => {
  const source = withPendingJoin();
  const { view } = mountPreview(source as never, 'proposed');

  select(view, {
    anchor: { offset: 1, path: [0, 0] },
    focus: { offset: 0, path: [1, 0] },
  });
  editBefore(source as never);

  expect(view.read.selection()).toMatchObject({
    anchor: { offset: 2, path: [0, 0] },
    focus: { offset: 0, path: [1, 0] },
  });
});

test('a range a named-root preview places without naming its root reads as placed after an edit elsewhere', () => {
  const source = withNotesJoin();
  const { view } = mountPreview(source as never, 'proposed', 'notes');
  const range = {
    anchor: { offset: 1, path: [0, 0] },
    focus: { offset: 0, path: [1, 0] },
  };

  select(view, range);
  editBefore(source as never);

  expect(view.read.selection()).toMatchObject(range);
});

test('a block selection of a block holding lines a pending join shows out of order selects only those lines', () => {
  const source = withReorderedJoin();
  const { view } = mountPreview(source, 'proposed');

  act(() => {
    writeRuntimeSelection(view, SelectionApi.nodes([[0]], { mode: 'block' }));
  });

  expect(source.read.selection.nodes().map(([, path]) => path)).toEqual([
    [0],
    [2],
  ]);
});

test.each([
  ['a path to the block', [0]],
  ['the document path', []],
  [
    'a block selection of the block',
    SelectionApi.nodes([[0]], { mode: 'block' }),
  ],
] as const)(
  '%s a pending join merges into selects the text the preview shows there',
  (_, target) => {
    const source = withPendingJoin();
    const { view } = mountPreview(source as never, 'proposed');

    act(() => {
      writeRuntimeSelection(view, target);
    });

    expect(source.read.selection()).toMatchObject({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 2, path: [1, 0] },
    });
  }
);

test('a caret placed where a hidden stored range shows selects that place', () => {
  const source = struck();
  const { view } = mountPreview(source, 'proposed');

  source.update.selection.set({
    anchor: { offset: 0, path: [0, 1] },
    focus: { offset: 6, path: [0, 1] },
  });
  select(view, caret([0, 0], 5));

  expect(source.read.selection()).toMatchObject(caret([0, 2], 0));
});

test('an object selection of a block whose pending type change makes it an object in Accepted selects that block', () => {
  const source = withPendingType('clip', 'paragraph');
  const { view } = mountPreview(source as never, 'accepted');

  act(() => {
    writeRuntimeSelection(view, SelectionApi.nodes([[0]], { mode: 'object' }));
  });

  expect(source.read.selection.nodeMode()).toBe('block');
});

test('an object selection of a block whose pending type change makes it an object reads as a block in Accepted', () => {
  const source = withPendingType('paragraph', 'clip');
  const accepted = createEditorView(source, {
    authored: { preview: 'accepted' },
  });

  source.update.selection.set(SelectionApi.nodes([[0]], { mode: 'object' }));

  expect(accepted.read.selection.nodeMode()).toBe('block');
});

test("a preview's update writes a change's stored range, which the preview reads at its own places", () => {
  const source = struck();
  const accepted = createEditorView(source, {
    authored: { preview: 'accepted' },
  });
  const [change] = source.read.authored.changes({ at: [0] }).items;

  accepted.update.selection.set(change.ranges[0]);

  expect([source.read.selection(), accepted.read.selection()]).toMatchObject([
    { anchor: { offset: 0, path: [0, 1] }, focus: { offset: 6, path: [0, 1] } },
    {
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 11, path: [0, 0] },
    },
  ]);
});

test('a caret a preview places in a named root selects that root', () => {
  const source = sourceOf({
    children: [p('main text')],
    roots: { notes: [p('note text')] },
  });
  const { view } = mountPreview(source, 'accepted');

  select(view, caret([0, 0], 2, 'notes'));

  expect(
    createEditorView(source, { root: 'notes' }).read.selection()
  ).toMatchObject(caret([0, 0], 2));
});

test('a caret a named-root preview places where the main selection shows selects that place in the named root', () => {
  const source = sourceOf({
    children: [p('This extra sentence can go.')],
    roots: { notes: [p('This sentence can go.')] },
  });

  createEditorView(source, {
    authored: { intent: 'propose' },
  }).update.text.delete({
    at: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 11 },
    },
  });

  const { view } = mountPreview(source, 'proposed', 'notes');

  source.update.selection.set(caret([0, 2], 0));
  select(view, caret([0, 0], 5));

  expect(
    createEditorView(source, { root: 'notes' }).read.selection()
  ).toMatchObject(caret([0, 0], 5));
});

test('a preview notifies a selection that accepting a change moves', () => {
  const source = createEditor({
    initialValue: [p('old')],
    plugins: [authored({ authorId: 'alice' })],
  });
  createEditorView(source, { authored: { intent: 'propose' } }).update((tx) =>
    tx.nodes.insert(p('new') as never, { at: [0] })
  );
  const accepted = createEditorView(source, {
    authored: { preview: 'accepted' },
  });
  const notified: boolean[] = [];

  accepted.subscribeCommit((commit) => {
    notified.push(commit.changed.has('selection'));
  });
  source.update.selection.set(caret([1, 0], 2));
  source.update((tx) =>
    tx.authored.decide({
      action: 'accept',
      changes: source.read.authored.changes({ at: [0] }).items,
    })
  );

  expect(accepted.read.selection()).toMatchObject(caret([1, 0], 2));
  expect(notified.at(-1)).toBe(true);
});

test.each(['before', 'after'] as const)(
  'a preview subscribed %s the caret was placed notifies a selection an edit clears',
  (when) => {
    const source = sourceOf([p('alpha')]);
    const accepted = createEditorView(source, {
      authored: { preview: 'accepted' },
    });
    const notified: boolean[][] = [];
    const subscribe = () =>
      accepted.subscribeCommit((commit) => {
        notified.push([
          commit.selectionChanged,
          commit.changed.has('selection'),
        ]);
      });

    if (when === 'before') subscribe();
    source.update.selection.set(caret([0, 0], 2));
    if (when === 'after') subscribe();
    source.update((tx) => {
      tx.text.insert('!', { at: { offset: 0, path: [0, 0] } });
      tx.selection.set(null);
    });

    expect([accepted.read.selection(), notified.at(-1)]).toEqual([
      null,
      [true, true],
    ]);
  }
);
