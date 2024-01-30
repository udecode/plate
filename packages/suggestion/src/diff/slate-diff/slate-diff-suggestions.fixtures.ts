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
      children: [{ text: 'PingCode ' }, { text: 'Wiki', bold: true }, { text: ' & Worktile' }],
    },
  ],
  expected: [
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
  ],
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
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the third paragraph, and insert some text.' }],
      key: '3',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the fourth paragraph.' }],
      key: '4',
    },
  ],
  expected: [
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
  ],
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
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the third paragraph, and insert some text.' }],
      key: '3',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the fifth paragraph.' }],
      key: '5',
    },
    {
      type: 'paragraph',
      children: [{ text: 'This is the fourth paragraph, and insert some text.' }],
      key: '4',
    },
  ],
  expected: [
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
  ],
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
        },
        {
          text: 'Worktile',
          bold: true,
        },
      ],
    },
  ],
  expected: [
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
  ],
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
      children: [{ text: 'PingCode & Worktile' }],
    },
  ],
  expected: [
    {
      type: 'paragraph',
      children: [
        { text: 'PingCode' },
        { text: ' & Worktile', suggestion: true, suggestion_0: true, suggestionId: '1' },
      ],
    },
  ],
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
      children: [{ text: 'PingCode' }],
    },
  ],
  expected: [
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
  ],
}
