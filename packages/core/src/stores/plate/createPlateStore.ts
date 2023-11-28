import { Value } from '@udecode/slate';

import {
  createAtomStore,
  GetRecord,
  SetRecord,
  UseRecord,
} from '../../jotai-factory';
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
    }
  );

export const {
  plateStore,
  usePlateStore,
  PlateProvider: PlateStoreProvider,
} = createPlateStore();

export const usePlateSelectors = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  id?: PlateId
): GetRecord<PlateStoreState<V, E>> => usePlateStore(id).get as any;
export const usePlateActions = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  id?: PlateId
): SetRecord<PlateStoreState<V, E>> => usePlateStore(id).set as any;
export const usePlateStates = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  id?: PlateId
): UseRecord<PlateStoreState<V, E>> => usePlateStore(id).use as any;

/**
 * Get the closest `Plate` id.
 */
export const usePlateId = (): PlateId => usePlateSelectors().id();
