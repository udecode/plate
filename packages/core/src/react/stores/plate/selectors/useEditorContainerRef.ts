import { usePlateSelectors } from '../createPlateStore';

export const useEditorContainerRef = (id?: string) => {
  return usePlateSelectors(id, {
    debugHookName: 'useEditorContainerRef',
  }).containerRef();
};

/** Returns the scrollRef if it exists, otherwise returns the containerRef. */
export const useEditorScrollRef = (id?: string) => {
  const scrollRef = usePlateSelectors(id, {
    debugHookName: 'useEditorScrollRef',
  }).scrollRef();

  const containerRef = useEditorContainerRef(id);

  return scrollRef.current ? scrollRef : containerRef;
};
