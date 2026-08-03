import type { Editor, NodeEntry, Range } from '@platejs/plite';
import type { Nullable } from '@udecode/utils';

import type { EditableProps } from '../../../lib';
import type { PlateEditor, PlateEditorReference } from '../../editor';

export type PlateStoreEditor = PlateEditorReference &
  Editor<any, any> &
  Pick<PlateEditor, 'plugin'>;

export type PlateStoreState<E = PlateStoreEditor> = Nullable<{
  decorate: NonNullable<(options: { editor: E; entry: NodeEntry }) => Range[]>;
  /** Whether `Editable` is rendered so Plite DOM is resolvable. */
  isMounted: boolean;
  /**
   * Whether the editor is primary. If no editor is active, then PlateController
   * will use the first-mounted primary editor.
   *
   * @default true
   */
  primary: boolean;
  renderElement: NonNullable<EditableProps['renderElement']>;
  renderLeaf: NonNullable<EditableProps['renderLeaf']>;
  renderText: NonNullable<EditableProps['renderText']>;
}> & {
  /** A reference to the editor container element. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Plite editor reference.
   */
  editor: E;
};
