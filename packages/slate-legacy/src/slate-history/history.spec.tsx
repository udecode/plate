/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../create-editor';
import { HistoryApi } from './history';
import { withHistory } from './with-history';

jsxt;

const createHistoryEditor = (value?: any): any =>
  withHistory(
    value
      ? createEditor(value)
      : createEditor(
          (
            <editor>
              <hp>
                hello
                <cursor />
              </hp>
            </editor>
          ) as any
        )
  );

describe('HistoryApi', () => {
  it('delegates undo and redo to the editor methods', () => {
    const undo = mock();
    const redo = mock();

    HistoryApi.undo({ undo } as any);
    HistoryApi.redo({ redo } as any);

    expect(undo).toHaveBeenCalledTimes(1);
    expect(redo).toHaveBeenCalledTimes(1);
  });

  it('recognizes history before edits', () => {
    const editor = createHistoryEditor();

    expect(HistoryApi.isHistory(editor.history)).toBe(true);
  });

  it('recognizes history after an edit', () => {
    const editor = createHistoryEditor();

    editor.insertText('x');

    expect(HistoryApi.isHistory(editor.history)).toBe(true);
    expect(editor.history.undos).toHaveLength(1);
  });

  it('recognizes history after undo and redo', () => {
    const editor = createHistoryEditor();

    editor.insertText('x');
    editor.undo();
    editor.redo();

    expect(HistoryApi.isHistory(editor.history)).toBe(true);
  });

  it('setSplittingOnce stores the flag', () => {
    const editor = createHistoryEditor();

    editor.tf.setSplittingOnce(true);
    expect(editor.api.isSplittingOnce()).toBe(true);

    editor.tf.setSplittingOnce(undefined);
    expect(editor.api.isSplittingOnce()).toBeUndefined();
  });

  it('withMerging enables merging inside the callback and restores it', () => {
    const editor = createHistoryEditor();

    expect(editor.api.isMerging()).toBeUndefined();

    editor.tf.withMerging(() => {
      expect(editor.api.isMerging()).toBe(true);
    });

    expect(editor.api.isMerging()).toBeUndefined();
  });

  it('withNewBatch marks the first operation as a fresh batch', () => {
    const editor = createHistoryEditor();

    editor.tf.withNewBatch(() => {
      expect(editor.api.isMerging()).toBe(true);
      expect(editor.api.isSplittingOnce()).toBe(true);
    });

    expect(editor.api.isMerging()).toBeUndefined();
    expect(editor.api.isSplittingOnce()).toBeUndefined();
  });

  it('withoutMerging forces non-merge behavior temporarily', () => {
    const editor = createHistoryEditor();

    editor.tf.withMerging(() => {
      editor.tf.withoutMerging(() => {
        expect(editor.api.isMerging()).toBe(false);
      });

      expect(editor.api.isMerging()).toBe(true);
    });

    expect(editor.api.isMerging()).toBeUndefined();
  });

  it('withoutSaving forces non-saving behavior temporarily', () => {
    const editor = createHistoryEditor();

    expect(editor.api.isSaving()).toBeUndefined();

    editor.tf.withoutSaving(() => {
      expect(editor.api.isSaving()).toBe(false);
    });

    expect(editor.api.isSaving()).toBeUndefined();
  });
});
