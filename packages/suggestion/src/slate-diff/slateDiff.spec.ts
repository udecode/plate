import { diffToSuggestions } from './slateDiff';
import { createPlateEditor, Value } from '@udeCode/plate-common';

interface SlateDiffFixture {
  it?: typeof it;
  input1: Value;
  input2: Value;
  output: Value;
}

const fixtures: Record<string, SlateDiffFixture> = {
  addMark: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode Wiki & Worktile' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode ' },
          {
            text: 'Wiki',
            bold: true,
          },
          {
            text: ' & Worktile',
          },
        ],
      },
    ],
    output: [
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
  },

  addTwoMark: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'These words are bold!' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [
          { text: 'These ' },
          {
            text: 'words',
            bold: true,
          },
          {
            text: ' are ',
          },
          {
            text: 'bold',
            bold: true,
          },
          {
            text: '!',
          },
        ],
      },
    ],
    output: [
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
            // TODO
            bold: undefined,
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
            // TODO
            bold: undefined,
          },
        ],
      },
    ],
  },

  insertUpdateParagraph: {
    input1: [
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
    input2: [
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
        children: [
          { text: 'This is the third paragraph' },
          {
            text: ', and insert some text',
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
    output: [
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
  },

  insertUpdateTwoParagraphs: {
    input1: [
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
    input2: [
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
        children: [
          { text: 'This is the third paragraph' },
          {
            text: ', and insert some text',
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
      },
      {
        type: 'paragraph',
        children: [
          { text: 'This is the fourth paragraph' },
          {
            text: ', and insert some text',
          },
          {
            text: '.',
          },
        ],
        key: '4',
      },
    ],
    output: [
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
  },

  insertTextAddMark: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
    ],
    input2: [
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
          },
          {
            text: 'Worktile',
            bold: true,
          },
        ],
      },
    ],
    output: [
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
  },

  insertText: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode' },
          {
            text: ' & Worktile',
          },
        ],
      },
    ],
    output: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode' },
          {
            text: ' & Worktile',
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
          },
        ],
      },
    ],
  },

  addNode: {
    it: it.only,
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
      },
    ],
    output: [
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
      },
    ],
  },

  removeNode: {
    it: it.only,
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
    ],
    output: [
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
  },

  setNodeAdd: {
    it: it.only,
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        someProp: 'World',
      },
    ],
    output: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        someProp: 'World',
        suggestion: true,
        suggestion_0: true,
        suggestionId: '1',
        suggestionUpdate: {
          someProp: 'World',
        },
      },
    ],
  },

  setNodeRemove: {
    it: it.only,
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        someProp: 'Hello',
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
      },
    ],
    output: [
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
        suggestionUpdate: {
          someProp: undefined,
        },
      },
    ],
  },

  setNodeChange: {
    it: it.only,
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        someProp: 'Hello',
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        someProp: 'World',
      },
    ],
    output: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        someProp: 'World',
        suggestion: true,
        suggestion_0: true,
        suggestionId: '1',
        suggestionUpdate: {
          someProp: 'World',
        },
      },
    ],
  },

  addNodeChildren: {
    it: it.only,
    input1: [
      {
        type: 'container',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'PingCode' }],
          },
        ],
      },
    ],
    input2: [
      {
        type: 'container',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'PingCode' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Worktile' }],
          },
        ],
      },
    ],
    output: [
      {
        type: 'container',
        children: [
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
          },
        ],
      },
    ],
  },

  removeText: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode & Worktile' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode' },
        ],
      },
    ],
    output: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode' },
          {
            text: ' & Worktile',
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
            suggestionDeletion: true,
          },
        ],
      },
    ],
  },

  mergeText: {
    input1: [
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
    input2: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'PingCode & ',
            bold: true,
          },
        ],
      },
    ],
    output: [
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
  },

  mergeNode: {
    input1: [
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
    input2: [
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
            text: 'co',
            bold: true,
          },
        ],
      },
    ],
    output: [
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
  },

  mergeTwoText: {
    input1: [
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
    input2: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'PingCode & Worktile',
            bold: true,
          },
        ],
      },
    ],
    output: [
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
  },

  mergeRemoveText: {
    input1: [
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
    input2: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'PingCode',
          },
        ],
      },
    ],
    output: [
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
  },
};

describe('slateDiff', () => {
  Object.entries(fixtures).forEach(([name, { it: itFn = it, input1, input2, output }]) => {
    itFn(name, () => {
      const editor = createPlateEditor();
      expect(diffToSuggestions(editor, input1, input2)).toStrictEqual(output);
    });
  });
});
