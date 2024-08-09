import {
  type PlateId,
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Get the editor value (deeply memoized). */
export const useEditorValue = (
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
) =>
  usePlateSelectors(id, {
    debugHookName: 'useEditorValue',
    ...options,
  }).trackedValue().value;
