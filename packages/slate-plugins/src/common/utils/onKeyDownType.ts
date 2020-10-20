import isHotkey from 'is-hotkey';
import get from 'lodash/get';
import { Editor, Transforms } from 'slate';
import { ELEMENT_PARAGRAPH } from '../../elements/paragraph/defaults';

export interface TypeOnKeyDownOptions {
  /**
   * Key of the mark
   */
  type: string;

  /**
   * Hotkey to toggle the mark
   */
  hotkey?: string;
}

/**
 * Get `onKeyDown` handler if there is a hotkey defined.
 */
export const onKeyDownType = ({ type, hotkey }: TypeOnKeyDownOptions) =>
  hotkey
    ? (e: any, editor: Editor) => {
        if (isHotkey(hotkey, e)) {
          e.preventDefault();
          const above = Editor.above(editor);
          if (above) {
            const [node] = above;
            const nodeType = get(node, 'type');
            if (nodeType === type) {
              Transforms.setNodes(editor, {
                type: ELEMENT_PARAGRAPH,
              });
            } else {
              Transforms.setNodes(editor, {
                type,
              });
            }
          }
        }
      }
    : undefined;
