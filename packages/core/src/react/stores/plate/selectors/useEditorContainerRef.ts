import { usePlateSelectors } from '../createPlateStore';

export const useEditorContainerRef = (id?: string) => {
  return usePlateSelectors(id, {
    debugHookName: 'useEditorContainerRef',
  }).containerRef();
};

export const useEditorScrollRef = (id?: string) => {
  return usePlateSelectors(id, {
    debugHookName: 'useScrollRef',
  }).containerRef();
};

/** Returns the scrollRef if it exists, otherwise returns the containerRef. */
export const useScrollRef = (id?: string) => {
  const scrollRef = useEditorScrollRef(id);
  const containerRef = useEditorContainerRef(id);

  return scrollRef.current ? scrollRef : containerRef;
};
