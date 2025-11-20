import React from 'react';

import { NodeApi } from 'platejs';
import { useEditorRef, useEditorSelector } from 'platejs/react';

import { getHeadingList } from '../../internal/getHeadingList';

type UseContentObserver = {
  editorContentRef: React.RefObject<HTMLElement | null>;
  isObserve: boolean;
  isScroll: boolean;
  rootMargin: string;
  status: number;
};

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

  const editor = useEditorRef();
  const headingList = useEditorSelector(getHeadingList, []);

  const [activeId, setActiveId] = React.useState('');

  React.useEffect(() => {
    // ✅ Access ref inside effect, not during render
    const root = isScroll ? editorContentRef.current : undefined;

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

      if (visibleHeadings.length > 0) {
        setActiveId(visibleHeadings[0] || lastKey);
      }
      headingElementsRef.current = {};
    };
    const observer = new IntersectionObserver(callback, {
      root,
      rootMargin,
    });

    headingList.forEach((item) => {
      const { path } = item;

      const node = NodeApi.get(editor, path);

      if (!node) return;

      const element = editor.api.toDOMNode(node);

      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [
    headingList,
    isObserve,
    editor,
    editorContentRef,
    isScroll,
    rootMargin,
    status,
  ]);

  return { activeId };
};
