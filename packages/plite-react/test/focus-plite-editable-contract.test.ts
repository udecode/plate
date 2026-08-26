import { SelectionApi } from "@platejs/plite";
import {
  EDITOR_TO_ELEMENT,
  EDITOR_TO_WINDOW,
  ELEMENT_TO_NODE,
  NODE_TO_ELEMENT,
} from "@platejs/plite-dom/internal";
import {
  getSelection as editorGetSelection,
  replace as editorReplace,
} from "@platejs/plite/internal";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EditableDOMRuntime } from "../src/editable/editable-dom-runtime";
import {
  readModelSelectionDOMPreference,
  writeCollapsedModelSelectionDOMPreference,
} from "../src/editable/model-selection-dom-preference";
import {
  focusPliteEditable,
  focusPliteEditableAfterEventFrame,
} from "../src/hooks/focus-plite-editable";
import { ReactEditor } from "../src/plugin/react-editor";
import { createReactEditor } from "../src/plugin/with-react";
import { createPliteProjectionGraph } from "../src/projection-graph";
import {
  createPliteViewSelection,
  writePliteViewSelection,
} from "../src/view-selection";

const createProjectedSelection = () => {
  const graph = createPliteProjectionGraph([
    { path: [0], root: "main" },
    { path: [0], root: "side" },
  ]);

  return createPliteViewSelection(graph, {
    kind: "text",
    anchor: { point: { path: [0, 0], offset: 0 } },
    focus: { point: { path: [0, 0], root: "side", offset: 1 } },
  });
};

const createCollapsedProjectedSelection = () => {
  const graph = createPliteProjectionGraph([{ path: [0], root: "main" }]);

  return createPliteViewSelection(graph, {
    kind: "text",
    anchor: { point: { path: [0, 0], offset: 1 } },
    focus: { point: { path: [0, 0], offset: 1 } },
  });
};

const createFocusableEditor = () => {
  const element = document.createElement("div");

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

const createNodeSelectionEditor = () => {
  const editor = createReactEditor();
  const element = document.createElement("div");
  const text = document.createTextNode("focus");
  const selection = SelectionApi.nodes([[0]]);

  element.tabIndex = 0;
  element.append(text);
  document.body.appendChild(element);
  EDITOR_TO_ELEMENT.set(editor, element);
  EDITOR_TO_WINDOW.set(editor, window);
  ELEMENT_TO_NODE.set(element, editor);
  NODE_TO_ELEMENT.set(editor, element);
  editorReplace(editor, {
    children: [{ children: [{ text: "focus" }], type: "paragraph" }],
    selection,
  });

  return { editor, element, selection, text };
};

afterEach(() => {
  document.body.textContent = "";
  vi.restoreAllMocks();
});

describe("focusPliteEditable", () => {
  it("cancels superseded frame and settle focus work", () => {
    const { editor, element } = createFocusableEditor();
    const runtime = new EditableDOMRuntime({ editor });
    const nextElement = document.createElement("button");

    document.body.appendChild(nextElement);
    runtime.setRoot(element);
    runtime.connect();

    try {
      const cancel = focusPliteEditableAfterEventFrame(editor);

      cancel();
      nextElement.focus();
      runtime.domPhaseScheduler.flush();

      expect(document.activeElement).toBe(nextElement);
    } finally {
      runtime.destroy();
    }
  });

  it("uses the DOM editor focus path for normal model selections", () => {
    const { editor, element, focus } = createFocusableEditor();

    focusPliteEditable(editor);

    expect(focus).toHaveBeenCalledTimes(1);
    expect(element.ownerDocument.activeElement).toBe(element);
  });

  it("does not export a model selection over an active projected view selection", () => {
    const { editor, element, focus } = createFocusableEditor();

    writePliteViewSelection(editor, createProjectedSelection());

    focusPliteEditable(editor);

    expect(focus).not.toHaveBeenCalled();
    expect(element.ownerDocument.activeElement).toBe(element);
  });

  it("restores the DOM focus path for a collapsed projected view selection", () => {
    const { editor, element, focus } = createFocusableEditor();

    writePliteViewSelection(editor, createCollapsedProjectedSelection());

    focusPliteEditable(editor);

    expect(focus).toHaveBeenCalledTimes(1);
    expect(element.ownerDocument.activeElement).toBe(element);
  });

  it("clears native selection for a node selection", () => {
    const { editor, element, selection, text } = createNodeSelectionEditor();
    const domSelection = document.getSelection();

    if (!domSelection) {
      throw new Error("Expected document selection");
    }

    domSelection.setBaseAndExtent(text, 0, text, 5);
    const resolveDOMRange = vi.spyOn(ReactEditor, "resolveDOMRange");

    focusPliteEditable(editor);

    expect(resolveDOMRange).not.toHaveBeenCalled();
    expect(editorGetSelection(editor)).toEqual(selection);
    expect(document.activeElement).toBe(element);
    expect(domSelection.rangeCount).toBe(0);
  });

  it("exports preferred DOM point during focus", () => {
    const editor = createReactEditor();
    const element = document.createElement("div");
    const firstLine = document.createTextNode("first line");
    const secondLine = document.createTextNode("second line");
    const domSelection = document.getSelection();
    const selection = {
      kind: "text",
      anchor: { path: [0, 0], offset: firstLine.textContent.length },
      focus: { path: [0, 0], offset: firstLine.textContent.length },
    };

    if (!domSelection) {
      throw new Error("Expected document selection");
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
          type: "paragraph",
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

  it("expires a preferred DOM point after the current task", () => {
    vi.useFakeTimers();

    const editor = createReactEditor();
    const element = document.createElement("div");
    const firstLine = document.createTextNode("first line");
    const secondLine = document.createTextNode("second line");
    const selection = {
      kind: "text",
      anchor: { path: [0, 0], offset: firstLine.textContent.length },
      focus: { path: [0, 0], offset: firstLine.textContent.length },
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
