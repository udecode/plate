import { KEYS } from 'platejs';

import { insertListItem } from './insertListItem';

describe('insertListItem', () => {
  it('returns false without a selection', () => {
    expect(insertListItem({ getType: (key: string) => key } as any)).toBe(
      false
    );
  });

  it('inserts a sibling list item before when the cursor is at the start', () => {
    const insertNodes = mock();
    const editor = {
      api: {
        above: mock(() => [{ type: KEYS.lic }, [0, 0]]),
        isCollapsed: mock(() => true),
        isEmpty: mock(() => false),
        isStart: mock(() => true),
        marks: mock(() => null),
        parent: mock(() => [
          { checked: true, children: [{}, {}], type: KEYS.li },
          [0],
        ]),
      },
      getType: (key: string) => key,
      selection: { focus: { offset: 0, path: [0, 0] } },
      tf: {
        delete: mock(),
        insertNodes,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;

    expect(
      insertListItem(editor, { inheritCheckStateOnLineStartBreak: true })
    ).toBe(true);

    expect(insertNodes).toHaveBeenCalledWith(
      {
        checked: true,
        children: [{ children: [{ text: '' }], type: KEYS.lic }],
        type: KEYS.li,
      },
      { at: [0] }
    );
  });

  it('inserts a sibling list item after when the cursor is at the end', () => {
    const insertNodes = mock();
    const select = mock();
    const editor = {
      api: {
        above: mock(() => [{ type: KEYS.lic }, [0, 0]]),
        isCollapsed: mock(() => true),
        isEmpty: mock(() => true),
        isStart: mock(() => false),
        marks: mock(() => ({ bold: true })),
        parent: mock(() => [
          { checked: true, children: [{}], type: KEYS.li },
          [0],
        ]),
      },
      getType: (key: string) => key,
      selection: { focus: { offset: 1, path: [0, 0] } },
      tf: {
        delete: mock(),
        insertNodes,
        select,
        withoutNormalizing: (fn: () => void) => fn(),
      },
    } as any;

    expect(
      insertListItem(editor, { inheritCheckStateOnLineEndBreak: true })
    ).toBe(true);

    expect(insertNodes).toHaveBeenCalledWith(
      {
        checked: true,
        children: [{ children: [{ bold: true, text: '' }], type: KEYS.lic }],
        type: KEYS.li,
      },
      { at: [1] }
    );
    expect(select).toHaveBeenCalledWith([1]);
  });

  it('deletes an expanded selection, splits the item, and moves nested list content', () => {
    const collapse = mock();
    const deleteSelection = mock();
    const moveNodes = mock();
    const select = mock();
    const splitNodes = mock();
    const wrapNodes = mock();
    const editor = {
      api: {
        above: mock(() => [{ type: KEYS.lic }, [0, 0]]),
        isCollapsed: mock(() => false),
        isEmpty: mock(() => false),
        isStart: mock(() => false),
        marks: mock(() => null),
        parent: mock(() => [
          { checked: true, children: [{}, {}], type: KEYS.li },
          [0],
        ]),
      },
      getType: (key: string) => key,
      selection: { focus: { offset: 2, path: [0, 0] } },
      tf: {
        collapse,
        delete: deleteSelection,
        moveNodes,
        select,
        splitNodes,
        withoutNormalizing: (fn: () => void) => fn(),
        wrapNodes,
      },
    } as any;

    expect(
      insertListItem(editor, { inheritCheckStateOnLineEndBreak: true })
    ).toBe(true);

    expect(deleteSelection).toHaveBeenCalledTimes(1);
    expect(splitNodes).toHaveBeenCalledTimes(1);
    expect(wrapNodes).toHaveBeenCalledWith(
      {
        checked: false,
        children: [],
        type: KEYS.li,
      },
      { at: [0, 1] }
    );
    expect(moveNodes).toHaveBeenNthCalledWith(1, {
      at: [0, 1],
      to: [1],
    });
    expect(moveNodes).toHaveBeenNthCalledWith(2, {
      at: [0, 1],
      to: [1, 1],
    });
    expect(select).toHaveBeenCalledWith([1]);
    expect(collapse).toHaveBeenCalledWith({ edge: 'start' });
  });
});
