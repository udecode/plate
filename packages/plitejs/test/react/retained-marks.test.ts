import {
  createEditor,
  createEditorView,
  definePlugin,
  editorCommands,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { describe, it, expect } from 'vitest';

import { readAuthoredViewFragments } from '../../src/core/authored-runtime';
import { setTargetRuntime } from '../../src/core/target-runtime';
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
      {
        type: 'paragraph',
        children: [
          { text: 'a', italic: true },
          { text: 'ABCDEF' },
          { text: 'b', italic: true },
        ],
      },
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

it('leaves struck text unformatted by a Suggesting format', () => {
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
    {
      type: 'paragraph',
      children: [{ text: 'a' }, { text: 'ABCDEF', bold: true }, { text: 'b' }],
    },
  ]);
});

it.each([
  ['edit', 'live and retained'],
  ['propose', 'live and retained'],
  ['edit', 'retained'],
] as const)(
  'toggles %s marks over %s text from inside an update',
  (intent, shape) => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [
        { type: 'paragraph', children: [{ text: 'Generate' }] },
        { type: 'paragraph', children: [{ text: 'tail' }] },
      ],
    });
    const view = createEditorView(source, {
      authored: { intent: 'propose', projection: 'markup' },
    });
    view.update.text.delete({ at: { anchor: point(2), focus: point(6) } });
    const { id } = source.read.authored.changes({ proposals: true }).items[0];
    view.api.authored.setView({ intent, projection: 'markup' });
    const fragment = readAuthoredViewFragments(view, id).find(
      (p) => p.kind === 'delete'
    )!;
    setTargetRuntime(view, {
      dispatchImplicitCommand: (command, input) =>
        applyRetainedViewSelectionMarkCommand(view as never, command, input),
      resolveImplicitTarget: () => null,
    });
    writePliteViewSelection(
      view,
      createPliteViewSelection(
        createContentRootViewBoundaryGraph(view, []),
        shape === 'retained'
          ? {
              anchor: { fragmentId: fragment.id, point: point(2) },
              focus: { fragmentId: fragment.id, point: point(4) },
            }
          : { anchor: { point: point(1) }, focus: { point: point(3) } }
      )
    );
    view.update((tx) => {
      tx.marks.toggle('bold');
    });
    source.update.authored.decide({
      action: 'reject',
      selection: source.read.authored.select({ ids: [id] }),
    });
    expect(view.read.children()[0]).toEqual({
      type: 'paragraph',
      children:
        shape === 'retained'
          ? [{ text: 'Gene' }, { text: 'ra', bold: true }, { text: 'te' }]
          : intent === 'propose'
            ? [
                { text: 'G' },
                { text: 'e', bold: true },
                { text: 'nera' },
                { text: 't', bold: true },
                { text: 'e' },
              ]
            : [{ text: 'G' }, { text: 'enerat', bold: true }, { text: 'e' }],
    });
  }
);

it('types over a suggested format of live and retained text', () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Generate content' }] },
    ],
  });
  const view = createEditorView(source, {
    authored: { intent: 'propose', projection: 'markup' },
  });
  view.update.text.delete({ at: { anchor: point(2), focus: point(6) } });
  setTargetRuntime(view, {
    dispatchImplicitCommand: (command, input) =>
      applyRetainedViewSelectionMarkCommand(view as never, command, input),
    resolveImplicitTarget: () => null,
  });
  writePliteViewSelection(
    view,
    createPliteViewSelection(createContentRootViewBoundaryGraph(view, []), {
      anchor: { point: point(0) },
      focus: { point: point(4) },
    })
  );
  view.update((tx) => {
    tx.marks.toggle('bold');
  });
  expect(
    applyMarkupInput(view as never, { kind: 'insert-text', text: 'K' })
  ).toBe(true);
  expect(view.read.children()[0]).toEqual({
    type: 'paragraph',
    children: [{ text: 'K', bold: true }, { text: ' content' }],
  });
});
