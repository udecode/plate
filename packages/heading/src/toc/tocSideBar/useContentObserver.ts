import React from 'react';

import {
  getNode,
  toDOMNode,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';

import { getHeadingList } from '../../utils/getHeadingList';

interface UseContentObserver {
  editorContentRef: React.RefObject<HTMLElement>;
  isObserve: boolean;
  isScroll: boolean;
  rootMargin: string;
  status: number;
}

export const useContentObserver = ({
  editorContentRef,
  isObserve,
  isScroll,
  rootMargin,
  status,
}: UseContentObserver) => {
  const headingElementsRef = React.useRef<
    Record<string, IntersectionObserverEntry>
  >({});

  const root = isScroll ? editorContentRef.current : undefined;
  const editor = useEditorRef();
  const headingList = useEditorSelector(getHeadingList, []);

  const [activeId, setActiveId] = React.useState('');

  React.useEffect(() => {
    const callback = (headings: IntersectionObserverEntry[]) => {
      if (!isObserve) return;

      headingElementsRef.current = headings.reduce((map, headingElement) => {
        map[headingElement.target.id] = headingElement;

        return map;
      }, headingElementsRef.current);

      const visibleHeadings: string[] = [];

      Object.keys(headingElementsRef.current).forEach((key) => {
        const headingElement = headingElementsRef.current[key];

        if (headingElement.isIntersecting) visibleHeadings.push(key);
      });
      const lastKey = Object.keys(headingElementsRef.current).pop()!;
      visibleHeadings.length > 0 && setActiveId(visibleHeadings[0] || lastKey);
      headingElementsRef.current = {};
    };
    const observer = new IntersectionObserver(callback, {
      root: root,
      rootMargin: rootMargin,
    });

    headingList.forEach((item) => {
      const { path } = item;

      const node = getNode(editor, path);

      if (!node) return;

      const element = toDOMNode(editor, node);

      return element && observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [headingList, isObserve, editor, root, rootMargin, status]);

  return { activeId };
};
