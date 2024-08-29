import {
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Version incremented on value change. */
export const useValueVersion = (
  id?: string,
  options: UsePlateEditorStoreOptions = {}
) => {
  return usePlateSelectors(id, {
    debugHookName: 'useValueVersion',
    ...options,
  }).versionValue();
};
