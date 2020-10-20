import isHotkey from 'is-hotkey';
import { Editor, Transforms } from 'slate';
import get from 'lodash/get';
import { ELEMENT_BLOCKQUOTE, ELEMENT_PARAGRAPH } from "@udecode/slate-plugins";
import { getAboveByType } from '../queries/getAboveByType';
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
        const t = getAboveByType(editor, ELEMENT_BLOCKQUOTE)
        const above = Editor.above(editor);
        if (above) {
          const [node, _] = above;
          const nodeType = get(node, 'type');
          if (nodeType === type) {
            Transforms.setNodes(editor, {
              type: ELEMENT_PARAGRAPH
            });
          } else {
            Transforms.setNodes(editor, {
              type
            });
          }
        }
      }
    }
    : undefined;
