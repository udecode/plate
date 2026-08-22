import { readFileSync } from 'node:fs';

import { replace as editorReplace } from '@platejs/plite/internal';

import { PliteReactUpdatePolicy } from '../src';
import { EditableDOMRuntime } from '../src/editable/editable-dom-runtime';
import { createEditableInputController } from '../src/editable/input-state';
import { applyEditableRepairRequest } from '../src/editable/mutation-controller';
import {
  shouldSkipDOMSelection,
  shouldSkipSelectionFocus,
  shouldSkipSelectionScroll,
} from '../src/editable/selection-side-effect-policy';
import { ReactEditor } from '../src/plugin/react-editor';
import { createReactEditor } from '../src/plugin/with-react';

test('selection preservation policy is deeply frozen', () => {
  expect(Object.isFrozen(PliteReactUpdatePolicy)).toBe(true);
  expect(Object.isFrozen(PliteReactUpdatePolicy.preserveSelection)).toBe(true);
  expect(Object.isFrozen(PliteReactUpdatePolicy.preserveSelection.tags)).toBe(
    true
  );
});

test('editable repair request exposes focused profiler buckets', () => {
  const source = readFileSync('src/editable/mutation-controller.ts', 'utf-8');

  expect(source).toMatch(
    /profileEditableMutationDuration\(\s*'repair\.selection-source-transition'/
  );
  expect(source).toMatch(
    /profileEditableMutationDuration\(\s*'repair\.model-owned-text-guard'/
  );
  expect(source).toMatch(
    /profileEditableMutationDuration\(\s*'repair\.focus-editor'/
  );
  expect(source).toMatch(
    /profileEditableMutationDuration\(\s*'repair\.focus-editor-after-render'/
  );
  expect(source).toMatch(
    /profileEditableMutationDuration\(\s*'repair\.force-render'/
  );
  expect(source).toMatch(
    /profileEditableMutationDuration\(\s*'repair\.dom-repair-queue'/
  );
});

const createRemoteSelectionEditor = () => {
  const editor = createReactEditor();

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'one' }] }],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  editor.update(PliteReactUpdatePolicy.preserveSelection, (tx) => {
    tx.selection.set({
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });

  return editor;
};

test('selection preservation policy skips DOM, scroll, and focus side effects', () => {
  const editor = createRemoteSelectionEditor();

  expect(shouldSkipDOMSelection(editor)).toBe(true);
  expect(shouldSkipSelectionScroll(editor)).toBe(true);
  expect(shouldSkipSelectionFocus(editor)).toBe(true);
});

test('selection preservation policy suppresses repair focus without skipping selection sync', () => {
  const editor = createRemoteSelectionEditor();
  const runtime = new EditableDOMRuntime({ editor });
  const originalFocus = ReactEditor.focus;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'model-owned',
    },
  });
  let focusCalls = 0;
  let syncCalls = 0;

  ReactEditor.focus = () => {
    focusCalls += 1;
  };

  try {
    applyEditableRepairRequest({
      domPhaseScheduler: runtime.domPhaseScheduler,
      domRepairQueue: {
        beginFrame() {},
        cancelBefore() {},
        repair() {},
        repairCaretAfterModelIntent() {},
        repairCaretAfterModelTextInsert() {},
        repairDOMInput() {},
      },
      editor,
      forceRender() {},
      inputController,
      request: { focus: true, kind: 'sync-selection' },
      syncDOMSelectionToEditor() {
        syncCalls += 1;
      },
    });
  } finally {
    runtime.destroy();
    ReactEditor.focus = originalFocus;
  }

  expect(focusCalls).toBe(0);
  expect(syncCalls).toBe(1);
});

test('an explicit history target overrides its remote-selection focus suppression', () => {
  const editor = createReactEditor();
  const target = createRemoteSelectionEditor();
  const runtime = new EditableDOMRuntime({ editor });
  const originalFocus = ReactEditor.focus;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'model-owned',
    },
  });
  const focusedEditors: unknown[] = [];
  let pendingFocusEditor: unknown;

  ReactEditor.focus = (focusEditor) => {
    focusedEditors.push(focusEditor);
  };

  try {
    applyEditableRepairRequest({
      domPhaseScheduler: runtime.domPhaseScheduler,
      domRepairQueue: {
        beginFrame() {},
        cancelBefore() {},
        repair() {},
        repairCaretAfterModelIntent() {},
        repairCaretAfterModelTextInsert() {},
        repairDOMInput() {},
      },
      editor,
      focusEditor: target,
      forceRender() {},
      inputController,
      request: { forceRender: true, kind: 'force-render' },
      requestFocusAfterRender(focusEditor) {
        pendingFocusEditor = focusEditor;
      },
      syncDOMSelectionToEditor() {},
    });
  } finally {
    runtime.destroy();
    ReactEditor.focus = originalFocus;
  }

  expect(focusedEditors).toEqual([target]);
  expect(pendingFocusEditor).toBe(target);
});

test('refocuses after a forced renderer repair can replace the active editable', () => {
  const editor = createReactEditor();
  const runtime = new EditableDOMRuntime({ editor });
  const originalFocus = ReactEditor.focus;
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: true },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'model-owned',
    },
  });
  const calls: string[] = [];

  ReactEditor.focus = () => {
    calls.push('focus');
  };

  try {
    applyEditableRepairRequest({
      domPhaseScheduler: runtime.domPhaseScheduler,
      domRepairQueue: {
        beginFrame() {},
        cancelBefore() {},
        repair() {},
        repairCaretAfterModelIntent() {},
        repairCaretAfterModelTextInsert() {},
        repairDOMInput() {},
      },
      editor,
      forceRender() {
        calls.push('render');
      },
      inputController,
      request: { focus: true, forceRender: true, kind: 'force-render' },
      syncDOMSelectionToEditor() {},
    });

    expect(calls).toEqual(['focus', 'render']);
    runtime.domPhaseScheduler.flush();
    expect(calls).toEqual(['focus', 'render', 'focus']);
  } finally {
    runtime.destroy();
    ReactEditor.focus = originalFocus;
  }
});

test('sync-selection repair can mark programmatic selection without DOM sync', () => {
  const editor = createRemoteSelectionEditor();
  const runtime = new EditableDOMRuntime({ editor });
  const inputController = createEditableInputController({
    preferModelSelectionForInputRef: { current: false },
    state: {
      activeIntent: null,
      isComposing: false,
      isDraggingInternally: false,
      isUpdatingSelection: false,
      latestElement: null,
      pendingDOMSelectionImport: false,
      selectionChangeOrigin: null,
      selectionSource: 'dom-current',
    },
  });
  let syncCalls = 0;

  applyEditableRepairRequest({
    domPhaseScheduler: runtime.domPhaseScheduler,
    domRepairQueue: {
      beginFrame() {},
      cancelBefore() {},
      repair() {},
      repairCaretAfterModelIntent() {},
      repairCaretAfterModelTextInsert() {},
      repairDOMInput() {},
    },
    editor,
    forceRender() {},
    inputController,
    request: {
      kind: 'sync-selection',
      selectionSourceTransition: {
        preferModelSelection: true,
        reason: 'model-command',
        selectionSource: 'model-owned',
      },
      syncDOMSelection: false,
    },
    syncDOMSelectionToEditor() {
      syncCalls += 1;
    },
  });

  expect(syncCalls).toBe(0);
  expect(inputController.state.isUpdatingSelection).toBe(true);
  expect(inputController.state.selectionChangeOrigin).toBe(
    'programmatic-export'
  );
  expect(inputController.state.selectionSource).toBe('model-owned');
  expect(inputController.state.modelOwnedTextInputGuard).toBeGreaterThan(0);
  runtime.destroy();
});
