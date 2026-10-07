import {
  createEditor,
  createEditorView,
  definePlugin,
  editorCommands,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { describe, it, expect } from 'vitest';

import { readAuthoredViewFragments } from '../../src/core/authored-runtime';
import { applyContentRootSelectionMoveCommand } from '../../src/react/editable/content-root-navigation';
import { createContentRootViewBoundaryGraph } from '../../src/react/editable/content-root-owners';
import {
  applyMarkupInput,
  applyModelOwnedTextInput,
  applyRetainedViewSelectionMarkCommand,
} from '../../src/react/editable/mutation-controller';
import {
  createPliteViewSelection,
  writePliteViewSelection,
} from '../../src/react/view-selection';

const point = (offset: number) => ({ path: [0, 0], offset });
describe('retained marks', () => {
  it('routes mixed visible ranges through installed toggle handlers', () => {
    let calls = 0;
    const source = createEditor({
      plugins: [
        authored({ authorId: 'alice' }),
        definePlugin('toggle-handler', {
          commands: ({ around }) => [
            around(editorCommands.toggleMark, ({ input, next }) => {
              calls += 1;
              return next({ ...input, key: 'italic' });
            }),
          ],
        }),
      ],
      initialValue: [{ type: 'paragraph', children: [{ text: 'aABCDEFb' }] }],
    });
    const view = createEditorView(source, {
      authored: { intent: 'propose', projection: 'markup' },
    });
    view.update.text.delete({ at: { anchor: point(1), focus: point(7) } });
    const { id } = source.read.authored.changes({ proposals: true }).items[0];
    writePliteViewSelection(
      view,
      createPliteViewSelection(createContentRootViewBoundaryGraph(view, []), {
        anchor: { point: point(0) },
        focus: { point: point(2) },
      })
    );
    expect(
      applyRetainedViewSelectionMarkCommand(
        view as never,
        editorCommands.toggleMark,
        { key: 'bold', value: true }
      )
    ).toBe(true);
    expect(calls).toBeGreaterThan(0);
    expect(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ ids: [id] }),
      }).status
    ).toBe('applied');
    expect(view.read.children()).toEqual([
      { type: 'paragraph', children: [{ text: 'aABCDEFb', italic: true }] },
    ]);
  });
});

it.each(['edit', 'propose'] as const)(
  'retains collapsed typing marks in %s',
  (intent) => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [{ type: 'paragraph', children: [{ text: 'aABCDEFb' }] }],
    });
    const view = createEditorView(source, {
      authored: { intent: 'propose', projection: 'markup' },
    });
    view.update.text.delete({ at: { anchor: point(1), focus: point(7) } });
    const { id } = source.read.authored.changes({ proposals: true }).items[0];
    view.api.authored.setView({ intent, projection: 'markup' });
    const fragment = readAuthoredViewFragments(view, id).find(
      (p) => p.kind === 'delete'
    )!;
    writePliteViewSelection(
      view,
      createPliteViewSelection(createContentRootViewBoundaryGraph(view, []), {
        anchor: { fragmentId: fragment.id, point: point(3) },
        focus: { fragmentId: fragment.id, point: point(3) },
      })
    );
    expect(
      applyRetainedViewSelectionMarkCommand(
        view as never,
        editorCommands.toggleMark,
        { key: 'bold', value: true }
      )
    ).toBe(true);
    expect(view.read.marks()).toEqual({ bold: true });
    expect(
      applyRetainedViewSelectionMarkCommand(
        view as never,
        editorCommands.toggleMark,
        { key: 'bold', value: true }
      )
    ).toBe(true);
    expect(view.read.marks()).toEqual({});
    expect(
      applyRetainedViewSelectionMarkCommand(
        view as never,
        editorCommands.toggleMark,
        { key: 'bold', value: true }
      )
    ).toBe(true);
    expect(
      applyMarkupInput(view as never, {
        kind: 'insert-text',
        text: 'X',
      })
    ).toBe(true);
    expect(view.read.children()).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'a' }, { text: 'X', bold: true }, { text: 'b' }],
      },
    ]);
    expect(
      source.read.authored
        .changes({ proposals: true })
        .items.find((p) => p.id === id)?.status
    ).toBe('pending');
  }
);

it('uses retained text formatting when the model caret remains in another leaf', () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'a', bold: true },
          { text: 'ABCDEF' },
          { text: 'b', bold: true },
        ],
      },
    ],
  });
  const view = createEditorView(source, {
    authored: { intent: 'propose', projection: 'markup' },
  });
  view.update.text.delete({
    at: {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 6 },
    },
  });
  const { id } = source.read.authored.changes({ proposals: true }).items[0];
  view.api.authored.setView({ intent: 'edit', projection: 'markup' });
  view.update.selection.set({ anchor: point(0), focus: point(0) });
  const fragment = readAuthoredViewFragments(view, id).find(
    (p) => p.kind === 'delete'
  )!;
  writePliteViewSelection(
    view,
    createPliteViewSelection(createContentRootViewBoundaryGraph(view, []), {
      anchor: { fragmentId: fragment.id, point: point(3) },
      focus: { fragmentId: fragment.id, point: point(3) },
    })
  );
  expect(
    applyMarkupInput(view as never, {
      kind: 'insert-text',
      text: 'X',
    })
  ).toBe(true);
  expect(view.read.children()).toEqual([
    {
      type: 'paragraph',
      children: [
        { text: 'a', bold: true },
        { text: 'X' },
        { text: 'b', bold: true },
      ],
    },
  ]);
});

it.each(['edit', 'propose'] as const)(
  'clears retained pending marks on keyboard movement in %s',
  (intent) => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [{ type: 'paragraph', children: [{ text: 'aABCDEFb' }] }],
    });
    const view = createEditorView(source, {
      authored: { intent: 'propose', projection: 'markup' },
    });
    view.update.text.delete({ at: { anchor: point(1), focus: point(7) } });
    const { id } = source.read.authored.changes({ proposals: true }).items[0];
    view.api.authored.setView({ intent, projection: 'markup' });
    const fragment = readAuthoredViewFragments(view, id).find(
      (p) => p.kind === 'delete'
    )!;
    writePliteViewSelection(
      view,
      createPliteViewSelection(createContentRootViewBoundaryGraph(view, []), {
        anchor: { fragmentId: fragment.id, point: point(2) },
        focus: { fragmentId: fragment.id, point: point(2) },
      })
    );
    expect(
      applyRetainedViewSelectionMarkCommand(
        view as never,
        editorCommands.toggleMark,
        { key: 'bold', value: true }
      )
    ).toBe(true);
    expect(
      applyContentRootSelectionMoveCommand({
        command: { kind: 'move-selection', axis: 'horizontal', reverse: false },
        editor: view as never,
        selection: view.read.selection(),
      }).handled
    ).toBe(true);
    applyModelOwnedTextInput({
      data: 'X',
      editor: view as never,
      inputType: 'insertText',
    });
    expect(view.read.children()).toEqual([
      { type: 'paragraph', children: [{ text: 'aXb' }] },
    ]);
  }
);

it('toggles the selected retained marks independently of live text', () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'a' },
          { text: 'ABCDEF', bold: true },
          { text: 'b' },
        ],
      },
    ],
  });
  const view = createEditorView(source, {
    authored: { intent: 'propose', projection: 'markup' },
  });
  view.update.text.delete({
    at: {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 6 },
    },
  });
  const { id } = source.read.authored.changes({ proposals: true }).items[0];
  const fragment = readAuthoredViewFragments(view, id).find(
    (part) => part.kind === 'delete'
  )!;
  writePliteViewSelection(
    view,
    createPliteViewSelection(createContentRootViewBoundaryGraph(view, []), {
      anchor: { fragmentId: fragment.id, point: point(0) },
      focus: { fragmentId: fragment.id, point: point(6) },
    })
  );
  applyRetainedViewSelectionMarkCommand(
    view as never,
    editorCommands.toggleMark,
    { key: 'bold', value: true }
  );
  source.update.authored.decide({
    action: 'reject',
    selection: source.read.authored.select({ ids: [id] }),
  });
  expect(view.read.children()).toEqual([
    { type: 'paragraph', children: [{ text: 'aABCDEFb' }] },
  ]);
});
