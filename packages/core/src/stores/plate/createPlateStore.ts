import { createStore } from '@udecode/zustood';
import { createEditor } from 'slate';
import { ELEMENT_DEFAULT } from '../../common/types/node.types';
import { withPlate } from '../../plugins/withPlate';
import { PlateChangeKey, PlateStoreState } from '../../types/PlateStore';
import { TEditor } from '../../types/slate/TEditor';

export const createPlateStore = (state: Partial<PlateStoreState> = {}) =>
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
  } as PlateStoreState).extendActions((_set, _get) => ({
    /**
     * Set a new editor with plate.
     */
    resetEditor: () => {
      _set.editor(
        withPlate(createEditor() as TEditor, {
          id: state.id,
          plugins: _get.editor()?.plugins,
        })
      );
    },
    incrementKey: (key: PlateChangeKey) => {
      const prev = _get[key]() ?? 1;

      _set[key](prev + 1);
    },
  }));
