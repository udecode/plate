import { PlateStoreApi } from '../../types/PlateStore';
import { getPlateId, usePlateId } from './selectors/getPlateId';
import { createPlateStore } from './createPlateStore';
import { platesStore } from './platesStore';

const loadingStore = createPlateStore({
  id: 'loading',
});

export const getPlateStore = (id?: string): PlateStoreApi => {
  id = getPlateId(id);

  const store = platesStore.get.get(id);

  return store || loadingStore;
};

export const usePlateStore = (id?: string): PlateStoreApi => {
  id = usePlateId(id);

  const store = platesStore.use.get(id);

  if (store) {
    return store;
  }

  console.warn(
    "The plate hooks must be used inside the <PlateProvider id={id}> component's context."
  );

  return store || loadingStore;
};
