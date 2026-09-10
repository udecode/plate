'use client';

import { cva } from 'class-variance-authority';
import type { NodeKey } from 'platejs';
import {
  type PlateElementProps,
  NavigationFeedbackPlugin,
  PlateElement,
  useEditor,
  useEditorPlugin,
  useEditorRootElement,
  useEditorScrollElement,
  useEditorSelector,
} from 'platejs/react';
import { TocPlugin } from 'platejs/toc/react';
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

export function TocElement({
  isScroll = true,
  topOffset = 80,
  ...props
}: PlateElementProps<typeof TocPlugin> & {
  isScroll?: boolean;
  topOffset?: number;
}) {
  const editor = useEditor();
  const navigation = useEditorPlugin(NavigationFeedbackPlugin);
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
  const root = useEditorRootElement(editor);
  const ownerWindow = root?.ownerDocument.defaultView;
  const scrollContainer = isScrollable ? container : ownerWindow;
  const [activeKey, setActiveKey] = React.useState<NodeKey | null>(null);

  // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- Disconnect releases both initial and refreshed observer bindings.
  React.useEffect(() => {
    if (!ownerWindow) return undefined;

    let active = true;
    const entries = new Map<NodeKey, IntersectionObserverEntry>();
    const observed = new Map<NodeKey, Element>();
    const keys = new WeakMap<Element, NodeKey>();
    const observer = new ownerWindow.IntersectionObserver(
      (headings) => {
        if (!active) return;
        headings.forEach((heading) => {
          const key = keys.get(heading.target);
          if (key && observed.get(key) === heading.target) {
            entries.set(key, heading);
          }
        });
        const firstVisible = headingList.find(
          ({ key }) => entries.get(key)?.isIntersecting
        );
        if (firstVisible) setActiveKey(firstVisible.key);
      },
      { root: isScrollable ? container : null }
    );
    const refresh = () => {
      headingList.forEach(({ key }) => {
        const node = editor.read.nodes.get(key)?.[0];
        const element = node ? editor.api.dom.resolveDOMNode(node) : null;
        const previous = observed.get(key);
        if (previous === element) return;
        if (previous) {
          observer.unobserve(previous);
          observed.delete(key);
          entries.delete(key);
        }
        if (element) {
          observed.set(key, element);
          keys.set(element, key);
          observer.observe(element);
        }
      });
    };
    refresh();
    scrollContainer?.addEventListener('scroll', refresh, { passive: true });
    return () => {
      active = false;
      scrollContainer?.removeEventListener('scroll', refresh);
      observer.disconnect();
    };
  }, [
    container,
    editor,
    headingList,
    isScrollable,
    ownerWindow,
    scrollContainer,
  ]);

  return (
    <PlateElement {...props} className="mb-1 p-0">
      <div contentEditable={false}>
        {headingList.length > 0 ? (
          headingList.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              className={headingItemVariants({
                active: item.key === activeKey,
                depth: item.depth as 1 | 2 | 3,
              })}
              onClick={(event) => {
                event.preventDefault();

                const node = editor.read.nodes.get(item.key)?.[0];

                if (!node) return;

                const element = editor.api.dom.resolveDOMNode(node);

                if (!element) return;

                setActiveKey(item.key);

                const path = editor.read.nodes.path(item.key);

                if (path) {
                  element.style.scrollMarginTop = `${topOffset}px`;

                  if (isScroll) {
                    editor.api.dom.scrollIntoView(path, {
                      behavior: 'smooth',
                      block: 'start',
                      scrollMode: 'always',
                    });
                  }
                  navigation.api.flashTarget({
                    key: item.key,
                    attributes: {
                      className: 'rounded-md bg-(--color-highlight)',
                    },
                  });
                }
              }}
              aria-current={item.key === activeKey ? 'location' : undefined}
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
  }),
];
