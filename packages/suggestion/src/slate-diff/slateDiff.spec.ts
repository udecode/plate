import {
  createPlateEditor,
  createPluginFactory,
  Value,
} from '@udecode/plate-common';

import { diffToSuggestions } from './slateDiff';

const ELEMENT_INLINE_VOID = 'inline-void';

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

  addMarkFirst: {
    input1: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode' },
          {
            text: ' Wiki & Worktile',
            italic: true,
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
            text: ' Wiki & Worktile',
            italic: true,
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
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
            suggestionUpdate: {
              bold: true,
            },
          },
          {
            text: ' Wiki & Worktile',
            italic: true,
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
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
            suggestionUpdate: {
              bold: true,
            },
          },
          {
            text: ' & ',
            bold: undefined,
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
          },
          {
            text: 'Worktile',
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
        children: [{ text: 'PingCode' }],
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

  replaceText: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode & Worktile' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode & Whatever' }],
      },
    ],
    output: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode & W' },
          {
            text: 'orktile',
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
            suggestionDeletion: true,
          },
          {
            text: 'hatever',
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
          },
        ],
      },
    ],
  },

  removeInlineVoid: {
    input1: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is an ' },
          {
            type: ELEMENT_INLINE_VOID,
            children: [{ text: '' }],
          },
          { text: '!' },
        ],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'This is an !' }],
      },
    ],
    output: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is an ' },
          {
            type: ELEMENT_INLINE_VOID,
            children: [{ text: '' }],
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
            suggestionDeletion: true,
          },
          { text: '!' },
        ],
      },
    ],
  },

  insertInlineVoid: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'This is an !' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is an ' },
          {
            type: ELEMENT_INLINE_VOID,
            children: [{ text: '' }],
          },
          { text: '!' },
        ],
      },
    ],
    output: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is an ' },
          {
            type: ELEMENT_INLINE_VOID,
            children: [{ text: '' }],
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
          },
          { text: '!' },
        ],
      },
    ],
  },

  updateInlineVoid: {
    input1: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is an ' },
          {
            type: ELEMENT_INLINE_VOID,
            someProp: 'Hello',
            children: [{ text: '' }],
          },
          { text: '!' },
        ],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is an ' },
          {
            type: ELEMENT_INLINE_VOID,
            someProp: 'World',
            children: [{ text: '' }],
          },
          { text: '!' },
        ],
      },
    ],
    output: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is an ' },
          {
            type: ELEMENT_INLINE_VOID,
            someProp: 'Hello',
            children: [{ text: '' }],
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
            suggestionDeletion: true,
          },
          {
            type: ELEMENT_INLINE_VOID,
            someProp: 'World',
            children: [{ text: '' }],
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
          },
          { text: '!' },
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
            suggestion: true,
            suggestion_0: true,
            suggestionId: '1',
            suggestionUpdate: {
              bold: undefined,
            },
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

const createInlineVoidPlugin = createPluginFactory({
  key: ELEMENT_INLINE_VOID,
  isElement: true,
  isInline: true,
  isVoid: true,
});

describe('slateDiff', () => {
  Object.entries(fixtures).forEach(
    ([name, { it: itFn = it, input1, input2, output }]) => {
      itFn(name, () => {
        const editor = createPlateEditor({
          plugins: [createInlineVoidPlugin()],
        });
        expect(diffToSuggestions(editor, input1, input2)).toStrictEqual(output);
      });
    }
  );
});
