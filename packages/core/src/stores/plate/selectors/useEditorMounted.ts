import {
  PlateId,
  UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

export const useEditorMounted = (
  id?: PlateId,
  options: UsePlateEditorStoreOptions = {}
): boolean => {
  return !!usePlateSelectors(id, {
    debugHookName: 'useEditorReadOnly',
    ...options,
  }).isMounted();
};
