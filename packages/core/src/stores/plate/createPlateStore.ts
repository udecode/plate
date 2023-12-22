import { Value } from '@udecode/slate';
import { atom } from 'jotai';

import { createAtomStore } from '../../libs/jotai';
import { PlateEditor } from '../../types/PlateEditor';
import { PlateStoreState } from '../../types/PlateStore';

/**
 * A unique id used as a provider scope.
 * Use it if you have multiple `Plate` in the same React tree.
 * @default PLATE_SCOPE
 */
export type PlateId = string;

export const PLATE_SCOPE = 'plate';
export const GLOBAL_PLATE_SCOPE = Symbol('global-plate');

export const createPlateStore = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>({
  decorate = null,
  editor = null as any,
  id,
  isMounted = false,
  versionDecorate = 1,
  versionEditor = 1,
  versionSelection = 1,
  onChange = null,
  editorRef = null,
  plugins = [],
  rawPlugins = [],
  readOnly = false,
  renderElement = null,
  renderLeaf = null,
  value = null as any,
  ...state
}: Partial<PlateStoreState<V, E>> = {}) =>
  createAtomStore(
    {
      decorate,
      editor,
      id,
      isMounted,
      versionDecorate,
      versionEditor,
      versionSelection,
      onChange,
      editorRef,
      plugins,
      rawPlugins,
      readOnly,
      renderElement,
      renderLeaf,
      value,
      ...state,
    } as PlateStoreState<V, E>,
    {
      name: 'plate',
      extend: (atoms) => ({
        trackedEditor: atom((get) => ({
          editor: get(atoms.editor),
          version: get(atoms.versionEditor),
        })),
        trackedSelection: atom((get) => ({
          selection: get(atoms.editor).selection,
          version: get(atoms.versionSelection),
        })),
      }),
    }
  );

export const {
  plateStore,
  usePlateStore,
  PlateProvider: PlateStoreProvider,
} = createPlateStore();

export const usePlateSelectors = (id?: PlateId) => usePlateStore(id).get;
export const usePlateActions = (id?: PlateId) => usePlateStore(id).set;
export const usePlateStates = (id?: PlateId) => usePlateStore(id).use;

/**
 * Get the closest `Plate` id.
 */
export const usePlateId = (): PlateId => usePlateSelectors().id();
