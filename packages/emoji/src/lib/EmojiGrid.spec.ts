import { AGridSection, Grid } from './EmojiGrid';

class TestSection extends AGridSection<{ id: string }, string> {
  protected createRootRef() {
    this._root = { id: `root-${this._id}` };
  }
}

describe('emoji grid', () => {
  it('creates row groups from the configured width and row offset', () => {
    const section = new TestSection('smileys', 2)
      .setIndexRowStart(5)
      .addElements(['a', 'b', 'c']);

    expect(section.id).toBe('smileys');
    expect(section.root).toEqual({ id: 'root-smileys' });
    expect(section.rowsNum).toBe(2);
    expect(section.getRows()).toEqual([
      { elements: ['a', 'b'], id: 5 },
      { elements: ['c'], id: 6 },
    ]);
  });

  it('rebuilds rows instead of appending when elements are updated', () => {
    const section = new TestSection('people', 3).addElements([
      'a',
      'b',
      'c',
      'd',
    ]);

    section.updateElements(['x', 'y']);

    expect(section.rowsNum).toBe(1);
    expect(section.getRows()).toEqual([{ elements: ['x', 'y'], id: 0 }]);
  });

  it('adds sections with stable ordering and row offsets', () => {
    const grid = new Grid<{ id: string }, string>();
    const first = new TestSection('first', 2);
    const second = new TestSection('second', 2);

    grid
      .addSection('first', first, {
        first: ['a', 'b', 'c'],
        second: [],
      })
      .addSection('second', second, {
        first: [],
        second: ['x'],
      });

    expect(grid.size).toBe(2);
    expect(grid.indexOf('first')).toBe(0);
    expect(grid.indexOf('second')).toBe(1);
    expect(grid.section('first')?.getRows()).toEqual([
      { elements: ['a', 'b'], id: 1 },
      { elements: ['c'], id: 2 },
    ]);
    expect(grid.section('second')?.getRows()).toEqual([
      { elements: ['x'], id: 3 },
    ]);
    expect(grid.sections()).toEqual([first, second]);
  });

  it('updates existing sections and ignores missing ids', () => {
    const grid = new Grid<{ id: string }, string>();
    const section = new TestSection('first', 2);

    grid.addSection('first', section, { first: ['a', 'b'] });
    grid.updateSection('first', ['z']);
    grid.updateSection('missing', ['noop']);

    expect(grid.section('first')?.getRows()).toEqual([
      { elements: ['z'], id: 1 },
    ]);
    expect(grid.size).toBe(1);
  });
});
