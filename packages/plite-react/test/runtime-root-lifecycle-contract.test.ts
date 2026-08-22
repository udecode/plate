import { createDOMPhaseScheduler } from '@platejs/plite-dom/internal';

import { createEditableInputControllerState } from '../src/editable/input-controller';
import { attachEditableOutsideFocusBoundaryListener } from '../src/editable/runtime-root-lifecycle';
import { ReactEditor } from '../src/plugin/react-editor';
import { createReactEditor } from '../src/plugin/with-react';

class TestPointerEvent extends MouseEvent {
  readonly pointerType: string;

  constructor(type: string, init: PointerEventInit) {
    super(type, init);
    this.pointerType = init.pointerType ?? '';
  }
}

const mountOutsideFocusBoundary = () => {
  const pointerEventDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'PointerEvent'
  );

  Object.defineProperty(window, 'PointerEvent', {
    configurable: true,
    value: TestPointerEvent,
  });

  const root = document.createElement('div');
  const outsideButton = document.createElement('button');
  const state = createEditableInputControllerState();
  const domPhaseScheduler = createDOMPhaseScheduler({
    getWindow: () => window,
  });
  const editor = createReactEditor();
  const findDocumentOrShadowRoot = vi
    .spyOn(ReactEditor, 'findDocumentOrShadowRoot')
    .mockReturnValue(document);

  root.tabIndex = 0;
  document.body.append(root, outsideButton);

  const detach = attachEditableOutsideFocusBoundaryListener({
    domPhaseScheduler,
    editor,
    publishFocusState: vi.fn(),
    readOnly: false,
    rootRef: { current: root },
    state,
    targetDocument: document,
  });

  return {
    domPhaseScheduler,
    outsideButton,
    root,
    state,
    unmount() {
      detach();
      domPhaseScheduler.destroy();
      findDocumentOrShadowRoot.mockRestore();
      root.remove();
      outsideButton.remove();

      if (pointerEventDescriptor) {
        Object.defineProperty(window, 'PointerEvent', pointerEventDescriptor);
      } else {
        delete (window as Partial<Window>).PointerEvent;
      }
    },
  };
};

const dispatchPointerDown = (
  target: HTMLElement,
  pointerType: 'mouse' | 'pen' | 'touch'
) => {
  target.dispatchEvent(
    new TestPointerEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerType,
    })
  );
};

test('respects the established mousedown focus-preservation contract for external mouse controls', () => {
  const runtime = mountOutsideFocusBoundary();

  try {
    runtime.root.focus();
    runtime.outsideButton.addEventListener('mousedown', (event) => {
      event.preventDefault();
    });

    dispatchPointerDown(runtime.outsideButton, 'mouse');
    runtime.outsideButton.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    );

    expect(runtime.state.outsideFocusBoundarySettleUntil).toBe(0);
    expect(runtime.domPhaseScheduler.pending()).toBe(0);
    expect(document.activeElement).toBe(runtime.root);
  } finally {
    runtime.unmount();
  }
});

test('releases editor-owned focus for an uncancelled outside mouse press', () => {
  const runtime = mountOutsideFocusBoundary();

  try {
    runtime.root.focus();
    dispatchPointerDown(runtime.outsideButton, 'mouse');
    runtime.outsideButton.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    );

    expect(runtime.state.outsideFocusBoundarySettleUntil).toBeGreaterThan(0);
    expect(runtime.domPhaseScheduler.pending()).toBe(1);
    runtime.domPhaseScheduler.flush();
    expect(document.activeElement).not.toBe(runtime.root);
  } finally {
    runtime.unmount();
  }
});

test('keeps a newer editor refocus after an outside mouse press', () => {
  const runtime = mountOutsideFocusBoundary();

  try {
    runtime.outsideButton.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, cancelable: true })
    );
    runtime.root.focus();
    runtime.domPhaseScheduler.flush();

    expect(document.activeElement).toBe(runtime.root);
    expect(runtime.state.outsideFocusBoundarySettleUntil).toBe(0);
  } finally {
    runtime.unmount();
  }
});

test.each(['pen', 'touch'] as const)(
  'keeps %s outside presses on the pointer event path',
  (pointerType) => {
    const runtime = mountOutsideFocusBoundary();

    try {
      dispatchPointerDown(runtime.outsideButton, pointerType);
      runtime.outsideButton.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true, cancelable: true })
      );

      expect(runtime.state.outsideFocusBoundarySettleUntil).toBeGreaterThan(0);
      expect(runtime.domPhaseScheduler.pending()).toBe(1);
    } finally {
      runtime.unmount();
    }
  }
);
