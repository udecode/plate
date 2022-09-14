import {
  createAtomStore,
  GetRecord,
  SetRecord,
  UseRecord,
} from '../../atoms/index';
import { Value } from '../../slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PlateStoreState } from '../../types/plate/PlateStore';
import { Scope } from '../../utils/index';

/**
 * A unique id used as a provider scope.
 * Use it if you have multiple `PlateProvider` in the same React tree.
 * @default PLATE_SCOPE
 */
export type PlateId = Scope;

export const PLATE_SCOPE = Symbol('plate');

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
  keyPlugins = '1',
  keySelection = '1',
  onChange = null,
  plugins = [],
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
      isRendered,
      keyDecorate,
      keyEditor,
      keyPlugins,
      keySelection,
      onChange,
      plugins,
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
