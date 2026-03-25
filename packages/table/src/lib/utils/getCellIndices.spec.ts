import * as platejs from 'platejs';

import * as computeCellIndicesModule from './computeCellIndices';
import { getCellIndices } from './getCellIndices';

describe('getCellIndices', () => {
  afterEach(() => {
    mock.restore();
  });

  it('returns cached indices without recomputing', () => {
    const getOption = mock(() => ({ col: 2, row: 1 }));
    const computeSpy = spyOn(
      computeCellIndicesModule,
      'computeCellIndices'
    ).mockReturnValue(undefined as any);

    spyOn(platejs, 'getEditorPlugin').mockReturnValue({
      getOption,
    } as any);

    expect(
      getCellIndices(
        { api: { debug: { warn: mock() } } } as any,
        {
          id: 'cell-1',
        } as any
      )
    ).toEqual({ col: 2, row: 1 });
    expect(getOption).toHaveBeenCalledWith('cellIndices', 'cell-1');
    expect(computeSpy).not.toHaveBeenCalled();
  });

  it('warns and falls back when neither cache nor recompute returns indices', () => {
    const warn = mock();

    spyOn(platejs, 'getEditorPlugin').mockReturnValue({
      getOption: mock(() => {}),
    } as any);
    spyOn(computeCellIndicesModule, 'computeCellIndices').mockReturnValue(
      undefined as any
    );

    expect(
      getCellIndices(
        { api: { debug: { warn } } } as any,
        {
          id: 'cell-2',
        } as any
      )
    ).toEqual({ col: 0, row: 0 });
    expect(warn).toHaveBeenCalledWith(
      'No cell indices found for element. Make sure all table cells have an id.',
      'TABLE_CELL_INDICES'
    );
  });
});
