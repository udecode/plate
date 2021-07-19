import { useCallback } from 'react';
import { usePlateStore } from '../plate.store';
import { getPlateState } from './getPlateState';

/**
 * Get the editor selection which is updated on editor change.
 */
export const useStoreEditorSelection = (id?: string | null) =>
  usePlateStore(
    useCallback((state) => getPlateState(state, id)?.selection, [id])
  );
