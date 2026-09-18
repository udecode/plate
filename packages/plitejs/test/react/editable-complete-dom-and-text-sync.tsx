import { act, fireEvent, render } from '@testing-library/react';
import { type Descendant, NodeApi } from 'plitejs';
import { history } from 'plitejs/history';
import React from 'react';
import { expect, test } from 'vitest';

import {
  getNodeKey as editorGetNodeKey,
  getSnapshot as editorGetSnapshot,
  point as editorPoint,
  replace as editorReplace,
} from '../../src/internal';
import {
  createEditor,
  Editable,
  EditorRoot,
  type DecorationSource,
} from '../../src/react';
import { setDOMTextSyncRendererCapability } from '../../src/react/dom-text-sync';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import {
  didSyncTextPathToDOM,
  getDOMTextRenderRevision,
  syncChangedTextToDOM,
} from '../../src/react/hooks/use-plite-node-ref';

const TestEditorSurface = ({
  editor,
  ...props
}: React.ComponentProps<typeof Editable> & {
  editor: React.ComponentProps<typeof EditorRoot>['editor'];
}) => (
  <EditorRoot editor={editor}>
    <Editable {...props} />
  </EditorRoot>
);

const createHighlightSource = <E,>(
  _editor: E,
  id: string
): DecorationSource<E> => ({
  id,
  read: ({ entry: [node, path] }) =>
    NodeApi.isText(node) && path.length === 2 && path[0] === 0 && path[1] === 0
      ? [
          {
            attributes: { 'data-highlight': id },
            key: id,
            range: {
              anchor: { path, offset: 0 },
              focus: { path, offset: Math.min(5, node.text.length) },
            },
          },
        ]
      : [],
});

const getNodeKey = (
  editor: ReturnType<typeof createEditor>,
  path: number[]
) => {
  const nodeKey = editorGetNodeKey(editor, path);

  if (!nodeKey) {
    throw new Error(`Missing node key at ${path.join('.')}`);
  }

  return nodeKey;
};

const fireEditorSelectAll = (root: HTMLElement) => {
  Object.defineProperty(root, 'isContentEditable', {
    configurable: true,
    value: true,
  });
  fireEvent.keyDown(root, {
    bubbles: true,
    ctrlKey: true,
    key: 'a',
  });
};

test('Editable full DOM Ctrl+A keeps select-all native-owned', async () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'one' }] },
      { type: 'paragraph', children: [{ text: 'two' }] },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface editor={editor} id="full-dom-select-all" />
  );
  const root = rendered.container.querySelector(
    '#full-dom-select-all'
  ) as HTMLElement | null;

  expect(root).toBeTruthy();

  await act(async () => {
    fireEditorSelectAll(root!);
  });

  expect(editorGetSnapshot(editor).selection).toEqual({
    kind: 'text',
    anchor: editorPoint(editor, [], { edge: 'start' }),
    focus: editorPoint(editor, [], { edge: 'end' }),
  });
  expect(root!.getAttribute('data-editor-viewport-selection')).toBe(null);
  expect(
    rendered.container.querySelectorAll('[data-editor-view-selection="true"]')
  ).toHaveLength(0);
});

test('Editable marks only default plain text as DOM-sync capable', async () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface editor={editor} id="editable-default-dom-sync" />
  );

  expect(
    rendered.container
      .querySelector('[data-editor-node="text"]')
      ?.getAttribute('data-editor-dom-sync')
  ).toBe('true');
  expect(
    rendered.container
      .querySelector('[data-editor-node="text"]')
      ?.hasAttribute('data-editor-dom-sync-reason')
  ).toBe(false);
});

test('Editable disables DOM text sync for app-owned text renderers', async () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      editor={editor}
      id="editable-custom-render-text"
      renderText={({ attributes, children }) => (
        <span {...attributes} data-custom-text="true">
          {children}
        </span>
      )}
    />
  );

  expect(
    rendered.container
      .querySelector('[data-editor-node="text"]')
      ?.hasAttribute('data-editor-dom-sync')
  ).toBe(false);
  expect(
    rendered.container
      .querySelector('[data-editor-node="text"]')
      ?.getAttribute('data-editor-dom-sync-reason')
  ).toBe('custom-text');
});

test('Editable restores native-updated app-owned text from model history', async () => {
  const editor = createEditor({ plugins: [history()] });

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      editor={editor}
      renderText={({ attributes, children }) => (
        <span {...attributes} data-custom-text="true">
          {children}
        </span>
      )}
    />
  );
  const string = rendered.container.querySelector(
    '[data-editor-string="true"]'
  );

  expect(string).toBeTruthy();
  string!.textContent = 'beta';

  await act(async () => {
    editor.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
          kind: 'text',
        },
      });
      tx.text.insert('beta', { at: { path: [0, 0], offset: 0 } });
    });
    editor.api.history.undo();
  });

  expect(
    rendered.container.querySelector('[data-editor-string="true"]')?.textContent
  ).toBe('alpha');
});

test('Editable keeps unknown custom leaf renderers model-owned', async () => {
  const leafEditor = createEditor();
  let renderLeafProps:
    | Parameters<
        NonNullable<React.ComponentProps<typeof Editable>['renderLeaf']>
      >[0]
    | null = null;

  const children: Descendant[] = [
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }],
    },
  ];

  editorReplace(leafEditor, {
    children,
    selection: null,
  });

  const leafRendered = render(
    <TestEditorSurface
      editor={leafEditor}
      id="editable-custom-render-leaf"
      renderLeaf={(props) => {
        renderLeafProps = props;

        return (
          <span {...props.attributes} data-custom-leaf="true">
            {props.children}
          </span>
        );
      }}
    />
  );

  expect(
    leafRendered.container
      .querySelector('[data-editor-node="text"]')
      ?.getAttribute('data-editor-dom-sync')
  ).toBeNull();
  expect(
    leafRendered.container
      .querySelector('[data-editor-node="text"]')
      ?.getAttribute('data-editor-dom-sync-reason')
  ).toBe('custom-leaf');
  expect(renderLeafProps).toMatchObject({
    leaf: {},
    path: [0, 0],
    text: {},
  });
  expect('text' in renderLeafProps!.leaf).toBe(false);
  expect('text' in renderLeafProps!.text).toBe(false);
});

test('Editable keeps retained DOM text sync enabled for decorated text', async () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const highlightSource = createHighlightSource(editor, 'highlight-alpha');

  const rendered = render(
    <EditorRoot decorations={[highlightSource]} editor={editor}>
      <Editable id="editable-decoration-dom-sync" />
    </EditorRoot>
  );

  expect(
    rendered.container
      .querySelector('[data-editor-node="text"]')
      ?.hasAttribute('data-editor-dom-sync')
  ).toBe(true);
  expect(
    rendered.container
      .querySelector('[data-editor-node="text"]')
      ?.getAttribute('data-editor-dom-sync-reason')
  ).toBeNull();
});

test('Editable routes native-updated decorated text through React', async () => {
  const editor = createEditor({ plugins: [history()] });

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha beta' }],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });

  const highlightSource = createHighlightSource(editor, 'highlight-alpha');

  const rendered = render(
    <EditorRoot decorations={[highlightSource]} editor={editor}>
      <Editable
        id="editable-native-decorated-dom-sync"
        renderLeaf={({ attributes, children }) => (
          <span {...attributes}>{children}</span>
        )}
      />
    </EditorRoot>
  );
  const textElement = rendered.container.querySelector(
    '[data-editor-node="text"]'
  );
  const firstString = rendered.container.querySelector('[data-editor-string]');

  expect(textElement?.getAttribute('data-editor-dom-sync-reason')).toBe(
    'custom-leaf'
  );
  expect(firstString?.textContent).toBe('alpha');

  if (!firstString) {
    throw new Error('Expected a decorated Plite string.');
  }

  firstString.textContent = 'alpha!';

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
    });
  });

  expect(didSyncTextPathToDOM(editor, [0, 0])).toBe(false);
  expect(
    [...rendered.container.querySelectorAll('[data-editor-string]')].map(
      (element) => element.textContent
    )
  ).toEqual(['alpha', '! beta']);

  await act(async () => {
    editor.update({ history: 'new-batch' }).break.insert();
    editor.update({ history: 'new-batch' }).break.insert();
    editor.api.history.undo();
    editor.api.history.undo();
  });

  expect(editor.read.text.string([])).toBe('alpha! beta');
  expect(rendered.container.querySelector('[data-editor]')?.textContent).toBe(
    'alpha! beta'
  );
});

test('Editable still reconciles an exact current custom leaf through React', async () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });
  const rendered = render(
    <EditorRoot editor={editor}>
      <Editable
        renderLeaf={({ attributes, children }) => (
          <span {...attributes}>{children}</span>
        )}
      />
    </EditorRoot>
  );
  const stringElement = rendered.container.querySelector(
    '[data-editor-string="true"]'
  );

  if (!stringElement) throw new Error('Expected a custom leaf string.');
  stringElement.textContent = 'alpha!';

  await act(async () => {
    editor.update((tx) =>
      tx.text.insert('!', { at: { path: [0, 0], offset: 5 } })
    );
  });
  const textNodeKey = getNodeKey(editor, [0, 0]);
  const syncResult = syncChangedTextToDOM(editor, [textNodeKey]);

  expect(syncResult.syncedTextCount).toBe(0);
  expect(didSyncTextPathToDOM(editor, [0, 0])).toBe(false);
  expect(
    rendered.container.querySelector('[data-editor-string="true"]')?.textContent
  ).toBe('alpha!');
});

test('custom text history preserves affected and sibling leaf owners', async () => {
  const editor = createEditor({ plugins: [history()] });

  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'first' }] },
      { type: 'paragraph', children: [{ text: 'second' }] },
    ],
    selection: null,
  });
  const rendered = render(
    <EditorRoot editor={editor}>
      <Editable
        renderLeaf={({ attributes, children }) => (
          <span {...attributes}>{children}</span>
        )}
      />
    </EditorRoot>
  );
  const firstNodeKey = getNodeKey(editor, [0, 0]);
  const secondNodeKey = getNodeKey(editor, [1, 0]);
  const leafAt = (path: string) =>
    rendered.container.querySelector(
      `[data-editor-node="text"][data-editor-path="${path}"] > [data-editor-leaf]`
    );
  const firstLeaf = leafAt('0,0');
  const secondLeaf = leafAt('1,0');

  expect(firstLeaf).not.toBeNull();
  expect(secondLeaf).not.toBeNull();

  await act(async () => {
    editor.update({ history: 'new-batch' }, (tx) => {
      tx.text.insert('!', { at: { offset: 5, path: [0, 0] } });
    });
  });
  await act(async () => {
    editor.api.history.undo();
  });

  expect(editor.read.text.string([])).toBe('firstsecond');
  expect(leafAt('0,0')).toBe(firstLeaf);
  expect(leafAt('1,0')).toBe(secondLeaf);
  expect(getDOMTextRenderRevision(editor, [firstNodeKey])).toBe(0);
  expect(getDOMTextRenderRevision(editor, [secondNodeKey])).toBe(0);

  rendered.unmount();
});

test('Editable recomputes decorated leaf strings from committed source ranges', async () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha beta' }],
      },
    ],
    selection: null,
  });

  const highlightSource = createHighlightSource(editor, 'highlight-alpha');

  const rendered = render(
    <EditorRoot decorations={[highlightSource]} editor={editor}>
      <Editable id="editable-decorated-range-dom-sync" />
    </EditorRoot>
  );
  const mountedEditor = findMountedEditableDOMRuntime(
    rendered.container.querySelector('[data-editor]')!
  )!.editor;

  expect(
    [...rendered.container.querySelectorAll('[data-highlight]')].map(
      (element) => element.textContent
    )
  ).toEqual(['alpha']);
  expect(rendered.container.querySelector('[data-editor]')?.textContent).toBe(
    'alpha beta'
  );

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
    });
  });

  expect(didSyncTextPathToDOM(mountedEditor, [0, 0])).toBe(true);
  expect(
    [...rendered.container.querySelectorAll('[data-highlight]')].map(
      (element) => element.textContent
    )
  ).toEqual(['alpha']);
  expect(rendered.container.querySelector('[data-editor]')?.textContent).toBe(
    'alpha! beta'
  );
});

test('Editable renders decorated leaf strings from model-owned history', async () => {
  const editor = createEditor({ plugins: [history()] });

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha beta' }],
      },
    ],
    selection: null,
  });

  const highlightSource = createHighlightSource(
    editor,
    'highlight-alpha-history'
  );
  const rendered = render(
    <EditorRoot decorations={[highlightSource]} editor={editor}>
      <Editable />
    </EditorRoot>
  );
  const mountedEditor = findMountedEditableDOMRuntime(
    rendered.container.querySelector('[data-editor]')!
  )!.editor;

  await act(async () => {
    editor.update((tx) => {
      tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
    });
    editor.api.history.undo();
  });

  expect(didSyncTextPathToDOM(mountedEditor, [0, 0])).toBe(true);
  expect(
    [...rendered.container.querySelectorAll('[data-highlight]')].map(
      (element) => element.textContent
    )
  ).toEqual(['alpha']);
  expect(rendered.container.querySelector('[data-editor]')?.textContent).toBe(
    'alpha beta'
  );
});

test('Editable restores decorated text exactly after split history merges', async () => {
  const editor = createEditor({ plugins: [history()] });

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha beta' }],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });

  const highlightSource = createHighlightSource(
    editor,
    'highlight-alpha-split-history'
  );
  const rendered = render(
    <EditorRoot decorations={[highlightSource]} editor={editor}>
      <Editable />
    </EditorRoot>
  );

  await act(async () => {
    editor.update.text.insert('!');
    editor.update({ history: 'new-batch' }).break.insert();
    editor.update({ history: 'new-batch' }).break.insert();
    editor.api.history.undo();
    editor.api.history.undo();
  });

  expect(editor.read.text.string([])).toBe('alpha! beta');
  expect(rendered.container.querySelector('[data-editor]')?.textContent).toBe(
    'alpha! beta'
  );
});

test('Editable restores capability-backed decorated leaf text after split history merges', async () => {
  const editor = createEditor({ plugins: [history()] });

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha beta' }],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });

  const highlightSource = createHighlightSource(
    editor,
    'highlight-alpha-capability-history'
  );
  const renderLeaf = setDOMTextSyncRendererCapability(
    (({ attributes, children }) => (
      <span {...attributes}>{children}</span>
    )) satisfies NonNullable<
      React.ComponentProps<typeof Editable>['renderLeaf']
    >,
    () => true
  );
  const rendered = render(
    <EditorRoot decorations={[highlightSource]} editor={editor}>
      <Editable renderLeaf={renderLeaf} />
    </EditorRoot>
  );

  await act(async () => {
    editor.update.text.insert('!');
    editor.update({ history: 'new-batch' }).break.insert();
    editor.update({ history: 'new-batch' }).break.insert();
    editor.api.history.undo();
    editor.api.history.undo();
  });

  expect(editor.read.text.string([])).toBe('alpha! beta');
  expect(rendered.container.querySelector('[data-editor]')?.textContent).toBe(
    'alpha! beta'
  );
});

test('Editable disables DOM text sync for empty zero-width text', async () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      editor={editor}
      id="editable-empty-dom-sync"
      placeholder="Write something"
    />
  );

  expect(
    rendered.container
      .querySelector('[data-editor-node="text"]')
      ?.hasAttribute('data-editor-dom-sync')
  ).toBe(false);
  expect(
    rendered.container
      .querySelector('[data-editor-node="text"]')
      ?.getAttribute('data-editor-dom-sync-reason')
  ).toBe('empty-text');
  expect(
    rendered.container.querySelector('[data-editor-zero-width]')
  ).toBeTruthy();
});

test('Editable falls back to React when text sync reaches empty text', async () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      editor={editor}
      id="editable-empty-text-fallback"
      placeholder="Write something"
    />
  );

  expect(rendered.container.textContent).toContain('alpha');

  await act(async () => {
    editor.update((tx) => {
      tx.text.delete({
        at: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        },
      });
    });
  });

  expect(didSyncTextPathToDOM(editor, [0, 0])).toBe(false);
  expect(rendered.container.textContent).not.toContain('alpha');
  expect(
    rendered.container
      .querySelector('[data-editor-node="text"]')
      ?.hasAttribute('data-editor-dom-sync')
  ).toBe(false);
  expect(
    rendered.container
      .querySelector('[data-editor-node="text"]')
      ?.getAttribute('data-editor-dom-sync-reason')
  ).toBe('empty-text');
  expect(
    rendered.container.querySelector('[data-editor-zero-width]')
  ).toBeTruthy();
});

test('Editable falls back to React updates while composing', async () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });

  const rendered = render(
    <TestEditorSurface editor={editor} id="editable-composition-dom-sync" />
  );
  const root = rendered.container.querySelector(
    '#editable-composition-dom-sync'
  );

  expect(root).toBeTruthy();

  await act(async () => {
    fireEvent.compositionStart(root!);
    editor.update((tx) => {
      tx.text.insert('!');
    });
  });

  expect(didSyncTextPathToDOM(editor, [0, 0])).toBe(false);
  expect(rendered.container.textContent).toContain('alpha!');

  await act(async () => {
    fireEvent.compositionEnd(root!);
  });
});

test('Editable forwards scrollSelectionIntoView to app-owned code', async () => {
  const editor = createEditor();
  const seen: string[] = [];

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beta' }],
      },
    ] as Descendant[],
    selection: null,
  });

  const rendered = render(
    <TestEditorSurface
      editor={editor}
      id="scroll-forwarding"
      scrollSelectionIntoView={(_editor, domRange) => {
        seen.push(domRange.toString());
      }}
    />
  );

  await act(async () => {
    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 4 },
      });
    });
  });

  expect(seen).toEqual(['eta']);
  rendered.unmount();
});
