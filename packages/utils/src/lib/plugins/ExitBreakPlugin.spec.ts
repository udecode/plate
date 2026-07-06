import { createBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';

import { ExitBreakPlugin } from './ExitBreakPlugin';

describe('ExitBreakPlugin', () => {
  it('inserts an exit block after the current block', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    editor.update.exitBreak.insert({});

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('inserts an exit block before the current block', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'start' }], type: 'p' }],
    });

    editor.update.exitBreak.insertBefore({ match: () => true });

    expect(editor.read.children()).toEqual([
      { children: [{ text: '' }], type: 'p' },
      { children: [{ text: 'start' }], type: 'p' },
    ]);
  });

  it('routes insert through the Plite runtime transform', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: 'start' }], type: 'p' }],
    });

    editor.update.exitBreak.insert({});

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'start' }], type: 'p' },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('exits after the nearest non-strict ancestor', () => {
    const editor = createPlateEditor({
      plugins: [
        ExitBreakPlugin,
        createBasePlugin({
          key: 'codeblock',
          node: {
            isElement: true,
            isStrictSiblings: false,
            type: 'codeblock',
          },
        }),
        createBasePlugin({
          key: 'codeline',
          node: {
            isElement: true,
            isStrictSiblings: true,
            type: 'codeline',
          },
        }),
      ],
      selection: {
        anchor: { offset: 4, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: 'code' }], type: 'codeline' }],
          type: 'codeblock',
        },
      ],
    });

    editor.update.exitBreak.insert({});

    expect(editor.read.children()).toEqual([
      {
        children: [{ children: [{ text: 'code' }], type: 'codeline' }],
        type: 'codeblock',
      },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });

  it('exits after the outer strict-sibling structure', () => {
    const editor = createPlateEditor({
      plugins: [
        ExitBreakPlugin,
        createBasePlugin({
          key: 'table',
          node: { isElement: true, isStrictSiblings: false, type: 'table' },
        }),
        createBasePlugin({
          key: 'tr',
          node: { isElement: true, isStrictSiblings: true, type: 'tr' },
        }),
        createBasePlugin({
          key: 'td',
          node: { isElement: true, isStrictSiblings: true, type: 'td' },
        }),
      ],
      selection: {
        anchor: { offset: 4, path: [0, 0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [{ children: [{ text: 'cell' }], type: 'td' }],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

    editor.update.exitBreak.insert({});

    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            children: [{ children: [{ text: 'cell' }], type: 'td' }],
            type: 'tr',
          },
        ],
        type: 'table',
      },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });
});
