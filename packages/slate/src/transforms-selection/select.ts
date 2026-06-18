import {
  getCurrentSelection,
  getEditorOperationRoot,
} from '../core/public-state';
import { getEditorTransformRegistry } from '../core/transform-registry';
import { type Location, LocationApi } from '../interfaces';
import { Editor } from '../interfaces/editor';
import type { SelectionMutationMethods } from '../interfaces/transforms/selection';
import {
  getPointRoot,
  getRangeRoot,
  type RangeRootMeta,
  stripImplicitRangeRoots,
} from '../internal/root-location';
import { formatDebugValue } from '../utils/format-debug-value';
import { executeSetSelectionCommand } from './set-selection';

const getCommandRangeRootMeta = (
  target: Location,
  fallback: string
): RangeRootMeta => {
  if (LocationApi.isRange(target)) {
    return getRangeRoot(target, fallback);
  }

  if (LocationApi.isPoint(target)) {
    const point = getPointRoot(target, fallback);

    return {
      anchor: point,
      focus: point,
      root: point.root,
    };
  }

  const point = {
    root: fallback,
    visibility: 'implicit',
  } as const;

  return {
    anchor: point,
    focus: point,
    root: fallback,
  };
};

export const select: SelectionMutationMethods['select'] = (editor, target) => {
  const selection = getCurrentSelection(editor);
  const commandRangeRootMeta = getCommandRangeRootMeta(
    target,
    getEditorOperationRoot(editor)
  );
  const range = Editor.range(editor, target);
  const commandRange = stripImplicitRangeRoots(range, commandRangeRootMeta);

  if (selection) {
    getEditorTransformRegistry(editor).setSelection(commandRange);
    return;
  }

  if (!LocationApi.isRange(commandRange)) {
    throw new Error(
      `When setting the selection and the current selection is \`null\` you must provide at least an \`anchor\` and \`focus\`, but you passed: ${formatDebugValue(
        commandRange
      )}`
    );
  }

  executeSetSelectionCommand(editor, {
    type: 'set_selection',
    properties: selection,
    newProperties: commandRange,
  });
};
