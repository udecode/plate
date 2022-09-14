import { Value } from '../../../slate/editor/TEditor';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { PlateId, usePlateSelectors } from '../createPlateStore';

export const usePlatePlugins = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: PlateId
) => {
  usePlateSelectors(id).keyPlugins();

  return usePlateSelectors<V, E>(id).plugins();
};
