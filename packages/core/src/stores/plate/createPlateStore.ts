import { createStore } from '@udecode/zustood';
import { ELEMENT_DEFAULT } from '../../common/types/node.types';
import { withPlate } from '../../plugins/withPlate';
import { Value } from '../../slate/editor/TEditor';
import { PlateEditor } from '../../types/PlateEditor';
import { PlateChangeKey, PlateStoreState } from '../../types/PlateStore';
import { createTEditor } from '../../utils/createTEditor';

export const createPlateStore = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  state: Partial<PlateStoreState<V, E>> = {}
) =>
  createStore(`plate-${state.id}`)({
    id: 'main',
    value: [{ type: ELEMENT_DEFAULT, children: [{ text: '' }] }],
    editor: null,
    keyEditor: 1,
    keyPlugins: 1,
    keySelection: 1,
    decorate: null,
    enabled: true,
    editableProps: null,
    onChange: null,
    plugins: [],
    renderElement: null,
    renderLeaf: null,
    ...state,
  } as PlateStoreState<V, E>).extendActions((_set, _get) => ({
    /**
     * Set a new editor with plate.
     */
    resetEditor: () => {
      _set.editor(
        withPlate<V, E>(createTEditor() as E, {
          id: state.id,
          plugins: _get.editor()?.plugins as any,
        })
      );
    },
    incrementKey: (key: PlateChangeKey) => {
      const prev = _get[key]() ?? 1;

      _set[key](prev + 1);
    },
  }));
