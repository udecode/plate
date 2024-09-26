import type { TNodeEntry, TSelection, ValueOf } from '@udecode/slate';
import type { TEditableProps } from '@udecode/slate-react';
import type { Range } from 'slate';

import type { Nullable } from '../../../lib';
import type { PlateEditor } from '../../editor';

export type PlateChangeKey =
  | 'versionDecorate'
  | 'versionEditor'
  | 'versionSelection';

export type PlateStoreState<E extends PlateEditor = PlateEditor> = Nullable<{
  decorate: NonNullable<(options: { editor: E; entry: TNodeEntry }) => Range[]>;

  /** Whether `Editable` is rendered so slate DOM is resolvable. */
  isMounted: boolean;

  /**
   * Whether the editor is primary. If no editor is active, then PlateController
   * will use the first-mounted primary editor.
   *
   * @default true
   */
  primary: boolean;

  //  Whether the editor is read-only.
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

  /** Version incremented on each editor.children change. */
  versionValue: number;
  /** Controlled callback called when the editor state changes. */
  onChange: (options: { editor: E; value: ValueOf<E> }) => void;
  /** Controlled callback called when the editor.selection changes. */
  onSelectionChange: (options: { editor: E; selection: TSelection }) => void;
  /** Controlled callback called when the editor.children changes. */
  onValueChange: (options: { editor: E; value: ValueOf<E> }) => void;
}> & {
  /**
   * A unique id used as a provider scope. Use it if you have multiple `Plate`
   * in the same React tree.
   *
   * @default random id
   */
  id: string;

  /**
   * Slate editor reference.
   *
   * @default createPlateFallbackEditor()
   */
  editor: E;
};

//  A list of store keys to be exposed in `editor.api.plate.set`.
export const EXPOSED_STORE_KEYS = [
  'readOnly',
  'onChange',
  'decorate',
  'renderElement',
  'renderLeaf',
] as const;
