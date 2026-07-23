import type { NodeEntry, Range } from '@platejs/plite';
import type { Nullable } from '@udecode/utils';

import type { EditableProps } from '../../../lib';
import type { PlateEditor } from '../../editor';

export type PlateStoreEditor = PlateEditor;

export type PlateStoreState<E extends PlateStoreEditor = PlateStoreEditor> =
  Nullable<{
    decorate: NonNullable<
      (options: { editor: E; entry: NodeEntry }) => Range[]
    >;
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
