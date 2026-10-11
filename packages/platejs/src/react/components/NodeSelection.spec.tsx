/// <reference types="@testing-library/jest-dom" />

import { describe, expect, it, spyOn } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { schema } from '../../core';
import { BaseParagraphPlugin } from '../../lib/plugins/paragraph/BaseParagraphPlugin';
import { createEditor } from '../editor/withPlate';
import { definePlugin } from '../plugin/definePlugin';
import { NodeSelectionDrag, NodeSelectionHighlight } from './NodeSelection';
import { EditorRoot } from './Plate';
import { EditorElement } from './plate-nodes';
import { EditorContent } from './PlateContent';

const renderNodeSelection = (selectedPaths = [[0]]) => {
  const editor = createEditor({
    initialValue: [
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: 'two' }], type: 'paragraph' },
    ],
    plugins: [BaseParagraphPlugin],
  });

  editor.update.selection.setNodes(selectedPaths);

  return {
    editor,
    view: render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
        <NodeSelectionHighlight
          className="selection-highlight"
          data-testid="selection-highlight"
          style={{ opacity: 0.5, position: 'relative' }}
          title="Selected"
        />
        <NodeSelectionDrag className="selection-drag" />
      </EditorRoot>
    ),
  };
};

describe('NodeSelection', () => {
  it('renders a styled highlight for each exact selected node', async () => {
    const { view } = renderNodeSelection([[0], [1]]);

    await waitFor(() => {
      const highlights = view.container.querySelectorAll(
        '[data-testid="selection-highlight"]'
      );

      expect(highlights).toHaveLength(2);
      expect(highlights[0]?.classList.contains('selection-highlight')).toBe(
        true
      );
      expect(highlights[0]?.getAttribute('title')).toBe('Selected');
      expect(highlights[0]?.getAttribute('contenteditable')).toBe('false');
      expect((highlights[0] as HTMLElement | undefined)?.style.opacity).toBe(
        '0.5'
      );
      expect((highlights[0] as HTMLElement | undefined)?.style.position).toBe(
        'absolute'
      );
      expect(
        (highlights[0] as HTMLElement | undefined)?.style.pointerEvents
      ).toBe('none');
    });
  });

  it('excludes structural and non-selectable elements', async () => {
    const StructuralPlugin = definePlugin('structuralSelectionTest', {
      schema: {
        element: {
          ...schema.element.textBlock(),
          blockContent: false,
        },
      },
    }).configure({
      component: ({ children, ...props }) => (
        <EditorElement {...props}>{children}</EditorElement>
      ),
    });
    const ContainerPlugin = definePlugin('selectionTestContainer', {
      schema: {
        element: {
          content: schema.content.element(StructuralPlugin, { min: 1 }),
        },
      },
    }).configure({
      component: ({ children, ...props }) => (
        <EditorElement {...props}>{children}</EditorElement>
      ),
    });
    const NonSelectablePlugin = definePlugin('nonSelectableSelectionTest', {
      schema: {
        element: {
          ...schema.element.textBlock(),
          selectable: false,
        },
      },
    }).configure({
      component: ({ children, ...props }) => (
        <EditorElement {...props}>{children}</EditorElement>
      ),
    });
    const editor = createEditor({
      initialValue: [
        {
          children: [
            {
              children: [{ text: 'structure' }],
              type: 'structuralSelectionTest',
            },
          ],
          type: 'selectionTestContainer',
        },
        { children: [{ text: 'locked' }], type: 'nonSelectableSelectionTest' },
        { children: [{ text: 'flow' }], type: 'paragraph' },
      ],
      plugins: [
        BaseParagraphPlugin,
        ContainerPlugin,
        NonSelectablePlugin,
        StructuralPlugin,
      ],
    });

    editor.update.selection.setNodes([[0, 0], [1], [2]]);

    const view = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
        <NodeSelectionHighlight />
      </EditorRoot>
    );

    await waitFor(() => {
      expect(
        view.container.querySelectorAll(
          '[data-slot="node-selection-highlight"]'
        )
      ).toHaveLength(1);
    });
  });

  it('does not duplicate a component-owned highlight', async () => {
    const SelfOwnedPlugin = definePlugin('selfOwnedSelectionTest', {
      schema: {
        element: schema.element.textBlock(),
      },
    }).configure({
      component: ({ attributes, children, ...props }) => (
        <EditorElement
          {...props}
          attributes={{
            ...attributes,
            'data-node-selection-highlight': 'self',
          }}
        >
          <div contentEditable={false} data-slot="node-selection-highlight" />
          {children}
        </EditorElement>
      ),
    });
    const editor = createEditor({
      initialValue: [
        { children: [{ text: 'owned' }], type: 'selfOwnedSelectionTest' },
        { children: [{ text: 'flow' }], type: 'paragraph' },
      ],
      plugins: [BaseParagraphPlugin, SelfOwnedPlugin],
    });

    editor.update.selection.setNodes([[0], [1]]);

    const view = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
        <NodeSelectionHighlight />
      </EditorRoot>
    );

    await waitFor(() => {
      expect(
        view.container.querySelectorAll(
          '[data-slot="node-selection-highlight"]'
        )
      ).toHaveLength(2);
    });
  });

  it('uses an owned header target without selecting its container for body drags', async () => {
    const ContainerPlugin = definePlugin('selectionHeaderContainer', {
      schema: {
        element: {
          content: schema.content.element(BaseParagraphPlugin, { min: 1 }),
        },
      },
    }).configure({
      component: ({ children, ...props }) => (
        <EditorElement {...props}>
          <div contentEditable={false} data-node-selection-target="true">
            Header
          </div>
          {children}
        </EditorElement>
      ),
    });
    const editor = createEditor({
      initialValue: [
        {
          type: 'selectionHeaderContainer',
          children: [{ type: 'paragraph', children: [{ text: 'body' }] }],
        },
      ],
      plugins: [BaseParagraphPlugin, ContainerPlugin],
    });
    const view = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
        <NodeSelectionHighlight />
        <NodeSelectionDrag />
      </EditorRoot>
    );
    const editable =
      view.container.querySelector<HTMLElement>('[data-editor]')!;
    const elements = editable.querySelectorAll<HTMLElement>(
      '[data-editor-node="element"]'
    );
    const header = editable.querySelector<HTMLElement>(
      '[data-node-selection-target]'
    )!;
    for (const [element, rect] of [
      [elements[0], new DOMRect(20, 40, 160, 100)],
      [header, new DOMRect(20, 40, 160, 30)],
      [elements[1], new DOMRect(40, 80, 140, 40)],
    ] as const) {
      Object.defineProperty(element, 'getBoundingClientRect', {
        configurable: true,
        value: () => rect,
      });
    }
    const drag = (top: number, bottom: number) => {
      fireEvent.pointerDown(editable, {
        button: 0,
        clientX: 0,
        clientY: top,
        pointerId: 1,
      });
      fireEvent.pointerMove(document, {
        clientX: 100,
        clientY: bottom,
        pointerId: 1,
      });
      fireEvent.pointerUp(document, {
        clientX: 100,
        clientY: bottom,
        pointerId: 1,
      });
    };
    drag(90, 100);
    await waitFor(() =>
      expect(editor.read.selection.nodes().map(([, path]) => path)).toEqual([
        [0, 0],
      ])
    );
    drag(45, 55);
    await waitFor(() =>
      expect(editor.read.selection.nodes().map(([, path]) => path)).toEqual([
        [0],
      ])
    );
  });

  it('keeps ArrowDown block navigation DOM work independent of document size', () => {
    const countWork = (blocks: number) => {
      const editor = createEditor({
        initialValue: Array.from({ length: blocks }, (_, index) => ({
          children: [{ text: `block ${index}` }],
          type: 'paragraph',
        })),
        plugins: [BaseParagraphPlugin],
      });
      const view = render(
        <EditorRoot editor={editor} suppressInstanceWarning>
          <EditorContent />
          <NodeSelectionDrag />
        </EditorRoot>
      );
      const editable =
        view.container.querySelector<HTMLElement>('[data-editor]')!;

      act(() => {
        editor.update.selection.setNodes([[1]]);
      });
      const query = spyOn(Element.prototype, 'querySelectorAll');
      const measure = spyOn(Element.prototype, 'getBoundingClientRect');

      try {
        fireEvent.keyDown(editable, { key: 'ArrowDown' });

        expect(editor.read.selection.nodes().map(([, path]) => path)).toEqual([
          [2],
        ]);

        return query.mock.calls.length + measure.mock.calls.length;
      } finally {
        query.mockRestore();
        measure.mockRestore();
        view.unmount();
      }
    };

    expect(countWork(300)).toBe(countWork(10));
  });

  it('stops ArrowDown before a sibling that a content boundary leaves unmounted [EDIT-SEL-BLOCK-ARROW-001]', () => {
    const ContainerPlugin = definePlugin('selectionHiddenContainer', {
      schema: {
        element: {
          content: schema.content.element(BaseParagraphPlugin, { min: 1 }),
        },
      },
    }).configure({
      component: (props) => (
        <EditorElement {...props}>
          {props.slots.children({ from: 0, to: 0 })}
          {props.slots.contentBoundary({
            mounted: false,
            reason: 'app-collapse',
            renderPlaceholder: () => null,
            scope: { from: 1, to: 1, type: 'children' },
            selectionPolicy: 'skip',
          })}
          {props.slots.children({ from: 2, to: 2 })}
        </EditorElement>
      ),
    });
    const editor = createEditor({
      initialValue: [
        {
          type: 'selectionHiddenContainer',
          children: [
            { type: 'paragraph', children: [{ text: 'visible' }] },
            { type: 'paragraph', children: [{ text: 'hidden' }] },
            { type: 'paragraph', children: [{ text: 'after' }] },
          ],
        },
      ],
      plugins: [BaseParagraphPlugin, ContainerPlugin],
    });
    const view = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
        <NodeSelectionDrag />
      </EditorRoot>
    );
    const editable =
      view.container.querySelector<HTMLElement>('[data-editor]')!;

    expect(view.container.textContent).not.toContain('hidden');
    act(() => {
      editor.update.selection.setNodes([[0, 0]]);
    });
    fireEvent.keyDown(editable, { key: 'ArrowDown' });

    expect(editor.read.selection.nodes().map(([, path]) => path)).toEqual([
      [0, 0],
    ]);
  });

  it('canonicalizes nested drag candidates', async () => {
    const ContainerPlugin = definePlugin('selectionTestContainer', {
      schema: {
        element: {
          content: schema.content.element(BaseParagraphPlugin, { min: 1 }),
        },
      },
    }).configure({
      component: ({ children, ...props }) => (
        <EditorElement {...props}>{children}</EditorElement>
      ),
    });
    const editor = createEditor({
      initialValue: [
        {
          children: [{ children: [{ text: 'nested' }], type: 'paragraph' }],
          type: 'selectionTestContainer',
        },
      ],
      plugins: [BaseParagraphPlugin, ContainerPlugin],
    });
    const view = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
        <NodeSelectionHighlight />
        <NodeSelectionDrag />
      </EditorRoot>
    );
    const editable = view.container.querySelector<HTMLElement>('[data-editor]');
    const elements = editable?.querySelectorAll<HTMLElement>(
      '[data-editor-node="element"]'
    );

    expect(editable).toBeTruthy();
    expect(elements).toHaveLength(2);

    for (const element of elements ?? []) {
      Object.defineProperty(element, 'getBoundingClientRect', {
        configurable: true,
        value: () => new DOMRect(20, 20, 80, 80),
      });
    }

    const nestedTarget = elements![1].querySelector<HTMLElement>(
      '[data-editor-node="text"]'
    )!;
    nestedTarget.setAttribute('data-node-selection-target', 'true');
    Object.defineProperty(nestedTarget, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(20, 20, 80, 10),
    });

    fireEvent.pointerDown(editable!, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 1,
    });
    fireEvent.pointerMove(document, {
      clientX: 120,
      clientY: 120,
      pointerId: 1,
    });
    fireEvent.pointerUp(document, {
      clientX: 120,
      clientY: 120,
      pointerId: 1,
    });

    await waitFor(() => {
      expect(editor.read.selection.nodes().map(([, path]) => path)).toEqual([
        [0],
      ]);
      expect(
        view.container.querySelectorAll(
          '[data-slot="node-selection-highlight"]'
        )
      ).toHaveLength(1);
    });
    fireEvent.pointerDown(editable!, {
      button: 0,
      clientX: 0,
      clientY: 90,
      pointerId: 2,
    });
    fireEvent.pointerUp(document, { clientX: 60, clientY: 95, pointerId: 2 });
    await waitFor(() => {
      expect(editor.read.selection.nodes().map(([, path]) => path)).toEqual([
        [0],
      ]);
    });
  });

  it('contracts the live selection when a drag returns toward its anchor', async () => {
    const { editor, view } = renderNodeSelection([]);
    const editable = view.container.querySelector<HTMLElement>('[data-editor]');
    const elements = editable?.querySelectorAll<HTMLElement>(
      '[data-editor-node="element"]'
    );

    expect(editable).toBeTruthy();
    expect(elements).toHaveLength(2);

    const layoutReads = [0, 0];
    const originalInnerHeight = window.innerHeight;

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
      writable: true,
    });
    const scroll = editable;

    if (scroll) {
      Object.defineProperty(scroll, 'getBoundingClientRect', {
        configurable: true,
        value: () => new DOMRect(0, 0, 1000, 1000),
      });
    }

    Object.defineProperty(elements![0], 'getBoundingClientRect', {
      configurable: true,
      value: () => {
        layoutReads[0] += 1;

        return new DOMRect(20, 20, 80, 60);
      },
    });
    Object.defineProperty(elements![1], 'getBoundingClientRect', {
      configurable: true,
      value: () => {
        layoutReads[1] += 1;

        return new DOMRect(20, 120, 80, 60);
      },
    });

    fireEvent.pointerDown(editable!, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 2,
    });
    fireEvent.pointerMove(document, {
      clientX: 120,
      clientY: 200,
      pointerId: 2,
    });

    await waitFor(() => {
      expect(editor.read.selection.nodes().map(([, path]) => path)).toEqual([
        [0],
        [1],
      ]);
      expect(
        document.querySelector<HTMLElement>('[data-slot="node-selection-drag"]')
          ?.style.position
      ).toBe('fixed');
      expect(
        document
          .querySelector('[data-slot="node-selection-drag"]')
          ?.classList.contains('selection-drag')
      ).toBe(true);
    });

    const selectionVersion = editor.read.lastCommit()?.version;

    fireEvent.pointerMove(document, {
      clientX: 120,
      clientY: 200,
      pointerId: 2,
    });
    await act(
      () =>
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, 20);
        })
    );

    expect(editor.read.lastCommit()?.version).toBe(selectionVersion);

    fireEvent.scroll(document);
    fireEvent.pointerMove(document, {
      clientX: 120,
      clientY: 200,
      pointerId: 2,
    });
    await act(
      () =>
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, 20);
        })
    );

    expect(layoutReads).toEqual([2, 2]);

    fireEvent.pointerMove(document, {
      clientX: 120,
      clientY: 80,
      pointerId: 2,
    });

    await waitFor(() => {
      expect(editor.read.selection.nodes().map(([, path]) => path)).toEqual([
        [0],
      ]);
    });

    fireEvent.pointerUp(document, {
      clientX: 120,
      clientY: 80,
      pointerId: 2,
    });

    expect(layoutReads).toEqual([2, 2]);
    window.innerHeight = originalInnerHeight;
  });

  it('tracks structural replacements and history restoration', async () => {
    const { editor, view } = renderNodeSelection([[0], [1]]);

    await waitFor(() => {
      expect(
        view.container.querySelectorAll(
          '[data-slot="node-selection-highlight"]'
        )
      ).toHaveLength(2);
    });

    act(() => {
      editor.update.text.insert('x');
    });

    await waitFor(() => {
      expect(
        view.container.querySelectorAll(
          '[data-slot="node-selection-highlight"]'
        )
      ).toHaveLength(0);
    });

    act(() => {
      editor.api.history.undo();
    });

    await waitFor(() => {
      expect(
        view.container.querySelectorAll(
          '[data-slot="node-selection-highlight"]'
        )
      ).toHaveLength(2);
    });

    act(() => {
      editor.update((tx) => {
        tx.selection.set(null);
        tx.nodes.replaceChildren(
          [{ children: [{ text: 'replacement' }], type: 'paragraph' }],
          { at: [] }
        );
      });
    });

    await waitFor(() => {
      expect(
        view.container.querySelectorAll(
          '[data-slot="node-selection-highlight"]'
        )
      ).toHaveLength(0);
    });
  });

  it('commits the highlight layer once per selected-set change', async () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 20 }, (_, index) => ({
        children: [{ text: `block ${index}` }],
        type: 'paragraph',
      })),
      plugins: [BaseParagraphPlugin],
    });
    let commits = 0;
    const { createPortal } = ReactDOM;
    const createPortalSpy = spyOn(ReactDOM, 'createPortal').mockImplementation(
      (children, container, key) => createPortal(children, container, key)
    );
    const view = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
        <React.Profiler
          id="node-selection-highlight"
          onRender={() => {
            commits += 1;
          }}
        >
          <NodeSelectionHighlight />
        </React.Profiler>
      </EditorRoot>
    );

    await waitFor(() => {
      expect(
        view.container.querySelectorAll(
          '[data-slot="node-selection-highlight"]'
        )
      ).toHaveLength(0);
    });
    commits = 0;
    createPortalSpy.mockClear();

    try {
      for (let index = 0; index < 10; index++) {
        act(() => {
          editor.update.selection.setNodes(
            Array.from({ length: index + 1 }, (_, pathIndex) => [pathIndex])
          );
        });
        await waitFor(() => {
          expect(
            view.container.querySelectorAll(
              '[data-slot="node-selection-highlight"]'
            )
          ).toHaveLength(index + 1);
        });
      }

      expect(commits).toBe(10);
      expect(createPortalSpy).toHaveBeenCalledTimes(10);
    } finally {
      createPortalSpy.mockRestore();
    }
  });

  it('measures selectable geometry once per stable large drag', async () => {
    const editor = createEditor({
      initialValue: Array.from({ length: 100 }, (_, index) => ({
        children: [{ text: `block ${index}` }],
        type: 'paragraph',
      })),
      plugins: [BaseParagraphPlugin],
    });
    const view = render(
      <EditorRoot editor={editor} suppressInstanceWarning>
        <EditorContent />
        <NodeSelectionDrag />
      </EditorRoot>
    );
    const editable = view.container.querySelector<HTMLElement>('[data-editor]');
    const elements = editable?.querySelectorAll<HTMLElement>(
      '[data-editor-node="element"]'
    );

    expect(editable).toBeTruthy();
    expect(elements).toHaveLength(100);

    let layoutReads = 0;
    const originalInnerHeight = window.innerHeight;

    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
      writable: true,
    });
    const scroll = editable;

    if (scroll) {
      Object.defineProperty(scroll, 'getBoundingClientRect', {
        configurable: true,
        value: () => new DOMRect(0, 0, 1000, 1000),
      });
    }
    for (const element of elements ?? []) {
      Object.defineProperty(element, 'getBoundingClientRect', {
        configurable: true,
        value: () => {
          layoutReads += 1;

          return new DOMRect(20, 20, 80, 60);
        },
      });
    }

    fireEvent.pointerDown(editable!, {
      button: 0,
      clientX: 0,
      clientY: 0,
      pointerId: 3,
    });
    for (let index = 0; index < 10; index++) {
      fireEvent.pointerMove(document, {
        clientX: 120,
        clientY: 120,
        pointerId: 3,
      });
      await act(
        () =>
          new Promise<void>((resolve) => {
            window.setTimeout(resolve, 20);
          })
      );
    }
    fireEvent.pointerUp(document, {
      clientX: 120,
      clientY: 120,
      pointerId: 3,
    });

    expect(editor.read.selection.nodes()).toHaveLength(100);
    expect(layoutReads).toBe(100);
    window.innerHeight = originalInnerHeight;
  });
});
