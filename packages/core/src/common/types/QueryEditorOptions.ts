import { Location } from 'slate';
import { TEditor, Value } from '../../slate/types/TEditor';
import { ENode } from '../../slate/types/TNode';
import { QueryNodeOptions } from './QueryNodeOptions';

/**
 * Query the editor state.
 */
export interface QueryEditorOptions<V extends Value>
  extends Pick<QueryNodeOptions<ENode<V>>, 'allow' | 'exclude'> {
  /**
   * Query the editor.
   */
  filter?: (editor: TEditor<V>) => boolean;

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
