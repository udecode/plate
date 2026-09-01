import type { RefObject } from 'react';

import type { PliteWidgetGeometry } from '../widget-geometry';
import type { PliteWidget } from '../widget-store';
import { useEditorContext } from './use-editor-context';
import { usePliteWidgetGeometry } from './use-plite-widget-geometry';
import { usePliteWidgetStore } from './use-plite-widget-store';

/** Identifies the exact mounted Editable used to resolve selection geometry. */
export type UseSelectionGeometryOptions = Readonly<{
  editableRef: RefObject<HTMLElement | null>;
}>;

const SELECTION_WIDGET_ID = 'plite-selection-geometry';
const SELECTION_WIDGETS = Object.freeze([
  Object.freeze({
    id: SELECTION_WIDGET_ID,
    target: Object.freeze({ type: 'selection' as const }),
  }),
]) satisfies readonly PliteWidget[];

/** Read geometry for the current selection in one exact Editable. */
export function useSelectionGeometry(
  options: UseSelectionGeometryOptions
): PliteWidgetGeometry | null {
  const editor = useEditorContext();
  const store = usePliteWidgetStore(editor, SELECTION_WIDGETS, {
    id: SELECTION_WIDGET_ID,
  });

  return usePliteWidgetGeometry(store, SELECTION_WIDGET_ID, options);
}
