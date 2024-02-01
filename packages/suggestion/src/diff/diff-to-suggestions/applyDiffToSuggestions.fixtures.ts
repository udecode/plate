import { TOperation } from '@udecode/plate-common'

export const addMarkFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [{ text: 'PingCode Wiki & Worktile' }],
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [
        { text: 'PingCode ' },
        {
          text: 'Wiki',
          bold: true,
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
          suggestionUpdate: {
            bold: true,
          },
        },
        {
          text: ' & Worktile',
          // TODO
          bold: undefined,
        },
      ],
    },
  ],
  operations: [
    {
      path: [0, 0],
      position: 9,
      properties: { bold: true },
      type: 'split_node',
    },
    {
      path: [0, 1],
      position: 4,
      properties: {
        bold: undefined,
      },
      type: 'split_node',
    },
  ] as TOperation[],
}

export const addTwoMarkFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [{ text: 'These words are bold!' }],
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [
        { text: 'These ' },
        {
          text: 'words',
          bold: true,
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
          suggestionUpdate: {
            bold: true,
          },
        },
        {
          text: ' are ',
        },
        {
          text: 'bold',
          bold: true,
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
          suggestionUpdate: {
            bold: true,
          },
        },
        {
          text: '!',
        },
      ],
    },
  ],
  operations: [
    {
      type: "split_node",
      path: [
        0,
        0
      ],
      position: 6,
      properties: {
        bold: true
      }
    },
    {
      type: "split_node",
      path: [
        0,
        1
      ],
      position: 5,
      properties: {}
    },
    {
      type: "split_node",
      path: [
        0,
        2
      ],
      position: 5,
      properties: {
        bold: true
      }
    },
    {
      type: "split_node",
      path: [
        0,
        3
      ],
      position: 4,
      properties: {}
    }
  ] as TOperation[],
}

export const insertUpdateParagraphFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [{ text: 'This is the first paragraph.' }],
      key: '1',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the third paragraph.' }],
      key: '3',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the fourth paragraph.' }],
      key: '4',
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [{ text: 'This is the first paragraph.' }],
      key: '1',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the second paragraph.' }],
      key: '2',
      suggestion: true,
      suggestion_0: true,
      suggestionId: '1',
    },
    {
      type: 'paragraph',
      children: [
        { text: 'This is the third paragraph' },
        {
          text: ', and insert some text',
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
        },
        {
          text: '.',
        },
      ],
      key: '3',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the fourth paragraph.' }],
      key: '4',
    },
  ],
  operations: [
    {
      node: {
        children: [{ text: 'This is the second paragraph.' }],
        key: '2',
        type: 'paragraph',
      },
      path: [1],
      type: 'insert_node',
    },
    {
      offset: 27,
      path: [2, 0],
      text: ', and insert some text',
      type: 'insert_text',
    },
  ] as TOperation[],
}
export const insertUpdateTwoParagraphsFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [{ text: 'This is the first paragraph.' }],
      key: '1',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the third paragraph.' }],
      key: '3',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the fourth paragraph.' }],
      key: '4',
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [{ text: 'This is the first paragraph.' }],
      key: '1',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the second paragraph.' }],
      key: '2',
      suggestion: true,
      suggestion_0: true,
      suggestionId: '1',
    },
    {
      type: 'paragraph',
      children: [
        { text: 'This is the third paragraph' },
        {
          text: ', and insert some text',
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
        },
        {
          text: '.',
        },
      ],
      key: '3',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the fifth paragraph.' }],
      key: '5',
      suggestion: true,
      suggestion_0: true,
      suggestionId: '1',
    },
    {
      type: 'paragraph',
      children: [
        { text: 'This is the fourth paragraph' },
        {
          text: ', and insert some text',
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
        },
        {
          text: '.',
        },
      ],
      key: '4',
    },
  ],
  operations: [
    {
      node: {
        children: [{ text: 'This is the second paragraph.' }],
        key: '2',
        type: 'paragraph',
      },
      path: [1],
      type: 'insert_node',
    },
    {
      offset: 27,
      path: [2, 0],
      text: ', and insert some text',
      type: 'insert_text',
    },
    {
      node: {
        children: [{ text: 'This is the fifth paragraph.' }],
        key: '5',
        type: 'paragraph',
      },
      path: [3],
      type: 'insert_node',
    },
    {
      offset: 28,
      path: [4, 0],
      text: ', and insert some text',
      type: 'insert_text',
    },
  ] as TOperation[],
}
export const insertTextAddMarkFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [{ text: 'PingCode' }],
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'PingCode',
          bold: true,
        },
        {
          text: ' & ',
          bold: undefined,
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
          suggestionUpdate: {
            bold: undefined,
          },
        },
        {
          text: 'Worktile',
          bold: true,
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
        },
      ],
    },
  ],
  operations: [
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 8,
      text: ' & Worktile',
    },
    {
      type: 'set_node',
      path: [0, 0],
      properties: {},
      newProperties: {
        bold: true,
      },
    },
    {
      type: 'split_node',
      path: [0, 0],
      position: 8,
      properties: {
        bold: undefined,
      },
    },
    {
      type: 'split_node',
      path: [0, 1],
      position: 3,
      properties: {
        bold: true,
      },
    },
  ] as TOperation[],
}

export const insertTextFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [{ text: 'PingCode' }],
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [
        { text: 'PingCode' },
        { text: ' & Worktile', suggestion: true, suggestion_0: true, suggestionId: '1' },
      ],
    },
  ],
  operations: [
    {
      type: 'insert_text',
      path: [0, 0],
      offset: 8,
      text: ' & Worktile',
    },
  ] as TOperation[],
}

export const removeNodeFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [{ text: 'PingCode' }],
    },
    {
      type: 'paragraph',
      children: [{ text: 'Worktile' }],
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [{ text: 'PingCode' }],
    },
    {
      type: 'paragraph',
      children: [{ text: 'Worktile' }],
      suggestion: true,
      suggestion_0: true,
      suggestionId: '1',
      suggestionDeletion: true,
    },
  ],
  operations: [
    {
      type: 'remove_node',
      path: [1],
      node: {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
      },
    },
  ] as TOperation[],
}

export const removeTextFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [{ text: 'PingCode & Worktile' }],
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [
        { text: 'PingCode' },
        { text: ' & Worktile', suggestion: true, suggestion_0: true, suggestionId: '1', suggestionDeletion: true },
      ],
    },
  ],
  operations: [
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 8,
      text: ' & Worktile',
    },
  ] as TOperation[],
}

export const mergeTextFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'PingCode',
          bold: true,
        },
        {
          text: ' & ',
        },
      ],
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'PingCode',
          bold: true,
        },
        {
          text: ' & ',
          bold: true,
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
          suggestionUpdate: {
            bold: true,
          },
        },
      ],
    },
  ],
  operations: [
    {
      type: 'merge_node',
      path: [0, 1],
      position: 0,
      properties: {},
    },
  ] as TOperation[],
}

export const mergeNodeFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'PingCode',
          bold: true,
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: ' & ',
        },
        {
          text: 'co',
          bold: true,
        },
      ],
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'PingCode',
          bold: true,
        },
        {
          text: ' & ',
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
        },
        {
          text: 'co',
          bold: true,
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: ' & ',
        },
        {
          text: 'co',
          bold: true,
        },
      ],
      suggestion: true,
      suggestion_0: true,
      suggestionId: '1',
      suggestionDeletion: true,
    },
  ],
  operations: [
    {
      type: 'merge_node',
      path: [1],
      position: 0,
      properties: {},
    },
  ] as TOperation[],
}

export const mergeTwoTextFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'PingCode',
          bold: true,
        },
        {
          text: ' & ',
        },
        {
          text: 'Worktile',
          bold: true,
        },
      ],
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'PingCode',
          bold: true,
        },
        {
          text: ' & ',
          bold: true,
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
          suggestionUpdate: {
            bold: true,
          },
        },
        {
          text: 'Worktile',
          bold: true,
        },
      ],
    },
  ],
  operations: [
    {
      type: 'merge_node',
      path: [0, 1],
      position: 0,
      properties: {},
    },
    {
      type: 'merge_node',
      path: [0, 1],
      position: 0,
      properties: {},
    },
  ] as TOperation[],
}

export const mergeRemoveTextFixtures = {
  doc1: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'PingCode',
          bold: true,
        },
        {
          text: ' & ',
        },
        {
          text: 'Worktile',
          bold: true,
        },
      ],
    },
  ],
  doc2: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'PingCode',
        },
        {
          text: ' & Worktile',
          bold: true,
          suggestion: true,
          suggestion_0: true,
          suggestionId: '1',
          suggestionDeletion: true,
        },
      ],
    },
  ],
  operations: [
    {
      type: 'merge_node',
      path: [0, 1],
      position: 0,
      properties: {},
    },
    {
      type: 'merge_node',
      path: [0, 1],
      position: 0,
      properties: {},
    },
    {
      type: 'remove_text',
      path: [0, 0],
      offset: 8,
      text: ' & Worktile',
    },
    {
      type: 'set_node',
      path: [0, 0],
      properties: {
        bold: true,
      },
      newProperties: {
        bold: undefined,
      },
    },
  ] as TOperation[],
}
