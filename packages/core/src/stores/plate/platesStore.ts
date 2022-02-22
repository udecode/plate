import { createStore } from '@udecode/zustood';
import { castArray } from 'lodash';
import { createEditor } from 'slate';
import { isUndefined } from '../../common/utils/types.utils';
import { PlateProps } from '../../components/Plate';
import { withPlate } from '../../plugins/withPlate';
import { PlatesStoreState, PlateStoreState } from '../../types/PlateStore';
import { eventEditorActions } from '../event-editor/event-editor.store';
import { createPlateStore } from './createPlateStore';
import { getPlateStore, usePlateStore } from './usePlateStore';

export const setPlateState = (
  draft: Partial<PlateStoreState>,
  state: PlateProps
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
  } else if (draft.enabled !== false) {
    draft.editor = withPlate(createEditor(), {
      id: draft.id,
      plugins: draft.plugins,
      disableCorePlugins: state.disableCorePlugins,
    });
  }

  if (!isUndefined(state.initialValue)) draft.value = state.initialValue;
  if (!isUndefined(state.value)) draft.value = state.value;

  return draft;
};

/**
 * Plates store.
 */
export const platesStore = createStore('plate')({} as PlatesStoreState)
  .extendActions((set) => ({
    /**
     * Set state by id.
     * If the store is not yet initialized, it will be initialized.
     * If the store is already set, it will be updated.
     */
    set: (id: string, state?: PlateProps) => {
      set.state((draft) => {
        if (!id) return;

        const store = draft[id];
        if (store) {
          if (state) {
            store.set.state((_draft) => {
              setPlateState(_draft as any, state);
            });
          }
        } else {
          draft[id] = createPlateStore({
            id,
            ...setPlateState({}, state ?? {}),
          });

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
    get(id: string) {
      return state[id];
    },
    has(id?: string | string[]) {
      const ids = castArray<string>(id);

      return ids.every((_id) => !!state[_id]);
    },
  }));

export const platesActions = platesStore.set;
export const platesSelectors = platesStore.get;
export const usePlatesSelectors = platesStore.use;

export const getPlateActions = (id?: string) => getPlateStore(id).set;
export const getPlateSelectors = (id?: string) => getPlateStore(id).get;
export const usePlateSelectors = (id?: string) => usePlateStore(id).use;
