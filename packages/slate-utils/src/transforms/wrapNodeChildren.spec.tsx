import { createTEditor } from '@udecode/slate';

import { wrapNodeChildren } from './wrapNodeChildren';

describe('wrapNodeChildren', () => {
  it('should wrap the children into a p', () => {
    const initialValue = [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: 'a',
                  },
                  {
                    bold: true,
                    text: 'b',
                  },
                  {
                    italic: true,
                    text: 'c',
                  },
                ] as any,
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ];

    const expectedValue = [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        text: 'a',
                      },
                      {
                        bold: true,
                        text: 'b',
                      },
                      {
                        italic: true,
                        text: 'c',
                      },
                    ],
                    type: 'p',
                  },
                ],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ];

    const editor = createTEditor();
    editor.children = initialValue;

    wrapNodeChildren(
      editor,
      {
        children: [],
        type: 'p',
      },
      {
        at: [0, 0, 0],
      }
    );

    expect(editor.children).toEqual(expectedValue);
  });
});
