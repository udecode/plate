import {
  getCurrentSelection,
  getCurrentSelectionRoot,
  getEditorUpdateRoot,
  setCurrentSelection,
  syncImplicitTargetToCurrentSelection,
} from '../core/public-state';
import type { AnyEditor as Editor, Value } from '../interfaces/editor';
import { PointApi } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import type { Selection } from '../interfaces/selection';
import { SelectionApi } from '../interfaces/selection';
import type { SelectionMutationMethods } from '../interfaces/transforms/selection';
import { withImplicitPointRoot } from '../internal/root-location';

const NON_SETTABLE_SELECTION_PROPERTIES = Object.getOwnPropertyNames(
  Object.prototype
);

type MutableRangeProperties = {
  -readonly [K in keyof Range]?: Range[K];
};

export const writeSelection = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  selection: Selection,
  root = getEditorUpdateRoot(editor)
) => {
  setCurrentSelection(editor, selection, root);
  syncImplicitTargetToCurrentSelection(editor);
};

export const setSelection: SelectionMutationMethods['setSelection'] = (
  editor,
  props
) => {
  const selection = getCurrentSelection(editor);
  const oldProps: MutableRangeProperties = {};
  const newProps: MutableRangeProperties = {};
  const selectionRoot = getCurrentSelectionRoot(editor);
  const updateRoot = getEditorUpdateRoot(editor);

  if (!selection) {
    return;
  }

  for (const key in props) {
    if (NON_SETTABLE_SELECTION_PROPERTIES.includes(key)) {
      continue;
    }

    const value = Object.hasOwn(selection, key)
      ? selection[key as keyof Range]
      : undefined;
    const newValue = props[key as keyof Range];

    if (
      compareSelectionProps(
        key as keyof Range,
        value,
        newValue,
        selectionRoot,
        updateRoot
      )
    ) {
      oldProps[key as keyof Range] = selection[key as keyof Range];
      newProps[key as keyof Range] = props[key as keyof Range];
    }
  }

  if (Object.keys(oldProps).length === 0) {
    return;
  }

  let nextSelection = { ...selection, ...newProps };

  if (
    SelectionApi.isText(selection) &&
    selection.marks !== undefined &&
    SelectionApi.isText(nextSelection) &&
    !Object.hasOwn(newProps, 'marks') &&
    ((Object.hasOwn(newProps, 'anchor') &&
      !PointApi.equals(selection.anchor, nextSelection.anchor)) ||
      (Object.hasOwn(newProps, 'focus') &&
        !PointApi.equals(selection.focus, nextSelection.focus)))
  ) {
    const { marks: _marks, ...selectionWithoutMarks } = nextSelection;

    nextSelection = selectionWithoutMarks;
  }

  writeSelection(editor, nextSelection, updateRoot);
};

const compareSelectionProps = (
  key: keyof Range,
  value: unknown,
  newValue: unknown,
  valueRoot: string,
  newValueRoot: string
) => {
  if (
    (key === 'anchor' || key === 'focus') &&
    PointApi.isPoint(value) &&
    PointApi.isPoint(newValue)
  ) {
    return !PointApi.equals(
      withImplicitPointRoot(value, valueRoot),
      withImplicitPointRoot(newValue, newValueRoot)
    );
  }

  return value !== newValue;
};
