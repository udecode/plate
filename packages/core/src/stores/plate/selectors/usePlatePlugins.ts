import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/PlateEditor';
import { getPlugins } from '../../../utils/getPlugins';
import { usePlateSelectors } from '../platesStore';
import { getPlateEditorRef } from './usePlateEditorRef';

export const getPlatePlugins = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
) => getPlugins<V, E>(getPlateEditorRef<V, E>(id)!);

export const usePlatePlugins = <
  V extends Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
) => {
  usePlateSelectors(id).keyPlugins();

  return getPlatePlugins<V, E>(id);
};
