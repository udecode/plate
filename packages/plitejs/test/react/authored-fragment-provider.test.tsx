import assert from 'node:assert/strict';

import { act, render } from '@testing-library/react';
import {
  createEditorView,
  defineEditorSchema,
  DocumentChange,
  NodeApi,
  schema,
  TextApi,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import {
  createEditor,
  Editable,
  Plite,
  type RenderElementProps,
  type RenderLeafProps,
  type RenderTextProps,
  type PliteDecorationSource,
} from 'plitejs/react';
import React from 'react';

import { hasActiveAnchors } from '../../src/core/anchor-state';
import { readAuthoredViewFragments } from '../../src/core/authored-runtime';
import { readDOMFragmentEditor } from '../../src/dom/plugin/dom-fragment-view';
import { applyContentRootSelectionMoveCommand } from '../../src/react/editable/content-root-navigation';
import { createContentRootViewBoundaryGraph } from '../../src/react/editable/content-root-owners';
import { createFastDOMSelectionRange } from '../../src/react/editable/fast-dom-selection-range';
import {
  applyEditableCommand,
  applyModelOwnedTextInput,
} from '../../src/react/editable/mutation-controller';
import {
  getProjectedViewSelectionSlice,
  writeProjectedViewSelectionClipboardData,
} from '../../src/react/editable/projected-clipboard';
import { resolveProjectedDOMSelection } from '../../src/react/editable/selection-projected-dom';
import { createReactRuntimeViewEditor } from '../../src/react/hooks/use-plite-runtime';
import {
  createPliteViewSelection,
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  writePliteViewSelection,
  type PliteViewSelection,
} from '../../src/react/view-selection';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const markup = { intent: 'propose', projection: 'markup' } as const;
const point = (offset: number) => ({ path: [0, 0], offset });

it('keeps the caret on the chosen side when collapsing across retained text', () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
  parent.update.selection.set({ anchor: point(1), focus: point(1) });
  writePliteViewSelection(
    parent,
    createPliteViewSelection(createContentRootViewBoundaryGraph(parent, []), {
      anchor: { point: point(1), affinity: 'backward' },
      focus: { point: point(1), affinity: 'forward' },
    })
  );
  applyEditableCommand({
    command: { kind: 'move-selection', axis: 'horizontal' },
    editor: parent,
  });
  const caret = readPliteViewSelection(parent);
  assert.ok(caret);
  assert.equal(isPliteViewSelectionCollapsed(caret), true);
  assert.equal(caret.focus.affinity, 'forward');
  applyEditableCommand({
    command: { kind: 'move-selection', axis: 'horizontal' },
    editor: parent,
  });
  assert.equal(readPliteViewSelection(parent), null);
  assert.deepEqual(parent.read.selection(), {
    anchor: point(2),
    focus: point(2),
  });
  applyEditableCommand({
    command: { kind: 'move-selection', axis: 'horizontal', reverse: true },
    editor: parent,
  });
  applyEditableCommand({
    command: { kind: 'move-selection', axis: 'horizontal', reverse: true },
    editor: parent,
  });
  const retainedCaret = readPliteViewSelection(parent);
  assert.ok(retainedCaret?.focus.fragmentId);
  assert.deepEqual(retainedCaret.focus.point, point(2));
  writePliteViewSelection(parent, null);
});

it('maps a retained selection through accepted edits and releases it on a decision', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('Before middle after')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
  const mounted = render(
    <Plite editor={parent}>
      <Editable />
    </Plite>
  );
  const { id } = source.read.authored.changes().items[0];
  const fragment = readAuthoredViewFragments(parent, id)[0];
  await act(async () =>
    writePliteViewSelection(
      parent,
      createPliteViewSelection(createContentRootViewBoundaryGraph(parent, []), {
        anchor: { fragmentId: fragment.id, point: point(1) },
        focus: { fragmentId: fragment.id, point: point(5) },
      })
    )
  );
  await act(async () => {
    source.update.text.insert('Prefix ', { at: point(0) });
    source.update.text.insert('X', { at: point(17) });
  });
  assert.equal(
    getProjectedViewSelectionSlice(parent)
      ?.content.map(NodeApi.string)
      .join(''),
    'idXdl'
  );
  assert.equal(
    [...mounted.container.querySelectorAll('[data-plite-view-selection]')]
      .map((node) => node.textContent)
      .join(''),
    'idXdl'
  );
  await act(async () =>
    source.update.authored.decide({
      action: 'reject',
      selection: source.read.authored.select({ ids: [id] }),
    })
  );
  assert.equal(readPliteViewSelection(parent), null);
  assert.equal(
    mounted.container.querySelector('[data-plite-view-selection]'),
    null
  );
  assert.equal(hasActiveAnchors(source), false);
  mounted.unmount();
});

it('keeps both sides of a retained gap mapped through accepted path and text changes', () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('Before middle after')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
  writePliteViewSelection(
    parent,
    createPliteViewSelection(createContentRootViewBoundaryGraph(parent, []), {
      anchor: { point: point(7), affinity: 'backward' },
      focus: { point: point(7), affinity: 'forward' },
    })
  );
  source.update.text.insert('Prefix ', { at: point(0) });
  source.update.nodes.insert(paragraph('Heading'), { at: [0] });
  assert.equal(
    getProjectedViewSelectionSlice(parent)
      ?.content.map(NodeApi.string)
      .join(''),
    'middle'
  );
  const selection = readPliteViewSelection(parent);
  assert.ok(selection);
  assert.deepEqual(selection.anchor.point, { path: [1, 0], offset: 14 });
  assert.deepEqual(selection.focus.point, { path: [1, 0], offset: 14 });
  assert.equal(isPliteViewSelectionCollapsed(selection), false);
  writePliteViewSelection(parent, null);
  assert.equal(hasActiveAnchors(source), false);
});

it('releases retained selection anchors when its mounted view unmounts', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
  const mounted = render(
    <Plite editor={parent}>
      <Editable />
    </Plite>
  );
  await act(async () =>
    writePliteViewSelection(
      parent,
      createPliteViewSelection(createContentRootViewBoundaryGraph(parent, []), {
        anchor: { point: point(1), affinity: 'backward' },
        focus: { point: point(1), affinity: 'forward' },
      })
    )
  );
  assert.equal(hasActiveAnchors(source), true);
  mounted.unmount();
  assert.equal(hasActiveAnchors(source), false);
  assert.equal(readPliteViewSelection(parent), null);
});

for (const fixture of [
  {
    text: 'A shared draft.',
    from: 2,
    to: 8,
    start: 1,
    axis: 'word',
    expected: ' shared',
  },
  {
    text: 'A shared draft.',
    from: 3,
    to: 6,
    start: 2,
    axis: 'word',
    expected: 'shared',
  },
  {
    text: 'A e\u0301 B',
    from: 3,
    to: 4,
    start: 2,
    axis: 'horizontal',
    expected: 'e\u0301',
  },
  {
    text: 'A 👩‍💻 B',
    from: 5,
    to: 7,
    start: 2,
    axis: 'horizontal',
    expected: '👩‍💻',
  },
] as const) {
  it(`moves one ${fixture.axis} unit through retained ${fixture.expected}`, () => {
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph(fixture.text)],
    });
    const parent = createReactRuntimeViewEditor(
      createEditorView(source, { authored: markup })
    );
    parent.update.text.delete({
      at: { anchor: point(fixture.from), focus: point(fixture.to) },
    });
    parent.update.selection.set({
      anchor: point(fixture.start),
      focus: point(fixture.start),
    });
    applyEditableCommand({
      command: { kind: 'move-selection', axis: fixture.axis, extend: true },
      editor: parent,
    });
    assert.equal(
      getProjectedViewSelectionSlice(parent)
        ?.content.map(NodeApi.string)
        .join(''),
      fixture.expected
    );
    applyEditableCommand({
      command: {
        kind: 'move-selection',
        axis: fixture.axis,
        extend: true,
        reverse: true,
      },
      editor: parent,
    });
    const selection = readPliteViewSelection(parent);
    assert.ok(selection);
    if (fixture.start === 1) {
      assert.equal(
        getProjectedViewSelectionSlice(parent)
          ?.content.map(NodeApi.string)
          .join(''),
        ' '
      );
      assert.ok(selection.focus.fragmentId);
      assert.deepEqual(selection.focus.point, point(0));
    } else {
      assert.equal(isPliteViewSelectionCollapsed(selection), true);
      assert.deepEqual(selection.focus.point, point(fixture.start));
    }
    assert.equal(NodeApi.string(source.read.children()[0]), fixture.text);
  });
}

it('counts retained block boundaries as character steps', () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('A'), paragraph('D'), paragraph('B')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.nodes.remove({ at: [1] });
  parent.update.selection.set({ anchor: point(1), focus: point(1) });
  const points = [];
  for (let index = 0; index < 4; index++) {
    applyEditableCommand({
      command: { kind: 'move-selection', axis: 'horizontal', extend: true },
      editor: parent,
    });
    const focus = readPliteViewSelection(parent)?.focus;
    assert.ok(focus);
    points.push([!!focus.fragmentId, focus.point.path, focus.point.offset]);
  }
  assert.deepEqual(points, [
    [true, [0, 0], 0],
    [true, [0, 0], 1],
    [false, [1, 0], 0],
    [false, [1, 0], 1],
  ]);
  for (let index = 0; index < 4; index++) {
    applyEditableCommand({
      command: {
        kind: 'move-selection',
        axis: 'horizontal',
        extend: true,
        reverse: true,
      },
      editor: parent,
    });
  }
  const selection = readPliteViewSelection(parent);
  assert.ok(selection);
  assert.equal(isPliteViewSelectionCollapsed(selection), true);
  assert.deepEqual(selection.focus.point, point(1));
});

it('advances each arrow through fragment coordinates before and after native selection import', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('A shared draft.')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(2), focus: point(8) } });
  parent.update.selection.set({ anchor: point(1), focus: point(1) });
  const mounted = render(
    <Plite editor={parent}>
      <Editable />
    </Plite>
  );
  const lengths: string[] = [];
  for (let index = 0; index < 8; index++) {
    await act(async () => {
      const result = applyContentRootSelectionMoveCommand({
        command: {
          kind: 'move-selection',
          axis: 'horizontal',
          extend: true,
          reverse: false,
        },
        editor: parent,
        selection: { anchor: point(1), focus: point(1) },
      });
      assert.equal(result.handled, true);
    });
    const view = readPliteViewSelection(parent);
    assert.ok(view);
    if (index > 0 && index < 7) assert.ok(view.focus.fragmentId);
    lengths.push(
      getProjectedViewSelectionSlice(parent)
        ?.content.map(NodeApi.string)
        .join('') ?? ''
    );
  }
  assert.deepEqual(lengths, [
    ' ',
    ' s',
    ' sh',
    ' sha',
    ' shar',
    ' share',
    ' shared',
    ' shared ',
  ]);
  for (const expected of [
    ' shared',
    ' share',
    ' shar',
    ' sha',
    ' sh',
    ' s',
    ' ',
    '',
  ]) {
    await act(async () =>
      applyEditableCommand({
        command: {
          kind: 'move-selection',
          axis: 'horizontal',
          extend: true,
          reverse: true,
        },
        editor: parent,
      })
    );
    assert.equal(
      getProjectedViewSelectionSlice(parent)
        ?.content.map(NodeApi.string)
        .join('') ?? '',
      expected
    );
  }
  assert.equal(
    isPliteViewSelectionCollapsed(readPliteViewSelection(parent)!),
    true
  );
  await act(async () =>
    applyEditableCommand({
      command: { kind: 'move-selection', axis: 'horizontal' },
      editor: parent,
    })
  );
  const beforeFragmentCaret = readPliteViewSelection(parent);
  assert.ok(beforeFragmentCaret);
  assert.equal(isPliteViewSelectionCollapsed(beforeFragmentCaret), true);
  assert.equal(beforeFragmentCaret.focus.affinity, 'backward');
  assert.deepEqual(parent.read.selection(), {
    anchor: point(2),
    focus: point(2),
  });
  const root = mounted.container.querySelector<HTMLElement>(
    '[data-plite-editor]'
  );
  const before = root?.querySelector('[data-plite-string]')?.firstChild;
  const retained = root?.querySelector(
    '[data-plite-retained] [data-plite-string]'
  )?.firstChild;
  const native = window.getSelection();
  assert.ok(root && before && retained && native);
  native.setBaseAndExtent(before, 1, retained, 3);
  const imported = resolveProjectedDOMSelection({
    domSelection: native,
    editor: parent,
    editorElement: root,
  });
  assert.ok(imported?.focus.fragmentId);
  await act(async () => {
    writePliteViewSelection(parent, imported);
    applyEditableCommand({
      command: { kind: 'move-selection', axis: 'horizontal', extend: true },
      editor: parent,
    });
  });
  assert.equal(
    getProjectedViewSelectionSlice(parent)
      ?.content.map(NodeApi.string)
      .join(''),
    ' shar'
  );
  mounted.unmount();
});

it('keeps both editable zero-width boundaries around a completely deleted text node', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('XYZ')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(0), focus: point(3) } });
  const mounted = render(
    <Plite editor={parent}>
      <Editable />
    </Plite>
  );
  const root = mounted.container.querySelector<HTMLElement>(
    '[data-plite-editor]'
  );
  const nodes = [
    ...mounted.container.querySelectorAll(
      '[data-plite-string], [data-plite-zero-width]'
    ),
  ].map((node) => node.firstChild);
  const before = nodes[0];
  const after = nodes.at(-1);
  const domSelection = window.getSelection();
  assert.ok(root && before && after && domSelection);
  domSelection.setBaseAndExtent(before, 0, after, 0);
  const selection = resolveProjectedDOMSelection({
    domSelection,
    editor: parent,
    editorElement: root,
  });
  assert.ok(selection);
  assert.equal(isPliteViewSelectionCollapsed(selection), false);
  assert.equal(
    selection.segments.parts.filter((part) => part.fragment).length,
    1
  );
  await act(async () => writePliteViewSelection(parent, selection));
  assert.equal(
    getProjectedViewSelectionSlice(parent)
      ?.content.map(NodeApi.string)
      .join(''),
    'XYZ'
  );
  mounted.unmount();
});

it('copies retained blocks in visible order without merging their paragraph boundaries', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [
      paragraph('Before'),
      paragraph('Deleted'),
      paragraph('After'),
    ],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.nodes.remove({ at: [1] });
  const mounted = render(
    <Plite editor={parent}>
      <Editable />
    </Plite>
  );
  const selection = createPliteViewSelection(
    createContentRootViewBoundaryGraph(parent, []),
    {
      anchor: { point: { path: [0, 0], offset: 3 } },
      focus: { point: { path: [1, 0], offset: 2 } },
    }
  );
  await act(async () => writePliteViewSelection(parent, selection));
  assert.deepEqual(
    getProjectedViewSelectionSlice(parent)?.content.map(NodeApi.string),
    ['ore', 'Deleted', 'Af']
  );
  assert.deepEqual(
    [...mounted.container.querySelectorAll('[data-plite-view-selection]')].map(
      (node) => node.textContent
    ),
    ['ore', 'Deleted', 'Af']
  );
  mounted.unmount();
});

it('selects, copies and protects native retained content across both document affinities', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
  const mounted = render(
    <Plite editor={parent}>
      <Editable />
    </Plite>
  );
  const root = mounted.container.querySelector<HTMLElement>(
    '[data-plite-editor]'
  );
  const domSelection = window.getSelection();
  assert.ok(root && domSelection);
  const select = (
    anchor: number,
    anchorOffset: number,
    focus: number,
    focusOffset: number
  ): PliteViewSelection => {
    const strings = [
      ...mounted.container.querySelectorAll('[data-plite-string]'),
    ].map((node) => node.firstChild);
    const anchorNode = strings[anchor];
    const focusNode = strings[focus];
    assert.ok(anchorNode && focusNode);
    domSelection.setBaseAndExtent(
      anchorNode,
      anchorOffset,
      focusNode,
      focusOffset
    );
    const selected = resolveProjectedDOMSelection({
      domSelection,
      editor: parent,
      editorElement: root,
    });
    assert.ok(selected);
    return selected;
  };
  const snapshot = source.read.value();
  for (const backward of [false, true]) {
    const selected = backward ? select(2, 0, 0, 1) : select(0, 1, 2, 0);
    assert.equal(selected.segments.backward, backward);
    assert.equal(isPliteViewSelectionCollapsed(selected), false);
    assert.deepEqual(selected.anchor.point, point(1));
    assert.deepEqual(selected.focus.point, point(1));
    assert.equal(
      selected.segments.parts.filter((part) => part.fragment).length,
      1
    );
    await act(async () => writePliteViewSelection(parent, selected));
    const slice = getProjectedViewSelectionSlice(parent);
    assert.ok(slice);
    assert.deepEqual(slice.content.map(NodeApi.string), ['XYZ']);
    const data = new Map<string, string>();
    assert.equal(
      writeProjectedViewSelectionClipboardData(parent, {
        getData: (type) => data.get(type) ?? '',
        setData: (type, value) => {
          data.set(type, value);
        },
      }),
      true
    );
    assert.equal(data.get('text/plain'), 'XYZ');
    assert.equal(
      mounted.container.querySelector(
        '[data-plite-retained] [data-plite-view-selection]'
      )?.textContent,
      'XYZ'
    );
    for (const command of [
      { kind: 'insert-text', text: '!' },
      { kind: 'delete', direction: 'backward' },
      { kind: 'delete-fragment' },
      { kind: 'insert-break', variant: 'paragraph' },
      { kind: 'transpose-character' },
    ] as const) {
      await act(async () => {
        applyEditableCommand({ command, editor: parent });
      });
      assert.deepEqual(source.read.value(), snapshot);
      assert.equal(parent.read.children().map(NodeApi.string).join(''), 'AB');
    }
    await act(async () => {
      applyModelOwnedTextInput({
        data: '!',
        editor: parent,
        inputType: 'insertReplacementText',
        selection: { anchor: point(0), focus: point(2) },
      });
    });
    assert.deepEqual(source.read.value(), snapshot);
    assert.equal(parent.read.children().map(NodeApi.string).join(''), 'AB');
    await act(async () => writePliteViewSelection(parent, null));
  }
  const selected = select(0, 0, 2, 1);
  await act(async () => writePliteViewSelection(parent, selected));
  const complete = getProjectedViewSelectionSlice(parent);
  assert.ok(complete);
  assert.equal(complete.content.length, 1);
  assert.equal(NodeApi.string(complete.content[0]), 'AXYZB');
  await act(async () => writePliteViewSelection(parent, null));
  await act(async () =>
    applyEditableCommand({ command: { kind: 'select-all' }, editor: parent })
  );
  assert.equal(
    getProjectedViewSelectionSlice(parent)
      ?.content.map(NodeApi.string)
      .join(''),
    'AXYZB'
  );
  await act(async () =>
    applyEditableCommand({
      command: { kind: 'insert-text', text: '!' },
      editor: parent,
    })
  );
  assert.deepEqual(source.read.value(), snapshot);
  await act(async () => writePliteViewSelection(parent, null));
  const inside = select(1, 1, 1, 2);
  assert.ok(inside.anchor.fragmentId);
  assert.equal(inside.segments.parts.length, 1);
  await act(async () => writePliteViewSelection(parent, inside));
  assert.equal(
    getProjectedViewSelectionSlice(parent)
      ?.content.map(NodeApi.string)
      .join(''),
    'Y'
  );
  await act(async () => writePliteViewSelection(parent, null));
  const caret = select(1, 1, 1, 1);
  assert.equal(isPliteViewSelectionCollapsed(caret), true);
  await act(async () => {
    writePliteViewSelection(parent, caret);
    applyEditableCommand({
      command: { kind: 'insert-text', text: '!' },
      editor: parent,
    });
  });
  assert.deepEqual(source.read.value(), snapshot);
  mounted.unmount();
});

it('automatically interleaves retained text with distinct native offsets', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
  const mounted = render(
    <Plite editor={parent}>
      <Editable />
    </Plite>
  );
  assert.equal(mounted.container.textContent, 'AXYZB');
  const retained = mounted.container.querySelector<HTMLElement>(
    '[data-plite-retained]'
  );
  assert.ok(retained);
  assert.equal(retained.tagName, 'SPAN');
  assert.equal(retained.textContent, 'XYZ');
  const editor = readDOMFragmentEditor(retained);
  assert.ok(editor);
  const text = retained.querySelector('[data-plite-string]')?.firstChild;
  assert.ok(text);
  assert.deepEqual(
    editor.api.dom.resolvePlitePoint([text, 2], { exactMatch: true }),
    point(2)
  );
  const after = retained.nextElementSibling?.firstElementChild?.firstChild;
  assert.ok(after);
  assert.deepEqual(parent.api.dom.resolveDOMPoint(point(2)), [after, 1]);
  const editorElement = parent.api.dom.root();
  assert.ok(editorElement);
  const selection = createFastDOMSelectionRange({
    editor: parent,
    editorElement,
    selection: { anchor: point(2), focus: point(2) },
  });
  assert.ok(selection);
  assert.equal(selection.startContainer, after);
  assert.equal(selection.startOffset, 1);
  await act(async () => source.update.text.insert('!', { at: point(3) }));
  assert.equal(retained.textContent, 'XY!Z');
  assert.equal(mounted.container.textContent, 'AXY!ZB');
  assert.deepEqual(parent.api.dom.resolveDOMPoint(point(2)), [after, 1]);
  mounted.unmount();
});

it('replaces imperative text flow when inline fragments arrive and keeps their order while editing', async () => {
  let authorId = 'alice';
  const source = createEditor({
    extensions: [authored({ authorId: () => authorId })],
    initialValue: [paragraph('AABBCCDD')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const mounted = render(
    <Plite editor={parent}>
      <Editable />
    </Plite>
  );
  assert.ok(mounted.container.querySelector('[data-plite-text-flow-host]'));
  await act(async () =>
    parent.update.text.delete({ at: { anchor: point(2), focus: point(4) } })
  );
  const proposedText = mounted.container.querySelector(
    '[data-plite-dom-sync-reason="retained-content"]'
  );
  assert.ok(proposedText);
  assert.equal(proposedText.getAttribute('data-plite-dom-sync'), null);
  authorId = 'bob';
  await act(async () =>
    parent.update.text.delete({ at: { anchor: point(4), focus: point(6) } })
  );
  const visible = () => mounted.container.textContent?.replaceAll('\uFEFF', '');
  const deleted = () =>
    [...mounted.container.querySelectorAll('[data-plite-retained]')].map(
      (node) => node.textContent
    );
  assert.deepEqual(deleted(), ['BB', 'DD']);
  assert.equal(visible(), 'AABBCCDD');
  await act(async () => parent.update.text.insert('!', { at: point(1) }));
  assert.equal(visible(), 'A!ABBCCDD');
  authorId = 'carol';
  await act(async () =>
    parent.update.text.delete({ at: { anchor: point(3), focus: point(5) } })
  );
  assert.deepEqual(deleted(), ['BB', 'CC', 'DD']);
  assert.equal(visible(), 'A!ABBCCDD');
  assert.deepEqual(parent.read.children(), [paragraph('A!A')]);
  assert.deepEqual(source.read.children(), [paragraph('AABBCCDD')]);
  await act(async () =>
    parent.api.authored.setView({ intent: 'propose', projection: 'proposed' })
  );
  assert.equal(visible(), 'A!A');
  assert.deepEqual(deleted(), []);
  await act(async () => parent.api.authored.setView(markup));
  assert.equal(visible(), 'A!ABBCCDD');
  assert.deepEqual(deleted(), ['BB', 'CC', 'DD']);
  mounted.unmount();
});

for (const [text, from, to] of [
  ['XYZA', 0, 3],
  ['AXYZ', 1, 4],
  ['XYZ', 0, 3],
] as const) {
  it(`keeps native editable points around retained boundary text in ${text}`, async () => {
    const source = createEditor({
      extensions: [authored({ authorId: 'alice' })],
      initialValue: [paragraph(text)],
    });
    const parent = createReactRuntimeViewEditor(
      createEditorView(source, { authored: markup })
    );
    const mounted = render(
      <Plite editor={parent}>
        <Editable placeholder="Type here" />
      </Plite>
    );
    await act(async () =>
      parent.update.text.delete({
        at: { anchor: point(from), focus: point(to) },
      })
    );
    assert.equal(mounted.container.textContent?.replaceAll('\uFEFF', ''), text);
    assert.equal(
      mounted.container.querySelector('[data-plite-retained]')?.textContent,
      'XYZ'
    );
    assert.equal(
      mounted.container.querySelector('[data-plite-placeholder]'),
      null
    );
    const length = text.length - (to - from);
    for (let offset = 0; offset <= length; offset++) {
      const dom = parent.api.dom.resolveDOMPoint(point(offset));
      assert.ok(dom);
      assert.equal(readDOMFragmentEditor(dom[0]), null);
      assert.deepEqual(
        parent.api.dom.resolvePlitePoint(dom, { exactMatch: true }),
        point(offset)
      );
    }
    await act(async () => parent.update.text.insert('!', { at: point(0) }));
    assert.equal(
      mounted.container.textContent?.replaceAll('\uFEFF', ''),
      `!${text}`
    );
    assert.deepEqual(source.read.children(), [paragraph(text)]);
    mounted.unmount();
  });
}

it('uses the root element and leaf renderers for retained inline elements', async () => {
  const links = defineEditorSchema('schema:authored-inline-fragment', {
    id: 'authored-inline-fragment',
    version: 1,
    unknown: 'preserve',
    elements: {
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
    },
    root: schema.content.not(schema.content.text()),
  });
  const source = createEditor({
    extensions: [links, authored({ authorId: 'alice' })],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'A' },
          {
            type: 'link',
            url: '/retained',
            children: [{ text: 'XYZ', bold: true }],
          },
          { text: 'B' },
        ],
      },
    ],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const renderElement = ({
    attributes,
    children,
    element,
  }: RenderElementProps) =>
    element.type === 'link' ? (
      <a {...attributes} href={String(element.url)}>
        {children}
      </a>
    ) : (
      <p {...attributes}>{children}</p>
    );
  const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => (
    <span {...attributes}>
      {leaf.bold ? <strong>{children}</strong> : children}
    </span>
  );
  const renderText = ({ attributes, children }: RenderTextProps) => (
    <span {...attributes} data-custom-text>
      {children}
    </span>
  );
  const mounted = render(
    <Plite editor={parent}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderText={renderText}
      />
    </Plite>
  );
  await act(async () => parent.update.nodes.remove({ at: [0, 1] }));
  assert.deepEqual(parent.read.children(), [paragraph('AB')]);
  const retained = mounted.container.querySelector('[data-plite-retained]');
  assert.equal(retained?.tagName, 'A');
  assert.equal(retained?.getAttribute('href'), '/retained');
  assert.equal(retained?.querySelector('strong')?.textContent, 'XYZ');
  assert.ok(retained?.querySelector('[data-custom-text]'));
  assert.equal(mounted.container.querySelectorAll('p').length, 1);
  assert.equal(
    mounted.container.textContent,
    'AXYZB',
    JSON.stringify({
      fragments: source.read.authored
        .changes()
        .items.flatMap((change) =>
          readAuthoredViewFragments(parent, change.id)
        ),
      html: mounted.container.innerHTML,
    })
  );
  await act(async () =>
    source.update.text.insert('!', { at: { path: [0, 1, 0], offset: 1 } })
  );
  assert.equal(retained?.querySelector('strong')?.textContent, 'X!YZ');
  assert.equal(mounted.container.textContent, 'AX!YZB');
  mounted.unmount();
});

it('splits proposed decorations at retained fragments without decorating their content', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const highlight: PliteDecorationSource<typeof source> = {
    id: 'proposed-highlight',
    read: ({ entry: [node, path] }) =>
      TextApi.isText(node)
        ? [
            {
              key: 'all',
              attributes: { 'data-highlight': true },
              range: {
                anchor: { path, offset: 0 },
                focus: { path, offset: node.text.length },
              },
            },
          ]
        : [],
  };
  const mounted = render(
    <Plite editor={parent} decorations={[highlight]}>
      <Editable />
    </Plite>
  );
  await act(async () =>
    parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } })
  );
  assert.equal(mounted.container.textContent, 'AXYZB');
  assert.deepEqual(
    [...mounted.container.querySelectorAll('[data-highlight]')].map(
      (node) => node.textContent
    ),
    ['A', 'B']
  );
  assert.equal(
    mounted.container.querySelector('[data-plite-retained] [data-highlight]'),
    null
  );
  for (let offset = 0; offset <= 2; offset++) {
    const dom = parent.api.dom.resolveDOMPoint(point(offset));
    assert.ok(dom);
    assert.deepEqual(
      parent.api.dom.resolvePlitePoint(dom, { exactMatch: true }),
      point(offset)
    );
  }
  mounted.unmount();
});

it('automatically mounts retained blocks and follows hidden accepted edits', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('Deleted'), paragraph('Visible')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.nodes.remove({ at: [0] });
  const { id } = source.read.authored.changes().items[0];
  const renderElement = ({ attributes, children }: RenderElementProps) => (
    <p {...attributes}>{children}</p>
  );
  const mounted = render(
    <Plite editor={parent}>
      <Editable renderElement={renderElement} />
    </Plite>
  );
  const retained = mounted.container.querySelector<HTMLElement>(
    '[data-plite-retained]'
  );
  assert.ok(retained);
  assert.equal(retained.tagName, 'P');
  assert.equal(retained.getAttribute('contenteditable'), 'false');
  assert.equal(retained.textContent, 'Deleted');
  assert.equal(
    mounted.container.querySelectorAll('[data-plite-editor]').length,
    1
  );
  const editor = readDOMFragmentEditor(retained);
  assert.ok(editor);
  const text = retained.querySelector('[data-plite-string]')?.firstChild;
  assert.ok(text);
  assert.deepEqual(
    editor.api.dom.resolvePlitePoint([text, 3], { exactMatch: true }),
    point(3)
  );
  assert.equal(
    parent.api.dom.resolvePlitePoint([text, 3], { exactMatch: true }),
    null
  );
  await act(async () =>
    source.update.text.insert('!', { at: { path: [1, 0], offset: 3 } })
  );
  assert.equal(retained.textContent, 'Deleted');
  await act(async () => source.update.text.insert('X', { at: point(3) }));
  assert.equal(retained.textContent, 'DelXeted');
  assert.equal(
    mounted.container.querySelectorAll('p')[1].textContent,
    'Vis!ible'
  );
  assert.throws(() => editor.update.text.insert('!'), /read-only/);
  await act(async () => {
    assert.equal(
      source.update.authored.decide({
        action: 'accept',
        selection: source.read.authored.select({ ids: [id] }),
      }).status,
      'blocked'
    );
  });
  assert.equal(retained.textContent, 'DelXeted');
  await act(async () => {
    assert.equal(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ ids: [id] }),
      }).status,
      'applied'
    );
  });
  assert.deepEqual(editor.read.children(), []);
  assert.equal(
    mounted.container.querySelectorAll('[data-plite-retained]').length,
    0,
    mounted.container.innerHTML
  );
  assert.equal(mounted.container.textContent, 'DelXetedVis!ible');
  mounted.unmount();
});

it('automatically mounts retained table rows directly inside tbody', async () => {
  const row = (text: string) => ({
    type: 'row',
    children: [{ type: 'cell', children: [paragraph(text)] }],
  });
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [
      { type: 'table', children: [row('Deleted'), row('Visible')] },
    ],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.nodes.remove({ at: [0, 0] });
  const Element = ({ attributes, children, element }: RenderElementProps) => {
    if (element.type === 'table') {
      return (
        <table {...attributes}>
          <tbody>{children}</tbody>
        </table>
      );
    }
    if (element.type === 'cell') return <td {...attributes}>{children}</td>;
    if (element.type === 'row') {
      return <tr {...attributes}>{children}</tr>;
    }
    return <p {...attributes}>{children}</p>;
  };
  const renderElement = (props: RenderElementProps) => <Element {...props} />;
  const mounted = render(
    <Plite editor={parent}>
      <Editable renderElement={renderElement} />
    </Plite>
  );
  const retained = mounted.container.querySelector<HTMLElement>(
    '[data-plite-retained]'
  );
  assert.ok(retained);
  assert.equal(retained.tagName, 'TR');
  assert.equal(retained.parentElement?.tagName, 'TBODY');
  assert.equal(mounted.container.querySelectorAll('table').length, 1);
  assert.equal(mounted.container.querySelectorAll('tbody > tr').length, 2);
  assert.equal(retained.textContent, 'Deleted');
  const editor = readDOMFragmentEditor(retained);
  assert.ok(editor);
  const text = retained.querySelector('[data-plite-string]')?.firstChild;
  assert.ok(text);
  assert.deepEqual(
    editor.api.dom.resolvePlitePoint([text, 2], { exactMatch: true }),
    { path: [0, 0, 0, 0, 0], offset: 2 }
  );
  await act(async () =>
    source.update.text.insert('X', { at: { path: [0, 0, 0, 0, 0], offset: 3 } })
  );
  assert.equal(retained.textContent, 'DelXeted');
  assert.equal(
    mounted.container.querySelectorAll('tbody > tr')[1].textContent,
    'Visible'
  );
  mounted.unmount();
});

it('preserves custom renderers for retained blocks docked to a direct text child', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [{ type: 'section', children: [paragraph('Deleted')] }],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const renderElement = ({
    attributes,
    children,
    element,
  }: RenderElementProps) =>
    element.type === 'section' ? (
      <section {...attributes}>{children}</section>
    ) : (
      <p {...attributes}>{children}</p>
    );
  const mounted = render(
    <Plite editor={parent}>
      <Editable renderElement={renderElement} />
    </Plite>
  );
  await act(async () => parent.update.nodes.remove({ at: [0, 0] }));
  const retained = mounted.container.querySelector('[data-plite-retained]');
  assert.equal(retained?.tagName, 'P');
  assert.equal(retained?.parentElement?.tagName, 'SECTION');
  assert.equal(retained?.textContent, 'Deleted');
  assert.deepEqual(parent.read.children(), [
    { type: 'section', children: [{ text: '' }] },
  ]);
  mounted.unmount();
});

it('keeps mounted retained blocks in document order through mode changes and decisions', async () => {
  let authorId = 'alice';
  const source = createEditor({
    extensions: [authored({ authorId: () => authorId })],
    initialValue: ['A', 'BB', 'C', 'D'].map(paragraph),
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const renderElement = ({ attributes, children }: RenderElementProps) => (
    <p {...attributes}>{children}</p>
  );
  const mounted = render(
    <Plite editor={parent}>
      <Editable renderElement={renderElement} />
    </Plite>
  );
  await act(async () => parent.update.nodes.remove({ at: [1] }));
  authorId = 'bob';
  await act(async () => parent.update.nodes.remove({ at: [1] }));
  const deleted = () =>
    [...mounted.container.querySelectorAll('[data-plite-retained]')].map(
      (node) => node.textContent
    );
  assert.deepEqual(deleted(), ['BB', 'C']);
  assert.equal(mounted.container.textContent, 'ABBCD');
  authorId = 'accepted';
  await act(async () =>
    source.update.text.insert('!', { at: { path: [1, 0], offset: 1 } })
  );
  assert.deepEqual(deleted(), ['B!B', 'C']);
  await act(async () =>
    parent.api.authored.setView({ intent: 'propose', projection: 'proposed' })
  );
  assert.deepEqual(deleted(), []);
  assert.equal(
    mounted.container.textContent,
    'AD',
    JSON.stringify({
      source: source.read.children(),
      proposed: parent.read.children(),
      view: parent.read.authored.view(),
      html: mounted.container.innerHTML,
    })
  );
  assert.deepEqual(parent.read.children(), ['A', 'D'].map(paragraph));
  assert.deepEqual(
    source.read.children(),
    ['A', 'B!B', 'C', 'D'].map(paragraph)
  );
  await act(async () => parent.api.authored.setView(markup));
  assert.deepEqual(deleted(), ['B!B', 'C']);
  await act(async () => {
    const result = source.update.authored.decide({
      action: 'reject',
      selection: source.read.authored.select({
        authorId: 'alice',
        status: 'pending',
      }),
    });
    assert.equal(result.status, 'applied');
  });
  assert.deepEqual(deleted(), ['C']);
  assert.equal(mounted.container.textContent, 'AB!BCD');
  await act(async () => {
    const result = source.update.authored.decide({
      action: 'accept',
      selection: source.read.authored.select({
        authorId: 'bob',
        status: 'pending',
      }),
    });
    assert.equal(result.status, 'applied');
  });
  assert.deepEqual(deleted(), []);
  assert.equal(mounted.container.textContent, 'AB!BD');
  assert.equal(
    mounted.container.querySelectorAll('[data-plite-editor]').length,
    1
  );
  mounted.unmount();
});

it('mounts retained blocks in an empty editable root and redocks them when content arrives', async () => {
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('Deleted')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const mounted = render(
    <Plite editor={parent}>
      <Editable />
    </Plite>
  );
  await act(async () => parent.update.nodes.remove({ at: [0] }));
  assert.equal(
    mounted.container.querySelector('[data-plite-retained]')?.textContent,
    'Deleted'
  );
  assert.equal(mounted.container.textContent, 'Deleted');
  await act(async () =>
    parent.update.nodes.insert(paragraph('Inserted'), { at: [0] })
  );
  assert.equal(mounted.container.textContent, 'DeletedInserted');
  assert.equal(
    mounted.container.querySelectorAll('[data-plite-retained]').length,
    1
  );
  mounted.unmount();
});

it('renders matching fragment identities in their own document roots', () => {
  const before = {
    children: [paragraph('Main removed'), paragraph('Main kept')],
    roots: { notes: [paragraph('Note removed'), paragraph('Note kept')] },
  };
  const source = createEditor({
    extensions: [authored({ authorId: 'alice' })],
    initialValue: before,
  });
  source.update((tx) => {
    tx.authored.propose();
    tx.changes.apply(
      DocumentChange.between(before, {
        children: [before.children[1]],
        roots: { notes: [before.roots.notes[1]] },
      })
    );
  });
  const main = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const notes = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup, root: 'notes' })
  );
  const mounted = render(
    <>
      <Plite editor={main}>
        <Editable aria-label="Main" />
      </Plite>
      <Plite editor={notes}>
        <Editable aria-label="Notes" />
      </Plite>
    </>
  );
  assert.equal(
    mounted.getByRole('textbox', { name: 'Main' }).textContent,
    'Main removedMain kept'
  );
  assert.equal(
    mounted.getByRole('textbox', { name: 'Notes' }).textContent,
    'Note removedNote kept'
  );
  mounted.unmount();
});
