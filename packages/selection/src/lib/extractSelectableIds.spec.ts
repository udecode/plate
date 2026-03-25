import {
  extractSelectableId,
  extractSelectableIds,
} from './extractSelectableIds';

describe('extractSelectableIds', () => {
  it('collects only truthy block ids from DOM elements', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const third = document.createElement('div');

    first.dataset.blockId = 'a';
    third.dataset.blockId = 'c';

    expect(extractSelectableIds([first, second, third])).toEqual(['a', 'c']);
  });

  it('returns the block id for a single element', () => {
    const element = document.createElement('div');

    element.dataset.blockId = 'node-1';

    expect(extractSelectableId(element)).toBe('node-1');
  });
});
