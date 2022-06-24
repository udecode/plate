import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { getPlugins } from '../../../utils/plate/getPlugins';
import { usePlateSelectors } from '../platesStore';
import { getPlateEditorRef } from './usePlateEditorRef';

export const getPlatePlugins = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
) => getPlugins<V, E>(getPlateEditorRef<V, E>(id)!);

export const usePlatePlugins = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
) => {
  usePlateSelectors(id).keyPlugins();

  return getPlatePlugins<V, E>(id);
};
