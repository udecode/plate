import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, test, vi } from 'vitest';

import {
  createEditorView,
  type Editor as CoreEditor,
  type Range as ModelRange,
} from '../../src';
import { authored } from '../../src/authored';
import { getEditorRuntimeOwner } from '../../src/core/editor-runtime';
import { DOMEditor } from '../../src/dom';
import {
  DOMRootRuntime,
  EDITOR_TO_ELEMENT,
  EDITOR_TO_ROOT_VIEW_EDITORS,
} from '../../src/dom/internal';
import { replace as editorReplace } from '../../src/internal';
import { Editable } from '../../src/react/components/editable-text-blocks';
import { EditorRoot } from '../../src/react/components/plite';
import { createReactRuntimeViewEditor } from '../../src/react/hooks/use-plite-runtime';
import { useSelectionGeometry } from '../../src/react/hooks/use-selection-geometry';
import { createEditor, type Editor } from '../../src/react/plugin/with-react';
import { createRangeGeometryOwner } from '../../src/react/range-geometry';

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const point = (offset: number) => ({ path: [0, 0], offset });

const viewportRect = (
  left: number,
  top: number,
  width: number,
  height: number
) => ({
  bottom: top + height,
  height,
  left,
  right: left + width,
  top,
  width,
  x: left,
  y: top,
});

const SelectionGeometryProbe = ({
  editableRef,
}: {
  editableRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const geometry = useSelectionGeometry({ editableRef });

  return (
    <span data-testid="selection-geometry">
      {geometry
        ? `${geometry.boundingRect.left},${geometry.boundingRect.top},${geometry.rects.length}`
        : 'none'}
    </span>
  );
};

const SelectionGeometryHarness = ({ editor }: { editor: Editor }) => {
  const editableRef = React.useRef<HTMLDivElement>(null);

  return (
    <EditorRoot editor={editor}>
      <Editable ref={editableRef} />
      <SelectionGeometryProbe editableRef={editableRef} />
    </EditorRoot>
  );
};

const installRangeRects = ({
  focus,
  selection,
}: {
  focus: () => ReturnType<typeof viewportRect>;
  selection: () => Array<ReturnType<typeof viewportRect>>;
}) => {
  const { prototype } = window.Range;
  const previousBoundingRect = Object.getOwnPropertyDescriptor(
    prototype,
    'getBoundingClientRect'
  );
  const previousClientRects = Object.getOwnPropertyDescriptor(
    prototype,
    'getClientRects'
  );

  Object.defineProperties(prototype, {
    getBoundingClientRect: {
      configurable: true,
      value: focus,
    },
    getClientRects: {
      configurable: true,
      value(this: Range) {
        return this.collapsed ? [] : selection();
      },
    },
  });

  return () => {
    if (previousBoundingRect) {
      Object.defineProperty(
        prototype,
        'getBoundingClientRect',
        previousBoundingRect
      );
    } else {
      Reflect.deleteProperty(prototype, 'getBoundingClientRect');
    }
    if (previousClientRects) {
      Object.defineProperty(prototype, 'getClientRects', previousClientRects);
    } else {
      Reflect.deleteProperty(prototype, 'getClientRects');
    }
  };
};

const createRootRuntime = (editor: Editor<any, any>, root: HTMLElement) => {
  const runtime = new DOMRootRuntime({
    adapter: {},
    editor,
    getAndroidMutationHandler: () => null,
    isAndroidMutationOwned: () => false,
    isCanonicalTextMutation: () => true,
    isComposing: () => false,
    onRepair: () => {},
    resolvePath: () => null,
  });

  runtime.setRoot(root);
  runtime.connect();

  return runtime;
};

const createMountedRoot = (text: string) => {
  const root = document.createElement('div');

  root.dataset.editor = 'true';
  root.textContent = text;
  document.body.append(root);

  return root;
};

const installResolvedRangeMock = () =>
  vi.spyOn(DOMEditor, 'resolveDOMRange').mockImplementation((editor, range) => {
    const root = EDITOR_TO_ELEMENT.get(editor);
    const text = root?.firstChild;

    if (!root || !text) return null;

    return {
      endContainer: text,
      getBoundingClientRect: () =>
        viewportRect(range.focus.offset * 10, 12, 1, 18),
      getClientRects: () => [],
      startContainer: text,
    } as unknown as globalThis.Range;
  });

const flushViewState = async (runtime: DOMRootRuntime) => {
  await Promise.resolve();
  await Promise.resolve();
  runtime.domPhaseScheduler.flush();
};

describe('range geometry', () => {
  test('measures expanded and collapsed selections in the exact Editable', async () => {
    const editor = createEditor();
    const restoreRects = installRangeRects({
      focus: () => viewportRect(30, 40, 1, 18),
      selection: () => [
        viewportRect(10, 20, 40, 18),
        viewportRect(10, 40, 20, 18),
      ],
    });

    editorReplace(editor, {
      children: [paragraph('alpha'), paragraph('beta')],
      selection: {
        kind: 'text',
        anchor: point(0),
        focus: point(4),
      },
    });

    try {
      const mounted = render(<SelectionGeometryHarness editor={editor} />);

      await waitFor(() => {
        expect(mounted.getByTestId('selection-geometry')).toHaveTextContent(
          '10,20,2'
        );
      });

      await act(async () => {
        editor.update((tx) => tx.selection.collapse({ edge: 'end' }));
      });

      await waitFor(() => {
        expect(mounted.getByTestId('selection-geometry')).toHaveTextContent(
          '30,40,0'
        );
      });
    } finally {
      restoreRects();
    }
  });

  test('remeasures after viewport and root layout changes', async () => {
    const editor = createEditor();
    let left = 10;
    const restoreRects = installRangeRects({
      focus: () => viewportRect(left, 40, 1, 18),
      selection: () => [viewportRect(left, 20, 40, 18)],
    });

    editorReplace(editor, {
      children: [paragraph('alpha')],
      selection: {
        kind: 'text',
        anchor: point(0),
        focus: point(4),
      },
    });

    try {
      const mounted = render(<SelectionGeometryHarness editor={editor} />);

      await waitFor(() => {
        expect(mounted.getByTestId('selection-geometry')).toHaveTextContent(
          '10,20,1'
        );
      });

      left = 20;
      await act(async () => {
        document.dispatchEvent(new Event('scroll'));
      });
      await waitFor(() => {
        expect(mounted.getByTestId('selection-geometry')).toHaveTextContent(
          '20,20,1'
        );
      });

      left = 30;
      act(() => {
        mounted.getByRole('textbox').style.fontSize = '18px';
      });
      await waitFor(() => {
        expect(mounted.getByTestId('selection-geometry')).toHaveTextContent(
          '30,20,1'
        );
      });
    } finally {
      restoreRects();
    }
  });

  test('anchors a collapsed empty paragraph to its zero-width line', async () => {
    const editor = createEditor();
    const elementPrototype = window.HTMLElement.prototype;
    const previousElementBoundingRect = Object.getOwnPropertyDescriptor(
      elementPrototype,
      'getBoundingClientRect'
    );
    const restoreRects = installRangeRects({
      focus: () => viewportRect(0, 0, 0, 0),
      selection: () => [],
    });

    Object.defineProperty(elementPrototype, 'getBoundingClientRect', {
      configurable: true,
      value(this: HTMLElement) {
        return this.hasAttribute('data-editor-zero-width')
          ? viewportRect(30, 40, 0, 18)
          : viewportRect(0, 0, 0, 0);
      },
    });
    editorReplace(editor, {
      children: [paragraph('')],
      selection: {
        kind: 'text',
        anchor: point(0),
        focus: point(0),
      },
    });

    try {
      const mounted = render(<SelectionGeometryHarness editor={editor} />);

      await waitFor(() => {
        expect(mounted.getByTestId('selection-geometry')).toHaveTextContent(
          '30,40,0'
        );
      });
    } finally {
      restoreRects();
      if (previousElementBoundingRect) {
        Object.defineProperty(
          elementPrototype,
          'getBoundingClientRect',
          previousElementBoundingRect
        );
      } else {
        Reflect.deleteProperty(elementPrototype, 'getBoundingClientRect');
      }
    }
  });

  test('binds to the exact ref view, invalidates setView, and retires stale subscriptions', async () => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const proposal = {
      intent: 'propose',
      projection: 'proposed',
    } as const;
    const accepted = {
      intent: 'edit',
      projection: 'accepted',
    } as const;
    const first = createReactRuntimeViewEditor(
      createEditorView(source, { authored: proposal })
    );

    const second = createReactRuntimeViewEditor(
      createEditorView(source, { authored: proposal })
    );
    const firstRoot = createMountedRoot('first');
    const secondRoot = createMountedRoot('second');
    const owner = getEditorRuntimeOwner(source);

    EDITOR_TO_ELEMENT.set(first, firstRoot);
    EDITOR_TO_ELEMENT.set(second, secondRoot);
    EDITOR_TO_ROOT_VIEW_EDITORS.set(owner, new Set([first, second]));
    const firstRuntime = createRootRuntime(first, firstRoot);
    const secondRuntime = createRootRuntime(second, secondRoot);
    const resolveRange = installResolvedRangeMock();
    const reads = new Map<object, number>();
    const ranges = new Map<object, ModelRange>([
      [first, { anchor: point(7), focus: point(7) }],
      [second, { anchor: point(2), focus: point(2) }],
    ]);
    const editableRef: { current: HTMLElement | null } = {
      current: firstRoot,
    };
    const geometry = createRangeGeometryOwner(
      source,
      {
        read: (view) => {
          reads.set(view, (reads.get(view) ?? 0) + 1);

          return ranges.get(view) ?? null;
        },
        subscribe: () => () => {},
      },
      editableRef
    );
    const release = geometry.activate();

    try {
      expect(geometry.getSnapshot()?.boundingRect.left).toBe(70);

      ranges.set(first, { anchor: point(4), focus: point(4) });
      first.api.authored.setView(accepted);
      await flushViewState(firstRuntime);
      expect(geometry.getSnapshot()?.boundingRect.left).toBe(40);

      editableRef.current = secondRoot;
      geometry.refresh();
      expect(geometry.getSnapshot()?.boundingRect.left).toBe(20);
      const retiredReads = reads.get(first);

      first.api.authored.setView(proposal);
      await flushViewState(firstRuntime);
      secondRuntime.domPhaseScheduler.flush();
      expect(reads.get(first)).toBe(retiredReads);

      const activeReads = reads.get(second) ?? 0;

      ranges.set(second, { anchor: point(6), focus: point(6) });
      second.api.authored.setView(accepted);
      await flushViewState(secondRuntime);
      expect(reads.get(second)).toBe(activeReads + 1);
      expect(geometry.getSnapshot()?.boundingRect.left).toBe(60);
    } finally {
      release();
      await Promise.resolve();
      resolveRange.mockRestore();
      firstRuntime.destroy();
      secondRuntime.destroy();
      EDITOR_TO_ELEMENT.delete(first);
      EDITOR_TO_ELEMENT.delete(second);
      EDITOR_TO_ROOT_VIEW_EDITORS.delete(owner);
      firstRoot.remove();
      secondRoot.remove();
    }
  });

  test('reassigns a pending shared read when its scheduling root retires', async () => {
    const source = createEditor({ initialValue: [paragraph('Base')] });
    const first = createReactRuntimeViewEditor(createEditorView(source));
    const second = createReactRuntimeViewEditor(createEditorView(source));
    const firstRoot = createMountedRoot('first');
    const secondRoot = createMountedRoot('second');
    const runtimeOwner = getEditorRuntimeOwner(source);

    EDITOR_TO_ELEMENT.set(first, firstRoot);
    EDITOR_TO_ELEMENT.set(second, secondRoot);
    EDITOR_TO_ROOT_VIEW_EDITORS.set(runtimeOwner, new Set([first, second]));
    const firstRuntime = createRootRuntime(first, firstRoot);
    const secondRuntime = createRootRuntime(second, secondRoot);
    const resolveRange = installResolvedRangeMock();
    const ranges = new Map<CoreEditor<any, any>, ModelRange>([
      [first, { anchor: point(1), focus: point(1) }],
      [second, { anchor: point(2), focus: point(2) }],
    ]);
    const reads = new Map<CoreEditor<any, any>, number>();
    const sourceGeometry: Parameters<typeof createRangeGeometryOwner>[1] = {
      read: (view) => {
        reads.set(view, (reads.get(view) ?? 0) + 1);

        return ranges.get(view) ?? null;
      },
      subscribe: () => () => {},
    };
    const firstGeometry = createRangeGeometryOwner(source, sourceGeometry, {
      current: firstRoot,
    });
    const secondGeometry = createRangeGeometryOwner(source, sourceGeometry, {
      current: secondRoot,
    });
    const releaseFirst = firstGeometry.activate();
    const releaseSecond = secondGeometry.activate();
    const secondReads = reads.get(second) ?? 0;
    const resolvedRanges = resolveRange.mock.calls.length;

    try {
      document.dispatchEvent(new Event('scroll'));
      releaseFirst();
      await Promise.resolve();

      expect(firstRuntime.domPhaseScheduler.pending()).toBe(0);
      expect(secondRuntime.domPhaseScheduler.pending()).toBe(1);
      secondRuntime.domPhaseScheduler.flush();
      expect(reads.get(second)).toBe(secondReads);
      expect(resolveRange.mock.calls.length).toBe(resolvedRanges + 2);
      expect(secondGeometry.getSnapshot()?.boundingRect.left).toBe(20);
    } finally {
      releaseSecond();
      await Promise.resolve();
      resolveRange.mockRestore();
      firstRuntime.destroy();
      secondRuntime.destroy();
      EDITOR_TO_ELEMENT.delete(first);
      EDITOR_TO_ELEMENT.delete(second);
      EDITOR_TO_ROOT_VIEW_EDITORS.delete(runtimeOwner);
      firstRoot.remove();
      secondRoot.remove();
    }
  });
});
