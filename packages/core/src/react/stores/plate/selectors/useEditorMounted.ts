import {
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

export const useEditorMounted = (
  id?: string,
  options: UsePlateEditorStoreOptions = {}
): boolean => {
  return !!usePlateSelectors(id, {
    debugHookName: 'useEditorMounted',
    ...options,
  }).isMounted();
};
