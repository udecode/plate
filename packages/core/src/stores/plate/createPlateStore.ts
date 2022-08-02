import { withPlate } from '../../plugins/withPlate';
import { Value } from '../../slate/editor/TEditor';
import { ELEMENT_DEFAULT } from '../../types/plate/node.types';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PlateChangeKey, PlateStoreState } from '../../types/plate/PlateStore';
import { createStore } from '../../utils/index';
import { createTEditor } from '../../utils/slate/createTEditor';

export const createPlateStore = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  state: Partial<PlateStoreState<V, E>> = {}
) =>
  createStore(`plate-${state.id}`)({
    id: 'main',
    value: [{ type: ELEMENT_DEFAULT, children: [{ text: '' }] }],
    editor: null,
    isReady: false,
    isRendered: false,
    keyEditor: 1,
    keyPlugins: 1,
    keySelection: 1,
    keyDecorate: 1,
    decorate: null,
    enabled: true,
    editableProps: null,
    onChange: null,
    plugins: [],
    renderElement: null,
    renderLeaf: null,
    ...state,
  } as PlateStoreState<V, E>)
    .extendActions((_set, _get) => ({
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
    }))
    .extendActions((_set) => ({
      /**
       * Redecorate the editor.
       */
      redecorate: () => {
        _set.incrementKey('keyDecorate');
      },
    }));
