import { PagedEditorContent } from 'platejs/pagination/react';
import type { Element } from 'platejs/react';
import React from 'react';

type Paragraph = Element & { type: 'paragraph' };
type Table = Element & { columns: number; type: 'table' };

void (
  <PagedEditorContent<Paragraph | Table>
    fragmentation={({ content, element }) =>
      element.type === 'table'
        ? {
            sizes: element.children.map(() => ({
              height: 40,
              width: content.width / element.columns,
            })),
            type: 'direct-children',
          }
        : undefined
    }
    page={{ margins: 72, preset: 'letter' }}
  />
);

void (
  <PagedEditorContent<Paragraph | Table>
    fragmentation={({ content, element }) =>
      element.type === 'paragraph'
        ? {
            size: {
              height: 24,
              // @ts-expect-error A paragraph has no numeric columns.
              width: content.width / element.columns,
            },
            type: 'atomic',
          }
        : undefined
    }
    page={{ margins: 72, preset: 'letter' }}
  />
);
