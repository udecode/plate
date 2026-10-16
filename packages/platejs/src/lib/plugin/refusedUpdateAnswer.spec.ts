import { AuthoredPlugin } from '../../authored';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '../../features/table/lib/BaseTablePlugin';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { createEditor } from '../../react/core';
import { dispatchPlateShortcut } from '../../react/utils/dispatchPlateShortcut.internal';
import { definePlugin } from './definePlugin';

const CellWriter = definePlugin('cellWriter', {
  shortcuts: { write: { keys: 'f2' } },
  update: ({ tx }) => ({
    write: () => {
      tx.text.insert('!', { at: { offset: 0, path: [0, 0, 0, 0, 0] } });

      return true;
    },
  }),
});

const tableVetoEditor = () => {
  const editor = createEditor({
    initialValue: [
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: '11' }], type: 'paragraph' }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ],
    plugins: [
      BaseTableCellPlugin,
      BaseTableRowPlugin,
      BaseTablePlugin,
      CellWriter,
      AuthoredPlugin,
    ],
    userId: 'bob',
  });
  const authored = editor.plugin(AuthoredPlugin).api;
  const refusals: unknown[] = [];

  authored.setView({ intent: 'propose' });
  authored.subscribeRefusals((refusal) => refusals.push(refusal));

  return { before: editor.read.children(), editor, refusals };
};

describe('a refused plugin update', () => {
  it('answers undefined through the plugin context', () => {
    const { before, editor, refusals } = tableVetoEditor();

    expect(editor.plugin(CellWriter).update.write()).toBeUndefined();
    expect(editor.read.children()).toEqual(before);
    expect(refusals).toEqual([
      expect.objectContaining({ code: 'veto', reasons: ['table'] }),
    ]);
  });

  it('keeps its generated shortcut handled', () => {
    const { before, editor, refusals } = tableVetoEditor();
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      code: 'F2',
      key: 'F2',
    });

    expect(
      dispatchPlateShortcut(
        editor,
        event,
        'keydown',
        getPlateRuntime(editor).shortcutTable
      )
    ).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(editor.read.children()).toEqual(before);
    expect(refusals).toHaveLength(1);
  });
});
