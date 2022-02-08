import { useEffect } from 'react';
import { castArray } from 'lodash';
import { platesActions, platesSelectors } from '../stores/plate/platesStore';
import { usePlateId } from '../stores/plate/selectors/getPlateId';

/**
 * On mount: create plate store and set it to the plates store.
 * If id is not defined, event id is used.
 */
export const useCreatePlateStore = (_ids?: string | string[]) => {
  const __ids = castArray<string>(_ids);
  const id = usePlateId(__ids[0]);

  useEffect(() => {
    // Set multiple plate stores
    if (Array.isArray(_ids)) {
      const ids = castArray<string>(_ids);

      ids.forEach((_id) => {
        if (!platesSelectors.has(_id)) {
          platesActions.set(_id);
        }
      });
    } else if (!platesSelectors.has(id)) {
      platesActions.set(id);
    }
  }, [_ids, id]);
};
