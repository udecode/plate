'use client';

import React from 'react';

import {
  NavigationFeedbackPlugin,
  type PlateEditor,
  useEditor,
  useEditorPlugin,
  useEditorScrollElement,
  useEditorSelector,
  usePluginStore,
} from '@platejs/core/react';
import type { NodeKey } from '@platejs/plite';

import type { Heading } from '../lib';

import { TocPlugin } from './TocPlugin';

export type TocSideBarProps = {
  open?: boolean;
  rootMargin?: string;
  topOffset?: number;
};

export type UseContentController = {
  container: HTMLElement | null;
  isObserve: boolean;
  rootMargin: string;
  scroll?: boolean;
  topOffset: number;
};

export type TocElementState = {
  activeContentKey: NodeKey | null;
  editor: PlateEditor;
  headingList: Heading[];
  onContentScroll: (
    element: HTMLElement,
    key: NodeKey,
    behavior?: ScrollBehavior
  ) => void;
};

export type TocSideBarState = {
  activeContentKey: NodeKey | null;
  editor: PlateEditor;
  headingList: Heading[];
  mouseInToc: boolean;
  onContentScroll: ReturnType<typeof useContentController>['onContentScroll'];
  open: boolean;
  setMouseInToc: React.Dispatch<React.SetStateAction<boolean>>;
  tocRef: React.RefObject<HTMLElement | null>;
};

export const useContentObserver = ({
  editorContent,
  isObserve,
  isScroll,
  rootMargin,
  status,
}: {
  editorContent: HTMLElement | null;
  isObserve: boolean;
  isScroll: boolean;
  rootMargin: string;
  status: number;
}) => {
  const headingElementsRef = React.useRef<
    Record<string, IntersectionObserverEntry>
  >({});
  const headingKeysRef = React.useRef(new WeakMap<Element, NodeKey>());
  const editor = useEditor();
  const headingList = useEditorSelector((editor) =>
    editor.plugin(TocPlugin).read.headings()
  );
  const [activeKey, setActiveKey] = React.useState<NodeKey | null>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (headings) => {
        if (!isObserve) return;

        headingElementsRef.current = headings.reduce((map, heading) => {
          const key = headingKeysRef.current.get(heading.target);

          if (key) map[key] = heading;

          return map;
        }, headingElementsRef.current);

        const firstVisible = Object.keys(headingElementsRef.current).find(
          (key) => headingElementsRef.current[key].isIntersecting
        );

        if (firstVisible) setActiveKey(firstVisible as NodeKey);
        headingElementsRef.current = {};
      },
      {
        root: isScroll ? editorContent : undefined,
        rootMargin,
      }
    );

    headingList.forEach(({ key }) => {
      const node = editor.read.nodes.get(key)?.[0];

      if (!node) return;

      const element = editor.api.dom.resolveDOMNode(node);

      if (element) {
        headingKeysRef.current.set(element, key);
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

  return { activeKey };
};

export const useContentController = ({
  container,
  isObserve,
  rootMargin,
  scroll = true,
  topOffset,
}: UseContentController) => {
  const editor = useEditor();
  const navigation = useEditorPlugin(NavigationFeedbackPlugin);
  const isScrollable =
    (container?.scrollHeight || 0) > (container?.clientHeight || 0);
  const scrollContainer =
    typeof window === 'object'
      ? isScrollable
        ? container
        : window
      : undefined;
  const [status, setStatus] = React.useState(0);
  const { activeKey } = useContentObserver({
    editorContent: container,
    isObserve,
    isScroll: isScrollable,
    rootMargin,
    status,
  });
  const [selectedContent, setSelectedContent] = React.useState<{
    key: NodeKey;
    observedKey: NodeKey | null;
  }>();
  const activeContentKey =
    selectedContent?.observedKey === activeKey
      ? selectedContent.key
      : activeKey;

  const onContentScroll = React.useCallback(
    ({
      behavior = 'instant',
      el,
      key,
    }: {
      behavior?: ScrollBehavior;
      el: HTMLElement;
      key: NodeKey;
    }) => {
      setSelectedContent({ key, observedKey: activeKey });

      const root = isScrollable ? container : document.body;

      if (!root) return;

      if (scroll) {
        const top =
          el.getBoundingClientRect().top +
          root.scrollTop -
          root.getBoundingClientRect().top -
          topOffset;

        if (isScrollable) {
          container?.scrollTo({ behavior, top });
        } else {
          window.scrollTo({ behavior, top });
        }
      }

      const path = editor.read.nodes.path(key);

      if (path) {
        navigation.update.flashTarget({
          target: {
            path,
            type: 'node',
          },
        });
      }
    },
    [
      activeKey,
      container,
      editor,
      isScrollable,
      navigation.update,
      scroll,
      topOffset,
    ]
  );

  React.useEffect(() => {
    if (!scrollContainer) return;

    const scroll = () => {
      if (isObserve) setStatus(Date.now());
    };

    scrollContainer.addEventListener('scroll', scroll);

    return () => {
      scrollContainer.removeEventListener('scroll', scroll);
    };
  }, [isObserve, scrollContainer]);

  return { activeContentKey, onContentScroll };
};

export const useTocObserver = ({
  activeKey,
  isObserve,
  tocRef,
}: {
  activeKey: NodeKey | null;
  isObserve: boolean;
  tocRef: React.RefObject<HTMLElement | null>;
}) => {
  const [visible, setVisible] = React.useState(true);
  const [offset, setOffset] = React.useState(0);

  React.useEffect(() => {
    const root = tocRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!isObserve || !entry?.rootBounds) return;

        const { boundingClientRect, intersectionRatio, rootBounds } = entry;
        const halfHeight = (root?.getBoundingClientRect().height || 0) / 2;
        const isAbove = boundingClientRect.top < rootBounds.top;
        const isBelow = boundingClientRect.bottom > rootBounds.bottom;
        const isVisible = intersectionRatio === 1;

        setVisible(isVisible);

        if (!isVisible) {
          setOffset(
            isAbove
              ? boundingClientRect.top - rootBounds.top - halfHeight
              : isBelow
                ? boundingClientRect.bottom - rootBounds.bottom + halfHeight
                : 0
          );
        }
      },
      { root }
    );

    const element = root?.querySelector('#toc_item_active');

    if (element) observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [tocRef, activeKey, isObserve]);

  return { offset, visible };
};

export const useTocController = ({
  activeKey,
  isObserve,
  tocRef,
}: {
  activeKey: NodeKey | null;
  isObserve: boolean;
  tocRef: React.RefObject<HTMLElement | null>;
}) => {
  const { offset, visible } = useTocObserver({
    activeKey,
    isObserve,
    tocRef,
  });

  React.useEffect(() => {
    if (visible) return;

    const wrapper = tocRef.current?.querySelector<HTMLElement>('#toc_wrap');

    wrapper?.scrollTo({
      behavior: 'instant',
      top: (wrapper.scrollTop ?? 0) + offset,
    });
  }, [visible, offset, tocRef]);
};

export const useTocElementState = (): TocElementState => {
  const editor = useEditor();
  const isScroll = usePluginStore(TocPlugin, 'isScroll');
  const topOffset = usePluginStore(TocPlugin, 'topOffset');
  const headingList = useEditorSelector((editor) =>
    editor.plugin(TocPlugin).read.headings()
  );
  const container = useEditorScrollElement(editor);
  const { activeContentKey, onContentScroll } = useContentController({
    container,
    isObserve: true,
    rootMargin: '0px 0px 0px 0px',
    scroll: isScroll,
    topOffset,
  });
  const onHeadingScroll = React.useCallback(
    (el: HTMLElement, key: NodeKey, behavior: ScrollBehavior = 'instant') => {
      onContentScroll({ behavior, el, key });
    },
    [onContentScroll]
  );

  return {
    activeContentKey,
    editor,
    headingList,
    onContentScroll: onHeadingScroll,
  };
};

export const useTocElement = ({
  editor,
  onContentScroll,
}: ReturnType<typeof useTocElementState>) => ({
  props: {
    onClick: (
      event: React.MouseEvent<HTMLElement, globalThis.MouseEvent>,
      item: Heading,
      behavior: ScrollBehavior
    ) => {
      event.preventDefault();

      const node = editor.read.nodes.get(item.key)?.[0];

      if (!node) return;

      const element = editor.api.dom.resolveDOMNode(node);

      if (element) onContentScroll(element, item.key, behavior);
    },
  },
});

export const useTocSideBarState = ({
  open = true,
  rootMargin = '0px 0px 0px 0px',
  topOffset = 0,
}: TocSideBarProps): TocSideBarState => {
  const editor = useEditor();
  const headingList = useEditorSelector((editor) =>
    editor.plugin(TocPlugin).read.headings()
  );
  const container = useEditorScrollElement(editor);
  const tocRef = React.useRef<HTMLElement>(null);
  const [mouseInToc, setMouseInToc] = React.useState(false);
  const isObserve = open && !mouseInToc;
  const { activeContentKey, onContentScroll } = useContentController({
    container,
    isObserve,
    rootMargin,
    topOffset,
  });

  useTocController({
    activeKey: activeContentKey,
    isObserve,
    tocRef,
  });

  return {
    activeContentKey,
    editor,
    headingList,
    mouseInToc,
    onContentScroll,
    open,
    setMouseInToc,
    tocRef,
  };
};

export const useTocSideBar = ({
  editor,
  mouseInToc,
  onContentScroll,
  open,
  setMouseInToc,
  tocRef,
}: TocSideBarState) => {
  const onContentClick = React.useCallback(
    (
      event: React.MouseEvent<HTMLElement, globalThis.MouseEvent>,
      item: Heading,
      behavior?: ScrollBehavior
    ) => {
      event.preventDefault();

      const node = editor.read.nodes.get(item.key)?.[0];

      if (!node) return;

      const element = editor.api.dom.resolveDOMNode(node);

      if (element) {
        onContentScroll({
          behavior,
          el: element,
          key: item.key,
        });
      }
    },
    [editor, onContentScroll]
  );

  return {
    navProps: {
      ref: tocRef,
      onMouseEnter: () => {
        if (!mouseInToc && open) setMouseInToc(true);
      },
      onMouseLeave: (
        event: React.MouseEvent<HTMLElement, globalThis.MouseEvent>
      ) => {
        if (!open) return;

        const { currentTarget } = event;
        const rect = currentTarget.getBoundingClientRect();
        const isIn =
          event.clientX > rect.left &&
          event.clientX < rect.left + currentTarget.clientWidth &&
          event.clientY > rect.top &&
          event.clientY < rect.top + currentTarget.clientHeight;

        if (isIn !== mouseInToc) setMouseInToc(isIn);
      },
    },
    onContentClick,
  };
};
