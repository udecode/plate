import {
  NodeApi,
  type Point,
  type Selection,
  type Value,
} from '@platejs/plite';

import type { BasePlateEditor } from '../../../editor';

import { getCurrentRuntimeTransforms } from '../../../../internal/currentRuntimeBridge';
import { pipeTransformInitialValue } from '../../../../internal/plugin/pipeTransformInitialValue';

export type InitOptions = {
  autoSelect?: boolean | 'end' | 'start';
  selection?: Selection;
  shouldNormalizeEditor?: boolean;
  value?: any;
  onReady?: (ctx: {
    editor: BasePlateEditor;
    isAsync: boolean;
    value: Value;
  }) => void;
};

export const init = (
  editor: BasePlateEditor,
  { autoSelect, selection, shouldNormalizeEditor, value, onReady }: InitOptions
) => {
  const tf = getCurrentRuntimeTransforms(editor);
  const asTextPoint = (point: Point | null | undefined) => {
    if (!point) return null;

    try {
      if (typeof editor.api.node !== 'function') return point;

      const node = editor.api.node(point.path)?.[0];

      if (node && NodeApi.isText(node)) return point;
    } catch {}

    return null;
  };
  const resolveInitialPoint = (point: Point) => {
    try {
      return (
        asTextPoint(point) ??
        asTextPoint(editor.api.start(point.path)) ??
        asTextPoint(editor.api.start([]))
      );
    } catch {
      try {
        return asTextPoint(editor.api.start([]));
      } catch {
        return null;
      }
    }
  };
  const resolveInitialSelection = (nextSelection: Selection) => {
    if (!nextSelection) return null;

    const anchor = resolveInitialPoint(nextSelection.anchor);
    const focus = resolveInitialPoint(nextSelection.focus);

    return anchor && focus ? { anchor, focus } : null;
  };

  const onValueLoaded = (isAsync = false) => {
    if (!editor.children || editor.children?.length === 0) {
      editor.children = editor.api.create.value() as Value;
    }

    if (editor.children.length > 0) {
      pipeTransformInitialValue(editor);
    }

    if (selection) {
      editor.selection = resolveInitialSelection(selection);
    } else if (autoSelect) {
      const edge = autoSelect === 'start' ? 'start' : 'end';
      const target =
        edge === 'start' ? editor.api.start([]) : editor.api.end([]);

      tf.select(target!);
    }
    if (shouldNormalizeEditor) {
      tf.normalize({ force: true });
    }

    // Only trigger React re-render for async initialization
    if (onReady) {
      onReady({ editor, isAsync, value: editor.children });
    }
  };

  if (value === null) {
    onValueLoaded();
  } else if (typeof value === 'string') {
    editor.children = editor.api.html.deserialize({
      element: value,
    }) as Value;
    onValueLoaded();
  } else if (typeof value === 'function') {
    const result = value(editor);

    // Check if result is a promise (async function)
    if (result && typeof result.then === 'function') {
      result.then((resolvedValue: any) => {
        if (resolvedValue != null) {
          editor.children = resolvedValue;
        }
        onValueLoaded(true);
      });
    } else {
      // Synchronous function
      if (result != null) {
        editor.children = result;
      }
      onValueLoaded();
    }
  } else if (value) {
    editor.children = value;
    onValueLoaded();
  } else {
    onValueLoaded();
  }
};
