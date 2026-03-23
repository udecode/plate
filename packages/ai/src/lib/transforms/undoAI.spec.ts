import { getTransientSuggestionKey } from '@platejs/suggestion';

import { undoAI } from './undoAI';

describe('undoAI', () => {
  it('does nothing when the latest undo batch is not tagged as ai', () => {
    const editor = {
      api: { some: mock(() => true) },
      history: { redos: { pop: mock(() => {}) }, undos: [{}] },
      undo: mock(() => {}),
    } as any;

    undoAI(editor);

    expect(editor.undo).not.toHaveBeenCalled();
    expect(editor.history.redos.pop).not.toHaveBeenCalled();
  });

  it('does nothing when there is no ai content left in the editor', () => {
    const editor = {
      api: { some: mock(() => false) },
      history: { redos: { pop: mock(() => {}) }, undos: [{ ai: true }] },
      undo: mock(() => {}),
    } as any;

    undoAI(editor);

    expect(editor.api.some).toHaveBeenCalledTimes(2);
    expect(editor.undo).not.toHaveBeenCalled();
    expect(editor.history.redos.pop).not.toHaveBeenCalled();
  });

  it('undoes the last ai batch when transient ai suggestions still exist', () => {
    const some = mock(
      ({ match }: { match: (node: Record<string, boolean>) => boolean }) =>
        match({ [getTransientSuggestionKey()]: true })
    );
    const editor = {
      api: { some },
      history: { redos: { pop: mock(() => {}) }, undos: [{ ai: true }] },
      undo: mock(() => {}),
    } as any;

    undoAI(editor);

    expect(some).toHaveBeenCalledTimes(2);
    expect(editor.undo).toHaveBeenCalledTimes(1);
    expect(editor.history.redos.pop).toHaveBeenCalledTimes(1);
  });
});
