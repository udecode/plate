import type { Editor as PliteEditor, NodeEntry, Range } from 'plitejs';
import type {
  PliteAnnotationStore,
  PliteDecorationSource,
} from 'plitejs/react';

import type { EditableProps } from '../../../lib';
import type { Nullable } from '../../../lib/types/Nullable';
import type { Editor, EditorReference } from '../../editor';

export type PlateStoreEditor = EditorReference &
  PliteEditor<any, any> &
  Pick<Editor, 'plugin'>;

export type PlateStoreState<E = PlateStoreEditor> = Nullable<{
  annotationStore: PliteAnnotationStore<any, any>;
  decorate: NonNullable<(options: { editor: E; entry: NodeEntry }) => Range[]>;
  decorationSources: ReadonlyArray<PliteDecorationSource<any>>;
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
