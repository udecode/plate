import type { TNodeEntry, TSelection, ValueOf } from '@udecode/slate';
import type { Range } from 'slate';

import type { PlateId } from '../../client';
import type { PlateEditor } from './PlateEditor';
import type { Nullable } from './misc/Nullable';
import type { TEditableProps } from './slate-react/TEditableProps';

export type PlateChangeKey =
  | 'versionDecorate'
  | 'versionEditor'
  | 'versionSelection';

export type PlateStoreState<E extends PlateEditor = PlateEditor> = {
  /**
   * Slate editor reference.
   *
   * @default createPlateFallbackEditor()
   */
  editor: E;

  /**
   * A unique id used as a provider scope. Use it if you have multiple `Plate`
   * in the same React tree.
   *
   * @default random id
   */
  id: PlateId;

  /**
   * Value of the editor.
   *
   * @default [{ type: 'p'; children: [{ text: '' }] }]
   */
  value: ValueOf<E>;
} & Nullable<{
  decorate: NonNullable<(options: { editor: E; entry: TNodeEntry }) => Range[]>;

  /** Whether `Editable` is rendered so slate DOM is resolvable. */
  isMounted: boolean;

  /** Controlled callback called when the editor state changes. */
  onChange: (options: { editor: E; value: ValueOf<E> }) => void;

  /** Controlled callback called when the editor.selection changes. */
  onSelectionChange: (options: { editor: E; selection: TSelection }) => void;

  /** Controlled callback called when the editor.children changes. */
  onValueChange: (options: { editor: E; value: ValueOf<E> }) => void;

  /**
   * Whether the editor is primary. If no editor is active, then PlateController
   * will use the first-mounted primary editor.
   *
   * @default true
   */
  primary: boolean;

  // Whether the editor is read-only.
  readOnly: boolean;

  renderElement: NonNullable<TEditableProps['renderElement']>;

  renderLeaf: NonNullable<TEditableProps['renderLeaf']>;

  /**
   * Version incremented when calling `redecorate`. This is a dependency of the
   * `decorate` function.
   */
  versionDecorate: number;
  /** Version incremented on each editor change. */
  versionEditor: number;
  /** Version incremented on each editor.selection change. */
  versionSelection: number;
}>;

// A list of store keys to be exposed in `editor.plate.set`.
export const EXPOSED_STORE_KEYS: (keyof PlateStoreState)[] = [
  'readOnly',
  'onChange',
  'decorate',
  'renderElement',
  'renderLeaf',
];
