/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { type TElement, type Value, NodeApi } from 'platejs';

import { type ComputeDiffOptions, computeDiff } from './computeDiff';

const inlineVoidType = 'inline-void';

const inlineElementType = 'inline-element';

interface ComputeDiffFixture
  extends Pick<ComputeDiffOptions, 'elementsAreRelated' | 'lineBreakChar'> {
  expected: Value;
  input1: Value;
  input2: Value;
  it?: typeof it;
}

const fixtures: Record<string, ComputeDiffFixture> = {
  addMark: {
    expected: [
      {
        children: [
          { text: 'PingCode ' },
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { bold: true },
              properties: {},
              type: 'update',
            },
            text: 'Wiki',
          },
          {
            // TODO
            bold: undefined,
            text: ' & Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode Wiki & Worktile' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          { text: 'PingCode ' },
          {
            bold: true,
            text: 'Wiki',
          },
          {
            text: ' & Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  addMarkFirst: {
    expected: [
      {
        children: [
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { bold: true },
              properties: {},
              type: 'update',
            },
            text: 'PingCode',
          },
          {
            italic: true,
            text: ' Wiki & Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [
          { text: 'PingCode' },
          {
            italic: true,
            text: ' Wiki & Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode',
          },
          {
            italic: true,
            text: ' Wiki & Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  addMarkRemoveText: {
    expected: [
      {
        children: [
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { bold: true },
              properties: {},
              type: 'update',
            },
            text: 'A ',
          },
          {
            diff: true,
            diffOperation: { type: 'delete' },
            text: 'B',
          },
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { bold: true },
              properties: {},
              type: 'update',
            },
            text: ' C',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'A B C' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          {
            bold: true,
            text: 'A  C',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  addMarkToMarkedText: {
    expected: [
      {
        children: [
          { bold: true, text: 'One ' },
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { italic: true },
              properties: {},
              type: 'update',
            },
            italic: true,
            text: 'two',
          },
          { bold: true, text: ' three' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ bold: true, text: 'One two three' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          { bold: true, text: 'One ' },
          { bold: true, italic: true, text: 'two' },
          { bold: true, text: ' three' },
        ],
        type: 'paragraph',
      },
    ],
  },

  addNode: {
    expected: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        diff: true,
        diffOperation: { type: 'insert' },
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        type: 'paragraph',
      },
    ],
  },

  addNodeChildren: {
    expected: [
      {
        children: [
          {
            children: [{ text: 'PingCode' }],
            type: 'paragraph',
          },
          {
            children: [{ text: 'Worktile' }],
            diff: true,
            diffOperation: { type: 'insert' },
            type: 'paragraph',
          },
        ],
        type: 'container',
      },
    ],
    input1: [
      {
        children: [
          {
            children: [{ text: 'PingCode' }],
            type: 'paragraph',
          },
        ],
        type: 'container',
      },
    ],
    input2: [
      {
        children: [
          {
            children: [{ text: 'PingCode' }],
            type: 'paragraph',
          },
          {
            children: [{ text: 'Worktile' }],
            type: 'paragraph',
          },
        ],
        type: 'container',
      },
    ],
  },

  addTwoMark: {
    expected: [
      {
        children: [
          { text: 'These ' },
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { bold: true },
              properties: {},
              type: 'update',
            },
            text: 'words',
          },
          {
            // TODO
            bold: undefined,
            text: ' are ',
          },
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { bold: true },
              properties: {},
              type: 'update',
            },
            text: 'bold',
          },
          {
            // TODO
            bold: undefined,
            text: '!',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'These words are bold!' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          { text: 'These ' },
          {
            bold: true,
            text: 'words',
          },
          {
            text: ' are ',
          },
          {
            bold: true,
            text: 'bold',
          },
          {
            text: '!',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  changeIdAndContent: {
    expected: [
      {
        id: '1',
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        id: '3',
        children: [
          { text: 'Worktile' },
          { diff: true, diffOperation: { type: 'insert' }, text: '!' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        id: '1',
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        id: '2',
        children: [{ text: 'Worktile' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        id: '1',
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        id: '3',
        children: [{ text: 'Worktile!' }],
        type: 'paragraph',
      },
    ],
  },

  changeIdBlock: {
    expected: [
      {
        id: '1',
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        id: '3',
        children: [{ text: 'Worktile' }],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        id: '1',
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        id: '2',
        children: [{ text: 'Worktile' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        id: '1',
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        id: '3',
        children: [{ text: 'Worktile' }],
        type: 'paragraph',
      },
    ],
  },

  changeIdInline: {
    expected: [
      {
        children: [
          { id: '1', text: 'PingCode' },
          { id: '4', children: [{ text: '' }], type: inlineVoidType },
          { id: '3', text: 'Worktile' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [
          { id: '1', text: 'PingCode' },
          { id: '2', children: [{ text: '' }], type: inlineVoidType },
          { id: '3', text: 'Worktile' },
        ],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          { id: '1', text: 'PingCode' },
          { id: '4', children: [{ text: '' }], type: inlineVoidType },
          { id: '3', text: 'Worktile' },
        ],
        type: 'paragraph',
      },
    ],
  },

  changeIdText: {
    expected: [
      {
        children: [
          { id: '1', text: 'PingCode' },
          { id: '4', text: ' & ' },
          { id: '3', text: 'Worktile' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [
          { id: '1', text: 'PingCode' },
          { id: '2', text: ' & ' },
          { id: '3', text: 'Worktile' },
        ],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          { id: '1', text: 'PingCode' },
          { id: '4', text: ' & ' },
          { id: '3', text: 'Worktile' },
        ],
        type: 'paragraph',
      },
    ],
  },

  customRelatedFunction: {
    expected: [
      {
        children: [{ text: '3/Added paragraph 1' }],
        diff: true,
        diffOperation: { type: 'insert' },
        type: 'paragraph',
      },
      {
        children: [
          { text: '1/First paragraph' },
          { diff: true, diffOperation: { type: 'insert' }, text: ' modified' },
        ],
        type: 'paragraph',
      },
      {
        children: [{ text: '4/Added paragraph 2' }],
        diff: true,
        diffOperation: { type: 'insert' },
        type: 'paragraph',
      },
      {
        children: [
          { text: '2/Second paragraph' },
          { diff: true, diffOperation: { type: 'insert' }, text: ' modified' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: '1/First paragraph' }],
        type: 'paragraph',
      },
      {
        children: [{ text: '2/Second paragraph' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: '3/Added paragraph 1' }],
        type: 'paragraph',
      },
      {
        children: [{ text: '1/First paragraph modified' }],
        type: 'paragraph',
      },
      {
        children: [{ text: '4/Added paragraph 2' }],
        type: 'paragraph',
      },
      {
        children: [{ text: '2/Second paragraph modified' }],
        type: 'paragraph',
      },
    ],
    elementsAreRelated: (element, nextElement) => {
      const getId = (e: TElement) => NodeApi.string(e).split('/')[0];

      return getId(element) === getId(nextElement);
    },
  },

  insertInlineVoid: {
    expected: [
      {
        children: [
          { text: 'This is an ' },
          {
            children: [{ text: '' }],
            diff: true,
            diffOperation: { type: 'insert' },
            type: inlineVoidType,
          },
          { text: '!' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'This is an !' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          { text: 'This is an ' },
          {
            children: [{ text: '' }],
            type: inlineVoidType,
          },
          { text: '!' },
        ],
        type: 'paragraph',
      },
    ],
  },

  insertText: {
    expected: [
      {
        children: [
          { text: 'PingCode' },
          {
            diff: true,
            diffOperation: { type: 'insert' },
            text: ' & Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          { text: 'PingCode' },
          {
            text: ' & Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  insertTextAddMark: {
    expected: [
      {
        children: [
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { bold: true },
              properties: {},
              type: 'update',
            },
            text: 'PingCode',
          },
          {
            // TODO:
            bold: undefined,
            diff: true,
            diffOperation: { type: 'insert' },
            text: ' & ',
          },
          {
            bold: true,
            diff: true,
            diffOperation: { type: 'insert' },
            text: 'Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode',
          },
          {
            text: ' & ',
          },
          {
            bold: true,
            text: 'Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  insertUpdateParagraph: {
    expected: [
      {
        key: '1',
        children: [{ text: 'This is the first paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '2',
        children: [{ text: 'This is the second paragraph.' }],
        diff: true,
        diffOperation: {
          type: 'insert',
        },
        type: 'paragraph',
      },
      {
        key: '3',
        children: [
          { text: 'This is the third paragraph' },
          {
            diff: true,
            diffOperation: {
              type: 'insert',
            },
            text: ', and insert some text',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
      {
        key: '4',
        children: [{ text: 'This is the fourth paragraph.' }],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        key: '1',
        children: [{ text: 'This is the first paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '3',
        children: [{ text: 'This is the third paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '4',
        children: [{ text: 'This is the fourth paragraph.' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        key: '1',
        children: [{ text: 'This is the first paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '2',
        children: [{ text: 'This is the second paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '3',
        children: [
          { text: 'This is the third paragraph' },
          {
            text: ', and insert some text',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
      {
        key: '4',
        children: [{ text: 'This is the fourth paragraph.' }],
        type: 'paragraph',
      },
    ],
  },

  insertUpdateTwoParagraphs: {
    expected: [
      {
        key: '1',
        children: [{ text: 'This is the first paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '2',
        children: [{ text: 'This is the second paragraph.' }],
        diff: true,
        diffOperation: { type: 'insert' },
        type: 'paragraph',
      },
      {
        key: '3',
        children: [
          { text: 'This is the third paragraph' },
          {
            diff: true,
            diffOperation: { type: 'insert' },
            text: ', and insert some text',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
      {
        key: '5',
        children: [{ text: 'This is the fifth paragraph.' }],
        diff: true,
        diffOperation: { type: 'insert' },
        type: 'paragraph',
      },
      {
        key: '4',
        children: [
          { text: 'This is the fourth paragraph' },
          {
            diff: true,
            diffOperation: { type: 'insert' },
            text: ', and insert some text',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        key: '1',
        children: [{ text: 'This is the first paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '3',
        children: [{ text: 'This is the third paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '4',
        children: [{ text: 'This is the fourth paragraph.' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        key: '1',
        children: [{ text: 'This is the first paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '2',
        children: [{ text: 'This is the second paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '3',
        children: [
          { text: 'This is the third paragraph' },
          {
            text: ', and insert some text',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
      {
        key: '5',
        children: [{ text: 'This is the fifth paragraph.' }],
        type: 'paragraph',
      },
      {
        key: '4',
        children: [
          { text: 'This is the fourth paragraph' },
          {
            text: ', and insert some text',
          },
          {
            text: '.',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  insertWithLineBreakChar: {
    expected: [
      {
        children: [
          { text: 'Ping' },
          { diff: true, diffOperation: { type: 'insert' }, text: '¶\n' },
          { text: 'Co' },
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { bold: true },
              properties: { bold: undefined },
              type: 'update',
            },
            text: 'd',
          },
          { bold: undefined, text: 'e' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          { text: 'Ping\nCo' },
          { bold: true, text: 'd' },
          { text: 'e' },
        ],
        type: 'paragraph',
      },
    ],
    lineBreakChar: '¶',
  },

  insertWithoutLineBreakChar: {
    expected: [
      {
        children: [
          { text: 'Ping' },
          { diff: true, diffOperation: { type: 'insert' }, text: '\n' },
          { text: 'Code' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'Ping\nCode' }],
        type: 'paragraph',
      },
    ],
  },

  mergeNode: {
    expected: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode',
          },
          {
            diff: true,
            diffOperation: { type: 'insert' },
            text: ' & ',
          },
          {
            bold: true,
            diff: true,
            diffOperation: { type: 'insert' },
            text: 'co',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: ' & ',
          },
          {
            bold: true,
            text: 'co',
          },
        ],
        diff: true,
        diffOperation: { type: 'delete' },
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            text: ' & ',
          },
          {
            bold: true,
            text: 'co',
          },
        ],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode',
          },
          {
            text: ' & ',
          },
          {
            bold: true,
            text: 'co',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  mergeRemoveText: {
    expected: [
      {
        children: [
          {
            diff: true,
            diffOperation: {
              newProperties: { bold: undefined },
              properties: { bold: true },
              type: 'update',
            },
            text: 'PingCode',
          },
          {
            bold: true,
            diff: true,
            diffOperation: { type: 'delete' },
            text: ' & Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode',
          },
          {
            text: ' & ',
          },
          {
            bold: true,
            text: 'Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          {
            text: 'PingCode',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  mergeText: {
    expected: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode',
          },
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { bold: true },
              properties: {},
              type: 'update',
            },
            text: ' & ',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode',
          },
          {
            text: ' & ',
          },
        ],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode & ',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  mergeTwoText: {
    expected: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode',
          },
          {
            bold: true,
            diff: true,
            diffOperation: {
              newProperties: { bold: true },
              properties: {},
              type: 'update',
            },
            text: ' & ',
          },
          {
            bold: true,
            text: 'Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode',
          },
          {
            text: ' & ',
          },
          {
            bold: true,
            text: 'Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          {
            bold: true,
            text: 'PingCode & Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
  },

  removeInlineVoid: {
    expected: [
      {
        children: [
          { text: 'This is an ' },
          {
            children: [{ text: '' }],
            diff: true,
            diffOperation: { type: 'delete' },
            type: inlineVoidType,
          },
          { text: '!' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [
          { text: 'This is an ' },
          {
            children: [{ text: '' }],
            type: inlineVoidType,
          },
          { text: '!' },
        ],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'This is an !' }],
        type: 'paragraph',
      },
    ],
  },

  removeNode: {
    expected: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        diff: true,
        diffOperation: { type: 'delete' },
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
    ],
  },

  removeText: {
    expected: [
      {
        children: [
          { text: 'PingCode' },
          {
            diff: true,
            diffOperation: { type: 'delete' },
            text: ' & Worktile',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode & Worktile' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
    ],
  },

  removeWithLineBreakChar: {
    expected: [
      {
        children: [
          { text: 'Ping' },
          { diff: true, diffOperation: { type: 'delete' }, text: '¶' },
          { text: 'Code' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'Ping\nCode' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
    ],
    lineBreakChar: '¶',
  },

  removeWithoutLineBreakChar: {
    expected: [
      {
        children: [
          { text: 'Ping' },
          { diff: true, diffOperation: { type: 'delete' }, text: '\n' },
          { text: 'Code' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'Ping\nCode' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
    ],
  },

  replaceText: {
    expected: [
      {
        children: [
          { text: 'PingCode & W' },
          {
            diff: true,
            diffOperation: { type: 'delete' },
            text: 'orktile',
          },
          {
            diff: true,
            diffOperation: { type: 'insert' },
            text: 'hatever',
          },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode & Worktile' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'PingCode & Whatever' }],
        type: 'paragraph',
      },
    ],
  },

  setNodeAdd: {
    expected: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        diff: true,
        diffOperation: {
          newProperties: { someProp: 'World' },
          properties: {},
          type: 'update',
        },
        someProp: 'World',
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        someProp: 'World',
        type: 'paragraph',
      },
    ],
  },

  setNodeChange: {
    expected: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        diff: true,
        diffOperation: {
          newProperties: { someProp: 'World' },
          properties: { someProp: 'Hello' },
          type: 'update',
        },
        someProp: 'World',
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        someProp: 'Hello',
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        someProp: 'World',
        type: 'paragraph',
      },
    ],
  },

  setNodeRemove: {
    expected: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        diff: true,
        diffOperation: {
          newProperties: { someProp: undefined },
          properties: { someProp: 'Hello' },
          type: 'update',
        },
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        someProp: 'Hello',
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'PingCode' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Worktile' }],
        type: 'paragraph',
      },
    ],
  },

  unrelatedTexts: {
    expected: [
      {
        children: [{ text: 'NO_DIFF_INLINE FirstA' }],
        diff: true,
        diffOperation: {
          type: 'delete',
        },
        type: 'paragraph',
      },
      {
        children: [{ text: 'NO_DIFF_INLINE SecondA' }],
        diff: true,
        diffOperation: {
          type: 'delete',
        },
        type: 'paragraph',
      },
      {
        children: [{ text: 'NO_DIFF_INLINE ThirdA' }],
        diff: true,
        diffOperation: {
          type: 'delete',
        },
        type: 'paragraph',
      },
      {
        children: [{ text: 'NO_DIFF_INLINE FirstB' }],
        diff: true,
        diffOperation: {
          type: 'insert',
        },
        type: 'paragraph',
      },
      {
        children: [{ text: 'NO_DIFF_INLINE SecondB' }],
        diff: true,
        diffOperation: {
          type: 'insert',
        },
        type: 'paragraph',
      },
      {
        children: [{ text: 'NO_DIFF_INLINE ThirdB' }],
        diff: true,
        diffOperation: {
          type: 'insert',
        },
        type: 'paragraph',
      },
      {
        children: [{ text: 'Same' }],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [{ text: 'NO_DIFF_INLINE FirstA' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'NO_DIFF_INLINE SecondA' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'NO_DIFF_INLINE ThirdA' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Same' }],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [{ text: 'NO_DIFF_INLINE FirstB' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'NO_DIFF_INLINE SecondB' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'NO_DIFF_INLINE ThirdB' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Same' }],
        type: 'paragraph',
      },
    ],
    elementsAreRelated: (element) =>
      !NodeApi.string(element).startsWith('NO_DIFF_INLINE'),
  },

  updateInlineElement: {
    expected: [
      {
        id: 'P3Jjv_ALdx',
        children: [
          { text: 'for ' },
          {
            children: [
              { text: 'ma' },
              { diff: true, diffOperation: { type: 'delete' }, text: 'a' },
              { text: 'in' },
            ],
            type: inlineElementType,
            url: 'https://discord.com',
          },
          { text: ' titles' },
        ],
        type: 'p',
      },
    ],
    input1: [
      {
        id: 'P3Jjv_ALdx',
        children: [
          {
            text: 'for ',
          },
          {
            children: [
              {
                text: 'maain',
              },
            ],
            type: inlineElementType,
            url: 'https://discord.com',
          },
          {
            text: ' titles',
          },
        ],
        type: 'p',
      },
    ],
    input2: [
      {
        id: 'P3Jjv_ALdx',
        children: [
          {
            text: 'for ',
          },
          {
            children: [
              {
                text: 'main',
              },
            ],
            type: inlineElementType,
            url: 'https://discord.com',
          },
          {
            text: ' titles',
          },
        ],
        type: 'p',
      },
    ],
  },

  updateInlineVoid: {
    expected: [
      {
        children: [
          { text: 'This is an ' },
          {
            children: [{ text: '' }],
            diff: true,
            diffOperation: { type: 'delete' },
            someProp: 'Hello',
            type: inlineVoidType,
          },
          {
            children: [{ text: '' }],
            diff: true,
            diffOperation: { type: 'insert' },
            someProp: 'World',
            type: inlineVoidType,
          },
          { text: '!' },
        ],
        type: 'paragraph',
      },
    ],
    input1: [
      {
        children: [
          { text: 'This is an ' },
          {
            children: [{ text: '' }],
            someProp: 'Hello',
            type: inlineVoidType,
          },
          { text: '!' },
        ],
        type: 'paragraph',
      },
    ],
    input2: [
      {
        children: [
          { text: 'This is an ' },
          {
            children: [{ text: '' }],
            someProp: 'World',
            type: inlineVoidType,
          },
          { text: '!' },
        ],
        type: 'paragraph',
      },
    ],
  },
};

describe('computeDiff', () => {
  Object.entries(fixtures).forEach(
    ([name, { expected, input1, input2, it: itFn = it, ...options }]) => {
      itFn(name, () => {
        const output = computeDiff(input1, input2, {
          ignoreProps: ['id'],
          isInline: (node) =>
            node.type === inlineVoidType || node.type === inlineElementType,
          ...options,
        });

        // biome-ignore lint/suspicious/noMisplacedAssertion: assertion is inside itFn callback which is a test function
        expect(output).toEqual(expected);
      });
    }
  );
});

// describe('computeDiff', () => {
//   it('should compute diff', () => {
//     const input1 = [
//       {
//         children: [
//           {
//             text: 'Experience a modern rich-text editor built with ',
//           },
//           {
//             children: [
//               {
//                 text: 'Slaxxte',
//               },
//             ],
//             type: 'a',
//             url: 'https://slatejs.org',
//             id: 'zg0crujFC2',
//           },
//           {
//             text: ' and ',
//           },
//           {
//             children: [
//               {
//                 text: 'Reaxct',
//               },
//             ],
//             type: 'a',
//             url: 'https://reactjs.org',
//             id: '-R-rUf5j6U',
//           },
//           {
//             text: '.',
//           },
//         ],
//         type: 'p',
//         id: '8RCsJ5pSjR',
//       },
//     ];

//     const input2 = [
//       {
//         children: [
//           {
//             text: 'Experience a modern rich-text editor built with ',
//           },
//           {
//             children: [
//               {
//                 text: 'Slate',
//               },
//             ],
//             type: 'a',
//             url: 'https://slatejs.org',
//           },
//           {
//             text: ' and ',
//           },
//           {
//             children: [
//               {
//                 text: 'React',
//               },
//             ],
//             type: 'a',
//             url: 'https://reactjs.org',
//           },
//           {
//             text: '.',
//           },
//         ],
//         type: 'p',
//         id: '8RCsJ5pSjR',
//       },
//     ];

//     const output = computeDiff(input1, input2, {
//       isInline: (node) => node.type === 'a',
//     });
//   });
// });
