import type {
  Descendant,
  NodeEntry,
  NodeOperation,
  Range,
  Selection,
  TextOperation,
  ValueOf,
} from '@platejs/plite';
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
    /** Controlled callback called when the editor state changes. */
    onChange: (options: { editor: E; value: ValueOf<E> }) => void;
    /** Controlled callback called when a node operation is applied. */
    onNodeChange: (options: {
      editor: E;
      node: Descendant;
      operation: NodeOperation;
      prevNode: Descendant;
    }) => void;
    /** Controlled callback called when the selection changes. */
    onSelectionChange: (options: { editor: E; selection: Selection }) => void;
    /** Controlled callback called when a text operation is applied. */
    onTextChange: (options: {
      editor: E;
      node: Descendant;
      operation: TextOperation;
      prevText: string;
      text: string;
    }) => void;
    /** Controlled callback called when the value changes. */
    onValueChange: (options: { editor: E; value: ValueOf<E> }) => void;
  }> & {
    /** A reference to the editor container element. */
    containerRef: React.RefObject<HTMLDivElement | null>;
    /**
     * Plite editor reference.
     *
     * @default createPlateFallbackEditor()
     */
    editor: E;
  };
