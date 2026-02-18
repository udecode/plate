import type { EditorTransforms, TSelection, Value } from '@platejs/slate';

import type { SlateEditor } from '../../../editor';

import { pipeNormalizeInitialValue } from '../../../../internal/plugin/pipeNormalizeInitialValue';

export type InitOptions = {
  autoSelect?: boolean | 'end' | 'start';
  selection?: TSelection;
  shouldNormalizeEditor?: boolean;
  value?: any;
  onReady?: (ctx: {
    editor: SlateEditor;
    isAsync: boolean;
    value: Value;
  }) => void;
};

export const init = (
  editor: SlateEditor,
  { autoSelect, selection, shouldNormalizeEditor, value, onReady }: InitOptions
) => {
  const onValueLoaded = (isAsync = false) => {
    if (!editor.children || editor.children?.length === 0) {
      editor.children = editor.api.create.value();
    }

    if (selection) {
      editor.selection = selection;
    } else if (autoSelect) {
      const edge = autoSelect === 'start' ? 'start' : 'end';
      const target =
        edge === 'start' ? editor.api.start([]) : editor.api.end([]);

      editor.tf.select(target!);
    }
    if (editor.children.length > 0) {
      pipeNormalizeInitialValue(editor);
    }
    if (shouldNormalizeEditor) {
      (editor.tf as EditorTransforms).normalize({ force: true });
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
        editor.children = resolvedValue;
        onValueLoaded(true);
      });
    } else {
      // Synchronous function
      editor.children = result;
      onValueLoaded();
    }
  } else if (value) {
    editor.children = value;
    onValueLoaded();
  } else {
    onValueLoaded();
  }
};
