import { AGridSection } from './GridSection';

class TestSection extends AGridSection<{ id: string }, string> {
  protected createRootRef() {
    this._root = { id: `root-${String(this._id)}` };
  }
}

describe('AGridSection', () => {
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
});
