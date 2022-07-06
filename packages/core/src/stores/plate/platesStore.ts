import { castArray } from 'lodash';
import { PlateProps } from '../../components/plate/Plate';
import { Value } from '../../slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';
import {
  PlatesStoreState,
  PlateStoreApi,
  PlateStoreState,
} from '../../types/plate/PlateStore';
import { createStore } from '../../utils/index';
import { isUndefined } from '../../utils/misc/type-utils';
import { eventEditorActions } from '../event-editor/event-editor.store';
import { createPlateStore } from './createPlateStore';
import { getPlateStore, usePlateStore } from './usePlateStore';

export const setPlateState = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  draft: Partial<PlateStoreState<V, E>>,
  state: PlateProps<V, E>
) => {
  if (!isUndefined(state.onChange)) draft.onChange = state.onChange;
  if (!isUndefined(state.plugins)) draft.plugins = state.plugins;
  if (!isUndefined(state.editableProps))
    draft.editableProps = state.editableProps;
  if (!isUndefined(state.renderElement))
    draft.renderElement = state.renderElement;
  if (!isUndefined(state.renderLeaf)) draft.renderLeaf = state.renderLeaf;
  if (!isUndefined(state.decorate)) draft.decorate = state.decorate;

  if (!isUndefined(state.enabled)) draft.enabled = state.enabled;

  if (!isUndefined(state.editor)) {
    draft.editor = state.editor;
    if (state.editor) {
      draft.value = state.editor.children;
    }
  }

  if (!isUndefined(state.initialValue)) draft.value = state.initialValue;
  if (!isUndefined(state.value)) draft.value = state.value;

  return draft;
};

/**
 * Plates store.
 */
export const createPlatesStore = (
  initialState: Partial<PlatesStoreState> = {}
) =>
  createStore('plate')(initialState as PlatesStoreState)
    .extendActions((set) => ({
      /**
       * Set state by id.
       * If the store is not yet initialized, it will be initialized.
       * If the store is already set, it will be updated.
       */
      // eslint-disable-next-line prettier/prettier
      set: <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(id: string, state?: PlateProps<V, E>) => {
        set.state((draft) => {
          if (!id) return;

          let store = draft[id];
          if (!store) {
            store = createPlateStore<V, E>({
              id,
              ...setPlateState({}, state ?? ({} as any)),
            } as any) as any;

            draft[id] = store;

            eventEditorActions.last(id);
          }
        });
      },
      /**
       * Remove state by id. Called by `Plate` on unmount.
       */
      unset: (id: string) => {
        set.state((draft) => {
          delete draft[id];
        });
      },
    }))
    .extendSelectors((state) => ({
      // eslint-disable-next-line prettier/prettier
      get<V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>,>(id: string) {
        return (state[id] as any) as PlateStoreApi<V, E>;
      },
      has(id?: string | string[]) {
        const ids = castArray<string>(id);

        return ids.every((_id) => !!state[_id]);
      },
    }));

export const platesStore = createPlatesStore({});

export const platesActions = platesStore.set;
export const platesSelectors = platesStore.get;
export const usePlatesSelectors = platesStore.use;

export const getPlateActions = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
) => getPlateStore<V, E>(id).set;
export const getPlateSelectors = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
) => getPlateStore<V, E>(id).get;
export const usePlateSelectors = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
) => usePlateStore<V, E>(id).use;
