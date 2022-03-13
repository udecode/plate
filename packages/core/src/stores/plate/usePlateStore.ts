import { PlateStoreApi } from '../../types/PlateStore';
import { getEventEditorId } from '../event-editor/selectors/getEventEditorId';
import { usePlateId } from './selectors/usePlateId';
import { createPlateStore } from './createPlateStore';
import { platesStore } from './platesStore';

const loadingStore = createPlateStore({
  id: 'loading',
});

export const getPlateStore = (id?: string): PlateStoreApi => {
  id = getEventEditorId(id);

  const store = platesStore.get.get(id);

  return store || loadingStore;
};

export const usePlateStore = (id?: string): PlateStoreApi => {
  const plateId = usePlateId();
  id = id ?? plateId ?? 'main';

  const store = platesStore.use.get(id);

  if (store) {
    return store;
  }

  console.warn(
    "The plate hooks must be used inside the <PlateProvider id={id}> component's context."
  );

  return store || loadingStore;
};
