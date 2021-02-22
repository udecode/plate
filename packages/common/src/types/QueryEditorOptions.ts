/**
 * Query the editor state.
 */
import { Editor } from 'slate';

export interface QueryEditorOptions {
  /**
   * Query the editor.
   */
  filter?: (editor: Editor) => boolean;

  /**
   * When the selection is at the start of the block above.
   */
  start?: boolean;

  /**
   * When the selection is at the end of the block above.
   */
  end?: boolean;
}
