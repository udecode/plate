import React from 'react';

mock.module('../../../lib', () => {
  class GridSection {
    id: string;
    perLine: number;
    root: React.RefObject<HTMLDivElement | null>;

    constructor(id: string, perLine: number) {
      this.id = id;
      this.perLine = perLine;
      this.root = React.createRef();
    }
  }

  class Grid {
    map = new Map<string, any>();

    addSection(id: string, section: any, elements: any) {
      this.map.set(id, { elements: elements[id] ?? [], section });
    }

    indexOf(id: string) {
      return Array.from(this.map.keys()).indexOf(id);
    }

    section(id: string) {
      return this.map.get(id)?.section;
    }

    sections() {
      return Array.from(this.map.values()).map((value) => value.section);
    }

    updateSection(id: string, elements: any[]) {
      const value = this.map.get(id);
      if (value) value.elements = elements;
    }
  }

  class EmojiInlineLibrary {}

  return {
    AGridSection: GridSection,
    DEFAULT_EMOJI_LIBRARY: {
      categories: [{ emojis: ['wave'], id: 'people' }],
    },
    EmojiCategory: { Frequent: 'frequent' },
    EmojiInlineLibrary,
    Grid,
    defaultCategories: ['people'],
  };
});

describe('emoji floating library', () => {
  afterAll(() => {
    mock.restore();
  });

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
