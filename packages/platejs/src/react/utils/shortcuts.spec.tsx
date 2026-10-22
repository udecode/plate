/** @jsxRuntime classic */
/** @jsx jsxt */

import { property } from '../../core';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { jsxt } from '../../testing';
import { createEditor } from '../editor';
import type { Editor } from '../editor/Editor';
import { definePlugin } from '../plugin';
import { dispatchPlateShortcut } from './dispatchPlateShortcut.internal';
import { pipeHandler } from './pipeHandler.internal';

jsxt;

const BoldPlugin = definePlugin('bold', {
  schema: { mark: property.boolean({ default: false, omitDefault: true }) },
});

it('uses custom hotkey handler for bold', () => {
  const input = (
    <editor>
      <hp>
        Hello <anchor />
        world
        <focus />
      </hp>
    </editor>
  ) as any;

  const output = (
    <editor>
      <hp>
        Hello <htext bold>world</htext>
      </hp>
    </editor>
  ) as any;

  const editor = createEditor({
    plugins: [
      BoldPlugin.configure({
        on: {
          keyDown: ({ editor: innerEditor, event }) => {
            if (event.key === 'b' && event.ctrlKey) {
              innerEditor.update.marks.toggle('bold');
            }
          },
        },
      }),
    ],
    selection: input.selection,
    initialValue: input.children,
  });

  pipeHandler(editor, { handlerKey: 'onKeyDown' })?.(
    new KeyboardEvent('keydown', { ctrlKey: true, key: 'b' })
  );

  expect(editor.read.children()).toEqual(output.children);
});

const pressCtrl = (editor: Editor, key: string) =>
  dispatchPlateShortcut(
    editor,
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      code: `Key${key.toUpperCase()}`,
      ctrlKey: true,
      key,
    }),
    'keydown',
    getPlateRuntime(editor).shortcutTable
  );

describe('extend method with shortcuts', () => {
  it('publishes one frozen shortcut table in deterministic order', () => {
    const firstPlugin = definePlugin('first', {
      shortcuts: {
        first: {
          keys: 'ctrl+1',
          handler: () => {},
          priority: 10,
        },
        second: {
          keys: 'ctrl+2',
          handler: () => {},
          priority: 10,
        },
      },
    });
    const secondPlugin = definePlugin('second', {
      shortcuts: {
        first: {
          keys: 'ctrl+3',
          handler: () => {},
          priority: 20,
        },
      },
    });
    const editor = createEditor({
      plugins: [firstPlugin, secondPlugin],
    });
    const table = getPlateRuntime(editor).shortcutTable.filter(
      ({ id }) => id.startsWith('first.') || id.startsWith('second.')
    );

    expect(table.map(({ id }) => id)).toEqual([
      'second.first',
      'first.first',
      'first.second',
    ]);
    expect(Object.isFrozen(getPlateRuntime(editor).shortcutTable)).toBe(true);
    expect(table.every(Object.isFrozen)).toBe(true);
  });

  it('add new shortcuts to a plugin', () => {
    const testPlugin = definePlugin('testPlugin', {
      shortcuts: {
        bold: {
          keys: 'ctrl+b',
          handler: ({ editor }) => {
            editor.update.text.insert('b');
          },
        },
      },
    }).extend({
      shortcuts: {
        italic: {
          keys: 'ctrl+i',
          handler: ({ editor }) => {
            editor.update.text.insert('i');
          },
        },
      },
    });

    const editor = createEditor({
      plugins: [testPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    pressCtrl(editor, 'b');
    pressCtrl(editor, 'i');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'bi' }], type: 'paragraph' },
    ]);
  });

  it('override existing shortcuts in a plugin', () => {
    const testPlugin = definePlugin('testPlugin', {
      shortcuts: {
        bold: {
          keys: 'ctrl+b',
          handler: ({ editor }) => {
            editor.update.text.insert('original');
          },
        },
      },
    }).extend({
      shortcuts: {
        bold: {
          keys: 'ctrl+b',
          handler: ({ editor }) => {
            editor.update.text.insert('override');
          },
        },
      },
    });

    const editor = createEditor({
      plugins: [testPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    pressCtrl(editor, 'b');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'override' }], type: 'paragraph' },
    ]);
  });

  it('configure existing shortcuts in a plugin', () => {
    const testPlugin = definePlugin('testPlugin', {
      shortcuts: {
        bold: {
          keys: 'ctrl+b',
          handler: ({ editor, event }) => {
            editor.update.text.insert(event.key);
          },
        },
      },
    }).configure({
      shortcuts: {
        bold: {
          handler: ({ editor, event }) => {
            editor.update.text.insert(event.key);
          },
          keys: 'ctrl+i',
        },
      },
    });

    const editor = createEditor({
      plugins: [testPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    pressCtrl(editor, 'b');
    pressCtrl(editor, 'i');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'i' }], type: 'paragraph' },
    ]);
  });

  it('allow removing shortcuts by setting them to null', () => {
    const testPlugin = definePlugin('testPlugin', {
      shortcuts: {
        bold: {
          keys: 'ctrl+b',
          handler: ({ editor }) => {
            editor.update.text.insert('b');
          },
        },
        italic: {
          keys: 'ctrl+i',
          handler: ({ editor }) => {
            editor.update.text.insert('i');
          },
        },
      },
    }).extend({
      shortcuts: {
        bold: null,
      },
    });

    const editor = createEditor({
      plugins: [testPlugin],
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
    });

    pressCtrl(editor, 'b');
    pressCtrl(editor, 'i');

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'i' }], type: 'paragraph' },
    ]);
  });
});
