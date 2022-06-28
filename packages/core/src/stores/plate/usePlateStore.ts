import { usePlateId } from '../../atoms/plateIdAtom';
import { Value } from '../../slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PlateStoreApi } from '../../types/plate/PlateStore';
import { getEventEditorId } from '../event-editor/selectors/getEventEditorId';
import { createPlateStore } from './createPlateStore';
import { platesStore } from './platesStore';

const loadingStore = createPlateStore({
  id: 'loading',
});

export const getPlateStore = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
): PlateStoreApi<V, E> => {
  id = getEventEditorId(id);

  const store = platesStore.get.get(id);

  return (store || loadingStore) as PlateStoreApi<V, E>;
};

export const usePlateStore = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  id?: string
): PlateStoreApi<V, E> => {
  const plateId = usePlateId();
  id = id ?? plateId ?? 'main';

  const store = platesStore.use.get(id);

  if (store) {
    return store as PlateStoreApi<V, E>;
  }

  console.warn(
    "The plate hooks must be used inside the <PlateProvider id={id}> component's context."
  );

  return store || loadingStore;
};
