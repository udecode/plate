import type { Descendant, Value } from '@udecode/slate';

import { bindFirst } from '@udecode/utils';

import type { CreateSlateEditorOptions } from '../../editor';

import { pipeNormalizeInitialValue } from '../../../internal/plugin/pipeNormalizeInitialValue';
import { createSlatePlugin } from '../../plugin';
import { insertExitBreak } from './transforms/insertExitBreak';
import { resetBlock } from './transforms/resetBlock';

export type InitOptions = Pick<
  CreateSlateEditorOptions,
  'autoSelect' | 'selection' | 'shouldNormalizeEditor' | 'value'
>;

/** Opinionated extension of slate default behavior. */
export const SlateExtensionPlugin = createSlatePlugin({
  key: 'slateExtension',
}).extendEditorTransforms(({ editor }) => ({
  insertExitBreak: bindFirst(insertExitBreak, editor),
  resetBlock: bindFirst(resetBlock, editor),
  /**
   * Initialize the editor value, selection and normalization. Set `value` to
   * `null` to skip children initialization.
   */
  async init({
    autoSelect,
    selection,
    shouldNormalizeEditor,
    value,
  }: InitOptions) {
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
      const target =
        edge === 'start' ? editor.api.start([]) : editor.api.end([]);

      editor.tf.select(target!);
    }
    if (editor.children.length > 0) {
      pipeNormalizeInitialValue(editor);
    }
    if (shouldNormalizeEditor) {
      editor.tf.normalize({ force: true });
    }
  },
  setValue: <V extends Value>(value?: V | string) => {
    let children: Descendant[] = value as any;

    if (typeof value === 'string') {
      children = editor.api.html.deserialize({
        element: value,
      });
    } else if (!value || value.length === 0) {
      children = editor.api.create.value();
    }

    editor.tf.replaceNodes(children, {
      at: [],
      children: true,
    });
  },
}));
