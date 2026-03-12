import { createEditor } from '../../create-editor';

describe('nodes', () => {
  it('skips non-selectable nodes and their descendants when requested', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'skip', children: [{ text: 'two' }] },
        { type: 'p', children: [{ text: 'three' }] },
      ] as any,
    }) as any;

    editor.api.isSelectable = (node: any) => node.type !== 'skip';

    const entries = Array.from(
      editor.api.nodes({
        at: [],
        ignoreNonSelectable: true,
        match: (node: any) =>
          node.type === 'p' ||
          node.type === 'skip' ||
          typeof node.text === 'string',
      })
    );

    expect(entries).toEqual([
      [{ type: 'p', children: [{ text: 'one' }] }, [0]],
      [{ text: 'one' }, [0, 0]],
      [{ type: 'p', children: [{ text: 'three' }] }, [2]],
      [{ text: 'three' }, [2, 0]],
    ]);
  });

  it('returns lowest universal matches when every branch satisfies the predicate', () => {
    const editor = createEditor({
      children: [
        { a: true, children: [{ text: 'one' }], type: 'tag' },
        { a: true, children: [{ text: 'two' }], type: 'tag' },
      ] as any,
    });

    expect(
      Array.from(
        editor.api.nodes({
          at: [],
          match: (node: any) => node.a === true,
          mode: 'lowest',
          universal: true,
        })
      )
    ).toEqual([
      [{ a: true, children: [{ text: 'one' }], type: 'tag' }, [0]],
      [{ a: true, children: [{ text: 'two' }], type: 'tag' }, [1]],
    ]);
  });

  it('returns no universal matches when any branch lacks a match', () => {
    const editor = createEditor({
      children: [
        { a: true, children: [{ text: 'one' }], type: 'tag' },
        { children: [{ text: 'two' }], type: 'p' },
      ] as any,
    });

    expect(
      Array.from(
        editor.api.nodes({
          at: [],
          match: (node: any) => node.a === true,
          mode: 'lowest',
          universal: true,
        })
      )
    ).toEqual([]);
  });
});
