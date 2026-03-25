import * as getBlocksWithIdModule from '../queries/getBlocksWithId';
import * as selectBlockByIdModule from './selectBlockById';
import { selectBlocksBySelectionOrId } from './selectBlocksBySelectionOrId';

describe('selectBlocksBySelectionOrId', () => {
  it('returns early when the editor has no selection', () => {
    const editor = {
      api: {
        nodesRange: mock(),
      },
      selection: null,
      tf: {
        focus: mock(),
        select: mock(),
      },
    } as any;

    selectBlocksBySelectionOrId(editor, 'block-1');

    expect(editor.api.nodesRange).not.toHaveBeenCalled();
    expect(editor.tf.select).not.toHaveBeenCalled();
    expect(editor.tf.focus).not.toHaveBeenCalled();
  });

  it('selects the range of currently selected blocks when the target id is already selected', () => {
    const blockEntries = [
      [{ id: 'block-1' }, [0]],
      [{ id: 'block-2' }, [1]],
    ] as any;
    const selectionRange = { anchor: { path: [0], offset: 0 } };
    const getBlocksSpy = spyOn(
      getBlocksWithIdModule,
      'getBlocksWithId'
    ).mockReturnValue(blockEntries);
    const selectBlockByIdSpy = spyOn(
      selectBlockByIdModule,
      'selectBlockById'
    ).mockImplementation(() => {});
    const editor = {
      api: {
        nodesRange: mock(() => selectionRange),
      },
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      tf: {
        focus: mock(),
        select: mock(),
      },
    } as any;

    selectBlocksBySelectionOrId(editor, 'block-2');

    expect(getBlocksSpy).toHaveBeenCalledWith(editor, { at: editor.selection });
    expect(editor.api.nodesRange).toHaveBeenCalledWith(blockEntries);
    expect(editor.tf.select).toHaveBeenCalledWith(selectionRange);
    expect(editor.tf.focus).toHaveBeenCalled();
    expect(selectBlockByIdSpy).not.toHaveBeenCalled();

    getBlocksSpy.mockRestore();
    selectBlockByIdSpy.mockRestore();
  });

  it('falls back to selecting by id when the target block is outside the current selection', () => {
    const getBlocksSpy = spyOn(
      getBlocksWithIdModule,
      'getBlocksWithId'
    ).mockReturnValue([[{ id: 'block-1' }, [0]]] as any);
    const selectBlockByIdSpy = spyOn(
      selectBlockByIdModule,
      'selectBlockById'
    ).mockImplementation(() => {});
    const editor = {
      api: {
        nodesRange: mock(),
      },
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      tf: {
        focus: mock(),
        select: mock(),
      },
    } as any;

    selectBlocksBySelectionOrId(editor, 'block-2');

    expect(selectBlockByIdSpy).toHaveBeenCalledWith(editor, 'block-2');
    expect(editor.api.nodesRange).not.toHaveBeenCalled();
    expect(editor.tf.select).not.toHaveBeenCalled();

    getBlocksSpy.mockRestore();
    selectBlockByIdSpy.mockRestore();
  });
});
