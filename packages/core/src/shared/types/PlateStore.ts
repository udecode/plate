import type React from 'react';

import type { Value } from '@udecode/slate';

import type { PlateId } from '../../client';
import type { PlateEditor } from './PlateEditor';
import type { Nullable } from './misc/Nullable';
import type {
  PlatePlugin,
  PluginOptions,
  WithPlatePlugin,
} from './plugin/PlatePlugin';
import type { TEditableProps } from './slate-react/TEditableProps';

export type PlateChangeKey =
  | 'versionDecorate'
  | 'versionEditor'
  | 'versionSelection';

export type PlateStoreState<
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = {
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

  /** Flattened plugins. */
  plugins: WithPlatePlugin<PluginOptions, V, E>[];

  /** Plugins prop passed to `Plate`. */
  rawPlugins: PlatePlugin<PluginOptions, V, E>[];

  /**
   * Value of the editor.
   *
   * @default [{ type: 'p'; children: [{ text: '' }] }]
   */
  value: V;
} & Nullable<{
  decorate: NonNullable<TEditableProps['decorate']>;

  /** Access the editor object using a React ref. */
  editorRef: React.ForwardedRef<E>;

  /** Whether `Editable` is rendered so slate DOM is resolvable. */
  isMounted: boolean;

  /** Controlled callback called when the editor state changes. */
  onChange: (value: V) => void;

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
  'plugins',
  'onChange',
  'decorate',
  'renderElement',
  'renderLeaf',
];
