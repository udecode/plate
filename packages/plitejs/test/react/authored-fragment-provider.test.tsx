import assert from 'node:assert/strict';

import { act, fireEvent, render, renderHook } from '@testing-library/react';
import {
  createEditorView,
  defineEditorSchema,
  DocumentChange,
  NodeApi,
  SelectionApi,
  schema,
  TextApi,
} from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';
import {
  createEditor,
  Editable,
  EditorRoot as ProductEditorRoot,
  useEditor,
  useEditorContext,
  useElementSelected,
  type RenderVoidProps,
  type RenderElementProps,
  type RenderLeafProps,
  type RenderTextProps,
  type DecorationSource,
} from 'plitejs/react';
import React from 'react';

import { hasActiveAnchors } from '../../src/core/anchor-state';
import {
  readAuthoredViewFragments,
  readAuthoredViewRenderSegments,
  type NativeAuthoredRenderSegment,
} from '../../src/core/authored-runtime';
import { getEditorRuntime } from '../../src/core/editor-runtime';
import {
  resolveDOMPointInRoot,
  resolveDOMRangeInRoot,
} from '../../src/dom/plugin/dom-editor';
import {
  readDOMFragmentEditor,
  readDOMFragmentParent,
} from '../../src/dom/plugin/dom-fragment-view';
import { PliteRuntimeView } from '../../src/react/components/plite';
import { applyContentRootSelectionMoveCommand } from '../../src/react/editable/content-root-navigation';
import {
  createContentRootViewBoundaryGraph,
  readContentRootRenderSegments,
} from '../../src/react/editable/content-root-owners';
import { getMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import {
  applyEditableCommand,
  applyModelOwnedTextInput,
} from '../../src/react/editable/mutation-controller';
import {
  getProjectedViewSelectionSlice,
  writeProjectedViewSelectionClipboardData,
} from '../../src/react/editable/projected-clipboard';
import { resolvePliteRangeFromDOMTextRange } from '../../src/react/editable/selection-dom-range';
import {
  resolveProjectedDOMSelection,
  resolveViewBoundaryDOMPoint,
} from '../../src/react/editable/selection-projected-dom';
import {
  createReactRuntimeViewEditor,
  PliteRuntimeProvider,
} from '../../src/react/hooks/use-plite-runtime';
import {
  createPliteViewSelection,
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  setPliteViewSelectionStoreKey,
  writePliteViewSelection,
  type PliteViewSelection,
} from '../../src/react/view-selection';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const markup = { intent: 'propose', projection: 'markup' } as const;
const point = (offset: number) => ({ path: [0, 0], offset });

const EditorRoot = ({ editor, ...props }: any) => (
  <PliteRuntimeProvider editor={editor}>
    <PliteRuntimeView {...props} directEditor={editor} />
  </PliteRuntimeProvider>
);

const editingMarkup = { intent: 'edit', projection: 'markup' } as const;

it('shares retained projection state while keeping mounted DOM views independent', async () => {
  const authoring = authored({ authorId: 'alice' });
  const parents: Array<ReturnType<typeof useEditorContext>> = [];
  const Surface = ({ label }: { label: string }) => {
    const editor = useEditorContext();

    if (!parents.includes(editor)) parents.push(editor);

    return <Editable aria-label={label} />;
  };
  const Fixture = () => {
    const editor = useEditor({
      plugins: [authoring],
      initialValue: [paragraph('Seed.')],
    });

    return (
      <ProductEditorRoot editor={editor}>
        <ProductEditorRoot authored={markup} editor={editor}>
          <Surface label="First markup" />
        </ProductEditorRoot>
        <ProductEditorRoot authored={markup} editor={editor}>
          <Surface label="Second markup" />
        </ProductEditorRoot>
      </ProductEditorRoot>
    );
  };
  const mounted = render(<Fixture />);

  assert.equal(parents.length, 2);
  await act(async () =>
    parents[0].update.text.delete({
      at: { anchor: point(1), focus: point(2) },
    })
  );
  await act(async () => parents[0].update.selection.set(point(0)));
  const retained = ['First markup', 'Second markup'].map((label) => {
    const root = mounted.getByRole('textbox', { name: label });
    const element = root.querySelector('[data-editor-retained]');

    assert.ok(element);
    assert.equal(element.getAttribute('data-editor-node-key'), null);
    const editor = readDOMFragmentEditor(element);

    assert.ok(editor);
    assert.ok(element.getAttribute('data-editor-node-key'));
    return editor;
  });

  assert.notEqual(retained[0], retained[1]);
  assert.equal(getEditorRuntime(retained[0]), getEditorRuntime(retained[1]));
  assert.equal(readDOMFragmentParent(retained[0]), parents[0]);
  assert.equal(readDOMFragmentParent(retained[1]), parents[1]);
  mounted.unmount();
});

it.each([
  { offset: 0, domOffset: 1, domText: 'qS' },
  { offset: 2, domOffset: 2, domText: 'eqd.' },
])(
  'repairs the native markup caret after an insertion at $offset',
  async ({ offset, domOffset, domText }) => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Seed.')],
    });
    const parent = createReactRuntimeViewEditor(
      createEditorView(source, { authored: markup })
    );
    parent.update.text.delete({ at: { anchor: point(1), focus: point(2) } });
    const mounted = render(
      <EditorRoot editor={parent}>
        <Editable />
      </EditorRoot>
    );
    const root = mounted.container.querySelector<HTMLElement>('[data-editor]');
    assert.ok(root);
    const runtime = getMountedEditableDOMRuntime(parent, root);
    assert.ok(runtime?.domRepairQueueRef.current);
    const native = window.getSelection();
    assert.ok(native);
    await act(async () => {
      parent.update.selection.set(point(offset));
      parent.update.text.insert('q');
    });
    const target = resolveDOMPointInRoot(parent, point(offset + 1), root);
    assert.ok(target);
    assert.equal(target[0].textContent, domText);
    assert.equal(target[1], domOffset);
    native.collapse(target[0], 0);
    runtime.inputController.state.textInputOwnership = 'model';
    target[0].nodeValue = 'stale';
    runtime.domRepairQueueRef.current.repairCaretAfterModelTextInsert();
    assert.equal(native.anchorOffset, 0);
    target[0].nodeValue = domText;
    runtime.domRepairQueueRef.current.repairCaretAfterModelTextInsert();
    assert.equal(native.anchorNode, target[0]);
    assert.equal(native.anchorOffset, domOffset);
    assert.equal(native.focusOffset, domOffset);
    assert.equal(
      root.querySelector('[data-editor-retained]')?.textContent,
      'e'
    );
    assert.equal(source.read.text.string([]), 'Seed.');
    mounted.unmount();
  }
);

it('shares native scope composition across readers and refreshes hidden accepted text', () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AB'), paragraph('CD'), paragraph('Unrelated')],
  });
  const views = Array.from({ length: 2 }, () =>
    createEditorView(source, { authored: markup })
  );
  views[0].update((tx) => {
    tx.authored.propose();
    tx.text.delete({
      at: {
        anchor: point(1),
        focus: { path: [1, 0], offset: 1 },
      },
    });
  });
  const read = (view: (typeof views)[number]) =>
    readAuthoredViewRenderSegments(view, view.read.children(), 'main', [0]);
  const text = (segments: readonly NativeAuthoredRenderSegment[]): string =>
    segments
      .map((segment) => {
        if (segment.kind === 'element') return text(segment.children);
        assert.ok(NodeApi.isText(segment.node));
        return segment.node.text.slice(segment.start, segment.end);
      })
      .join('');
  const initial = read(views[0]);
  assert.equal(text(initial), 'ABCD');
  assert.equal(read(views[1]), initial);
  assert.equal(
    readContentRootRenderSegments(views[0], views[0].key([0])!),
    initial
  );
  views[0].update.selection.set(point(0));
  assert.equal(read(views[1]), initial);

  source.update.text.insert('!', { at: { path: [1, 0], offset: 1 } });
  const updated = read(views[1]);
  assert.notEqual(updated, initial);
  assert.equal(text(updated), 'ABC!D');
  assert.equal(text(initial), 'ABCD');
  assert.equal(read(views[0]), updated);
  views[0].api.authored.setView({ intent: 'propose', projection: 'proposed' });
  assert.equal(
    readContentRootRenderSegments(views[0], views[0].key([0])!),
    null
  );
  views[0].api.authored.setView(markup);
  assert.equal(read(views[0]), updated);
  const independent = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: source.read.value(),
  });
  const independentView = createEditorView(independent, { authored: markup });
  assert.notEqual(read(independentView), updated);
  assert.equal(text(read(independentView)), 'ABC!D');
});

const AtomicSelection = ({ element }: RenderVoidProps) => {
  const selected = useElementSelected();
  return <span data-atomic-selected={selected}>@{String(element.label)}</span>;
};

it('keeps retained inline atoms on their surrounding text line and in rich copy', () => {
  const atoms = defineEditorSchema('schema:authored-retained-atom', {
    id: 'authored-retained-atom',
    version: 1,
    unknown: 'preserve',
    elements: { mention: { void: 'markable-inline' } },
    root: schema.content.not(schema.content.text()),
  });
  const initial = [
    {
      type: 'paragraph',
      children: [
        { text: 'A' },
        { type: 'mention', label: 'Alice', children: [{ text: '' }] },
        { text: 'B' },
      ],
    },
  ];
  const source = createEditor({
    plugins: [atoms, history(), authored({ authorId: 'alice' })],
    initialValue: initial,
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.selection.set({ path: [0, 2], offset: 0 });
  applyEditableCommand({
    command: { kind: 'delete', direction: 'backward' },
    editor: parent,
  });
  parent.api.history.undo();
  parent.api.history.redo();
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable renderVoid={(props) => <AtomicSelection {...props} />} />
    </EditorRoot>
  );
  assert.equal(
    mounted.container.querySelectorAll('[data-editor-retained] br').length,
    0
  );
  assert.equal(
    mounted.container.textContent?.replaceAll('\uFEFF', ''),
    'A@AliceB'
  );
  const graph = createContentRootViewBoundaryGraph(parent, []);
  const selection = createPliteViewSelection(graph, {
    anchor: { point: point(0) },
    focus: { point: point(2) },
  });
  assert.ok(selection);
  act(() => writePliteViewSelection(parent, selection));
  const copied = getProjectedViewSelectionSlice(parent);
  assert.equal(copied?.content.length, 1);
  const block = copied?.content[0];
  assert.ok(block && NodeApi.isElement(block));
  assert.deepEqual(
    block.children.filter(
      (child) => !TextApi.isText(child) || child.text !== ''
    ),
    initial[0].children
  );
  act(() => {
    writePliteViewSelection(parent, null);
    parent.update.selection.set(point(1));
    applyEditableCommand({
      command: { kind: 'move-selection', axis: 'horizontal', extend: true },
      editor: parent,
    });
  });
  const atom = getProjectedViewSelectionSlice(parent);
  assert.equal(atom?.content.map(NodeApi.string).join(''), '');
  const selected = atom?.content[0];
  assert.ok(selected && NodeApi.isElement(selected));
  assert.deepEqual(selected.children.filter(NodeApi.isElement), [
    initial[0].children[1],
  ]);
  assert.equal(
    mounted.container
      .querySelector('[data-atomic-selected]')
      ?.getAttribute('data-atomic-selected'),
    'true'
  );
  mounted.unmount();
});

it('copies retained block atoms even when their text range is empty', () => {
  const atoms = defineEditorSchema('schema:authored-retained-media', {
    id: 'authored-retained-media',
    version: 1,
    unknown: 'preserve',
    elements: { media: { void: 'block' } },
    root: schema.content.not(schema.content.text()),
  });
  const media = { type: 'media', label: 'Preview', children: [{ text: '' }] };
  const source = createEditor({
    plugins: [atoms, authored({ authorId: 'alice' })],
    initialValue: [paragraph('AB'), media, paragraph('CD')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.nodes.remove({ at: [1] });
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable renderVoid={(props) => <AtomicSelection {...props} />} />
    </EditorRoot>
  );
  act(() => {
    applyEditableCommand({ command: { kind: 'select-all' }, editor: parent });
  });
  assert.deepEqual(getProjectedViewSelectionSlice(parent)?.content, [
    paragraph('AB'),
    media,
    paragraph('CD'),
  ]);
  assert.equal(
    mounted.container
      .querySelector('[data-atomic-selected]')
      ?.getAttribute('data-atomic-selected'),
    'true'
  );
  mounted.unmount();
});

for (const position of ['first', 'last', 'only'] as const) {
  it(`selects and copies a retained block atom at the ${position} document boundary`, () => {
    const atoms = defineEditorSchema('schema:authored-boundary-media', {
      id: 'authored-boundary-media',
      version: 1,
      unknown: 'preserve',
      elements: { media: { void: 'block' } },
      root: schema.content.not(schema.content.text()),
    });
    const media = { type: 'media', label: 'Preview', children: [{ text: '' }] };
    const initial =
      position === 'only'
        ? [media]
        : position === 'first'
          ? [media, paragraph('AB')]
          : [paragraph('AB'), media];
    const source = createEditor({
      plugins: [atoms, authored({ authorId: 'alice' })],
      initialValue: initial,
    });
    const parent = createReactRuntimeViewEditor(
      createEditorView(source, { authored: markup })
    );
    parent.update.nodes.remove({ at: [position === 'last' ? 1 : 0] });
    const mounted = render(
      <EditorRoot editor={parent}>
        <Editable renderVoid={(props) => <AtomicSelection {...props} />} />
      </EditorRoot>
    );
    act(() => {
      applyEditableCommand({ command: { kind: 'select-all' }, editor: parent });
    });
    assert.deepEqual(getProjectedViewSelectionSlice(parent)?.content, initial);
    assert.equal(
      isPliteViewSelectionCollapsed(readPliteViewSelection(parent)!),
      false
    );
    if (position !== 'only') {
      act(() => {
        writePliteViewSelection(parent, null);
        parent.update.selection.set(point(position === 'first' ? 0 : 2));
        applyEditableCommand({
          command: {
            kind: 'move-selection',
            axis: 'horizontal',
            extend: true,
            reverse: position === 'first',
          },
          editor: parent,
        });
      });
      assert.deepEqual(getProjectedViewSelectionSlice(parent)?.content, [
        media,
      ]);
    }
    act(() => {
      applyEditableCommand({
        command: { kind: 'insert-text', text: 'X' },
        editor: parent,
      });
    });
    assert.deepEqual(
      parent.read.children(),
      position === 'only' ? [] : [paragraph('AB')]
    );
    assert.equal(
      mounted.container
        .querySelector('[data-atomic-selected]')
        ?.getAttribute('data-atomic-selected'),
      'true'
    );
    mounted.unmount();
  });
}

it('round-trips ordinary ranges inside composed text without including retained neighbors', () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AB'), paragraph('CD')],
  });
  const view = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  view.update.text.delete({
    at: { anchor: point(1), focus: { path: [1, 0], offset: 1 } },
  });
  const mounted = render(
    <EditorRoot editor={view}>
      <Editable />
    </EditorRoot>
  );
  for (const backward of [false, true]) {
    const range = backward
      ? { anchor: point(2), focus: point(1) }
      : { anchor: point(1), focus: point(2) };
    const domRange = view.api.dom.resolveDOMRange(range);
    assert.ok(domRange);
    assert.equal(domRange.toString(), 'D');
    assert.equal(domRange.startContainer, domRange.endContainer);
    assert.equal(domRange.startOffset, 0);
    assert.equal(domRange.endOffset, 1);
    assert.deepEqual(
      resolvePliteRangeFromDOMTextRange(view, domRange, {
        requireCurrentRuntimeBinding: true,
      }),
      { anchor: point(1), focus: point(2) }
    );
    for (const offset of [0, 1]) {
      const collapsed = domRange.cloneRange();
      collapsed.setStart(domRange.startContainer, offset);
      collapsed.collapse(true);
      assert.deepEqual(resolvePliteRangeFromDOMTextRange(view, collapsed), {
        anchor: point(offset + 1),
        focus: point(offset + 1),
      });
    }
  }
  mounted.unmount();
});

for (const input of [
  'native',
  'keyboard',
  'projected',
  'target-range',
] as const) {
  it(`keeps an ordinary replacement beside its retained original paragraph through ${input} selection`, async () => {
    const value = [paragraph('AB'), paragraph('CD')];
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: value,
    });
    const view = createReactRuntimeViewEditor(
      createEditorView(source, { authored: markup })
    );
    if (input === 'target-range') {
      applyEditableCommand({
        editor: view,
        command: {
          kind: 'delete-fragment',
          direction: 'backward',
          selection: { anchor: point(1), focus: { path: [1, 0], offset: 1 } },
        },
      });
    } else {
      view.update.text.delete({
        at: { anchor: point(1), focus: { path: [1, 0], offset: 1 } },
      });
    }
    const mounted = render(
      <EditorRoot editor={view}>
        <Editable
          renderElement={({ attributes, children }) => (
            <p {...attributes}>{children}</p>
          )}
        />
      </EditorRoot>
    );
    const texts = () =>
      [...mounted.container.querySelectorAll('p')].map(
        (node) => node.textContent
      );
    assert.deepEqual(texts(), ['AB', 'CD']);
    await act(async () => {
      if (input === 'keyboard') {
        view.update.selection.set(point(2));
        applyEditableCommand({
          editor: view,
          command: {
            kind: 'move-selection',
            axis: 'horizontal',
            reverse: true,
            extend: true,
          },
        });
        assert.equal(readPliteViewSelection(view), null);
        assert.deepEqual(view.read.selection(), {
          anchor: point(2),
          focus: point(1),
        });
        applyEditableCommand({
          editor: view,
          command: {
            kind: 'move-selection',
            axis: 'horizontal',
            reverse: true,
            extend: true,
          },
        });
        assert.deepEqual(
          getProjectedViewSelectionSlice(view)?.content.map(NodeApi.string),
          ['CD']
        );
        applyEditableCommand({
          editor: view,
          command: { kind: 'move-selection', axis: 'horizontal', extend: true },
        });
        assert.equal(readPliteViewSelection(view), null);
        assert.deepEqual(view.read.selection(), {
          anchor: point(2),
          focus: point(1),
        });
      } else if (input === 'projected') {
        view.update.selection.set(point(2));
        const graph = createContentRootViewBoundaryGraph(view, []);
        writePliteViewSelection(
          view,
          createPliteViewSelection(graph, {
            anchor: { point: point(2), affinity: 'backward' },
            focus: { point: point(1), affinity: 'forward' },
          })
        );
        assert.deepEqual(
          getProjectedViewSelectionSlice(view)?.content.map(NodeApi.string),
          ['D']
        );
      } else {
        view.update.selection.set({ anchor: point(1), focus: point(2) });
      }
      applyModelOwnedTextInput({
        editor: view,
        inputType: 'insertText',
        data: 'X',
        ...(input === 'target-range' && {
          selection: { anchor: point(1), focus: point(2) },
        }),
      });
    });
    assert.equal(view.read.text.string([]), 'AX');
    assert.deepEqual(source.read.children(), value);
    assert.deepEqual(
      texts(),
      ['AB', 'CDX'],
      JSON.stringify(source.read.value())
    );
    mounted.unmount();
  });
}

for (const nested of [false, true]) {
  it(`types after a restored paragraph end with default affinity${nested ? ' inside a table cell' : ''}`, async () => {
    const paragraphs = [paragraph('AB'), paragraph('CD')];
    const value = nested
      ? [
          {
            type: 'table',
            children: [
              {
                type: 'row',
                children: [{ type: 'cell', children: paragraphs }],
              },
            ],
          },
        ]
      : paragraphs;
    const prefix = nested ? [0, 0, 0] : [];
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: value,
    });
    const view = createReactRuntimeViewEditor(
      createEditorView(source, { authored: markup })
    );
    view.update.text.delete({
      at: {
        anchor: { path: [...prefix, 0, 0], offset: 1 },
        focus: { path: [...prefix, 1, 0], offset: 1 },
      },
    });
    const mounted = render(
      <EditorRoot editor={view}>
        <Editable
          renderElement={({ attributes, children, element }) =>
            element.type === 'paragraph' ? (
              <p {...attributes}>{children}</p>
            ) : (
              <div {...attributes}>{children}</div>
            )
          }
        />
      </EditorRoot>
    );
    assert.deepEqual(
      [...mounted.container.querySelectorAll('p')].map(
        (node) => node.textContent
      ),
      ['AB', 'CD']
    );
    await act(async () => {
      view.update.selection.set({ path: [...prefix, 0, 0], offset: 2 });
      applyModelOwnedTextInput({
        editor: view,
        inputType: 'insertText',
        data: '!',
      });
    });
    assert.deepEqual(
      [...mounted.container.querySelectorAll('p')].map(
        (node) => node.textContent
      ),
      ['AB', 'CD!']
    );
    mounted.unmount();
  });
}

it('moves to a proposed document edge using public selection coordinates', async () => {
  const source = renderHook(() =>
    useEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [
        paragraph('AB'),
        { type: 'quote', children: [paragraph('CD')] },
      ],
    })
  );
  let view: ReturnType<typeof useEditorContext> | undefined;
  const Surface = () => {
    view = useEditorContext();
    return <Editable aria-label="Proposed" />;
  };
  const mounted = render(
    <ProductEditorRoot
      authored={{ intent: 'propose', projection: 'proposed' }}
      editor={source.result.current}
    >
      <Surface />
    </ProductEditorRoot>
  );
  assert.ok(view);
  const editor = view;
  await act(async () =>
    editor.update.selection.set({ path: [1, 0, 0], offset: 2 })
  );
  fireEvent.keyDown(mounted.getByRole('textbox', { name: 'Proposed' }), {
    key: 'Home',
    ctrlKey: true,
  });
  assert.deepEqual(editor.read.selection(), {
    anchor: point(0),
    focus: point(0),
  });
  mounted.unmount();
  source.unmount();
});

it('keeps composed children in their native partial-render slots', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [
      {
        type: 'quote',
        children: ['AB', 'CD', 'Gap', 'EF', 'GH'].map(paragraph),
      },
    ],
  });
  const view = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  view.update((tx) => {
    tx.authored.propose();
    tx.text.delete({
      at: {
        anchor: { path: [0, 0, 0], offset: 1 },
        focus: { path: [0, 1, 0], offset: 1 },
      },
    });
    tx.text.delete({
      at: {
        anchor: { path: [0, 2, 0], offset: 1 },
        focus: { path: [0, 3, 0], offset: 1 },
      },
    });
  });
  const mounted = render(
    <EditorRoot editor={view}>
      <Editable
        renderElement={({ attributes, children, element, slots }) =>
          element.type === 'quote' ? (
            <blockquote {...attributes}>
              {element.children.map((_, index) => (
                <div data-slot={index} key={view.key([0, index])}>
                  {slots.children({ from: index, to: index })}
                </div>
              ))}
            </blockquote>
          ) : (
            <p {...attributes}>{children}</p>
          )
        }
      />
    </EditorRoot>
  );
  const texts = () =>
    [...mounted.container.querySelectorAll('[data-slot]')].map(
      (node) => node.textContent
    );
  assert.deepEqual(texts(), ['ABCD', 'Gap', 'EFGH']);
  assert.equal(mounted.container.querySelectorAll('p').length, 5);
  await act(async () =>
    source.update.text.insert('!', { at: { path: [0, 1, 0], offset: 1 } })
  );
  assert.deepEqual(texts(), ['ABC!D', 'Gap', 'EFGH']);
  await act(async () =>
    view.update.text.insert('?', { at: { path: [0, 1, 0], offset: 1 } })
  );
  assert.deepEqual(texts(), ['ABC!D', 'G?ap', 'EFGH']);
  await act(async () =>
    source.update.authored.decide({
      action: 'reject',
      selection: source.read.authored.select({ status: 'pending' }),
    })
  );
  assert.deepEqual(texts(), ['AB', 'C!D', 'Gap', 'EF', 'GH']);
  mounted.unmount();
});

it('refreshes native text after switching a shared runtime to composed markup', async () => {
  const authoring = authored({ authorId: 'alice' });
  let parent: ReturnType<typeof useEditorContext> | undefined;
  const Capture = () => {
    parent = useEditorContext();
    return (
      <Editable
        renderElement={({ attributes, children, element }) =>
          element.type === 'quote' ? (
            <blockquote {...attributes}>{children}</blockquote>
          ) : (
            <p {...attributes}>{children}</p>
          )
        }
      />
    );
  };
  const Fixture = () => {
    const editor = useEditor({
      plugins: [authoring],
      initialValue: [
        paragraph('AB'),
        { type: 'quote', children: [paragraph('CD')] },
      ],
    });
    return (
      <ProductEditorRoot editor={editor}>
        <ProductEditorRoot editor={editor}>
          <Editable />
        </ProductEditorRoot>
        <ProductEditorRoot
          authored={{ intent: 'propose', projection: 'proposed' }}
          editor={editor}
        >
          <Capture />
        </ProductEditorRoot>
      </ProductEditorRoot>
    );
  };
  const mounted = render(<Fixture />);
  assert.ok(parent);
  const view = parent;
  await act(async () => {
    applyEditableCommand({
      editor: view,
      command: {
        kind: 'delete-fragment',
        direction: 'backward',
        selection: { anchor: point(1), focus: { path: [1, 0, 0], offset: 1 } },
      },
    });
  });
  await act(async () => view.plugin(authoring).api.setView(markup));
  assert.deepEqual(
    [...mounted.container.querySelectorAll('p')].map(
      (node) => node.textContent
    ),
    ['ABD', 'CD']
  );
  await act(async () => view.update.selection.set(point(2)));
  await act(async () => {
    applyModelOwnedTextInput({
      data: '!',
      editor: view,
      inputType: 'insertText',
      selection: { anchor: point(2), focus: point(2) },
    });
  });
  assert.equal(view.read.text.string([]), 'AD!');
  assert.deepEqual(
    [...mounted.container.querySelectorAll('p')].map(
      (node) => node.textContent
    ),
    ['ABD!', 'CD']
  );
  mounted.unmount();
});

it('refreshes a composed branch when native input changes only ordinary text', async () => {
  const value = [
    paragraph('AB'),
    { type: 'quote', children: [paragraph('CD')] },
  ];
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: value,
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.changes.apply(
    DocumentChange.between({ children: value }, { children: [paragraph('AD')] })
  );
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable
        renderElement={({ attributes, children, element }) =>
          element.type === 'quote' ? (
            <blockquote {...attributes}>{children}</blockquote>
          ) : (
            <p {...attributes}>{children}</p>
          )
        }
      />
    </EditorRoot>
  );
  assert.deepEqual(
    [...mounted.container.querySelectorAll('p')].map(
      (node) => node.textContent
    ),
    ['ABD', 'CD']
  );
  await act(async () => {
    applyModelOwnedTextInput({
      data: '!',
      editor: parent,
      inputType: 'insertText',
      selection: { anchor: point(2), focus: point(2) },
    });
  });
  assert.equal(parent.read.text.string([]), 'AD!');
  assert.deepEqual(
    [...mounted.container.querySelectorAll('p')].map(
      (node) => node.textContent
    ),
    ['ABD!', 'CD']
  );
  mounted.unmount();
});

it('composes separate retained ranges through the root and follows later edits', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: ['AB', 'CD', 'Gap', 'EF', 'GH'].map(paragraph),
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update((tx) => {
    tx.authored.propose();
    tx.text.delete({
      at: { anchor: point(1), focus: { path: [1, 0], offset: 1 } },
    });
    tx.text.delete({
      at: {
        anchor: { path: [2, 0], offset: 1 },
        focus: { path: [3, 0], offset: 1 },
      },
    });
  });
  assert.deepEqual(parent.read.children().map(NodeApi.string), [
    'AD',
    'Gap',
    'EH',
  ]);
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable
        renderElement={({ attributes, children }) => (
          <p {...attributes}>{children}</p>
        )}
      />
    </EditorRoot>
  );
  const texts = () =>
    [...mounted.container.querySelectorAll('p')].map(
      (node) => node.textContent
    );
  assert.deepEqual(texts(), ['AB', 'CD', 'Gap', 'EF', 'GH']);
  await act(async () =>
    source.update.text.insert('!', { at: { path: [1, 0], offset: 1 } })
  );
  assert.deepEqual(texts(), ['AB', 'C!D', 'Gap', 'EF', 'GH']);
  await act(async () =>
    parent.update.text.insert('?', { at: { path: [1, 0], offset: 1 } })
  );
  assert.deepEqual(texts(), ['AB', 'C!D', 'G?ap', 'EF', 'GH']);
  await act(async () => {
    assert.equal(
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ status: 'pending' }),
      }).status,
      'applied'
    );
  });
  assert.deepEqual(texts(), ['AB', 'C!D', 'Gap', 'EF', 'GH']);
  assert.equal(
    mounted.container.querySelector('[data-editor-retained]')?.outerHTML ??
      null,
    null
  );
  mounted.unmount();
});

for (const fixture of [
  {
    name: 'into a quote',
    value: [paragraph('AB'), { type: 'quote', children: [paragraph('CD')] }],
    anchor: point(1),
    focus: { path: [1, 0, 0], offset: 1 },
    proposedPoint: point(2),
    tags: ['P', 'BLOCKQUOTE'],
  },
  {
    name: 'out of a quote',
    value: [{ type: 'quote', children: [paragraph('AB')] }, paragraph('CD')],
    anchor: { path: [0, 0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 1 },
    proposedPoint: { path: [0, 0, 0], offset: 2 },
    tags: ['BLOCKQUOTE', 'P'],
  },
  {
    name: 'between quotes',
    value: [
      { type: 'quote', children: [paragraph('AB')] },
      { type: 'quote', children: [paragraph('CD')] },
    ],
    anchor: { path: [0, 0, 0], offset: 1 },
    focus: { path: [1, 0, 0], offset: 1 },
    proposedPoint: { path: [0, 0, 0], offset: 2 },
    tags: ['BLOCKQUOTE', 'BLOCKQUOTE'],
  },
]) {
  it(`renders native retained ancestry and both move placements ${fixture.name}`, async () => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: fixture.value,
    });
    const parent = createReactRuntimeViewEditor(
      createEditorView(source, { authored: markup })
    );
    parent.update.text.delete({
      at: { anchor: fixture.anchor, focus: fixture.focus },
    });
    const mounted = render(
      <EditorRoot editor={parent}>
        <Editable
          renderElement={({ attributes, children, element }) =>
            element.type === 'quote' ? (
              <blockquote {...attributes}>{children}</blockquote>
            ) : (
              <p {...attributes}>{children}</p>
            )
          }
        />
      </EditorRoot>
    );
    const root = mounted.container.querySelector<HTMLElement>('[data-editor]');
    assert.ok(root);
    assert.deepEqual(
      [...root.children].map((node) => node.tagName),
      fixture.tags
    );
    assert.deepEqual(
      [...root.querySelectorAll('p')].map((node) => node.textContent),
      ['ABD', 'CD']
    );
    assert.equal(root.querySelectorAll('p p, p blockquote').length, 0);
    const ordinary = [...root.querySelectorAll('[data-editor-string]')].find(
      (node) =>
        node.textContent === 'D' && !node.closest('[data-editor-retained]')
    )?.firstChild;
    assert.ok(ordinary);
    assert.deepEqual(
      parent.api.dom.resolvePoint([ordinary, 1], { exactMatch: true }),
      fixture.proposedPoint
    );
    assert.deepEqual(parent.api.dom.resolveDOMPoint(fixture.proposedPoint), [
      ordinary,
      1,
    ]);
    const retained = [...root.querySelectorAll('[data-editor-string]')].filter(
      (node) => node.closest('[data-editor-retained]')
    );
    assert.equal(retained.map((node) => node.textContent).join(''), 'BCD');
    for (const node of retained) {
      const view = readDOMFragmentEditor(node);
      assert.ok(view && node.firstChild);
      const nativePoint = view.api.dom.resolvePoint([node.firstChild, 1], {
        exactMatch: true,
      });
      assert.ok(nativePoint);
      assert.deepEqual(view.api.dom.resolveDOMPoint(nativePoint), [
        node.firstChild,
        1,
      ]);
    }
    await act(async () =>
      source.update.text.insert('!', { at: fixture.focus })
    );
    assert.deepEqual(
      [...root.querySelectorAll('p')].map((node) => node.textContent),
      ['ABD', 'C!D']
    );
    await act(async () => {
      assert.equal(
        source.update.authored.decide({
          action: 'reject',
          selection: source.read.authored.select({
            authorId: 'alice',
            status: 'pending',
          }),
        }).status,
        'applied'
      );
    });
    assert.equal(
      root.querySelector('[data-editor-retained]')?.outerHTML ?? null,
      null
    );
    assert.deepEqual(
      [...root.querySelectorAll('p')].map((node) => node.textContent),
      ['AB', 'C!D']
    );
    mounted.unmount();
  });
}

for (const affinity of ['backward', 'forward'] as const) {
  it(`keeps ${affinity} input in the correct rendered paragraph after a range deletion`, async () => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('AB'), paragraph('CD')],
    });
    const parent = createReactRuntimeViewEditor(
      createEditorView(source, { authored: markup })
    );
    parent.update.text.delete({
      at: { anchor: point(1), focus: { path: [1, 0], offset: 1 } },
    });
    const mounted = render(
      <EditorRoot editor={parent}>
        <Editable
          renderElement={({ attributes, children }) => (
            <p {...attributes}>{children}</p>
          )}
        />
      </EditorRoot>
    );
    await act(async () => {
      parent.update.selection.set(
        SelectionApi.text({ anchor: point(1), focus: point(1) }, { affinity })
      );
      parent.update.text.insert('X');
    });
    assert.deepEqual(
      [...mounted.container.querySelectorAll('p')].map(
        (node) => node.textContent
      ),
      affinity === 'backward' ? ['AXB', 'CD'] : ['AB', 'CXD']
    );
    const text = [
      ...mounted.container.querySelectorAll('[data-editor-string]'),
    ].find((node) => node.textContent === 'X')?.firstChild;
    assert.ok(text);
    assert.deepEqual(
      parent.api.dom.resolvePoint([text, 1], { exactMatch: true }),
      point(2)
    );
    assert.deepEqual(parent.api.dom.resolveDOMPoint(point(2)), [text, 1]);
    mounted.unmount();
  });
}

it('keeps the caret on the chosen side when collapsing across retained text', () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
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
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('Before middle after')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(7), focus: point(13) } });
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
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
    [...mounted.container.querySelectorAll('[data-editor-view-selection]')]
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
    mounted.container.querySelector('[data-editor-view-selection]'),
    null
  );
  assert.equal(hasActiveAnchors(source), false);
  mounted.unmount();
});

it('keeps both sides of a retained gap mapped through accepted path and text changes', () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
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
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
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
      plugins: [authored({ authorId: 'alice' })],
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
    if (fixture.start === 1) {
      assert.equal(selection, null);
      assert.deepEqual(parent.read.selection(), {
        anchor: point(1),
        focus: point(2),
      });
      assert.equal(
        parent.read.text.string({ anchor: point(1), focus: point(2) }),
        ' '
      );
    } else {
      assert.ok(selection);
      assert.equal(isPliteViewSelectionCollapsed(selection), true);
      assert.deepEqual(selection.focus.point, point(fixture.start));
    }
    assert.equal(NodeApi.string(source.read.children()[0]), fixture.text);
  });
}

it('counts retained block boundaries as character steps', () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
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
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('A shared draft.')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(2), focus: point(8) } });
  parent.update.selection.set({ anchor: point(1), focus: point(1) });
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );
  const lengths: string[] = [];
  const selectedText = () => {
    const projected = getProjectedViewSelectionSlice(parent);
    if (projected) return projected.content.map(NodeApi.string).join('');
    const selected = parent.read.selection();
    return selected && !SelectionApi.isNode(selected)
      ? parent.read.slice
          .get({ at: selected })
          .content.map(NodeApi.string)
          .join('')
      : '';
  };
  for (let index = 0; index < 8; index++) {
    await act(async () => {
      const selection = parent.read.selection();
      assert.ok(!SelectionApi.isNode(selection));
      const result = applyContentRootSelectionMoveCommand({
        command: {
          kind: 'move-selection',
          axis: 'horizontal',
          extend: true,
          reverse: false,
        },
        editor: parent,
        selection,
      });
      assert.equal(result.handled, true);
    });
    const view = readPliteViewSelection(parent);
    if (index > 0 && index < 6) assert.ok(view?.focus.fragmentId);
    lengths.push(selectedText());
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
    assert.equal(selectedText(), expected);
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
  const root = mounted.container.querySelector<HTMLElement>('[data-editor]');
  const before = root?.querySelector('[data-editor-string]')?.firstChild;
  const retained = root?.querySelector(
    '[data-editor-retained] [data-editor-string]'
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
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('XYZ')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(0), focus: point(3) } });
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );
  const root = mounted.container.querySelector<HTMLElement>('[data-editor]');
  const nodes = [
    ...mounted.container.querySelectorAll(
      '[data-editor-string], [data-editor-zero-width]'
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

it('keeps a retained selection bound to the markup view when storage is shared', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );

  parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
  setPliteViewSelectionStoreKey(parent, source);
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );
  const root = mounted.container.querySelector<HTMLElement>('[data-editor]');
  const strings = [
    ...mounted.container.querySelectorAll('[data-editor-string]'),
  ].map((node) => node.firstChild);
  const anchorNode = strings[0];
  const focusNode = strings[1];
  const domSelection = window.getSelection();

  assert.ok(root && anchorNode && focusNode && domSelection);
  domSelection.setBaseAndExtent(anchorNode, 1, focusNode, 2);
  const selection = resolveProjectedDOMSelection({
    domSelection,
    editor: parent,
    editorElement: root,
  });

  assert.ok(selection);
  await act(async () => {
    writePliteViewSelection(parent, selection);
    parent.update.selection.set(point(1));
  });
  assert.ok(readPliteViewSelection(parent));
  assert.equal(
    getProjectedViewSelectionSlice(parent)
      ?.content.map(NodeApi.string)
      .join(''),
    'XY'
  );
  mounted.unmount();
});

it('copies retained blocks in visible order without merging their paragraph boundaries', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
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
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
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
    [...mounted.container.querySelectorAll('[data-editor-view-selection]')].map(
      (node) => node.textContent
    ),
    ['ore', 'Deleted', 'Af']
  );
  mounted.unmount();
});

it('edits text inside a retained deletion without changing the accepted original', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' }), history()],
    initialValue: [paragraph('Alpha bravo omega')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(6), focus: point(11) } });
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );
  const root = mounted.container.querySelector<HTMLElement>('[data-editor]');
  const retained = root?.querySelector('[data-editor-retained="delete"]');
  const text = retained?.querySelector('[data-editor-string]')?.firstChild;
  const nativeSelection = window.getSelection();
  assert.ok(root && retained && text && nativeSelection);
  nativeSelection.setBaseAndExtent(text, 2, text, 2);
  const selection = resolveProjectedDOMSelection({
    domSelection: nativeSelection,
    editor: parent,
    editorElement: root,
  });
  assert.ok(selection?.anchor.fragmentId);
  await act(async () => {
    writePliteViewSelection(parent, selection);
    applyModelOwnedTextInput({
      data: 'X',
      editor: parent,
      inputType: 'insertText',
    });
  });
  const retainedText = () =>
    [...root.querySelectorAll('[data-editor-retained="delete"]')]
      .map((node) => node.textContent)
      .join('');
  assert.equal(retainedText(), 'brXavo');
  assert.equal(
    source.read.children().map(NodeApi.string).join(''),
    'Alpha bravo omega'
  );
  assert.equal(
    parent.read.children().map(NodeApi.string).join(''),
    'Alpha  omega'
  );
  await act(async () => {
    applyModelOwnedTextInput({
      data: 'Y',
      editor: parent,
      inputType: 'insertText',
    });
  });
  assert.equal(retainedText(), 'brXYavo');
  await act(async () => {
    applyEditableCommand({
      command: { kind: 'delete', direction: 'backward' },
      editor: parent,
    });
  });
  assert.equal(retainedText(), 'brXavo');
  await act(async () => {
    applyEditableCommand({
      command: { kind: 'history', direction: 'undo' },
      editor: parent,
    });
  });
  assert.equal(retainedText(), 'brXYavo');
  await act(async () => {
    applyEditableCommand({
      command: { kind: 'history', direction: 'redo' },
      editor: parent,
    });
    await Promise.resolve();
    assert.ok(
      readPliteViewSelection(parent)?.anchor.fragmentId,
      'redo retains fragment selection'
    );
    applyModelOwnedTextInput({
      data: 'Z',
      editor: parent,
      inputType: 'insertText',
    });
  });
  assert.equal(retainedText(), 'brXZavo');
  assert.equal(
    source.read.children().map(NodeApi.string).join(''),
    'Alpha bravo omega'
  );
  mounted.unmount();
});

it('pastes and splits retained text while protecting the original deletion', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' }), history()],
    initialValue: [paragraph('Alpha bravo omega')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(6), focus: point(11) } });
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );
  const root = mounted.container.querySelector<HTMLElement>('[data-editor]');
  const nativeSelection = window.getSelection();
  assert.ok(root && nativeSelection);
  const select = (anchor: number, focus = anchor) => {
    const text = root.querySelector(
      '[data-editor-retained="delete"] [data-editor-string]'
    )?.firstChild;
    assert.ok(text);
    nativeSelection.setBaseAndExtent(text, anchor, text, focus);
    const selection = resolveProjectedDOMSelection({
      domSelection: nativeSelection,
      editor: parent,
      editorElement: root,
    });
    assert.ok(selection?.anchor.fragmentId);
    writePliteViewSelection(parent, selection);
  };
  const retainedText = () =>
    [...root.querySelectorAll('[data-editor-retained="delete"]')]
      .map((node) => node.textContent)
      .join('');
  await act(async () => {
    select(2);
    applyEditableCommand({
      command: { kind: 'delete', direction: 'backward' },
      editor: parent,
    });
  });
  assert.equal(retainedText(), 'bravo');
  await act(async () => {
    select(1, 3);
    applyModelOwnedTextInput({
      data: 'Q',
      editor: parent,
      inputType: 'insertText',
    });
  });
  assert.equal(retainedText(), 'bQravo');
  await act(async () => {
    applyEditableCommand({
      command: { kind: 'delete', direction: 'backward' },
      editor: parent,
    });
  });
  assert.equal(retainedText(), 'bravo');
  await act(async () => {
    select(2);
    applyEditableCommand({
      command: {
        kind: 'insert-data',
        data: {
          files: [],
          types: ['text/plain'],
          getData: (type: string) => (type === 'text/plain' ? 'YZ' : ''),
        } as unknown as DataTransfer,
      },
      editor: parent,
    });
  });
  assert.equal(retainedText(), 'brYZavo');
  await act(async () => {
    applyEditableCommand({
      command: { kind: 'insert-break', variant: 'paragraph' },
      editor: parent,
    });
  });
  assert.deepEqual(
    [...root.querySelectorAll('[data-editor-node="element"]')].map(
      (node) => node.textContent
    ),
    ['Alpha brYZ', 'avo omega']
  );
  await act(async () => {
    applyModelOwnedTextInput({
      data: 'X',
      editor: parent,
      inputType: 'insertText',
    });
  });
  assert.equal(retainedText(), 'brYZXavo');
  assert.equal(
    source.read.children().map(NodeApi.string).join(''),
    'Alpha bravo omega'
  );
  assert.equal(
    parent.read.children().map(NodeApi.string).join(''),
    'Alpha  omega'
  );
  mounted.unmount();
});

it('selects, copies and protects native retained content across both document affinities', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );
  const root = mounted.container.querySelector<HTMLElement>('[data-editor]');
  const domSelection = window.getSelection();
  assert.ok(root && domSelection);
  const select = (
    anchor: number,
    anchorOffset: number,
    focus: number,
    focusOffset: number
  ): PliteViewSelection => {
    const strings = [
      ...mounted.container.querySelectorAll('[data-editor-string]'),
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
        '[data-editor-retained] [data-editor-view-selection]'
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
  assert.deepEqual(source.read.children(), snapshot.children);
  assert.equal(
    root.querySelector('[data-editor-retained="delete"]')?.textContent,
    'X!YZ'
  );
  mounted.unmount();
});

it('deletes the live document after select-all spans retained authored content', async () => {
  const source = createEditor({
    plugins: [history(), authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
  parent.api.authored.setView(editingMarkup);
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );

  await act(async () => {
    applyEditableCommand({ command: { kind: 'select-all' }, editor: parent });
  });

  assert.equal(
    getProjectedViewSelectionSlice(parent)
      ?.content.map(NodeApi.string)
      .join(''),
    'AXYZB'
  );
  assert.deepEqual(parent.read.selection(), {
    anchor: point(0),
    focus: point(2),
  });

  await act(async () => {
    applyEditableCommand({
      command: { kind: 'delete-fragment' },
      editor: parent,
    });
  });

  assert.deepEqual(parent.read.children(), [paragraph('')]);
  assert.equal(Object.isFrozen(parent.read.children()[0]), true);
  assert.equal(
    Object.isFrozen(
      NodeApi.isElement(parent.read.children()[0])
        ? parent.read.children()[0].children
        : null
    ),
    true
  );
  assert.equal(
    Object.isFrozen(
      NodeApi.isElement(parent.read.children()[0])
        ? parent.read.children()[0].children[0]
        : null
    ),
    true
  );
  assert.deepEqual(parent.read.selection(), {
    anchor: point(0),
    focus: point(0),
  });
  assert.equal(readPliteViewSelection(parent), null);

  await act(async () => parent.api.history.undo());
  assert.deepEqual(parent.read.children(), [paragraph('AB')]);

  await act(async () => parent.api.history.redo());
  assert.deepEqual(parent.read.children(), [paragraph('')]);
  assert.deepEqual(parent.read.selection(), {
    anchor: point(0),
    focus: point(0),
  });
  assert.equal(readPliteViewSelection(parent), null);
  mounted.unmount();
});

it('deletes live ranges when a projected selection crosses retained content', async () => {
  const source = createEditor({
    plugins: [history(), authored({ authorId: 'alice' })],
    initialValue: [paragraph('LAXYZBR')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(2), focus: point(5) } });
  parent.api.authored.setView(editingMarkup);
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );
  const root = mounted.container.querySelector<HTMLElement>('[data-editor]');
  const domSelection = window.getSelection();
  assert.ok(root && domSelection);

  for (const backward of [false, true]) {
    const strings = [
      ...mounted.container.querySelectorAll('[data-editor-string]'),
    ].map((node) => node.firstChild);
    const startNode = strings[0];
    const endNode = strings[2];
    assert.ok(startNode && endNode);

    domSelection.setBaseAndExtent(
      backward ? endNode : startNode,
      1,
      backward ? startNode : endNode,
      1
    );
    const selected = resolveProjectedDOMSelection({
      domSelection,
      editor: parent,
      editorElement: root,
    });
    assert.ok(selected);
    assert.equal(selected.segments.backward, backward);
    assert.equal(domSelection.toString(), 'AXYZB');
    assert.equal(
      selected.segments.parts.filter((part) => part.fragment).length,
      1
    );

    await act(async () => {
      writePliteViewSelection(parent, selected);
      applyEditableCommand({
        command: { kind: 'delete-fragment' },
        editor: parent,
      });
    });

    assert.deepEqual(source.read.children(), [paragraph('LAXYZBR')]);
    assert.deepEqual(parent.read.children(), [paragraph('LR')]);
    assert.deepEqual(parent.read.selection(), {
      anchor: point(1),
      focus: point(1),
    });
    assert.equal(readPliteViewSelection(parent), null);

    await act(async () => parent.api.history.undo());
    assert.deepEqual(parent.read.children(), [paragraph('LABR')]);
  }

  await act(async () => parent.api.history.redo());
  assert.deepEqual(parent.read.children(), [paragraph('LR')]);
  mounted.unmount();
});

it('inserts consecutive breaks after authored select-all deletion', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
  parent.api.authored.setView(editingMarkup);
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );

  await act(async () => {
    applyEditableCommand({ command: { kind: 'select-all' }, editor: parent });
    applyEditableCommand({
      command: { kind: 'delete-fragment' },
      editor: parent,
    });
    assert.notEqual(
      parent.read.authored.changesAt({
        anchor: point(0),
        focus: point(0),
      }).length,
      0
    );
    applyEditableCommand({
      command: { kind: 'insert-break', variant: 'paragraph' },
      editor: parent,
    });
    applyEditableCommand({
      command: { kind: 'insert-break', variant: 'paragraph' },
      editor: parent,
    });
  });

  assert.deepEqual(parent.read.children(), [
    paragraph(''),
    paragraph(''),
    paragraph(''),
  ]);
  assert.deepEqual(parent.read.selection(), {
    anchor: { path: [2, 0], offset: 0 },
    focus: { path: [2, 0], offset: 0 },
  });
  mounted.unmount();
});

it('automatically interleaves retained text with distinct native offsets', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({ at: { anchor: point(1), focus: point(4) } });
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );
  assert.equal(mounted.container.textContent, 'AXYZB');
  const retained = mounted.container.querySelector<HTMLElement>(
    '[data-editor-retained]'
  );
  assert.ok(retained);
  assert.equal(retained.tagName, 'SPAN');
  assert.equal(retained.textContent, 'XYZ');
  const editor = readDOMFragmentEditor(retained);
  assert.ok(editor);
  const text = retained.querySelector('[data-editor-string]')?.firstChild;
  assert.ok(text);
  assert.deepEqual(
    editor.api.dom.resolvePoint([text, 2], { exactMatch: true }),
    point(2)
  );
  const after = retained.nextElementSibling?.firstElementChild?.firstChild;
  assert.ok(after);
  assert.deepEqual(parent.api.dom.resolveDOMPoint(point(2)), [after, 1]);
  const editorElement = parent.api.dom.root();
  assert.ok(editorElement);
  const selection = resolveDOMRangeInRoot(
    parent,
    { anchor: point(2), focus: point(2) },
    editorElement
  );
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
    plugins: [authored({ authorId: () => authorId })],
    initialValue: [paragraph('AABBCCDD')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );
  assert.ok(mounted.container.querySelector('[data-editor-text-flow-host]'));
  await act(async () =>
    parent.update.text.delete({ at: { anchor: point(2), focus: point(4) } })
  );
  const proposedText = mounted.container.querySelector(
    '[data-editor-dom-sync-reason="retained-content"]'
  );
  assert.ok(proposedText);
  assert.equal(proposedText.getAttribute('data-editor-dom-sync'), null);
  authorId = 'bob';
  await act(async () =>
    parent.update.text.delete({ at: { anchor: point(4), focus: point(6) } })
  );
  const visible = () => mounted.container.textContent?.replaceAll('\uFEFF', '');
  const deleted = () =>
    [...mounted.container.querySelectorAll('[data-editor-retained]')].map(
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
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph(text)],
    });
    const parent = createReactRuntimeViewEditor(
      createEditorView(source, { authored: markup })
    );
    const mounted = render(
      <EditorRoot editor={parent}>
        <Editable placeholder="Type here" />
      </EditorRoot>
    );
    await act(async () =>
      parent.update.text.delete({
        at: { anchor: point(from), focus: point(to) },
      })
    );
    assert.equal(mounted.container.textContent?.replaceAll('\uFEFF', ''), text);
    assert.equal(
      mounted.container.querySelector('[data-editor-retained]')?.textContent,
      'XYZ'
    );
    assert.equal(
      mounted.container.querySelector('[data-editor-placeholder]'),
      null
    );
    const length = text.length - (to - from);
    for (let offset = 0; offset <= length; offset++) {
      const dom = parent.api.dom.resolveDOMPoint(point(offset));
      assert.ok(dom);
      assert.equal(readDOMFragmentEditor(dom[0]), null);
      assert.deepEqual(
        parent.api.dom.resolvePoint(dom, { exactMatch: true }),
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

for (const side of ['prefix', 'suffix'] as const) {
  it(`preserves one native link across a deleted inline ${side}`, async () => {
    const links = defineEditorSchema(`schema:authored-inline-${side}`, {
      id: `authored-inline-${side}`,
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
    const value = [
      {
        type: 'paragraph',
        children: [
          { text: 'A' },
          { type: 'link', url: '/retained', children: [{ text: 'BC' }] },
          { text: 'D' },
        ],
      },
    ];
    const source = createEditor({
      plugins: [links, authored({ authorId: 'alice' })],
      initialValue: value,
    });
    const view = createReactRuntimeViewEditor(
      createEditorView(source, { authored: markup })
    );
    const middle = { path: [0, 1, 0], offset: 1 };
    view.update.text.delete({
      at:
        side === 'prefix'
          ? { anchor: point(1), focus: middle }
          : { anchor: middle, focus: { path: [0, 2], offset: 1 } },
    });
    const mounted = render(
      <EditorRoot editor={view}>
        <Editable
          renderElement={({ attributes, children, element }) =>
            element.type === 'link' ? (
              <a {...attributes} href={String(element.url)}>
                {children}
              </a>
            ) : (
              <p {...attributes}>{children}</p>
            )
          }
        />
      </EditorRoot>
    );
    const visible = () =>
      mounted.container.textContent?.replaceAll('\uFEFF', '');
    const linked = () =>
      mounted.container
        .querySelector('a')
        ?.textContent?.replaceAll('\uFEFF', '');
    assert.equal(view.read.text.string([]), side === 'prefix' ? 'ACD' : 'AB');
    assert.equal(visible(), 'ABCD');
    assert.equal(mounted.container.querySelectorAll('a').length, 1);
    assert.equal(linked(), 'BC');
    assert.equal(
      mounted.container.querySelector('a')?.getAttribute('href'),
      '/retained'
    );
    await act(async () => view.update.text.insert('!', { at: middle }));
    assert.equal(visible(), side === 'prefix' ? 'ABC!D' : 'AB!CD');
    assert.equal(linked(), side === 'prefix' ? 'BC!' : 'B!C');
    await act(async () =>
      source.update.authored.decide({
        action: 'reject',
        selection: source.read.authored.select({ status: 'pending' }),
      })
    );
    assert.deepEqual(source.read.children(), value);
    assert.equal(visible(), 'ABCD');
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
    plugins: [links, authored({ authorId: 'alice' })],
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
    <EditorRoot editor={parent}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderText={renderText}
      />
    </EditorRoot>
  );
  await act(async () => parent.update.nodes.remove({ at: [0, 1] }));
  assert.deepEqual(parent.read.children(), [paragraph('AB')]);
  const retained = mounted.container.querySelector('[data-editor-retained]');
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
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AXYZB')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const highlight: DecorationSource<typeof source> = {
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
    <EditorRoot editor={parent} decorations={[highlight]}>
      <Editable />
    </EditorRoot>
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
    mounted.container.querySelector('[data-editor-retained] [data-highlight]'),
    null
  );
  for (let offset = 0; offset <= 2; offset++) {
    const dom = parent.api.dom.resolveDOMPoint(point(offset));
    assert.ok(dom);
    assert.deepEqual(
      parent.api.dom.resolvePoint(dom, { exactMatch: true }),
      point(offset)
    );
  }
  mounted.unmount();
});

it('automatically mounts retained blocks and follows hidden accepted edits', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
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
    <EditorRoot editor={parent}>
      <Editable renderElement={renderElement} />
    </EditorRoot>
  );
  const retained = mounted.container.querySelector<HTMLElement>(
    '[data-editor-retained]'
  );
  assert.ok(retained);
  assert.equal(retained.tagName, 'P');
  assert.equal(retained.getAttribute('contenteditable'), null);
  assert.equal(retained.textContent, 'Deleted');
  assert.equal(mounted.container.querySelectorAll('[data-editor]').length, 1);
  const editor = readDOMFragmentEditor(retained);
  assert.ok(editor);
  const text = retained.querySelector('[data-editor-string]')?.firstChild;
  assert.ok(text);
  assert.deepEqual(
    editor.api.dom.resolvePoint([text, 3], { exactMatch: true }),
    point(3)
  );
  assert.equal(
    parent.api.dom.resolvePoint([text, 3], { exactMatch: true }),
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
    mounted.container.querySelectorAll('[data-editor-retained]').length,
    0,
    mounted.container.innerHTML
  );
  assert.equal(mounted.container.textContent, 'DelXetedVis!ible');
  mounted.unmount();
});

it('resolves each native point when one retained slice occupies separate paragraph mounts', () => {
  const value = [paragraph('AB'), paragraph('CD')];
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: value,
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.changes.apply(
    DocumentChange.between({ children: value }, { children: [paragraph('AD')] })
  );
  const { id } = source.read.authored.changes().items[0];
  const [fragment] = readAuthoredViewFragments(parent, id);
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable
        renderElement={({ attributes, children }) => (
          <p {...attributes}>{children}</p>
        )}
      />
    </EditorRoot>
  );
  assert.deepEqual(
    [...mounted.container.querySelectorAll('p')].map(
      (node) => node.textContent
    ),
    ['AB', 'CD']
  );
  for (const [index, text] of ['B', 'C'].entries()) {
    const result = resolveViewBoundaryDOMPoint(parent, {
      fragmentId: fragment.id,
      point: { path: [index, 0], offset: 1 },
    });
    assert.ok(result, `Missing retained point for ${text}`);
    assert.equal(result[0].textContent, text);
    assert.equal(result[1], 1);
  }
  mounted.unmount();
  assert.equal(
    resolveViewBoundaryDOMPoint(parent, {
      fragmentId: fragment.id,
      point: { path: [1, 0], offset: 1 },
    }),
    null
  );
});

it('preserves paragraph boundaries and native coordinates in an open multi-block deletion', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('AB'), paragraph('CD')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  parent.update.text.delete({
    at: { anchor: point(1), focus: { path: [1, 0], offset: 1 } },
  });
  assert.deepEqual(parent.read.children(), [paragraph('AD')]);
  const { id } = source.read.authored.changes().items[0];
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable
        renderElement={({ attributes, children }) => (
          <p {...attributes}>{children}</p>
        )}
      />
    </EditorRoot>
  );
  const blocks = [...mounted.container.querySelectorAll('p')];
  assert.deepEqual(
    blocks.map((node) => node.textContent),
    ['AB', 'CD']
  );
  assert.equal(mounted.container.querySelector('p p'), null);
  const nativeText = (text: string) => {
    const element = [
      ...mounted.container.querySelectorAll('[data-editor-string]'),
    ].find((node) => node.textContent === text);
    assert.ok(element?.firstChild, `Missing rendered ${text}`);
    return element.firstChild;
  };
  assert.deepEqual(
    parent.api.dom.resolvePoint([nativeText('D'), 1], {
      exactMatch: true,
    }),
    point(2),
    mounted.container.innerHTML
  );
  for (const text of ['B', 'C']) {
    const node = nativeText(text);
    const retained = readDOMFragmentEditor(node);
    assert.ok(retained);
    assert.deepEqual(
      retained.api.dom.resolvePoint([node, 1], { exactMatch: true }),
      point(1)
    );
  }
  await act(async () =>
    source.update.authored.decide({
      action: 'reject',
      selection: source.read.authored.select({ ids: [id] }),
    })
  );
  assert.deepEqual(
    [...mounted.container.querySelectorAll('p')].map(
      (node) => node.textContent
    ),
    ['AB', 'CD']
  );
  assert.equal(
    mounted.container.querySelector('[data-editor-retained]')?.outerHTML ??
      null,
    null
  );
  mounted.unmount();
});

it('automatically mounts retained table rows directly inside tbody', async () => {
  const row = (text: string) => ({
    type: 'row',
    children: [{ type: 'cell', children: [paragraph(text)] }],
  });
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
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
    <EditorRoot editor={parent}>
      <Editable renderElement={renderElement} />
    </EditorRoot>
  );
  const retained = mounted.container.querySelector<HTMLElement>(
    '[data-editor-retained]'
  );
  assert.ok(retained);
  assert.equal(retained.tagName, 'TR');
  assert.equal(retained.parentElement?.tagName, 'TBODY');
  assert.equal(mounted.container.querySelectorAll('table').length, 1);
  assert.equal(mounted.container.querySelectorAll('tbody > tr').length, 2);
  assert.equal(retained.textContent, 'Deleted');
  const editor = readDOMFragmentEditor(retained);
  assert.ok(editor);
  const text = retained.querySelector('[data-editor-string]')?.firstChild;
  assert.ok(text);
  assert.deepEqual(
    editor.api.dom.resolvePoint([text, 2], { exactMatch: true }),
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
    plugins: [authored({ authorId: 'alice' })],
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
    <EditorRoot editor={parent}>
      <Editable renderElement={renderElement} />
    </EditorRoot>
  );
  await act(async () => parent.update.nodes.remove({ at: [0, 0] }));
  const retained = mounted.container.querySelector('[data-editor-retained]');
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
    plugins: [authored({ authorId: () => authorId })],
    initialValue: ['A', 'BB', 'C', 'D'].map(paragraph),
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const renderElement = ({ attributes, children }: RenderElementProps) => (
    <p {...attributes}>{children}</p>
  );
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable renderElement={renderElement} />
    </EditorRoot>
  );
  await act(async () => parent.update.nodes.remove({ at: [1] }));
  authorId = 'bob';
  await act(async () => parent.update.nodes.remove({ at: [1] }));
  const deleted = () =>
    [...mounted.container.querySelectorAll('[data-editor-retained]')].map(
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
  assert.equal(mounted.container.querySelectorAll('[data-editor]').length, 1);
  mounted.unmount();
});

it('mounts retained blocks in an empty editable root and redocks them when content arrives', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: [paragraph('Deleted')],
  });
  const parent = createReactRuntimeViewEditor(
    createEditorView(source, { authored: markup })
  );
  const mounted = render(
    <EditorRoot editor={parent}>
      <Editable />
    </EditorRoot>
  );
  await act(async () => parent.update.nodes.remove({ at: [0] }));
  assert.equal(
    mounted.container.querySelector('[data-editor-retained]')?.textContent,
    'Deleted'
  );
  assert.equal(mounted.container.textContent, 'Deleted');
  await act(async () =>
    parent.update.nodes.insert(paragraph('Inserted'), { at: [0] })
  );
  assert.equal(mounted.container.textContent, 'DeletedInserted');
  assert.equal(
    mounted.container.querySelectorAll('[data-editor-retained]').length,
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
    plugins: [authored({ authorId: 'alice' })],
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
      <EditorRoot editor={main}>
        <Editable aria-label="Main" />
      </EditorRoot>
      <EditorRoot editor={notes}>
        <Editable aria-label="Notes" />
      </EditorRoot>
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
