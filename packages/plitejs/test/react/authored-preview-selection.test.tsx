import { act, render } from '@testing-library/react';
import React from 'react';
import { expect, test } from 'vitest';

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

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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
  preview: 'accepted' | 'proposed'
) => {
  let view!: ReturnType<typeof useEditorContext>;
  const Capture = () => {
    view = useEditorContext();

    return <Editable aria-label="preview" />;
  };
  const mounted = render(
    <EditorRoot editor={source} authored={{ preview }} readOnly>
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

test.each([
  ['accepted', 'This extra sentence can go.'],
  ['proposed', 'This sentence can go.'],
] as const)(
  'a native caret at the end of a read-only %s preview reads where it was placed',
  async (preview, shown) => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'This extra sentence can go.' }],
        },
      ],
    });
    createEditorView(source, {
      authored: { intent: 'propose' },
    }).update.text.delete({
      at: {
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 11 },
      },
    });
    let view!: ReturnType<typeof useEditorContext>;
    const Capture = () => {
      view = useEditorContext();

      return <Editable aria-label="preview" />;
    };
    const mounted = render(
      <EditorRoot editor={source} authored={{ preview }} readOnly>
        <Capture />
      </EditorRoot>
    );
    const root = mounted.getByLabelText('preview');
    const text = root.querySelector('[data-editor-string]')!.firstChild as Text;

    await act(async () => {
      root.focus();
      document
        .getSelection()!
        .setBaseAndExtent(text, text.data.length, text, text.data.length);
      document.dispatchEvent(new Event('selectionchange'));
      await wait(100);
    });

    const end = { path: [0, 0], offset: shown.length };
    const stored = { path: [0, 2], offset: 16 };

    expect(view.read.selection()).toMatchObject({ anchor: end, focus: end });
    expect(source.read.selection()).toMatchObject({
      anchor: stored,
      focus: stored,
    });
  }
);

test('a caret in the line a pending join leaves empty reads on that line', () => {
  const TwoLines = defineEditorSchema('preview-selection-two-lines', {
    elements: { paragraph: schema.element.textBlock() },
    id: 'preview-selection-two-lines',
    root: schema.content.types(['paragraph'], {
      default: { type: 'paragraph' },
      min: 2,
    }),
    unknown: 'reject',
    version: 1,
  });
  const source = createEditor({
    initialValue: [
      p('ab'),
      p('cd', [{ at: 1, author: 'carol', change: 'carol:1', kind: 'join' }]),
    ] as never,
    plugins: [TwoLines, authored({ authorId: 'alice' })],
  });
  const { view } = mountPreview(source as never, 'proposed');

  select(view, caret([1, 0], 0));

  expect(view.read.selection()).toMatchObject(caret([1, 0], 0));
});

test('a range across lines a pending join reorders reads as it was made', () => {
  const source = sourceOf([
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
  const { view } = mountPreview(source, 'proposed');
  const range = {
    anchor: { offset: 3, path: [0, 0] },
    focus: { offset: 1, path: [1, 0] },
  };

  select(view, range);

  expect(view.read.selection()).toMatchObject(range);
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

test('a preview notifies a selection an edit clears', () => {
  const source = createEditor({
    initialValue: [p('alpha')],
    plugins: [authored({ authorId: 'alice' })],
  });
  const accepted = createEditorView(source, {
    authored: { preview: 'accepted' },
  });
  const notified: boolean[] = [];

  accepted.subscribeCommit((commit) => {
    notified.push(commit.changed.has('selection'));
  });
  source.update.selection.set(caret([0, 0], 2));
  source.update((tx) => {
    tx.text.insert('!', { at: { offset: 0, path: [0, 0] } });
    tx.selection.set(null);
  });

  expect(accepted.read.selection()).toBeNull();
  expect(notified.at(-1)).toBe(true);
});
