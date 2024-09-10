import type { Location } from 'slate';

import type { TEditor } from '../interfaces';
import type { QueryNodeOptions } from './QueryNodeOptions';

/** Query the editor state. */
export interface QueryEditorOptions<E extends TEditor = TEditor>
  extends Pick<QueryNodeOptions, 'allow' | 'exclude'> {
  /** Location from where to lookup the node types (bottom-up) */
  at?: Location;

  /** Query the editor. */
  filter?: (editor: E) => boolean;

  /** When the selection is at the end of the block above. */
  selectionAtBlockEnd?: boolean;

  /** When the selection is at the start of the block above. */
  selectionAtBlockStart?: boolean;
}
