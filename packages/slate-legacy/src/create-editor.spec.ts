import { createEditor } from './create-editor';
import { withHistory } from './slate-history';

describe('createEditor', () => {
  it('syncs representative legacy methods to editor.api and editor.tf', () => {
    const editor = createEditor();

    expect(editor.getMarks).toBe(editor.api.marks);
    expect(editor.insertText).toBe(editor.tf.insertText);
    expect(editor.select).toBe(editor.tf.select);
    expect(editor.point).toBe(editor.api.point);
  });

  it('exposes history helpers after withHistory wraps the editor', () => {
    const editor = withHistory(createEditor());

    expect(editor.history).toEqual({ redos: [], undos: [] });
    expect(editor.undo).toBe(editor.tf.undo);
    expect(editor.redo).toBe(editor.tf.redo);
    expect(editor.apply).toBe(editor.tf.apply);
    expect(editor.api.isSaving()).toBeUndefined();
    expect(editor.api.isMerging()).toBeUndefined();
    expect(editor.api.isSplittingOnce()).toBeUndefined();
  });
});
