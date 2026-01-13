import * as React from 'react';

import type { SlateElementProps } from 'platejs/static';

import { type Heading, BaseTocPlugin, isHeading } from '@platejs/toc';
import { type SlateEditor, type TElement, NodeApi } from 'platejs';
import { SlateElement } from 'platejs/static';

/**
 * DOCX-compatible TOC component.
 * Renders TOC items as anchor links for proper Word internal navigation.
 */
export function TocElementStaticDocx(props: SlateElementProps) {
  const { editor } = props;
  const headingList = getHeadingList(editor);

  const depthIndent: Record<number, string> = {
    1: '0',
    2: '24pt',
    3: '48pt',
  };

  return (
    <SlateElement {...props}>
      <div
        style={{
          marginBottom: '12pt',
          padding: '8pt 0',
        }}
      >
        {headingList.length > 0 ? (
          headingList.map((item) => (
            <p
              key={item.id}
              style={{
                margin: '4pt 0',
                paddingLeft: depthIndent[item.depth] || '0',
              }}
            >
              <a
                href={`#${item.id}`}
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
    </SlateElement>
  );
}

const headingDepth: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

const getHeadingList = (editor?: SlateEditor) => {
  if (!editor) return [];

  const options = editor.getOptions(BaseTocPlugin);

  if (options.queryHeading) {
    return options.queryHeading(editor);
  }

  const headingList: Heading[] = [];

  const values = editor.api.nodes<TElement>({
    at: [],
    match: (n) => isHeading(n),
  });

  if (!values) return [];

  Array.from(values).forEach(([node, path]) => {
    const { type } = node;
    const title = NodeApi.string(node);
    const depth = headingDepth[type];
    const id = node.id as string;

    if (title) {
      headingList.push({ id, depth, path, title, type });
    }
  });

  return headingList;
};
