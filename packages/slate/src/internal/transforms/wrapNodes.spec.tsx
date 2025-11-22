import { createEditor } from '../../create-editor';

describe('wrapNodes', () => {
  describe('when children is true', () => {
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

      const editor = createEditor();
      editor.children = initialValue;

      editor.tf.wrapNodes(
        {
          children: [],
          type: 'p',
        },
        {
          at: [0, 0, 0],
          children: true,
        }
      );

      expect(editor.children).toEqual(expectedValue);
    });
  });

  describe('when children is false or undefined', () => {
    it('should wrap the node normally', () => {
      const initialValue = [
        {
          children: [{ text: 'test' }],
          type: 'paragraph',
        },
      ];

      const expectedValue = [
        {
          children: [
            {
              children: [{ text: 'test' }],
              type: 'blockquote',
            },
          ],
          type: 'paragraph',
        },
      ];

      const editor = createEditor();
      editor.children = initialValue;

      editor.tf.wrapNodes(
        {
          children: [],
          type: 'blockquote',
        },
        {
          at: [0, 0],
        }
      );

      expect(editor.children).toEqual(expectedValue);
    });
  });
});
