import React from 'react';

import { useEditorRef, useEditorSelector } from '@platejs/core/react';

import { getHeadingList } from '../../internal/getHeadingList';

type UseContentObserver = {
  editorContent: HTMLElement | null;
  isObserve: boolean;
  isScroll: boolean;
  rootMargin: string;
  status: number;
};

export const useContentObserver = ({
  editorContent,
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
    const root = isScroll ? editorContent : undefined;

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
      const [firstVisible] = visibleHeadings;

      if (firstVisible) setActiveId(firstVisible);
      headingElementsRef.current = {};
    };
    const observer = new IntersectionObserver(callback, {
      root,
      rootMargin,
    });

    headingList.forEach((item) => {
      const { path } = item;

      const node = editor.read.nodes.get(path)?.[0];

      if (!node) return;

      const element = editor.api.dom.resolveDOMNode(node);

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
    editorContent,
    isScroll,
    rootMargin,
    status,
  ]);

  return { activeId };
};
