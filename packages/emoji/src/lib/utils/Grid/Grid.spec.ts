import { Grid } from './Grid';
import { AGridSection } from './GridSection';

class TestSection extends AGridSection<{ id: string }, string> {
  protected createRootRef() {
    this._root = { id: `root-${String(this._id)}` };
  }
}

describe('Grid', () => {
  it('adds sections with stable ordering and row offsets', () => {
    const grid = new Grid<{ id: string }, string>();
    const first = new TestSection('first', 2);
    const second = new TestSection('second', 2);

    grid
      .addSection('first', first, {
        first: ['a', 'b', 'c'],
        second: [],
      } as any)
      .addSection('second', second, {
        first: [],
        second: ['x'],
      } as any);

    expect(grid.size).toBe(2);
    expect(grid.indexOf('first')).toBe(0);
    expect(grid.indexOf('second')).toBe(1);
    expect(grid.section('first').getRows()).toEqual([
      { elements: ['a', 'b'], id: 1 },
      { elements: ['c'], id: 2 },
    ]);
    expect(grid.section('second').getRows()).toEqual([
      { elements: ['x'], id: 3 },
    ]);
    expect(grid.sections()).toEqual([first, second]);
  });

  it('updates existing sections and ignores missing ids', () => {
    const grid = new Grid<{ id: string }, string>();
    const section = new TestSection('first', 2);

    grid.addSection('first', section, { first: ['a', 'b'] } as any);
    grid.updateSection('first', ['z']);
    grid.updateSection('missing', ['noop']);

    expect(grid.section('first').getRows()).toEqual([
      { elements: ['z'], id: 1 },
    ]);
    expect(grid.size).toBe(1);
  });
});
