import { Location } from 'slate';
import { TEditor } from '../../types/slate/TEditor';
import { QueryNodeOptions } from './QueryNodeOptions';

/**
 * Query the editor state.
 */
export interface QueryEditorOptions
  extends Pick<QueryNodeOptions, 'allow' | 'exclude'> {
  /**
   * Query the editor.
   */
  filter?: (editor: TEditor) => boolean;

  /**
   * Location from where to lookup the node types (bottom-up)
   */
  at?: Location;

  /**
   * When the selection is at the start of the block above.
   */
  selectionAtBlockStart?: boolean;

  /**
   * When the selection is at the end of the block above.
   */
  selectionAtBlockEnd?: boolean;
}
