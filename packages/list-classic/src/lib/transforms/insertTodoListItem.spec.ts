import { KEYS } from '@platejs/utils';

import { BaseTodoListPlugin } from '../BaseTodoListPlugin';
import { insertTodoListItem } from './insertTodoListItem';

describe('insertTodoListItem', () => {
  it('returns false when there is no selection', () => {
    const editor = {
      getOptions: () => ({
        inheritCheckStateOnLineEndBreak: false,
        inheritCheckStateOnLineStartBreak: false,
      }),
      getType: (key: string) => key,
      selection: null,
    } as any;

    expect(insertTodoListItem(editor)).toBe(false);
  });

  it('inserts a todo before when the cursor is at the start', () => {
    const insertNodes = mock();
    const editor = {
      api: {
        above: mock(() => [{ checked: true, type: KEYS.listTodoClassic }, [0]]),
        isCollapsed: mock(() => true),
        isEmpty: mock(() => false),
        isStart: mock(() => true),
        marks: mock(() => null),
      },
      getOptions: (plugin: any) =>
        plugin === BaseTodoListPlugin
          ? {
              inheritCheckStateOnLineEndBreak: false,
              inheritCheckStateOnLineStartBreak: true,
            }
          : {},
      getType: (key: string) => key,
      selection: { focus: { offset: 0, path: [0] } },
      update: (fn: any) =>
        fn({
          nodes: { insert: insertNodes },
          text: { delete: mock() },
          withoutNormalizing: (callback: () => void) => callback(),
        }),
    } as any;

    expect(insertTodoListItem(editor)).toBe(true);
    expect(insertNodes).toHaveBeenCalledWith(
      {
        checked: true,
        children: [{ text: '' }],
        type: KEYS.listTodoClassic,
      },
      { at: [0] }
    );
  });

  it('inserts a todo after at the end and preserves marks', () => {
    const insertNodes = mock();
    const select = mock();
    const editor = {
      api: {
        above: mock(() => [
          { checked: false, type: KEYS.listTodoClassic },
          [0],
        ]),
        isCollapsed: mock(() => true),
        isEmpty: mock(() => true),
        isStart: mock(() => false),
        marks: mock(() => ({ italic: true })),
      },
      getOptions: () => ({
        inheritCheckStateOnLineEndBreak: true,
        inheritCheckStateOnLineStartBreak: false,
      }),
      getType: (key: string) => key,
      selection: { focus: { offset: 1, path: [0] } },
      update: (fn: any) =>
        fn({
          nodes: { insert: insertNodes },
          selection: { set: select },
          text: { delete: mock() },
          withoutNormalizing: (callback: () => void) => callback(),
        }),
    } as any;

    expect(insertTodoListItem(editor)).toBe(true);
    expect(insertNodes).toHaveBeenCalledWith(
      {
        checked: false,
        children: [{ italic: true, text: '' }],
        type: KEYS.listTodoClassic,
      },
      { at: [1] }
    );
    expect(select).toHaveBeenCalledWith([1]);
  });

  it('deletes expanded selections and splits nodes for middle breaks', () => {
    const deleteSelection = mock();
    const splitNodes = mock();
    const editor = {
      api: {
        above: mock(() => [{ checked: true, type: KEYS.listTodoClassic }, [0]]),
        isCollapsed: mock(() => false),
        isEmpty: mock(() => false),
        isStart: mock(() => false),
        marks: mock(() => null),
      },
      getOptions: () => ({
        inheritCheckStateOnLineEndBreak: false,
        inheritCheckStateOnLineStartBreak: false,
      }),
      getType: (key: string) => key,
      selection: { focus: { offset: 1, path: [0] } },
      update: (fn: any) =>
        fn({
          nodes: { split: splitNodes },
          text: { delete: deleteSelection },
          withoutNormalizing: (callback: () => void) => callback(),
        }),
    } as any;

    expect(insertTodoListItem(editor)).toBe(true);
    expect(deleteSelection).toHaveBeenCalledTimes(1);
    expect(splitNodes).toHaveBeenCalledTimes(1);
  });
});
