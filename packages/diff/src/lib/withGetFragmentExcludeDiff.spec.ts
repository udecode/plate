import { withGetFragmentExcludeDiff } from './withGetFragmentExcludeDiff';

describe('withGetFragmentExcludeDiff', () => {
  it('returns a deep-cloned fragment without diff metadata', () => {
    const original = [
      {
        children: [
          {
            diff: { insert: true },
            diffOperation: 'insert',
            text: 'child',
          },
        ],
        diff: { remove: true },
        diffOperation: 'remove',
        type: 'p',
      },
    ] as any;

    const override = withGetFragmentExcludeDiff({
      api: {
        getFragment: () => original,
      },
    } as any);

    const fragment = override.api!.getFragment!();

    expect(fragment).toEqual([
      {
        children: [
          {
            diff: undefined,
            diffOperation: undefined,
            text: 'child',
          },
        ],
        diff: undefined,
        diffOperation: undefined,
        type: 'p',
      },
    ]);
    expect(original[0].diff).toEqual({ remove: true });
    expect(original[0].children[0].diffOperation).toBe('insert');
  });
});
