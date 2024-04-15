import {
  PlateId,
  UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/**
 * Get the editor selection (deeply memoized).
 */
export const useEditorSelection = (
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
) =>
  usePlateSelectors(id, {
    debugHookName: 'useEditorSelection',
    ...options,
  }).trackedSelection().selection;
