import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { DOMEditor } from '../../dom/plite-dom.internal';
import { NodeApi } from '../../facade';
import { createEditor } from '../editor/withPlate';
import { NodeSelectionDrag } from './NodeSelection';
import { EditorRoot } from './Plate';
import { EditorContent } from './PlateContent';

const BLOCK = { height: 60, pitch: 100, top: 20 } as const;

const fixture = (count = 3, container?: HTMLElement) => {
  const editor = createEditor({
    initialValue: Array.from({ length: count }, (_, index) => ({
      children: [{ text: `block ${index}` }],
      type: 'paragraph',
    })),
  });
  const tree = (readOnly = false) => (
    <EditorRoot editor={editor} readOnly={readOnly} suppressInstanceWarning>
      <EditorContent />
      <NodeSelectionDrag />
    </EditorRoot>
  );
  const resizeObservers: Array<{
    callback: ResizeObserverCallback;
    targets: Map<Element, string | undefined>;
  }> = [];
  const nativeResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class {
    readonly targets = new Map<Element, string | undefined>();

    constructor(callback: ResizeObserverCallback) {
      resizeObservers.push({ callback, targets: this.targets });
    }

    disconnect() {
      this.targets.clear();
    }

    observe(target: Element) {
      this.targets.set(target, undefined);
    }

    unobserve(target: Element) {
      this.targets.delete(target);
    }
  };
  const view = render(tree(), container ? { container } : undefined);
  const editable = view.container.querySelector<HTMLElement>('[data-editor]')!;
  const { ownerDocument } = editable;
  const ownerWindow = ownerDocument.defaultView!;
  Object.defineProperty(editable, 'getBoundingClientRect', {
    configurable: true,
    value: () => new DOMRect(0, 0, 1000, 1000),
  });
  const scroll = editor.api.dom.scroll?.();
  if (scroll) {
    Object.defineProperty(scroll, 'getBoundingClientRect', {
      configurable: true,
      value: () => new DOMRect(0, 0, 1000, 1000),
    });
  }
  let layoutReads = 0;
  let scrollTop = 0;
  const heights = new Map<number, number>();
  const detached = new Set<number>();
  const measure = () => {
    for (const element of editable.querySelectorAll<HTMLElement>(
      '[data-editor-node="element"]'
    )) {
      const index = Number(element.textContent?.replace('block ', ''));
      Object.defineProperty(element, 'getBoundingClientRect', {
        configurable: true,
        value: () => {
          layoutReads += 1;
          if (detached.has(index)) return new DOMRect(0, 0, 0, 0);
          let top = Number.isNaN(index)
            ? 9999
            : BLOCK.top + index * BLOCK.pitch - scrollTop;
          for (const [other, height] of heights) {
            if (other < index) top += height - BLOCK.height;
          }
          return new DOMRect(20, top, 80, heights.get(index) ?? BLOCK.height);
        },
      });
    }
  };
  measure();
  const callbacks = new Map<number, FrameRequestCallback>();
  let nextFrame = 100_000;
  const request = vi
    .spyOn(ownerWindow, 'requestAnimationFrame')
    .mockImplementation((callback) => {
      nextFrame += 1;
      callbacks.set(nextFrame, callback);
      return nextFrame;
    });
  const cancel = vi
    .spyOn(ownerWindow, 'cancelAnimationFrame')
    .mockImplementation((id) => {
      callbacks.delete(id);
    });
  const sizeOf = (target: Element) => {
    const index = Number(target.textContent?.replace('block ', ''));

    if (target === editable || Number.isNaN(index)) {
      return { height: 1000, width: 1000 };
    }
    if (detached.has(index)) return { height: 0, width: 0 };
    return { height: heights.get(index) ?? BLOCK.height, width: 80 };
  };
  const reportSizes = () =>
    act(() => {
      for (const { callback, targets } of resizeObservers) {
        const entries = [...targets.keys()].flatMap((target) => {
          const { height, width } = sizeOf(target);
          const size = `${width},${height}`;

          if (targets.get(target) === size) return [];
          targets.set(target, size);
          return [
            {
              borderBoxSize: [{ blockSize: height, inlineSize: width }],
              contentRect: { height, width },
              target,
            },
          ];
        });

        if (entries.length > 0) {
          callback(
            entries as unknown as ResizeObserverEntry[],
            {} as ResizeObserver
          );
        }
      }
    });
  const flush = () => {
    act(() => {
      const queued = [...callbacks.values()];
      callbacks.clear();
      for (const callback of queued) callback(0);
    });
    reportSizes();
  };
  const scrollable = () => {
    const viewport = Object.fromEntries(
      ['clientHeight', 'clientWidth'].map((key) => [
        key,
        Object.getOwnPropertyDescriptor(ownerDocument.documentElement, key),
      ])
    );

    Object.defineProperties(ownerDocument.documentElement, {
      clientHeight: { configurable: true, value: 1000 },
      clientWidth: { configurable: true, value: 1200 },
    });
    restore.push(() => {
      for (const [key, descriptor] of Object.entries(viewport)) {
        if (descriptor) {
          Object.defineProperty(ownerDocument.documentElement, key, descriptor);
        } else {
          delete (
            ownerDocument.documentElement as unknown as Record<string, unknown>
          )[key];
        }
      }
    });
    editable.style.overflowY = 'auto';
    const scrollHeight = count * 100 + 1000;
    Object.defineProperties(editable, {
      clientHeight: { configurable: true, value: 1000 },
      clientLeft: { configurable: true, value: 0 },
      clientTop: { configurable: true, value: 0 },
      clientWidth: { configurable: true, value: 1000 },
      scrollHeight: { configurable: true, value: scrollHeight },
      scrollTop: {
        configurable: true,
        get: () => scrollTop,
        set: (value: number) => {
          scrollTop = Math.min(Math.max(0, value), scrollHeight - 1000);
        },
      },
    });
  };
  const restore: Array<() => void> = [];
  const pointer = (
    type: 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel',
    target: Element | Document,
    y?: number,
    shiftKey = false
  ) => {
    fireEvent[type](target, {
      button: 0,
      clientX: type === 'pointerDown' ? 0 : 120,
      clientY: y ?? (type === 'pointerDown' ? 0 : 80),
      pointerId: 41,
      shiftKey,
    });
  };
  const selected = () =>
    editor.read.selection.nodes().map(([node]) => NodeApi.string(node));
  const rectangle = () =>
    ownerDocument.querySelector('[data-slot="node-selection-drag"]') !== null;
  const close = () => {
    view.unmount();
    request.mockRestore();
    cancel.mockRestore();
    window.ResizeObserver = nativeResizeObserver;
    while (restore.length > 0) restore.pop()!();
  };
  return {
    editor,
    view,
    tree,
    editable,
    ownerDocument,
    ownerWindow,
    pointer,
    selected,
    rectangle,
    flush,
    measure,
    close,
    scrollable,
    detach: (index: number) => {
      detached.add(index);
      act(() => {
        ownerWindow.dispatchEvent(new Event('resize'));
      });
    },
    grow: (index: number, height: number) => {
      heights.set(index, height);
    },
    observed: () =>
      resizeObservers.reduce((total, { targets }) => total + targets.size, 0),
    resize: (index: number, height: number) => {
      heights.set(index, height);
      act(() => {
        ownerWindow.dispatchEvent(new Event('resize'));
      });
    },
    layoutReads: () => layoutReads,
    scrollTop: () => scrollTop,
  };
};

describe('node selection gesture lifetime', () => {
  it('discards pending movement when pointer capture is lost', () => {
    const f = fixture();
    try {
      f.pointer('pointerDown', f.editable);
      f.pointer('pointerMove', f.ownerDocument, 80);
      f.flush();
      f.pointer('pointerMove', f.ownerDocument, 280);
      fireEvent.lostPointerCapture(f.editable, { pointerId: 41 });
      f.flush();
      expect(f.selected()).toEqual(['block 0']);
      expect(f.rectangle()).toBe(false);
      expect(f.editable.hasPointerCapture(41)).toBe(false);
    } finally {
      f.close();
    }
  });

  it('cancels pending movement without publishing or replaying a selection', () => {
    const f = fixture();
    try {
      act(() => f.editor.update.selection.setNodes([[1]]));
      f.pointer('pointerDown', f.editable);
      f.pointer('pointerMove', f.ownerDocument);
      f.pointer('pointerCancel', f.ownerDocument);
      f.flush();
      expect(f.selected()).toEqual(['block 1']);
      expect(f.rectangle()).toBe(false);
      expect(f.editable.hasPointerCapture(41)).toBe(false);
    } finally {
      f.close();
    }
  });

  for (const reason of ['blur', 'Escape'] as const) {
    it(`ends a pending drag on ${reason}`, () => {
      const f = fixture();
      try {
        act(() => f.editor.update.selection.setNodes([[1]]));
        f.pointer('pointerDown', f.editable);
        f.pointer('pointerMove', f.ownerDocument);
        if (reason === 'blur') fireEvent.blur(f.ownerWindow);
        else fireEvent.keyDown(f.ownerDocument, { key: 'Escape' });
        f.flush();
        expect(f.selected()).toEqual(['block 1']);
        expect(f.rectangle()).toBe(false);
        expect(f.editable.hasPointerCapture(41)).toBe(false);
      } finally {
        f.close();
      }
    });
  }

  it('keeps events and the drag rectangle in the editable document', () => {
    const frame = document.createElement('iframe');
    document.body.append(frame);
    // Happy DOM omits this intrinsic from child windows; its selector parser requires it.
    Object.defineProperty(frame.contentWindow, 'SyntaxError', {
      value: SyntaxError,
    });
    const f = fixture(3, frame.contentDocument!.body);
    try {
      f.pointer('pointerDown', f.editable);
      expect(f.rectangle()).toBe(true);
      expect(
        document.querySelector('[data-slot="node-selection-drag"]') === null
      ).toBe(true);
      f.pointer('pointerMove', document, 280);
      f.flush();
      expect(f.selected()).toEqual([]);
      f.pointer('pointerMove', f.ownerDocument);
      f.pointer('pointerUp', f.ownerDocument);
      f.flush();
      expect(f.selected()).toEqual(['block 0']);
      expect(f.rectangle()).toBe(false);
    } finally {
      f.close();
      frame.remove();
    }
  });

  it('does not replay old paths over a selection changed after pointer release', () => {
    const f = fixture();
    try {
      f.pointer('pointerDown', f.editable);
      f.pointer('pointerUp', f.ownerDocument);
      expect(f.selected()).toEqual(['block 0']);
      act(() => f.editor.update.selection.setNodes([[2]]));
      f.flush();
      expect(f.selected()).toEqual(['block 2']);
    } finally {
      f.close();
    }
  });

  it('resolves shift anchors and geometry again after a structural edit', () => {
    const f = fixture();
    try {
      act(() => f.editor.update.selection.setNodes([[1]]));
      f.pointer('pointerDown', f.editable, 0, true);
      f.pointer('pointerMove', f.ownerDocument);
      act(() =>
        f.editor.update.nodes.insert(
          { children: [{ text: 'inserted' }], type: 'paragraph' },
          { at: [0] }
        )
      );
      f.measure();
      f.flush();
      expect(f.selected()).toEqual(['block 0', 'block 1']);
      f.pointer('pointerUp', f.ownerDocument);
      f.flush();
      expect(f.selected()).toEqual(['block 0', 'block 1']);
    } finally {
      f.close();
    }
  });

  it('does not start or continue a readonly gesture', () => {
    const f = fixture();
    try {
      f.view.rerender(f.tree(true));
      f.pointer('pointerDown', f.editable);
      f.pointer('pointerUp', f.ownerDocument);
      f.flush();
      expect(f.rectangle()).toBe(false);
      expect(f.selected()).toEqual([]);
      f.view.rerender(f.tree());
      f.pointer('pointerDown', f.editable);
      f.pointer('pointerMove', f.ownerDocument);
      f.view.rerender(f.tree(true));
      f.flush();
      expect(f.rectangle()).toBe(false);
      expect(f.selected()).toEqual([]);
      expect(f.editable.hasPointerCapture(41)).toBe(false);
    } finally {
      f.close();
    }
  });

  it('cancels the queued release focus when the window loses focus', () => {
    const f = fixture();
    try {
      f.pointer('pointerDown', f.editable);
      f.pointer('pointerUp', f.ownerDocument);
      const focus = vi.spyOn(f.editable, 'focus');
      fireEvent.blur(f.ownerWindow);
      f.flush();
      expect(focus).not.toHaveBeenCalled();
      focus.mockRestore();
    } finally {
      f.close();
    }
  });

  it('drops removed shift targets and disposes pending work on unmount', () => {
    const f = fixture();
    try {
      act(() => f.editor.update.selection.setNodes([[1]]));
      f.pointer('pointerDown', f.editable, 0, true);
      f.pointer('pointerMove', f.ownerDocument);
      act(() => f.editor.update.nodes.remove({ at: [1] }));
      f.measure();
      f.flush();
      expect(f.selected()).toEqual(['block 0']);
      f.pointer('pointerMove', f.ownerDocument, 280);
      f.view.unmount();
      const change = f.editor.read.lastCommit();
      f.flush();
      expect(f.editor.read.lastCommit()).toBe(change);
      expect(f.rectangle()).toBe(false);
      expect(f.editable.hasPointerCapture(41)).toBe(false);
    } finally {
      f.close();
    }
  });

  for (const count of [1, 5, 20, 100, 1000]) {
    it(`measures ${count} stable candidates at the start and after the editable's first size report, never once per frame`, () => {
      const f = fixture(count);
      try {
        f.pointer('pointerDown', f.editable);
        for (let index = 0; index < 5; index++) {
          f.pointer('pointerMove', f.ownerDocument, 90);
          f.flush();
        }
        f.pointer('pointerUp', f.ownerDocument, 90);
        f.flush();
        expect(f.layoutReads()).toBe(2 * count);
        expect(f.selected()).toEqual(['block 0']);
      } finally {
        f.close();
      }
    });
  }
});

describe('node selection scroll frames', () => {
  const countFrame = (f: ReturnType<typeof fixture>, run: () => void) => {
    const queries = vi.spyOn(f.editable, 'querySelectorAll');
    const resolutions = vi.spyOn(DOMEditor, 'resolveNode');
    const reads = f.layoutReads();

    try {
      run();

      return {
        queries: queries.mock.calls.length,
        reads: f.layoutReads() - reads,
        resolutions: resolutions.mock.calls.length,
      };
    } finally {
      queries.mockRestore();
      resolutions.mockRestore();
    }
  };
  const selectedCount = (scrollTop: number, pointerY: number, count: number) =>
    Math.min(
      count,
      Math.floor((pointerY - BLOCK.top + scrollTop) / BLOCK.pitch) + 1
    );

  for (const count of [100, 1000]) {
    it(`rereads only rectangles while a script scrolls ${count} candidates`, () => {
      const f = fixture(count);
      try {
        f.scrollable();
        f.pointer('pointerDown', f.editable);
        f.pointer('pointerMove', f.ownerDocument, 500);
        f.flush();
        for (let frame = 0; frame < 5; frame++) {
          const work = countFrame(f, () => {
            f.editable.scrollTop += 50;
            fireEvent.scroll(f.editable);
            f.pointer('pointerMove', f.ownerDocument, 500);
            f.flush();
          });

          expect(f.scrollTop()).toBe(50 * (frame + 1));
          expect(f.selected()).toHaveLength(
            selectedCount(f.scrollTop(), 500, count)
          );
          expect(work.queries).toBe(0);
          expect(work.resolutions).toBe(0);
          expect(work.reads).toBeLessThanOrEqual(count);
        }
      } finally {
        f.close();
      }
    });

    it(`scrolls from the bottom edge and rereads only rectangles across ${count} candidates`, () => {
      const f = fixture(count);
      try {
        f.scrollable();
        f.pointer('pointerDown', f.editable);
        f.pointer('pointerMove', f.ownerDocument, 995);
        f.flush();
        for (let frame = 0; frame < 5; frame++) {
          const before = f.scrollTop();
          const work = countFrame(f, () => f.flush());

          expect(f.scrollTop()).toBeGreaterThan(before);
          expect(f.selected()).toHaveLength(
            selectedCount(f.scrollTop(), 995, count)
          );
          expect(work.queries).toBe(0);
          expect(work.resolutions).toBe(0);
          expect(work.reads).toBeLessThanOrEqual(count);
        }
      } finally {
        f.close();
      }
    });
  }

  it('finds a hit target added mid-drag without a commit', async () => {
    const f = fixture(3);
    try {
      f.pointer('pointerDown', f.editable);
      f.pointer('pointerMove', f.ownerDocument, 280);
      f.flush();
      expect(f.selected()).toEqual(['block 0', 'block 1', 'block 2']);

      const block = f.editable.querySelectorAll(
        '[data-editor-node="element"]'
      )[1];
      const target = block.firstElementChild!;
      const commit = f.editor.read.lastCommit();

      Object.defineProperty(target, 'getBoundingClientRect', {
        configurable: true,
        value: () => new DOMRect(20, 9000, 80, 60),
      });
      target.setAttribute('data-node-selection-target', '');
      await act(async () => {});
      expect(f.editor.read.lastCommit()).toBe(commit);
      f.flush();
      expect(f.selected()).toEqual(['block 0', 'block 2']);
    } finally {
      f.close();
    }
  });

  it('keeps a start below a block in its gap when that block grows', () => {
    const f = fixture(10);
    try {
      f.pointer('pointerDown', f.editable, 490);
      f.pointer('pointerMove', f.ownerDocument, 760);
      f.flush();
      expect(f.selected()).toEqual(['block 5', 'block 6', 'block 7']);

      f.resize(4, 150);
      f.flush();
      expect(f.selected()).toEqual(['block 5', 'block 6']);
    } finally {
      f.close();
    }
  });

  it('rereads a block that grew before its first size report', () => {
    const f = fixture(10);
    try {
      f.pointer('pointerDown', f.editable, 490);
      f.grow(4, 150);
      f.pointer('pointerMove', f.ownerDocument, 760);
      f.flush();
      f.pointer('pointerMove', f.ownerDocument, 760);
      f.flush();
      expect(f.selected()).toEqual(['block 5', 'block 6']);
    } finally {
      f.close();
    }
  });

  it('updates hits when a block grows inside a fixed-size editable', () => {
    const f = fixture();
    try {
      f.pointer('pointerDown', f.editable);
      f.pointer('pointerMove', f.ownerDocument, 150);
      f.flush();
      f.flush();
      expect(f.selected()).toEqual(['block 0', 'block 1']);

      f.grow(0, 160);
      f.flush();
      f.flush();
      expect(f.selected()).toEqual(['block 0']);
    } finally {
      f.close();
    }
  });

  it('observes nothing after a release with a candidate refresh pending', () => {
    const f = fixture();
    try {
      f.pointer('pointerDown', f.editable);
      f.pointer('pointerMove', f.ownerDocument);
      f.flush();
      act(() =>
        f.editor.update.nodes.insert(
          { children: [{ text: 'inserted' }], type: 'paragraph' },
          { at: [0] }
        )
      );
      f.pointer('pointerUp', f.ownerDocument);
      expect(f.observed()).toBe(0);
    } finally {
      f.close();
    }
  });

  it('keeps the start inside the block beside it when that block shrinks', () => {
    const f = fixture(10);
    try {
      f.pointer('pointerDown', f.editable, 470);
      f.pointer('pointerMove', f.ownerDocument, 760);
      f.flush();
      f.resize(4, 20);
      f.flush();
      expect(f.selected()).toEqual([
        'block 4',
        'block 5',
        'block 6',
        'block 7',
      ]);
    } finally {
      f.close();
    }
  });

  it('holds the start while the block it follows has no box', () => {
    const f = fixture(10);
    try {
      f.pointer('pointerDown', f.editable, 490);
      f.pointer('pointerMove', f.ownerDocument, 760);
      f.flush();
      f.detach(4);
      f.flush();
      expect(f.selected()).toEqual(['block 5', 'block 6', 'block 7']);
    } finally {
      f.close();
    }
  });
});
