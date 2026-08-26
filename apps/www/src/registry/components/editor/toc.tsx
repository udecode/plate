'use client';

import { TocPlugin } from '@platejs/toc/react';
import { cva } from 'class-variance-authority';
import type { NodeKey } from 'platejs';
import {
  type PlateElementProps,
  NavigationFeedbackPlugin,
  PlateElement,
  useEditor,
  useEditorPlugin,
  useEditorScrollElement,
  useEditorSelector,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

const headingItemVariants = cva(
  'block h-auto w-full cursor-pointer truncate rounded-none px-0.5 py-1.5 text-left font-medium underline decoration-[0.5px] underline-offset-4',
  {
    variants: {
      active: {
        false: 'text-muted-foreground hover:bg-accent hover:text-foreground',
        true: 'bg-accent text-foreground decoration-foreground',
      },
      depth: {
        1: 'pl-0.5',
        2: 'pl-[26px]',
        3: 'pl-[50px]',
      },
    },
  }
);

export function TocElement(props: PlateElementProps<typeof TocPlugin>) {
  const headingElementsRef = React.useRef<
    Record<string, IntersectionObserverEntry>
  >({});
  const headingKeysRef = React.useRef(new WeakMap<Element, NodeKey>());
  const editor = useEditor();
  const navigation = useEditorPlugin(NavigationFeedbackPlugin);
  const isScroll = usePluginStore(TocPlugin, 'isScroll');
  const topOffset = usePluginStore(TocPlugin, 'topOffset');
  const headingList = useEditorSelector(
    (innerEditor) => innerEditor.plugin(TocPlugin).read.headings(),
    {
      equalityFn: (previous, next) =>
        previous !== null &&
        previous.length === next.length &&
        previous.every((heading, index) => {
          const nextHeading = next[index];

          return (
            heading.key === nextHeading?.key &&
            heading.depth === nextHeading.depth &&
            heading.title === nextHeading.title &&
            heading.type === nextHeading.type
          );
        }),
      shouldUpdate: (change) => !change || change.changed.hasAny('document'),
    }
  );
  const container = useEditorScrollElement(editor);
  const isScrollable =
    (container?.scrollHeight || 0) > (container?.clientHeight || 0);
  const scrollContainer =
    typeof window === 'object'
      ? isScrollable
        ? container
        : window
      : undefined;
  const [status, setStatus] = React.useState(0);
  const [activeKey, setActiveKey] = React.useState<NodeKey | null>(null);
  const [selectedContent, setSelectedContent] = React.useState<{
    key: NodeKey;
    observedKey: NodeKey | null;
  }>();
  const activeContentKey =
    selectedContent?.observedKey === activeKey
      ? selectedContent.key
      : activeKey;

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (headings) => {
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
        root: isScrollable ? container : undefined,
        rootMargin: '0px 0px 0px 0px',
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
  }, [container, editor, headingList, isScrollable, status]);

  React.useEffect(() => {
    if (!scrollContainer) return undefined;

    const scroll = () => {
      setStatus(Date.now());
    };

    scrollContainer.addEventListener('scroll', scroll);

    return () => {
      scrollContainer.removeEventListener('scroll', scroll);
    };
  }, [scrollContainer]);

  return (
    <PlateElement {...props} className="mb-1 p-0">
      <div contentEditable={false}>
        {headingList.length > 0 ? (
          headingList.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              className={headingItemVariants({
                active: item.key === activeContentKey,
                depth: item.depth as 1 | 2 | 3,
              })}
              onClick={(event) => {
                event.preventDefault();

                const node = editor.read.nodes.get(item.key)?.[0];

                if (!node) return;

                const element = editor.api.dom.resolveDOMNode(node);

                if (!element) return;

                setSelectedContent({
                  key: item.key,
                  observedKey: activeKey,
                });

                const root = isScrollable ? container : document.body;

                if (!root) return;

                if (isScroll) {
                  const top =
                    element.getBoundingClientRect().top +
                    root.scrollTop -
                    root.getBoundingClientRect().top -
                    topOffset;

                  if (isScrollable) {
                    container?.scrollTo({ behavior: 'smooth', top });
                  } else {
                    window.scrollTo({ behavior: 'smooth', top });
                  }
                }

                const path = editor.read.nodes.path(item.key);

                if (path) {
                  navigation.update.flashTarget({
                    target: { path, type: 'node' },
                  });
                }
              }}
              aria-current={
                item.key === activeContentKey ? 'location' : undefined
              }
            >
              {item.title}
            </Button>
          ))
        ) : (
          <div className="text-sm text-gray-500">
            Create a heading to display the table of contents.
          </div>
        )}
      </div>
      {props.children}
    </PlateElement>
  );
}

export const TocKit = [
  TocPlugin.configure({
    component: TocElement,
    initialState: {
      // isScroll: true,
      topOffset: 80,
    },
  }),
];
