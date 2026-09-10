import type { NodeEntry, PliteDecoration } from '../../facade';
import { createEditor } from '../../lib/editor/withPlite';
import { defineBasePlugin } from '../../lib/plugin/defineBasePlugin';
import { getPlateDecorationSources } from './getPlateDecorationSources';

const entry: NodeEntry = [{ text: 'paint' }, [0, 0]];
const decoration: PliteDecoration = {
  attributes: {
    'data-feature': '',
    'data-priority': 'semantic',
    className: 'semantic',
    style: { color: 'blue', opacity: 0.5 },
  },
  key: 'paint',
  range: {
    anchor: { offset: 0, path: [0, 0] },
    focus: { offset: 5, path: [0, 0] },
  },
};
const rows = [decoration];

describe('Plate decoration presentation', () => {
  it('merges presentation while retaining semantic markers, order and ranges', () => {
    const plugin = defineBasePlugin('paint', {
      decorate: { read: () => [decoration, { ...decoration, key: 'second' }] },
    }).configure({
      decorate: {
        attributes: {
          'data-priority': 'presentation',
          className: 'paint',
          style: { color: 'red' },
        },
      },
    });
    const editor = createEditor({ plugins: [plugin] });
    const result = getPlateDecorationSources(editor)[0].read({ entry });

    expect(result.map((row) => row.key)).toEqual(['paint', 'second']);
    expect(result[0].range).toBe(decoration.range);
    expect(result[0].attributes).toEqual({
      'data-feature': '',
      'data-priority': 'presentation',
      className: 'semantic paint',
      style: { color: 'red', opacity: 0.5 },
    });
    expect(decoration.attributes.style!.color).toBe('blue');
  });

  it.each([undefined, null])(
    'retains source results with presentation %s',
    (attributes) => {
      const plugin = defineBasePlugin('paint', {
        decorate: { attributes, read: () => rows },
      });
      const editor = createEditor({ plugins: [plugin] });

      expect(getPlateDecorationSources(editor)[0].read({ entry })).toBe(rows);
    }
  );

  it('clears inherited presentation without clearing the reader', () => {
    const plugin = defineBasePlugin('paint', {
      decorate: { attributes: { className: 'paint' }, read: () => rows },
    }).configure({ decorate: { attributes: null } });
    const editor = createEditor({ plugins: [plugin] });

    expect(getPlateDecorationSources(editor)[0].read({ entry })).toBe(rows);
  });

  it('preserves terminal configuration, one observer and cleanup through author stages', () => {
    let observations = 0;
    let cleanups = 0;
    const plugin = defineBasePlugin('paint', {
      decorate: {
        observe: ({ refresh, store }) => {
          observations += 1;
          const unsubscribe = store.subscribe(() =>
            refresh({ nodeKeys: 'all' })
          );
          return () => {
            cleanups += 1;
            unsubscribe();
          };
        },
        read: () => rows,
      },
      initialState: { color: 'red' },
    })
      .extend({
        decorate: { attributes: { className: 'stage' } },
      })
      .configure({
        decorate: {
          attributes: ({ store }) => ({ style: { color: store.get('color') } }),
        },
      });
    const editor = createEditor({ plugins: [plugin] });
    const source = getPlateDecorationSources(editor)[0];
    const refresh = mock();
    const cleanup = source.observe!({ refresh });

    expect(source.read({ entry })[0].attributes.style!.color).toBe('red');
    editor.plugin(plugin).store.set({ color: 'green' });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(source.read({ entry })[0].attributes.style!.color).toBe('green');
    expect(source.read({ entry })[0].attributes.className).toBe('semantic');
    cleanup();
    expect(observations).toBe(1);
    expect(cleanups).toBe(1);
  });

  it('uses the supplied editor view for both reading and presentation', () => {
    const seen: object[] = [];
    const plugin = defineBasePlugin('paint', {
      decorate: {
        attributes: ({ decoration: current, editor, entry: currentEntry }) => {
          seen.push(editor);
          expect(current).toBe(decoration);
          expect(currentEntry).toBe(entry);
          return { 'data-editor': editor.id };
        },
        read: ({ editor }) => {
          seen.push(editor);
          return rows;
        },
      },
    });
    const first = createEditor({ id: 'first', plugins: [plugin] });
    const second = createEditor({ id: 'second', plugins: [plugin] });
    const source = getPlateDecorationSources(first)[0];

    expect(
      source.read({ editor: second, entry })[0].attributes['data-editor']
    ).toBe('second');
    expect(seen).toEqual([second, second]);
    expect(source.read({ entry })[0].attributes['data-editor']).toBe('first');
  });

  it('retains empty results without evaluating presentation', () => {
    const empty: readonly PliteDecoration[] = [];
    const attributes = mock(() => ({ className: 'paint' }));
    const plugin = defineBasePlugin('paint', {
      decorate: { attributes, read: () => empty },
    });
    const editor = createEditor({ plugins: [plugin] });

    expect(getPlateDecorationSources(editor)[0].read({ entry })).toBe(empty);
    expect(attributes).not.toHaveBeenCalled();
  });

  it('propagates presentation errors through source reads', () => {
    const error = new Error('paint failed');
    const plugin = defineBasePlugin('paint', {
      decorate: {
        attributes: () => {
          throw error;
        },
        read: () => rows,
      },
    });
    const editor = createEditor({ plugins: [plugin] });

    expect(() => getPlateDecorationSources(editor)[0].read({ entry })).toThrow(
      error
    );
  });
});
