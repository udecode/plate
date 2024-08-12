import {
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/**
 * Whether the editor is read-only. You can also use `useReadOnly` from
 * `slate-react` in node components.
 */
export const useEditorReadOnly = (
  id?: string,
  options: UsePlateEditorStoreOptions = {}
): boolean => {
  return !!usePlateSelectors(id, {
    debugHookName: 'useEditorReadOnly',
    ...options,
  }).readOnly();
};
