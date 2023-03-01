import { createTEditor } from '../types';
import { wrapNodeChildren } from './wrapNodeChildren';

describe('wrapNodeChildren', () => {
  it('should wrap the children into a p', () => {
    const initialValue = [
      {
        type: 'table',
        children: [
          {
            type: 'tr',
            children: [
              {
                type: 'td',
                children: [
                  {
                    text: 'a',
                  },
                  {
                    text: 'b',
                    bold: true,
                  },
                  {
                    text: 'c',
                    italic: true,
                  },
                ] as any,
              },
            ],
          },
        ],
      },
    ];

    const expectedValue = [
      {
        type: 'table',
        children: [
          {
            type: 'tr',
            children: [
              {
                type: 'td',
                children: [
                  {
                    type: 'p',
                    children: [
                      {
                        text: 'a',
                      },
                      {
                        text: 'b',
                        bold: true,
                      },
                      {
                        text: 'c',
                        italic: true,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    const editor = createTEditor();
    editor.children = initialValue;

    wrapNodeChildren(
      editor,
      {
        type: 'p',
        children: [],
      },
      {
        at: [0, 0, 0],
      }
    );

    expect(editor.children).toEqual(expectedValue);
  });
});
