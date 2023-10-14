import { ForwardedRef } from 'react';
import { Value } from '@udecode/slate';

import { PlateId } from '../stores';
import { Nullable } from './misc/Nullable';
import { PlateEditor } from './PlateEditor';
import {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from './plugin/PlatePlugin';
import { TEditableProps } from './slate-react/TEditableProps';

export type PlateChangeKey =
  | 'versionEditor'
  | 'versionSelection'
  | 'versionDecorate';

export type PlateStoreState<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = {
  /**
   * A unique id used as a provider scope.
   * Use it if you have multiple `Plate` in the same React tree.
   * @default PLATE_SCOPE
   */
  id: PlateId;

  /**
   * Slate editor reference.
   * @default pipe(createTEditor(), withPlate({ id, plugins, options, components }))
   */
  editor: E;

  /**
   * Plugins prop passed to `Plate`.
   */
  rawPlugins: PlatePlugin<PluginOptions, V, E>[];

  // Whether the editor is read-only.
  readOnly: boolean;

  /**
   * Flattened plugins.
   */
  plugins: WithPlatePlugin<PluginOptions, V, E>[];

  /**
   * Value of the editor.
   * @default [{ type: 'p', children: [{ text: '' }]}]
   */
  value: V;
} & Nullable<{
  /**
   * Whether `Editable` is rendered so slate DOM is resolvable.
   */
  isMounted: boolean;

  /**
   * Version incremented on each editor change.
   */
  versionEditor: number;

  /**
   * Version incremented on each editor.selection change.
   */
  versionSelection: number;

  /**
   * Version incremented when calling `redecorate`.
   * This is a dependency of the `decorate` function.
   */
  versionDecorate: number;

  /**
   * Controlled callback called when the editor state changes.
   */
  onChange: { fn: (value: V) => void };

  /**
   * Controlled callback called when the editor selection state changes.
   */
  onSelectionChange: { fn: (value: V) => void };

  /**
   * Controlled callback called when the editor value state changes.
   */
  onValueChange: { fn: (value: V) => void };

  /**
   * Access the editor object using a React ref.
   */
  editorRef: { ref: ForwardedRef<E> };

  decorate: { fn: NonNullable<TEditableProps['decorate']> };
  renderElement: { fn: NonNullable<TEditableProps['renderElement']> };
  renderLeaf: { fn: NonNullable<TEditableProps['renderLeaf']> };
}>;

// A list of store keys to be exposed in `editor.plate.set`.
export const EXPOSED_STORE_KEYS: (keyof PlateStoreState)[] = [
  'readOnly',
  'plugins',
  'onChange',
  'onSelectionChange',
  'onValueChange',
  'decorate',
  'renderElement',
  'renderLeaf',
];
