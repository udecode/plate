import { replace as editorReplace } from '@platejs/plite/internal';
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from '@platejs/plite-dom/internal';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  readModelSelectionDOMPreference,
  writeCollapsedModelSelectionDOMPreference,
} from '../src/editable/model-selection-dom-preference';
import { EditableDOMRuntime } from '../src/editable/editable-dom-runtime';
import { focusPliteEditable } from '../src/hooks/focus-plite-editable';
import { createReactEditor } from '../src/plugin/with-react';
import { createPliteProjectionGraph } from '../src/projection-graph';
import {
  createPliteViewSelection,
  writePliteViewSelection,
} from '../src/view-selection';

const createProjectedSelection = () => {
  const graph = createPliteProjectionGraph([
    { path: [0], root: 'main' },
    { path: [0], root: 'side' },
  ]);

  return createPliteViewSelection(graph, {
    kind: 'text',
    anchor: { point: { path: [0, 0], offset: 0 } },
    focus: { point: { path: [0, 0], root: 'side', offset: 1 } },
  });
};

const createCollapsedProjectedSelection = () => {
  const graph = createPliteProjectionGraph([{ path: [0], root: 'main' }]);

  return createPliteViewSelection(graph, {
    kind: 'text',
    anchor: { point: { path: [0, 0], offset: 1 } },
    focus: { point: { path: [0, 0], offset: 1 } },
  });
};

const createFocusableEditor = () => {
  const element = document.createElement('div');

  element.tabIndex = 0;
  document.body.appendChild(element);

  const focus = vi.fn(() => {
    element.focus({ preventScroll: true });
  });
  const editor = Object.assign(element, {
    api: {
      dom: {
        assertDOMNode: () => element,
        focus,
      },
    },
  }) as unknown as Parameters<typeof focusPliteEditable>[0];

  return { editor, element, focus };
};

afterEach(() => {
  document.body.textContent = '';
});

describe('focusPliteEditable', () => {
  it('uses the DOM editor focus path for normal model selections', () => {
    const { editor, element, focus } = createFocusableEditor();

    focusPliteEditable(editor);

    expect(focus).toHaveBeenCalledTimes(1);
    expect(element.ownerDocument.activeElement).toBe(element);
  });

  it('does not export a model selection over an active projected view selection', () => {
    const { editor, element, focus } = createFocusableEditor();

    writePliteViewSelection(editor, createProjectedSelection());

    focusPliteEditable(editor);

    expect(focus).not.toHaveBeenCalled();
    expect(element.ownerDocument.activeElement).toBe(element);
  });

  it('restores the DOM focus path for a collapsed projected view selection', () => {
    const { editor, element, focus } = createFocusableEditor();

    writePliteViewSelection(editor, createCollapsedProjectedSelection());

    focusPliteEditable(editor);

    expect(focus).toHaveBeenCalledTimes(1);
    expect(element.ownerDocument.activeElement).toBe(element);
  });

  it('exports preferred DOM point during focus', () => {
    const editor = createReactEditor();
    const element = document.createElement('div');
    const firstLine = document.createTextNode('first line');
    const secondLine = document.createTextNode('second line');
    const domSelection = document.getSelection();
    const selection = {
      kind: 'text',
      anchor: { path: [0, 0], offset: firstLine.textContent!.length },
      focus: { path: [0, 0], offset: firstLine.textContent!.length },
    };

    if (!domSelection) {
      throw new Error('Expected document selection');
    }

    element.tabIndex = 0;
    element.append(firstLine, secondLine);
    document.body.appendChild(element);
    EDITOR_TO_ELEMENT.set(editor, element);
    EDITOR_TO_WINDOW.set(editor, window);
    ELEMENT_TO_NODE.set(element, editor);
    NODE_TO_ELEMENT.set(editor, element);
    const runtime = new EditableDOMRuntime({ editor });

    runtime.setRoot(element);
    runtime.connect();

    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [
            { text: `${firstLine.textContent}${secondLine.textContent}` },
          ],
        },
      ],
      selection,
    });

    writeCollapsedModelSelectionDOMPreference(editor, selection, {
      node: secondLine,
      offset: 0,
    });

    try {
      focusPliteEditable(editor);

      expect(document.activeElement).toBe(element);
      expect(domSelection.anchorNode).toBe(secondLine);
      expect(domSelection.anchorOffset).toBe(0);
    } finally {
      runtime.destroy();
      EDITOR_TO_ELEMENT.delete(editor);
      EDITOR_TO_WINDOW.delete(editor);
      ELEMENT_TO_NODE.delete(element);
      NODE_TO_ELEMENT.delete(editor);
    }
  });

  it('expires a preferred DOM point after the current task', () => {
    vi.useFakeTimers();

    const editor = createReactEditor();
    const element = document.createElement('div');
    const firstLine = document.createTextNode('first line');
    const secondLine = document.createTextNode('second line');
    const selection = {
      kind: 'text',
      anchor: { path: [0, 0], offset: firstLine.textContent!.length },
      focus: { path: [0, 0], offset: firstLine.textContent!.length },
    };

    element.append(firstLine, secondLine);
    document.body.appendChild(element);
    const runtime = new EditableDOMRuntime({ editor });

    runtime.setRoot(element);
    runtime.connect();

    writeCollapsedModelSelectionDOMPreference(editor, selection, {
      node: secondLine,
      offset: 0,
    });

    expect(
      readModelSelectionDOMPreference({
        editor,
        editorElement: element,
        selection,
      })
    ).not.toBeNull();
    vi.runOnlyPendingTimers();

    expect(
      readModelSelectionDOMPreference({
        editor,
        editorElement: element,
        selection,
      })
    ).toBeNull();
    runtime.destroy();
    vi.useRealTimers();
  });
});
