import {
  type UsePlateEditorStoreOptions,
  usePlateSelectors,
} from '../createPlateStore';

/** Get the editor selection (deeply memoized). */
export const useEditorSelection = (
  id?: string,
  options: UsePlateEditorStoreOptions = {}
) =>
  usePlateSelectors(id, {
    debugHookName: 'useEditorSelection',
    ...options,
  }).trackedSelection().selection;
