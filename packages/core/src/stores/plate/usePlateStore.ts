import { PlateStoreApi } from '../../types/PlateStore';
import { getPlateId, usePlateId } from './selectors/getPlateId';
import { platesStore } from './platesStore';

export const getPlateStore = (id?: string): PlateStoreApi => {
  id = getPlateId(id);

  const store = platesStore.get.get(id);

  if (!store) {
    platesStore.set.set(id);
    return platesStore.get.get(id);
  }

  return store;
};

export const usePlateStore = (id?: string): PlateStoreApi => {
  id = usePlateId(id);

  const store = platesStore.use.get(id);

  if (!store) {
    platesStore.set.set(id);
    return platesStore.get.get(id);
  }

  return store;
};
