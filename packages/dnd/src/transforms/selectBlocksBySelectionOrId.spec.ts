import * as getBlocksWithIdModule from '../queries/getBlocksWithId';
import * as selectBlockByIdModule from './selectBlockById';
import { selectBlocksBySelectionOrId } from './selectBlocksBySelectionOrId';

describe('selectBlocksBySelectionOrId', () => {
  it('returns early when the editor has no selection', () => {
    const editor = {
      api: {
        dom: { focus: mock() },
        nodesRange: mock(),
      },
      selection: null,
      update: mock(),
    } as any;

    selectBlocksBySelectionOrId(editor, 'block-1');

    expect(editor.api.nodesRange).not.toHaveBeenCalled();
    expect(editor.update).not.toHaveBeenCalled();
    expect(editor.api.dom.focus).not.toHaveBeenCalled();
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
    const setSelection = mock();
    const tx = { selection: { set: setSelection } };
    const editor = {
      api: {
        dom: { focus: mock() },
        nodesRange: mock(() => selectionRange),
      },
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      update: mock((fn) => fn(tx)),
    } as any;

    selectBlocksBySelectionOrId(editor, 'block-2');

    expect(getBlocksSpy).toHaveBeenCalledWith(editor, { at: editor.selection });
    expect(editor.api.nodesRange).toHaveBeenCalledWith(blockEntries);
    expect(setSelection).toHaveBeenCalledWith(selectionRange);
    expect(editor.api.dom.focus).toHaveBeenCalled();
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
        dom: { focus: mock() },
        nodesRange: mock(),
      },
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      update: mock(),
    } as any;

    selectBlocksBySelectionOrId(editor, 'block-2');

    expect(selectBlockByIdSpy).toHaveBeenCalledWith(editor, 'block-2');
    expect(editor.api.nodesRange).not.toHaveBeenCalled();
    expect(editor.update).not.toHaveBeenCalled();

    getBlocksSpy.mockRestore();
    selectBlockByIdSpy.mockRestore();
  });
});
