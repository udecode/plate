import { usePlateSelectors } from '../createPlateStore';

export const useEditorContainerRef = (id?: string) => {
  return usePlateSelectors(id, {
    debugHookName: 'useEditorContainerRef',
  }).containerRef();
};
