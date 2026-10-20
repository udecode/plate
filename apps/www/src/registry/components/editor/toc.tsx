'use client';

import { cva } from 'class-variance-authority';
import type { NodeKey } from 'platejs';
import { BaseDetailsPlugin } from 'platejs/details';
import {
  type EditorElementProps,
  NavigationFeedbackPlugin,
  EditorElement,
  useEditor,
  useEditorSelector,
  useElementSelected,
} from 'platejs/react';
import { TocPlugin } from 'platejs/toc/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';

const headingItemVariants = cva(
  'block h-auto w-full cursor-pointer truncate rounded-none px-0.5 py-1.5 text-left font-medium text-muted-foreground underline decoration-[0.5px] underline-offset-4 hover:bg-accent hover:text-foreground',
  {
    variants: {
      level: {
        1: 'pl-0.5',
        2: 'pl-[26px]',
        3: 'pl-[50px]',
        4: 'pl-[74px]',
        5: 'pl-[98px]',
        6: 'pl-[122px]',
      },
    },
  }
);

export function TocElement({
  isScroll = true,
  topOffset = 80,
  ...props
}: EditorElementProps<typeof TocPlugin> & {
  isScroll?: boolean;
  topOffset?: number;
}) {
  const editor = useEditor();
  const navigation = useEditor().plugin(NavigationFeedbackPlugin);
  const details = editor.plugin(BaseDetailsPlugin);
  const openDetailsHolding = (key: NodeKey) => {
    const path = (details.installed && editor.read.nodes.path(key)) || [];
    const closedKeys = path.flatMap((childIndex, depth) => {
      const ancestor = path.slice(0, depth);
      const isTitle = childIndex === 0;
      const detailsKey =
        depth > 0 &&
        !isTitle &&
        editor.read.nodes.get(ancestor, { type: BaseDetailsPlugin })
          ? editor.key(ancestor)
          : undefined;

      return detailsKey && !details.store.get('openKeys').has(detailsKey)
        ? [detailsKey]
        : [];
    });

    for (const detailsKey of closedKeys) {
      details.api.setOpen(detailsKey, true);
    }

    return closedKeys.length > 0;
  };
  const selected = useElementSelected({ mode: 'text' });
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
            heading.level === nextHeading.level &&
            heading.title === nextHeading.title
          );
        }),
      shouldUpdate: (change) => !change || change.changed.hasAny('document'),
    }
  );

  return (
    <EditorElement {...props} className="mb-1 p-0">
      <div
        className="rounded-sm data-[selected=true]:bg-primary/10"
        contentEditable={false}
        data-selected={selected}
      >
        {headingList.length > 0 ? (
          headingList.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              className={headingItemVariants({ level: item.level })}
              onClick={(event) => {
                event.preventDefault();

                const navigate = () => {
                  const entry = editor.read.nodes.get(item.key);

                  if (!entry) return;

                  const element = editor.api.dom.resolveDOMNode(entry[0]);

                  if (!element) return;

                  element.style.scrollMarginTop = `${topOffset}px`;

                  if (isScroll) {
                    editor.api.dom.scrollIntoView(entry[1], {
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
                };

                if (openDetailsHolding(item.key)) {
                  requestAnimationFrame(navigate);
                } else {
                  navigate();
                }
              }}
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
    </EditorElement>
  );
}

export const TocKit = [
  TocPlugin.configure({
    component: TocElement,
  }),
];
