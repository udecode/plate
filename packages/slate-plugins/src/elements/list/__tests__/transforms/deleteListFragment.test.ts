import { createEditor, Editor, Range, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { deleteListFragment } from '../../transforms/deleteListFragment';

const ONEPATH = [0, 1, 0, 0, 0];
const TWOPATH = [0, 1, 0, 1, 0, 0, 0];
const THREEPATH = [0, 1, 0, 1, 0, 1, 0, 0, 0];

function createExampleNodes() {
  return {
    // [0]
    children: [
      {
        type: 'p',
        children: [{ text: 'before' }],
      },
      {
        // [0, 1]
        type: 'ul',
        children: [
          {
            // [0, 1, 0]
            type: 'li',
            children: [
              {
                type: 'p',
                children: [{ text: 'one' }],
              },
              {
                // [0, 1, 0, 1]
                type: 'ul',
                children: [
                  {
                    // [0, 1, 0, 1, 0]
                    type: 'li',
                    children: [
                      {
                        type: 'p',
                        children: [{ text: 'two' }],
                      },
                      {
                        // [0, 1, 0, 1, 0, 1]
                        type: 'ul',
                        children: [
                          {
                            // [0, 1, 0, 1, 0, 1, 0]
                            type: 'li',
                            children: [
                              {
                                // [0, 1, 0, 1, 0, 1, 0, 1]
                                type: 'p',
                                children: [{ text: 'three' }],
                              },
                            ],
                          },
                          {
                            // [0, 1, 0, 1, 0, 1, 1]
                            type: 'li',
                            children: [
                              {
                                // [0, 1, 0, 1, 0, 1, 1, 1]
                                type: 'p',
                                children: [{ text: 'four' }],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    // [0, 1, 0, 1, 1]
                    type: 'li',
                    children: [{ type: 'p', children: [{ text: 'five' }] }],
                  },
                ],
              },
            ],
          },
          {
            // [0, 1, 1]
            type: 'li',
            children: [{ type: 'p', children: [{ text: 'six' }] }],
          },
        ],
      },
      {
        type: 'p',
        children: [{ text: 'after' }],
      },
    ],
  };
}

function createExample(editor: Editor = createEditor()) {
  Transforms.insertNodes(editor, createExampleNodes());
  return editor;
}

describe('deleteListFragment', () => {
  describe('unhandled', () => {
    it(`doesn't handle deletes that are within a single list item`, () => {
      const editor = createExample();
      const selection: Range = {
        anchor: { path: [0], offset: 0 },
        focus: { path: [0], offset: 0 },
      };
      const actual = deleteListFragment(editor, selection);

      expect(actual).toBeUndefined();
    });

    it(`doesn't handle deletes when the end is outside of the list`, () => {
      const editor = createExample();
      const selection: Range = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 2], offset: 4 },
      };
      const actual = deleteListFragment(editor, selection);

      expect(actual).toBeUndefined();
    });
  });

  describe('deletes top of list', () => {
    it('deletes the entire first list item from the top of the list', () => {
      const editor = withHistory(createExample());
      // select from 'above' to 'one'
      const selection: Range = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: ONEPATH, offset: 3 },
      };

      const actual = deleteListFragment(editor, selection);

      expect(actual).toEqual(3);
      const expected = [
        {
          children: [
            {
              type: 'p',
              children: [{ text: '' }],
            },
            {
              type: 'ul',
              children: [
                {
                  type: 'li',
                  children: [
                    {
                      type: 'p',
                      children: [{ text: 'two' }],
                    },
                    {
                      type: 'ul',
                      children: [
                        {
                          type: 'li',
                          children: [
                            {
                              type: 'p',
                              children: [{ text: 'three' }],
                            },
                          ],
                        },
                        {
                          type: 'li',
                          children: [
                            {
                              type: 'p',
                              children: [{ text: 'four' }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'li',
                  children: [{ type: 'p', children: [{ text: 'five' }] }],
                },
                {
                  type: 'li',
                  children: [{ type: 'p', children: [{ text: 'six' }] }],
                },
              ],
            },
            {
              type: 'p',
              children: [{ text: 'after' }],
            },
          ],
        },
      ];
      expect(editor.children).toEqual(expected);

      // test undo
      editor.undo();

      const expectedUndo = [createExampleNodes()];
      expect(editor.children).toEqual(expectedUndo);
    });

    it('partially deletes the first list item', () => {
      const editor = withHistory(createExample());
      // select from 'above' to 'one'
      const selection: Range = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: ONEPATH, offset: 2 },
      };

      const actual = deleteListFragment(editor, selection);

      expect(actual).toEqual(3);
      const expected = [
        {
          children: [
            {
              type: 'p',
              children: [{ text: 'e' }],
            },
            {
              type: 'ul',
              children: [
                {
                  type: 'li',
                  children: [
                    {
                      type: 'p',
                      children: [{ text: 'two' }],
                    },
                    {
                      type: 'ul',
                      children: [
                        {
                          type: 'li',
                          children: [
                            {
                              type: 'p',
                              children: [{ text: 'three' }],
                            },
                          ],
                        },
                        {
                          type: 'li',
                          children: [
                            {
                              type: 'p',
                              children: [{ text: 'four' }],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'li',
                  children: [{ type: 'p', children: [{ text: 'five' }] }],
                },
                {
                  type: 'li',
                  children: [{ type: 'p', children: [{ text: 'six' }] }],
                },
              ],
            },
            {
              type: 'p',
              children: [{ text: 'after' }],
            },
          ],
        },
      ];
      expect(editor.children).toEqual(expected);

      // test undo
      editor.undo();

      const expectedUndo = [createExampleNodes()];
      expect(editor.children).toEqual(expectedUndo);
    });
  });

  describe('deletes inside the list', () => {
    it("deep delete doesn't require moving siblings", () => {
      const editor = withHistory(createExample());
      const selection: Range = {
        anchor: { path: TWOPATH, offset: 0 }, // "two"
        focus: { path: THREEPATH, offset: 5 }, // "three"
      };

      const actual = deleteListFragment(editor, selection);

      expect(actual).toEqual(0);
      const expected = [
        {
          children: [
            {
              type: 'p',
              children: [{ text: 'before' }],
            },
            {
              type: 'ul',
              children: [
                {
                  type: 'li',
                  children: [
                    {
                      type: 'p',
                      children: [{ text: 'one' }],
                    },
                    {
                      type: 'ul',
                      children: [
                        {
                          type: 'li',
                          children: [
                            {
                              type: 'p',
                              children: [{ text: '' }],
                            },
                            {
                              type: 'ul',
                              children: [
                                {
                                  type: 'li',
                                  children: [
                                    {
                                      type: 'p',
                                      children: [{ text: 'four' }],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'li',
                          children: [
                            { type: 'p', children: [{ text: 'five' }] },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'li',
                  children: [{ type: 'p', children: [{ text: 'six' }] }],
                },
              ],
            },
            {
              type: 'p',
              children: [{ text: 'after' }],
            },
          ],
        },
      ];
      expect(editor.children).toEqual(expected);

      // test undo
      editor.undo();

      const expectedUndo = [createExampleNodes()];
      expect(editor.children).toEqual(expectedUndo);
    });

    it('delete moves siblings', () => {
      const editor = withHistory(createExample());
      const selection: Range = {
        anchor: { path: ONEPATH, offset: 1 }, // "one"
        focus: { path: TWOPATH, offset: 2 }, // "two"
      };

      const actual = deleteListFragment(editor, selection);

      expect(actual).toEqual(2);
      const expected = [
        {
          children: [
            {
              type: 'p',
              children: [
                {
                  text: 'before',
                },
              ],
            },
            {
              type: 'ul',
              children: [
                {
                  type: 'li',
                  children: [
                    {
                      type: 'p',
                      children: [
                        {
                          text: 'oo',
                        },
                      ],
                    },
                    {
                      type: 'ul',
                      children: [
                        {
                          type: 'li',
                          children: [
                            {
                              type: 'p',
                              children: [
                                {
                                  text: 'five',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'li',
                          children: [
                            {
                              type: 'p',
                              children: [
                                {
                                  text: 'three',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          type: 'li',
                          children: [
                            {
                              type: 'p',
                              children: [
                                {
                                  text: 'four',
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'li',
                  children: [
                    {
                      type: 'p',
                      children: [
                        {
                          text: 'six',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'p',
              children: [
                {
                  text: 'after',
                },
              ],
            },
          ],
        },
      ];
      expect(editor.children).toEqual(expected);

      // test undo
      editor.undo();

      const expectedUndo = [createExampleNodes()];
      expect(editor.children).toEqual(expectedUndo);
    });
  });
});
