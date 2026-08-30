/// <reference types="@testing-library/jest-dom" />

import { describe, expect, it, spyOn } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { schema } from 'plitejs';
import React from 'react';
import ReactDOM from 'react-dom';

import { BaseParagraphPlugin } from '../../lib/plugins/paragraph/BaseParagraphPlugin';
import { createEditor } from '../editor/withPlate';
import { definePlatePlugin } from '../plugin/definePlatePlugin';
import { NodeSelectionDrag, NodeSelectionHighlight } from './NodeSelection';
import { Plate } from './Plate';
import { PlateElement } from './plate-nodes';
import { PlateContent } from './PlateContent';

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
      <Plate editor={editor} suppressInstanceWarning>
        <PlateContent />
        <NodeSelectionHighlight
          className="selection-highlight"
          data-testid="selection-highlight"
          style={{ opacity: 0.5, position: 'relative' }}
          title="Selected"
        />
        <NodeSelectionDrag className="selection-drag" />
      </Plate>
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
    const StructuralPlugin = definePlatePlugin('structuralSelectionTest', {
      schema: {
        element: {
          ...schema.element.textBlock(),
          blockContent: false,
        },
      },
    }).configure({
      component: ({ children, ...props }) => (
        <PlateElement {...props}>{children}</PlateElement>
      ),
    });
    const ContainerPlugin = definePlatePlugin('selectionTestContainer', {
      schema: {
        element: {
          content: schema.content.element(StructuralPlugin, { min: 1 }),
        },
      },
    }).configure({
      component: ({ children, ...props }) => (
        <PlateElement {...props}>{children}</PlateElement>
      ),
    });
    const NonSelectablePlugin = definePlatePlugin(
      'nonSelectableSelectionTest',
      {
        schema: {
          element: {
            ...schema.element.textBlock(),
            selectable: false,
          },
        },
      }
    ).configure({
      component: ({ children, ...props }) => (
        <PlateElement {...props}>{children}</PlateElement>
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
      <Plate editor={editor} suppressInstanceWarning>
        <PlateContent />
        <NodeSelectionHighlight />
      </Plate>
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
    const SelfOwnedPlugin = definePlatePlugin('selfOwnedSelectionTest', {
      schema: {
        element: schema.element.textBlock(),
      },
    }).configure({
      component: ({ attributes, children, ...props }) => (
        <PlateElement
          {...props}
          attributes={{
            ...attributes,
            'data-node-selection-highlight': 'self',
          }}
        >
          <div contentEditable={false} data-slot="node-selection-highlight" />
          {children}
        </PlateElement>
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
      <Plate editor={editor} suppressInstanceWarning>
        <PlateContent />
        <NodeSelectionHighlight />
      </Plate>
    );

    await waitFor(() => {
      expect(
        view.container.querySelectorAll(
          '[data-slot="node-selection-highlight"]'
        )
      ).toHaveLength(2);
    });
  });

  it('canonicalizes nested drag candidates', async () => {
    const ContainerPlugin = definePlatePlugin('selectionTestContainer', {
      schema: {
        element: {
          content: schema.content.element(BaseParagraphPlugin, { min: 1 }),
        },
      },
    }).configure({
      component: ({ children, ...props }) => (
        <PlateElement {...props}>{children}</PlateElement>
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
      <Plate editor={editor} suppressInstanceWarning>
        <PlateContent />
        <NodeSelectionHighlight />
        <NodeSelectionDrag />
      </Plate>
    );
    const editable = view.container.querySelector<HTMLElement>(
      '[data-plite-editor]'
    );
    const elements = editable?.querySelectorAll<HTMLElement>(
      '[data-plite-node="element"]'
    );

    expect(editable).toBeTruthy();
    expect(elements).toHaveLength(2);

    for (const element of elements ?? []) {
      Object.defineProperty(element, 'getBoundingClientRect', {
        configurable: true,
        value: () => new DOMRect(20, 20, 80, 80),
      });
    }

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
  });

  it('contracts the live selection when a drag returns toward its anchor', async () => {
    const { editor, view } = renderNodeSelection([]);
    const editable = view.container.querySelector<HTMLElement>(
      '[data-plite-editor]'
    );
    const elements = editable?.querySelectorAll<HTMLElement>(
      '[data-plite-node="element"]'
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
    const scroll = editor.api.dom.scroll?.();

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
      editor.update.history.undo();
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
      <Plate editor={editor} suppressInstanceWarning>
        <PlateContent />
        <React.Profiler
          id="node-selection-highlight"
          onRender={() => {
            commits += 1;
          }}
        >
          <NodeSelectionHighlight />
        </React.Profiler>
      </Plate>
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
      <Plate editor={editor} suppressInstanceWarning>
        <PlateContent />
        <NodeSelectionDrag />
      </Plate>
    );
    const editable = view.container.querySelector<HTMLElement>(
      '[data-plite-editor]'
    );
    const elements = editable?.querySelectorAll<HTMLElement>(
      '[data-plite-node="element"]'
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
    const scroll = editor.api.dom.scroll?.();

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
