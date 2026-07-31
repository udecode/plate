/** @jsx jsxt */

import { property } from '@platejs/plite';
import { jsxt } from '@platejs/test-utils';

jsxt;
import { createPlateEditor } from '../editor';
import { createPlatePlugin } from '../plugin';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { pipeHandler } from './pipeHandler';

const BoldPlugin = createPlatePlugin({
  name: 'bold',
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

  const editor = createPlateEditor({
    plugins: [
      BoldPlugin.configure({
        on: {
          keyDown: ({ editor, event }) => {
            if (event.key === 'b' && event.ctrlKey) {
              editor.update.marks.toggle('bold');
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

describe('extend method with shortcuts', () => {
  it('publishes one frozen shortcut table in deterministic order', () => {
    const firstPlugin = createPlatePlugin({
      name: 'first',
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
    const secondPlugin = createPlatePlugin({
      name: 'second',
      shortcuts: {
        first: {
          keys: 'ctrl+3',
          handler: () => {},
          priority: 20,
        },
      },
    });
    const editor = createPlateEditor({
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
    const testPlugin = createPlatePlugin({
      name: 'testPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: () => {},
        },
      },
    }).extend({
      shortcuts: {
        italic: {
          keys: 'mod+i',
          handler: () => {},
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    expect(getPlateRuntime(editor).shortcuts['testPlugin.bold']).toBeDefined();
    expect(
      getPlateRuntime(editor).shortcuts['testPlugin.italic']
    ).toBeDefined();
  });

  it('override existing shortcuts in a plugin', () => {
    const originalCallback = mock();
    const newCallback = mock();

    const testPlugin = createPlatePlugin({
      name: 'testPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: originalCallback,
        },
      },
    }).extend({
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: newCallback,
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    getPlateRuntime(editor).shortcuts['testPlugin.bold']?.handler?.({
      editor,
      event: {} as KeyboardEvent,
      handler: {} as any,
    } as any);

    expect(originalCallback).not.toHaveBeenCalled();
    expect(newCallback).toHaveBeenCalled();
  });

  it('configure existing shortcuts in a plugin', () => {
    const originalCallback = mock();
    const _newCallback = mock();

    const testPlugin = createPlatePlugin({
      name: 'testPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: originalCallback,
        },
      },
    }).configure({
      shortcuts: {
        bold: {
          handler: originalCallback,
          keys: 'mod+bb',
        },
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    expect(getPlateRuntime(editor).shortcuts['testPlugin.bold']?.keys).toBe(
      'mod+bb'
    );
  });

  it('allow removing shortcuts by setting them to null', () => {
    const testPlugin = createPlatePlugin({
      name: 'testPlugin',
      shortcuts: {
        bold: {
          keys: 'mod+b',
          handler: () => {},
        },
        italic: {
          keys: 'mod+i',
          handler: () => {},
        },
      },
    }).extend({
      shortcuts: {
        bold: null,
      },
    });

    const editor = createPlateEditor({
      plugins: [testPlugin],
    });

    expect(
      getPlateRuntime(editor).shortcuts['testPlugin.bold']
    ).toBeUndefined();
    expect(
      getPlateRuntime(editor).shortcuts['testPlugin.italic']
    ).toBeDefined();
  });
});
