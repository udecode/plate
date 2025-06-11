import type { EditorTransforms, TSelection, Value } from '@platejs/slate';

import type { SlateEditor } from '../../../editor';

import { pipeNormalizeInitialValue } from '../../../../internal/plugin/pipeNormalizeInitialValue';

// import { pipeNormalizeInitialValue } from '../../../../internal/plugin/pipeNormalizeInitialValue';

export type InitOptions = {
  autoSelect?: boolean | 'end' | 'start';
  selection?: TSelection;
  shouldNormalizeEditor?: boolean;
  value?: any;
};

export const init = async (
  editor: SlateEditor,
  { autoSelect, selection, shouldNormalizeEditor, value }: InitOptions
) => {
  if (value !== null) {
    if (typeof value === 'string') {
      editor.children = editor.api.html.deserialize({
        element: value,
      }) as Value;
    } else if (typeof value === 'function') {
      editor.children = await value(editor);
    } else if (value) {
      editor.children = value;
    }
    if (!editor.children || editor.children?.length === 0) {
      editor.children = editor.api.create.value();
    }
  }

  if (selection) {
    editor.selection = selection;
  } else if (autoSelect) {
    const edge = autoSelect === 'start' ? 'start' : 'end';
    const target = edge === 'start' ? editor.api.start([]) : editor.api.end([]);

    editor.tf.select(target!);
  }
  if (editor.children.length > 0) {
    pipeNormalizeInitialValue(editor);
  }
  if (shouldNormalizeEditor) {
    (editor.tf as EditorTransforms).normalize({ force: true });
  }
};
