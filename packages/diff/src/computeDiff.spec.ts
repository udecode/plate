/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { isText, Value } from '@udecode/plate-common';

import { computeDiff, ComputeDiffOptions } from './computeDiff';

const ELEMENT_INLINE_VOID = 'inline-void';

interface ComputeDiffFixture
  extends Pick<ComputeDiffOptions, 'lineBreakChar' | 'shouldDiffDescendants'> {
  it?: typeof it;
  input1: Value;
  input2: Value;
  expected: Value;
}

const fixtures: Record<string, ComputeDiffFixture> = {
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
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode ' },
          {
            text: 'Wiki',
            bold: true,
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { bold: true },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'PingCode',
            bold: true,
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { bold: true },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'These ' },
          {
            text: 'words',
            bold: true,
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { bold: true },
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
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { bold: true },
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

  addMarkToMarkedText: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'One two three', bold: true }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [
          { text: 'One ', bold: true },
          { text: 'two', bold: true, italic: true },
          { text: ' three', bold: true },
        ],
      },
    ],
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'One ', bold: true },
          {
            text: 'two',
            bold: true,
            italic: true,
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { italic: true },
            },
          },
          { text: ' three', bold: true },
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
    expected: [
      {
        type: 'paragraph',
        children: [{ text: 'This is the first paragraph.' }],
        key: '1',
      },
      {
        type: 'paragraph',
        children: [{ text: 'This is the second paragraph.' }],
        key: '2',
        diff: true,
        diffOperation: {
          type: 'insert',
        },
      },
      {
        type: 'paragraph',
        children: [
          { text: 'This is the third paragraph' },
          {
            text: ', and insert some text',
            diff: true,
            diffOperation: {
              type: 'insert',
            },
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
    expected: [
      {
        type: 'paragraph',
        children: [{ text: 'This is the first paragraph.' }],
        key: '1',
      },
      {
        type: 'paragraph',
        children: [{ text: 'This is the second paragraph.' }],
        key: '2',
        diff: true,
        diffOperation: { type: 'insert' },
      },
      {
        type: 'paragraph',
        children: [
          { text: 'This is the third paragraph' },
          {
            text: ', and insert some text',
            diff: true,
            diffOperation: { type: 'insert' },
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
        diff: true,
        diffOperation: { type: 'insert' },
      },
      {
        type: 'paragraph',
        children: [
          { text: 'This is the fourth paragraph' },
          {
            text: ', and insert some text',
            diff: true,
            diffOperation: { type: 'insert' },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'PingCode',
            bold: true,
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { bold: true },
            },
          },
          {
            text: ' & ',
            // TODO:
            bold: undefined,
            diff: true,
            diffOperation: { type: 'insert' },
          },
          {
            text: 'Worktile',
            bold: true,
            diff: true,
            diffOperation: { type: 'insert' },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode' },
          {
            text: ' & Worktile',
            diff: true,
            diffOperation: { type: 'insert' },
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
    expected: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        diff: true,
        diffOperation: { type: 'insert' },
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
    expected: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        diff: true,
        diffOperation: { type: 'delete' },
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
    expected: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        someProp: 'World',
        diff: true,
        diffOperation: {
          type: 'update',
          properties: {},
          newProperties: { someProp: 'World' },
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
    expected: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        diff: true,
        diffOperation: {
          type: 'update',
          properties: { someProp: 'Hello' },
          newProperties: { someProp: undefined },
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
    expected: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Worktile' }],
        someProp: 'World',
        diff: true,
        diffOperation: {
          type: 'update',
          properties: { someProp: 'Hello' },
          newProperties: { someProp: 'World' },
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
    expected: [
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
            diff: true,
            diffOperation: { type: 'insert' },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode' },
          {
            text: ' & Worktile',
            diff: true,
            diffOperation: { type: 'delete' },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode & W' },
          {
            text: 'orktile',
            diff: true,
            diffOperation: { type: 'delete' },
          },
          {
            text: 'hatever',
            diff: true,
            diffOperation: { type: 'insert' },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is an ' },
          {
            type: ELEMENT_INLINE_VOID,
            children: [{ text: '' }],
            diff: true,
            diffOperation: { type: 'delete' },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is an ' },
          {
            type: ELEMENT_INLINE_VOID,
            children: [{ text: '' }],
            diff: true,
            diffOperation: { type: 'insert' },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is an ' },
          {
            type: ELEMENT_INLINE_VOID,
            someProp: 'Hello',
            children: [{ text: '' }],
            diff: true,
            diffOperation: { type: 'delete' },
          },
          {
            type: ELEMENT_INLINE_VOID,
            someProp: 'World',
            children: [{ text: '' }],
            diff: true,
            diffOperation: { type: 'insert' },
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
    expected: [
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
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { bold: true },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'PingCode',
            bold: true,
          },
          {
            text: ' & ',
            diff: true,
            diffOperation: { type: 'insert' },
          },
          {
            text: 'co',
            bold: true,
            diff: true,
            diffOperation: { type: 'insert' },
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
        diff: true,
        diffOperation: { type: 'delete' },
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
    expected: [
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
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { bold: true },
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
    expected: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'PingCode',
            diff: true,
            diffOperation: {
              type: 'update',
              properties: { bold: true },
              newProperties: { bold: undefined },
            },
          },
          {
            text: ' & Worktile',
            bold: true,
            diff: true,
            diffOperation: { type: 'delete' },
          },
        ],
      },
    ],
  },

  addMarkRemoveText: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'A B C' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'A  C',
            bold: true,
          },
        ],
      },
    ],
    expected: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'A ',
            bold: true,
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { bold: true },
            },
          },
          {
            text: 'B',
            diff: true,
            diffOperation: { type: 'delete' },
          },
          {
            text: ' C',
            bold: true,
            diff: true,
            diffOperation: {
              type: 'update',
              properties: {},
              newProperties: { bold: true },
            },
          },
        ],
      },
    ],
  },

  changeIdBlock: {
    input1: [
      {
        type: 'paragraph',
        id: '1',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        id: '2',
        children: [{ text: 'Worktile' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        id: '1',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        id: '3',
        children: [{ text: 'Worktile' }],
      },
    ],
    expected: [
      {
        type: 'paragraph',
        id: '1',
        children: [{ text: 'PingCode' }],
      },
      {
        type: 'paragraph',
        id: '3',
        children: [{ text: 'Worktile' }],
      },
    ],
  },

  changeIdText: {
    input1: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode', id: '1' },
          { text: ' & ', id: '2' },
          { text: 'Worktile', id: '3' },
        ],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode', id: '1' },
          { text: ' & ', id: '4' },
          { text: 'Worktile', id: '3' },
        ],
      },
    ],
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode', id: '1' },
          { text: ' & ', id: '4' },
          { text: 'Worktile', id: '3' },
        ],
      },
    ],
  },

  changeIdInline: {
    input1: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode', id: '1' },
          { type: ELEMENT_INLINE_VOID, id: '2', children: [{ text: '' }] },
          { text: 'Worktile', id: '3' },
        ],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode', id: '1' },
          { type: ELEMENT_INLINE_VOID, id: '4', children: [{ text: '' }] },
          { text: 'Worktile', id: '3' },
        ],
      },
    ],
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'PingCode', id: '1' },
          { type: ELEMENT_INLINE_VOID, id: '4', children: [{ text: '' }] },
          { text: 'Worktile', id: '3' },
        ],
      },
    ],
  },

  insertWithoutLineBreakChar: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'Ping\nCode' }],
      },
    ],
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'Ping' },
          { text: '\n', diff: true, diffOperation: { type: 'insert' } },
          { text: 'Code' },
        ],
      },
    ],
  },

  removeWithoutLineBreakChar: {
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'Ping\nCode' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
    ],
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'Ping' },
          { text: '\n', diff: true, diffOperation: { type: 'delete' } },
          { text: 'Code' },
        ],
      },
    ],
  },

  insertWithLineBreakChar: {
    lineBreakChar: '¶',
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
          { text: 'Ping\nCo' },
          { text: 'd', bold: true },
          { text: 'e' },
        ],
      },
    ],
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'Ping' },
          { text: '¶\n', diff: true, diffOperation: { type: 'insert' } },
          { text: 'Co' },
          {
            text: 'd',
            bold: true,
            diff: true,
            diffOperation: {
              type: 'update',
              properties: { bold: undefined },
              newProperties: { bold: true },
            },
          },
          { text: 'e', bold: undefined },
        ],
      },
    ],
  },

  removeWithLineBreakChar: {
    lineBreakChar: '¶',
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'Ping\nCode' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'PingCode' }],
      },
    ],
    expected: [
      {
        type: 'paragraph',
        children: [
          { text: 'Ping' },
          { text: '¶', diff: true, diffOperation: { type: 'delete' } },
          { text: 'Code' },
        ],
      },
    ],
  },

  shouldNotDiffDescendants: {
    shouldDiffDescendants: ([firstNode]) =>
      !firstNode ||
      !isText(firstNode) ||
      !firstNode.text.startsWith('NO_DIFF_INLINE'),
    input1: [
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE FirstA' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE SecondA' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE ThirdA' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Same' }],
      },
    ],
    input2: [
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE FirstB' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE SecondB' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE ThirdB' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Same' }],
      },
    ],
    expected: [
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE FirstA' }],
        diff: true,
        diffOperation: {
          type: 'delete',
        },
      },
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE SecondA' }],
        diff: true,
        diffOperation: {
          type: 'delete',
        },
      },
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE ThirdA' }],
        diff: true,
        diffOperation: {
          type: 'delete',
        },
      },
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE FirstB' }],
        diff: true,
        diffOperation: {
          type: 'insert',
        },
      },
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE SecondB' }],
        diff: true,
        diffOperation: {
          type: 'insert',
        },
      },
      {
        type: 'paragraph',
        children: [{ text: 'NO_DIFF_INLINE ThirdB' }],
        diff: true,
        diffOperation: {
          type: 'insert',
        },
      },
      {
        type: 'paragraph',
        children: [{ text: 'Same' }],
      },
    ],
  },
};

describe('computeDiff', () => {
  Object.entries(fixtures).forEach(
    ([name, { it: itFn = it, input1, input2, expected, ...options }]) => {
      itFn(name, () => {
        const output = computeDiff(input1, input2, {
          isInline: (node) => node.type === ELEMENT_INLINE_VOID,
          ignoreProps: ['id'],
          ...options,
        });

        expect(output).toEqual(expected);
      });
    }
  );
});
