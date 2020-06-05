import { Editor, Point, Transforms } from 'slate';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { DEFAULT_ELEMENT } from '../../element';
import { WithResetBlockTypeOptions } from './types';

export interface WithDeleteStartResetOptions {
  /**
   * Node types where the plugin applies.
   */
  types: string[];
  /**
   * Default type to set when resetting.
   */
  defaultType?: string;
  /**
   * Callback called when unwrapping.
   */
  onUnwrap?: any;
}

/**
 * When deleting backward at the start of an empty block, reset the block type to a default type.
 */
export const withDeleteStartReset = ({
  defaultType = DEFAULT_ELEMENT,
  types,
  onUnwrap,
}: WithResetBlockTypeOptions) => <T extends Editor>(editor: T) => {
  const { deleteBackward } = editor;

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (isCollapsed(selection)) {
      const parent = Editor.above(editor, {
        match: (n) => types.includes(n.type as string),
      });

      if (parent) {
        const [, parentPath] = parent;
        const parentStart = Editor.start(editor, parentPath);

        if (selection && Point.equals(selection.anchor, parentStart)) {
          Transforms.setNodes(editor, { type: defaultType });

          onUnwrap?.();

          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};
