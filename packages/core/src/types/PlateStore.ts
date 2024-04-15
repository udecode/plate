import React from 'react';
import { Value } from '@udecode/slate';

import { Nullable } from './misc/Nullable';
import { PlateEditor } from './PlateEditor';
import {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from './plugin/PlatePlugin';
import { TEditableProps } from './slate-react/TEditableProps';

import type { PlateId } from '../client';

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
   * @default random id
   */
  id: PlateId;

  /**
   * Slate editor reference.
   * @default createPlateFallbackEditor()
   */
  editor: E;

  /**
   * Plugins prop passed to `Plate`.
   */
  rawPlugins: PlatePlugin<PluginOptions, V, E>[];

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

  // Whether the editor is read-only.
  readOnly: boolean;

  /**
   * Whether the editor is primary. If no editor is active, then
   * PlateController will use the first-mounted primary editor.
   * @default true
   */
  primary: boolean;

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
  onChange: (value: V) => void;

  /**
   * Access the editor object using a React ref.
   */
  editorRef: React.ForwardedRef<E>;

  decorate: NonNullable<TEditableProps['decorate']>;
  renderElement: NonNullable<TEditableProps['renderElement']>;
  renderLeaf: NonNullable<TEditableProps['renderLeaf']>;
}>;

// A list of store keys to be exposed in `editor.plate.set`.
export const EXPOSED_STORE_KEYS: (keyof PlateStoreState)[] = [
  'readOnly',
  'plugins',
  'onChange',
  'decorate',
  'renderElement',
  'renderLeaf',
];
