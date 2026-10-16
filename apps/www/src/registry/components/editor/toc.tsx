'use client';

import { cva } from 'class-variance-authority';
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
}: EditorElementProps<typeof TocPlugin> & {
  isScroll?: boolean;
  topOffset?: number;
}) {
  const editor = useEditor();
  const navigation = useEditor().plugin(NavigationFeedbackPlugin);
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
            heading.depth === nextHeading.depth &&
            heading.title === nextHeading.title &&
            heading.type === nextHeading.type
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
              className={headingItemVariants({
                depth: item.depth as 1 | 2 | 3,
              })}
              onClick={(event) => {
                event.preventDefault();

                const node = editor.read.nodes.get(item.key)?.[0];

                if (!node) return;

                const element = editor.api.dom.resolveDOMNode(node);

                if (!element) return;

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
