import type { Range as PliteRange, Value } from '@platejs/plite';
import type { DOMRange } from '@platejs/plite-dom';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import {
  findMountedEditableDOMRuntime,
  getMountedEditableDOMRuntime,
} from './editable-dom-runtime';

export type ModelSelectionDOMPoint = {
  node: globalThis.Node;
  offset: number;
};

export const writeCollapsedModelSelectionDOMPreference = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: ReactRuntimeEditor<V, TExtensions>,
  selection: PliteRange,
  point: ModelSelectionDOMPoint | null
) => {
  const runtime = point
    ? findMountedEditableDOMRuntime(point.node)
    : getMountedEditableDOMRuntime(editor);

  runtime?.writeCollapsedModelSelectionDOMPreference(selection, point);
};

export const readModelSelectionDOMPreference = <
  V extends Value,
  TExtensions extends readonly unknown[],
>({
  editor,
  editorElement,
  selection,
}: {
  editor: ReactRuntimeEditor<V, TExtensions>;
  editorElement: HTMLElement;
  selection: PliteRange;
}): DOMRange | null =>
  (
    findMountedEditableDOMRuntime(editorElement) ??
    getMountedEditableDOMRuntime(editor)
  )?.readModelSelectionDOMPreference({ editorElement, selection }) ?? null;
