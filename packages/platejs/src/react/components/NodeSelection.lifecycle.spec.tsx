import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { NodeApi } from '../../facade';
import { createEditor } from '../editor/withPlate';
import { NodeSelectionDrag } from './NodeSelection';
import { Plate } from './Plate';
import { PlateContent } from './PlateContent';

const fixture = (count = 3, container?: HTMLElement) => {
  const editor = createEditor({
    initialValue: Array.from({ length: count }, (_, index) => ({
      children: [{ text: `block ${index}` }],
      type: 'paragraph',
    })),
  });
  const tree = (readOnly = false) => (
    <Plate editor={editor} readOnly={readOnly} suppressInstanceWarning>
      <PlateContent domStrategy="full" />
      <NodeSelectionDrag />
    </Plate>
  );
  const view = render(tree(), container ? { container } : undefined);
  const editable = view.container.querySelector<HTMLElement>(
    '[data-plite-editor]'
  )!;
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
  const measure = () => {
    for (const element of editable.querySelectorAll<HTMLElement>(
      '[data-plite-node="element"]'
    )) {
      const index = Number(element.textContent?.replace('block ', ''));
      Object.defineProperty(element, 'getBoundingClientRect', {
        configurable: true,
        value: () => {
          layoutReads += 1;
          return new DOMRect(
            20,
            Number.isNaN(index) ? 9999 : 20 + index * 100,
            80,
            60
          );
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
  const flush = () =>
    act(() => {
      const queued = [...callbacks.values()];
      callbacks.clear();
      for (const callback of queued) callback(0);
    });
  const pointer = (
    type: 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel',
    target: Element | Document,
    y = 80,
    shiftKey = false
  ) => {
    fireEvent[type](target, {
      button: 0,
      clientX: type === 'pointerDown' ? 0 : 120,
      clientY: type === 'pointerDown' ? 0 : y,
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
    layoutReads: () => layoutReads,
  };
};

describe('node selection gesture lifetime', () => {
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
    } finally {
      f.close();
    }
  });

  for (const count of [1, 5, 20, 100, 1000]) {
    it(`measures ${count} stable candidates once across repeated drag updates`, () => {
      const f = fixture(count);
      try {
        f.pointer('pointerDown', f.editable);
        for (let index = 0; index < 5; index++) {
          f.pointer('pointerMove', f.ownerDocument, 90);
          f.flush();
        }
        f.pointer('pointerUp', f.ownerDocument, 90);
        f.flush();
        expect(f.layoutReads()).toBe(count);
        expect(f.selected()).toEqual(['block 0']);
      } finally {
        f.close();
      }
    });
  }
});
