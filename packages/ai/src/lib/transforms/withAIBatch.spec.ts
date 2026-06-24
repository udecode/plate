import { withAIBatch } from './withAIBatch';

describe('withAIBatch', () => {
  it('uses withMerging by default and tags the last undo batch', () => {
    const batch = {};
    let called = false;
    const fn = () => {
      called = true;
    };
    const withMerging = mock((cb: () => void) => cb());
    const withNewBatch = mock(() => {});
    const editor = {
      api: {
        history: { withMerging, withNewBatch },
      },
      history: { undos: [batch] },
    } as any;

    withAIBatch(editor, fn);

    expect(withMerging).toHaveBeenCalledTimes(1);
    expect(withNewBatch).not.toHaveBeenCalled();
    expect(called).toBe(true);
    expect(batch).toMatchObject({ ai: true });
  });

  it('uses withNewBatch when split is true', () => {
    const batch = {};
    let called = false;
    const fn = () => {
      called = true;
    };
    const withMerging = mock(() => {});
    const withNewBatch = mock((cb: () => void) => cb());
    const editor = {
      api: {
        history: { withMerging, withNewBatch },
      },
      history: { undos: [batch] },
    } as any;

    withAIBatch(editor, fn, { split: true });

    expect(withNewBatch).toHaveBeenCalledTimes(1);
    expect(withMerging).not.toHaveBeenCalled();
    expect(called).toBe(true);
    expect(batch).toMatchObject({ ai: true });
  });

  it('is a safe no-op when no undo batch exists yet', () => {
    let called = false;
    const fn = () => {
      called = true;
    };
    const withMerging = mock((cb: () => void) => cb());
    const editor = {
      api: {
        history: { withMerging, withNewBatch: mock(() => {}) },
      },
      history: { undos: [] },
    } as any;

    expect(() => withAIBatch(editor, fn)).not.toThrow();
    expect(withMerging).toHaveBeenCalledTimes(1);
    expect(called).toBe(true);
    expect(editor.history.undos).toEqual([]);
  });
});
