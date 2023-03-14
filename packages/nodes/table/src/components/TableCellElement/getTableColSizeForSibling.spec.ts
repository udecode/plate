import { getTableColSizeForSibling } from './getTableColSizeForSibling';

describe('getTableColSizeForSibling', () => {
  it('preserves the total size of both columns', () => {
    const ownInitialSize = 10;
    const siblingInitialSize = 20;
    const ownSize = 5;
    const siblingSize = getTableColSizeForSibling(
      ownInitialSize,
      siblingInitialSize,
      ownSize
    );
    expect(ownSize + siblingSize).toBe(ownInitialSize + siblingInitialSize);
  });
});
