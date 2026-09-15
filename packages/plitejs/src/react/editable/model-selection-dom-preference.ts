import type { Range as ModelRange, Value } from '../..';
import type { DOMRange } from '../../dom';
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
  TPlugins extends readonly unknown[],
>(
  editor: ReactRuntimeEditor<V, TPlugins>,
  selection: ModelRange,
  point: ModelSelectionDOMPoint | null
) => {
  const runtime = point
    ? findMountedEditableDOMRuntime(point.node)
    : getMountedEditableDOMRuntime(editor);

  runtime?.writeCollapsedModelSelectionDOMPreference(selection, point);
};

export const readModelSelectionDOMPreference = <
  V extends Value,
  TPlugins extends readonly unknown[],
>({
  editor,
  editorElement,
  selection,
}: {
  editor: ReactRuntimeEditor<V, TPlugins>;
  editorElement: HTMLElement;
  selection: ModelRange;
}): DOMRange | null =>
  (
    findMountedEditableDOMRuntime(editorElement) ??
    getMountedEditableDOMRuntime(editor)
  )?.readModelSelectionDOMPreference({ editorElement, selection }) ?? null;
