import { Value } from '@udecode/slate';
import { isDefined } from '@udecode/utils';
import { atom } from 'jotai';
import {
  createAtomStore,
  GetRecord,
  SetRecord,
  UseRecord,
} from '../../atoms/index';
import { Scope, useAtom } from '../../libs/index';
import { PlateEditor } from '../../types/PlateEditor';
import { PlateStoreState } from '../../types/PlateStore';

/**
 * A unique id used as a provider scope.
 * Use it if you have multiple `PlateProvider` in the same React tree.
 * @default PLATE_SCOPE
 */
export type PlateId = Scope;

export const PLATE_SCOPE = 'plate';
export const GLOBAL_PLATE_SCOPE = Symbol('global-plate');

export const plateIdAtom = atom(PLATE_SCOPE);

/**
 * Get the closest `Plate` id.
 */
export const usePlateId = () => useAtom(plateIdAtom, GLOBAL_PLATE_SCOPE)[0];

export const createPlateStore = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>({
  decorate = null,
  editor = null as any,
  id,
  isRendered = false,
  keyDecorate = '1',
  keyEditor = '1',
  keySelection = '1',
  onChange = null,
  plugins = [],
  rawPlugins = [],
  readOnly = false,
  renderElement = null,
  renderLeaf = null,
  value = null as any,
  ...state
}: Partial<PlateStoreState<V, E>> = {}) => {
  const stores = createAtomStore(
    {
      decorate,
      editor,
      id,
      isRendered,
      keyDecorate,
      keyEditor,
      keySelection,
      onChange,
      plugins,
      rawPlugins,
      readOnly,
      renderElement,
      renderLeaf,
      value,
      ...state,
    } as PlateStoreState<V, E>,
    {
      scope: PLATE_SCOPE,
      name: 'plate',
    }
  );

  return {
    plateStore: stores.plateStore,
    usePlateStore: (_id?: PlateId) => {
      const closestId = usePlateId();

      // get targeted store if id defined or if the store is found
      if (isDefined(_id) || stores.usePlateStore(_id).get.id(_id)) {
        return stores.usePlateStore(_id);
      }

      return stores.usePlateStore(closestId);
    },
  };
};

export const { plateStore, usePlateStore } = createPlateStore();

export const usePlateSelectors = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: PlateId
): GetRecord<PlateStoreState<V, E>> => usePlateStore(id).get as any;
export const usePlateActions = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: PlateId
): SetRecord<PlateStoreState<V, E>> => usePlateStore(id).set as any;
export const usePlateStates = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: PlateId
): UseRecord<PlateStoreState<V, E>> => usePlateStore(id).use as any;
