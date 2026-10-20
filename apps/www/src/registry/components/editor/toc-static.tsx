import { cva } from 'class-variance-authority';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import { BaseTocPlugin } from 'platejs/toc';
import * as React from 'react';

import { Button } from '@/components/ui/button';

const headingItemVariants = cva(
  'block h-auto w-full cursor-pointer truncate rounded-none px-0.5 py-1.5 text-left font-medium text-muted-foreground underline decoration-[0.5px] underline-offset-4 hover:bg-accent hover:text-muted-foreground',
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

export function TocElementStatic(
  props: EditorElementProps<typeof BaseTocPlugin>
) {
  const headingList = props.editor.plugin(BaseTocPlugin).read.headings();

  return (
    <EditorElement {...props} className="mb-1 p-0">
      <div>
        {headingList.length > 0 ? (
          headingList.map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              className={headingItemVariants({ level: item.level })}
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

export const BaseTocKit = [
  BaseTocPlugin.configure({ component: TocElementStatic }),
];
