import { RangeApi, type Range as PliteRange } from '@platejs/plite';
import type { DOMRange } from '@platejs/plite-dom';

export type ModelSelectionDOMPoint = {
  node: globalThis.Node;
  offset: number;
};

type ModelSelectionDOMPreference = {
  anchor: ModelSelectionDOMPoint;
  deleteScheduled: boolean;
  expiresAt: number;
  focus: ModelSelectionDOMPoint;
  selection: PliteRange;
};

const MODEL_SELECTION_DOM_PREFERENCES = new WeakMap<
  object,
  ModelSelectionDOMPreference
>();
const MODEL_SELECTION_DOM_PREFERENCE_TTL_MS = 5000;

const getTimestamp = () => globalThis.performance?.now?.() ?? Date.now();

const isConnectedInsideEditor = (
  editorElement: HTMLElement,
  point: ModelSelectionDOMPoint
) => point.node.isConnected && editorElement.contains(point.node);

export const writeCollapsedModelSelectionDOMPreference = (
  editor: object,
  selection: PliteRange,
  point: ModelSelectionDOMPoint | null
) => {
  if (!point || !RangeApi.isCollapsed(selection)) {
    MODEL_SELECTION_DOM_PREFERENCES.delete(editor);
    return;
  }

  const preference: ModelSelectionDOMPreference = {
    anchor: point,
    deleteScheduled: false,
    expiresAt: getTimestamp() + MODEL_SELECTION_DOM_PREFERENCE_TTL_MS,
    focus: point,
    selection,
  };

  MODEL_SELECTION_DOM_PREFERENCES.set(editor, preference);
  globalThis.setTimeout?.(() => {
    if (MODEL_SELECTION_DOM_PREFERENCES.get(editor) === preference) {
      MODEL_SELECTION_DOM_PREFERENCES.delete(editor);
    }
  }, MODEL_SELECTION_DOM_PREFERENCE_TTL_MS);
};

const scheduleModelSelectionDOMPreferenceDelete = (
  editor: object,
  preference: ModelSelectionDOMPreference
) => {
  if (preference.deleteScheduled) {
    return;
  }

  preference.deleteScheduled = true;
  globalThis.setTimeout?.(() => {
    if (MODEL_SELECTION_DOM_PREFERENCES.get(editor) === preference) {
      MODEL_SELECTION_DOM_PREFERENCES.delete(editor);
    }
  }, 0);
};

export const readModelSelectionDOMPreference = ({
  editor,
  editorElement,
  selection,
}: {
  editor: object;
  editorElement: HTMLElement;
  selection: PliteRange;
}): DOMRange | null => {
  const preference = MODEL_SELECTION_DOM_PREFERENCES.get(editor);

  if (!preference) {
    return null;
  }

  if (preference.expiresAt < getTimestamp()) {
    MODEL_SELECTION_DOM_PREFERENCES.delete(editor);
    return null;
  }

  if (!RangeApi.equals(preference.selection, selection)) {
    MODEL_SELECTION_DOM_PREFERENCES.delete(editor);
    return null;
  }

  if (
    !isConnectedInsideEditor(editorElement, preference.anchor) ||
    !isConnectedInsideEditor(editorElement, preference.focus)
  ) {
    return null;
  }

  try {
    const domRange = editorElement.ownerDocument.createRange();

    domRange.setStart(preference.anchor.node, preference.anchor.offset);
    domRange.setEnd(preference.focus.node, preference.focus.offset);
    scheduleModelSelectionDOMPreferenceDelete(editor, preference);

    return domRange;
  } catch {
    return null;
  }
};
