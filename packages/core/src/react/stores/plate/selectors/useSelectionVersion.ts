import {
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Version incremented on selection change. */
export const useSelectionVersion = (
  id?: string,
  options: UsePlateEditorStoreOptions = {}
) => {
  return usePlateSelectors(id, {
    debugHookName: 'useSelectionVersion',
    ...options,
  }).versionSelection();
};
