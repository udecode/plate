describe('emoji floating library', () => {
  it('builds floating grids, clamps missing indexes, and updates frequent emojis', async () => {
    const { EmojiFloatingLibrary } = await import(
      `./EmojiFloatingLibrary?test=${Math.random().toString(36).slice(2)}`
    );
    const { EmojiFloatingGridBuilder } = await import(
      `./EmojiFloatingGridBuilder?test=${Math.random().toString(36).slice(2)}`
    );
    const { EmojiFloatingGrid } = await import(
      `./EmojiFloatingGrid?test=${Math.random().toString(36).slice(2)}`
    );
    (EmojiFloatingLibrary as any).instance = undefined;

    const localStorage = {
      getList: () => ['wave'],
      update: mock(),
    };
    const settings = {
      categories: { value: ['people'] },
      perLine: { value: 8 },
      showFrequent: { value: true },
    };

    const grid = new EmojiFloatingGridBuilder(
      localStorage as any,
      ['people'] as any,
      { frequent: ['wave'], people: ['wave'] } as any,
      settings as any
    ).build();

    expect(grid.sections()).toHaveLength(2);

    const library = EmojiFloatingLibrary.getInstance(
      settings as any,
      localStorage as any
    );

    expect(library.getGrid()).toBeTruthy();
    expect(library.indexOf('missing' as any)).toBe(0);

    library.updateFrequentCategory('wave');

    expect(localStorage.update).toHaveBeenCalledWith('wave');
    expect(new EmojiFloatingGrid().createRootRef().current).toBeNull();
  });
});
