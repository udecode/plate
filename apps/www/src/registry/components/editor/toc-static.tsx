import { BaseTocPlugin, type Heading } from '@platejs/toc';
import { cva } from 'class-variance-authority';
import type { BaseEditor } from 'platejs';
import { type PliteElementProps, PliteElement } from 'platejs/static';
import * as React from 'react';

import { Button } from '@/components/ui/button';

const headingItemVariants = cva(
  'block h-auto w-full cursor-pointer truncate rounded-none px-0.5 py-1.5 text-left font-medium text-muted-foreground underline decoration-[0.5px] underline-offset-4 hover:bg-accent hover:text-muted-foreground',
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

export function TocElementStatic(
  props: PliteElementProps<typeof BaseTocPlugin>
) {
  const { editor } = props;
  const headingList = getHeadingList(editor);

  return (
    <PliteElement {...props} className="mb-1 p-0">
      <div>
        {headingList.length > 0 ? (
          headingList.map((item: Heading) => (
            <Button
              key={item.key}
              variant="ghost"
              className={headingItemVariants({
                depth: item.depth as 1 | 2 | 3,
              })}
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
    </PliteElement>
  );
}

const getHeadingList = (editor?: BaseEditor) => {
  if (!editor) return [];

  return editor.plugin(BaseTocPlugin).read.headings();
};

/**
 * DOCX-compatible TOC component.
 * Renders TOC items as anchor links for proper Word internal navigation.
 */
export function TocElementDocx(props: PliteElementProps<typeof BaseTocPlugin>) {
  const { editor } = props;
  const headingList = getHeadingList(editor);

  const depthIndent: Record<number, string> = {
    1: '0',
    2: '24pt',
    3: '48pt',
  };

  return (
    <PliteElement {...props}>
      <div
        style={{
          marginBottom: '12pt',
          padding: '8pt 0',
        }}
      >
        {headingList.length > 0 ? (
          headingList.map((item: Heading) => (
            <p
              key={item.key}
              style={{
                margin: '4pt 0',
                paddingLeft: depthIndent[item.depth] || '0',
              }}
            >
              <a
                href={`#plate_${item.key.replaceAll(/[^A-Za-z0-9_]/g, '_')}`}
                style={{
                  color: '#0066cc',
                  textDecoration: 'underline',
                }}
              >
                {item.title}
              </a>
            </p>
          ))
        ) : (
          <p style={{ color: '#666', fontSize: '10pt' }}>
            Create a heading to display the table of contents.
          </p>
        )}
      </div>
      {props.children}
    </PliteElement>
  );
}

export const BaseTocKit = [
  BaseTocPlugin.configure({ component: TocElementStatic }),
];
