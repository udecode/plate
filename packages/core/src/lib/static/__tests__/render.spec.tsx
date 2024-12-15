import React from 'react';

import { createSlateEditor } from '../../editor';
import { createTSlatePlugin } from '../../plugin';
import { serializePlateStatic } from '../serializePlateStatic';
import { createStaticEditor, staticComponents } from './create-static-editor';

describe('serializePlateStatic nodes', () => {
  it('should serialize render below nodes', async () => {
    const renderBelowPlugin = createTSlatePlugin({
      key: 'test-list',
      render: {
        belowNodes: (injectProps: any) => {
          const { element } = injectProps;

          return function Component({
            children,
          }: {
            children: React.ReactNode;
          }) {
            return (
              <ul>
                <li>{children}</li>
              </ul>
            );
          };
        },
      },
    });

    const editor = createSlateEditor({
      plugins: [renderBelowPlugin],
      value: [
        {
          children: [{ text: 'test render below' }],
          type: 'p',
        },
      ],
    });

    const html = await serializePlateStatic(editor, staticComponents, {
      preserveClassNames: [],
      stripClassNames: true,
      stripDataAttributes: true,
    });

    expect(html).toContain(
      '<ul><li><span><span><span>test render below</span></span></span></li></ul>'
    );
  });

  it('should serialize string with %', async () => {
    const editor = createStaticEditor([
      {
        children: [
          {
            text: 'None encoded string 100%',
          },
        ],
        type: 'p',
      },
      {
        children: [{ text: 'Encoded string 100%25' }],
        type: 'p',
      },
    ]);

    const html = await serializePlateStatic(editor, staticComponents, {
      preserveClassNames: [],
      stripClassNames: true,
      // stripDataAttributes: true,
    });

    expect(html).toContain(
      '<span data-slate-string="true">None encoded string 100%</span>'
    );
    expect(html).toContain(
      '<span data-slate-string="true">Encoded string 100%25</span>'
    );
  });
});
