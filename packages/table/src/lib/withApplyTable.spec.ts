import { KEYS } from 'platejs';

import * as utilsModule from './utils';
import { withApplyTable } from './withApplyTable';

describe('withApplyTable', () => {
  afterEach(() => {
    mock.restore();
  });

  it('moves focus to the table end when the anchor is inside the table and selection extends forward', () => {
    const apply = mock();
    const editor = {
      api: {
        before: mock(() => ({ offset: 0, path: [0] })),
        block: mock(() => [{ type: KEYS.table }, [1]]),
        end: mock(() => ({ offset: 0, path: [1, 0] })),
        isAt: mock(() => true),
      },
      getType: (key: string) => key,
      selection: {
        anchor: { offset: 0, path: [1, 0, 0] },
        focus: { offset: 0, path: [2, 0, 0] },
      },
      tf: {},
    } as any;

    const transforms = (
      withApplyTable({
        api: {} as any,
        editor,
        getOptions: () => ({ _cellIndices: {} }),
        tf: { apply },
        type: KEYS.table,
      } as any) as any
    ).transforms;
    const op = {
      newProperties: {
        anchor: { offset: 0, path: [1, 0, 0] },
        focus: { offset: 0, path: [2, 0, 0] },
      },
      type: 'set_selection',
    } as any;

    transforms.apply(op);

    expect(op.newProperties.focus).toEqual({ offset: 0, path: [1, 0] });
    expect(apply).toHaveBeenCalledWith(op);
  });

  it('moves focus before the table when the focus is inside the table in a backward selection', () => {
    const apply = mock();
    const editor = {
      api: {
        before: mock(() => ({ offset: 0, path: [0] })),
        block: mock()
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce([{ type: KEYS.table }, [1]]),
        end: mock(),
        isAt: mock(() => true),
        start: mock(() => ({ offset: 0, path: [1, 0] })),
      },
      getType: (key: string) => key,
      selection: {
        anchor: { offset: 0, path: [2, 0, 0] },
        focus: { offset: 0, path: [1, 0, 0] },
      },
      tf: {},
    } as any;

    const transforms = (
      withApplyTable({
        api: {} as any,
        editor,
        getOptions: () => ({ _cellIndices: {} }),
        tf: { apply },
        type: KEYS.table,
      } as any) as any
    ).transforms;
    const op = {
      newProperties: {
        anchor: { offset: 0, path: [2, 0, 0] },
        focus: { offset: 0, path: [1, 0, 0] },
      },
      type: 'set_selection',
    } as any;

    transforms.apply(op);

    expect(op.newProperties.focus).toEqual({ offset: 0, path: [0] });
    expect(apply).toHaveBeenCalledWith(op);
  });

  it('cleans removed cell indices and recomputes indices for affected tables', () => {
    const apply = mock();
    const computeSpy = spyOn(
      utilsModule,
      'computeCellIndices'
    ).mockImplementation(() => ({}) as any);
    spyOn(utilsModule, 'getCellTypes').mockReturnValue(['td'] as any);
    const cellIndices = {
      keep: { col: 0, row: 0 },
      removeA: { col: 1, row: 0 },
      removeB: { col: 2, row: 0 },
    } as any;
    const tableNode = { type: KEYS.table } as any;
    const editor = {
      api: {
        node: mock(() => [tableNode, [0]]),
        nodes: mock(() => [
          [{ id: 'removeA', type: 'td' }, [0, 0]],
          [{ id: 'removeB', type: 'td' }, [0, 1]],
        ]),
      },
      getType: (key: string) => key,
      tf: {},
    } as any;

    const transforms = (
      withApplyTable({
        api: {} as any,
        editor,
        getOptions: () => ({ _cellIndices: cellIndices }),
        tf: { apply },
        type: KEYS.table,
      } as any) as any
    ).transforms;

    transforms.apply({
      node: { type: 'td' },
      path: [0, 0],
      type: 'remove_node',
    } as any);

    expect(cellIndices).toEqual({
      keep: { col: 0, row: 0 },
    });
    expect(computeSpy).toHaveBeenCalledWith(editor, {
      tableNode,
    });
    expect(apply).toHaveBeenCalled();
  });
});
