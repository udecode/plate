import {
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Get the editor value (deeply memoized). */
export const useEditorValue = (
  id?: string,
  options: UsePlateEditorStoreOptions = {}
) =>
  usePlateSelectors(id, {
    debugHookName: 'useEditorValue',
    ...options,
  }).trackedValue().value;
