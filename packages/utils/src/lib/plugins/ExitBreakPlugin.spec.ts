import { createBasePlugin } from '@platejs/core';
import { createPlateEditor } from '@platejs/core/react';
import { schema } from '@platejs/plite';

import { ExitBreakPlugin } from './ExitBreakPlugin';

describe('ExitBreakPlugin', () => {
  it('inserts an exit block after the current block', () => {
    const editor = createPlateEditor({
      plugins: [ExitBreakPlugin],
      selection: {
        kind: 'text',
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
        kind: 'text',
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
        kind: 'text',
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

  it('exits after the nearest ancestor whose parent accepts a paragraph', () => {
    const editor = createPlateEditor({
      plugins: [
        ExitBreakPlugin,
        createBasePlugin({
          key: 'codeblock',
          node: {
            element: {
              content: schema.content.type('codeline', {
                default: { type: 'codeline' },
                min: 1,
              }),
              groups: ['block'],
            },
            type: 'codeblock',
          },
        }),
        createBasePlugin({
          key: 'codeline',
          node: {
            element: {
              content: schema.content.text({ default: 'text', min: 1 }),
            },
            type: 'codeline',
          },
        }),
      ],
      selection: {
        kind: 'text',
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

  it('exits after an outer structure whose grammar rejects paragraphs', () => {
    const editor = createPlateEditor({
      plugins: [
        ExitBreakPlugin,
        createBasePlugin({
          key: 'table',
          node: {
            element: {
              content: schema.content.type('tr', {
                default: { type: 'tr' },
                min: 1,
              }),
              groups: ['block'],
            },
            type: 'table',
          },
        }),
        createBasePlugin({
          key: 'tr',
          node: {
            element: {
              content: schema.content.type('td', {
                default: { type: 'td' },
                min: 1,
              }),
            },
            type: 'tr',
          },
        }),
        createBasePlugin({
          key: 'td',
          node: {
            element: {
              content: schema.content.group('block', {
                default: { type: 'p' },
                min: 1,
              }),
            },
            type: 'td',
          },
        }),
      ],
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [0, 0, 0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0, 0, 0] },
      },
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'cell' }], type: 'p' }],
                  type: 'td',
                },
              ],
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
            children: [
              {
                children: [{ children: [{ text: 'cell' }], type: 'p' }],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
      { children: [{ text: '' }], type: 'p' },
    ]);
  });
});
