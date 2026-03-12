import { createEditor } from '../create-editor';
import { NodeApi } from './node';

const createNestedEditor = () =>
  createEditor({
    children: [
      { type: 'p', children: [{ text: 'one' }, { text: 'two' }] },
      {
        type: 'blockquote',
        children: [{ type: 'p', children: [{ text: 'three' }] }],
      },
    ] as any,
  });

const mapEntries = (entries: Iterable<[any, number[]]>) =>
  Array.from(entries).map(([node, path]) => [NodeApi.string(node), path]);

describe('NodeApi', () => {
  it('gets nodes and safe wrappers by path', () => {
    const editor = createNestedEditor();
    const child = NodeApi.child(editor as any, 0) as any;

    expect(NodeApi.get(editor, [0])).toEqual({
      children: [{ text: 'one' }, { text: 'two' }],
      type: 'p',
    });
    expect(NodeApi.getIf(editor, [9])).toBeUndefined();
    expect(child).toEqual({
      children: [{ text: 'one' }, { text: 'two' }],
      type: 'p',
    });
    expect(NodeApi.ancestor(editor, [1, 0])).toEqual({
      children: [{ text: 'three' }],
      type: 'p',
    });
    expect(NodeApi.common(editor, [0, 0], [0, 1])).toEqual([
      { children: [{ text: 'one' }, { text: 'two' }], type: 'p' },
      [0],
    ]);
    expect(NodeApi.descendant(editor, [1, 0])).toEqual({
      children: [{ text: 'three' }],
      type: 'p',
    });
    expect(NodeApi.parent(editor, [1, 0, 0])).toEqual({
      children: [{ text: 'three' }],
      type: 'p',
    });
    expect(NodeApi.first(editor, [0])).toEqual([{ text: 'one' }, [0, 0]]);
    expect(NodeApi.last(editor, [0])).toEqual([{ text: 'two' }, [0, 1]]);
    expect(NodeApi.leaf(editor, [1, 0, 0])).toEqual({ text: 'three' });
  });

  it('iterates children, descendants, elements, levels, nodes, and texts', () => {
    const editor = createNestedEditor();

    expect(mapEntries(NodeApi.children(editor, [0]))).toEqual([
      ['one', [0, 0]],
      ['two', [0, 1]],
    ]);
    expect(mapEntries(NodeApi.descendants(editor))).toEqual([
      ['onetwo', [0]],
      ['one', [0, 0]],
      ['two', [0, 1]],
      ['three', [1]],
      ['three', [1, 0]],
      ['three', [1, 0, 0]],
    ]);
    expect(mapEntries(NodeApi.elements(editor))).toEqual([
      ['onetwo', [0]],
      ['three', [1]],
      ['three', [1, 0]],
    ]);
    expect(mapEntries(NodeApi.levels(editor, [1, 0, 0]))).toEqual([
      ['onetwothree', []],
      ['three', [1]],
      ['three', [1, 0]],
      ['three', [1, 0, 0]],
    ]);
    expect(mapEntries(NodeApi.nodes(editor))).toEqual([
      ['onetwothree', []],
      ['onetwo', [0]],
      ['one', [0, 0]],
      ['two', [0, 1]],
      ['three', [1]],
      ['three', [1, 0]],
      ['three', [1, 0, 0]],
    ]);
    expect(mapEntries(NodeApi.texts(editor, { reverse: true }))).toEqual([
      ['three', [1, 0, 0]],
      ['two', [0, 1]],
      ['one', [0, 0]],
    ]);
  });

  it('gets first and last children and first text', () => {
    const editor = createNestedEditor();

    expect(NodeApi.firstChild(editor, [0])).toEqual([{ text: 'one' }, [0, 0]]);
    expect(NodeApi.lastChild(editor, [0])).toEqual([{ text: 'two' }, [0, 1]]);
    expect(NodeApi.firstText(editor)).toEqual([{ text: 'one' }, [0, 0]]);
  });

  it('computes fragments, strings, and last-child checks', () => {
    const editor = createNestedEditor();

    expect(
      NodeApi.fragment(editor, {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [1, 0, 0], offset: 2 },
      })
    ).toEqual([
      { type: 'p', children: [{ text: 'ne' }, { text: 'two' }] },
      {
        type: 'blockquote',
        children: [{ type: 'p', children: [{ text: 'th' }] }],
      },
    ]);
    expect(
      NodeApi.fragment(editor, {
        anchor: { path: [9], offset: 0 },
        focus: { path: [9], offset: 0 },
      })
    ).toEqual([]);
    expect(NodeApi.string(editor)).toBe('onetwothree');
    expect(NodeApi.isLastChild(editor, [0, 1])).toBe(true);
    expect(NodeApi.isLastChild(editor, [0, 0])).toBe(false);
    expect(NodeApi.isLastChild(editor, [])).toBe(false);
  });

  it('checks node predicates and single-child nesting', () => {
    const singleChildBlockquote = {
      type: 'blockquote',
      children: [{ type: 'p', children: [{ text: 'one' }] }],
    } as any;

    expect(NodeApi.hasSingleChild(singleChildBlockquote)).toBe(true);
    expect(
      NodeApi.hasSingleChild({
        type: 'p',
        children: [{ text: 'one' }, { text: 'two' }],
      } as any)
    ).toBe(false);
    expect(NodeApi.hasSingleChild({ text: 'one' } as any)).toBe(true);
    expect(NodeApi.isNode({ children: [] })).toBe(true);
    expect(NodeApi.isNode({ text: '' })).toBe(true);
    expect(NodeApi.isNode({})).toBe(false);
    expect(NodeApi.isNodeList([])).toBe(true);
    expect(NodeApi.isNodeList([{ children: [] }])).toBe(true);
    expect(NodeApi.isNodeList([{ text: '' }])).toBe(true);
    expect(NodeApi.isNodeList([{ children: [] }, 'bad'] as any)).toBe(false);
    expect(NodeApi.isDescendant({ children: [] })).toBe(true);
    expect(NodeApi.isDescendant({ text: '' })).toBe(true);
    expect(NodeApi.isDescendant({ selection: null } as any)).toBe(false);
  });

  it('returns undefined for invalid safe wrappers', () => {
    const editor = createNestedEditor();

    expect(NodeApi.ancestor(editor, [9])).toBeUndefined();
    expect(NodeApi.common(editor, [0], null as any)).toBeUndefined();
    expect(NodeApi.descendant(editor, [9])).toBeUndefined();
    expect(NodeApi.first(editor, [9])).toBeUndefined();
    expect(NodeApi.get(editor, [9])).toBeUndefined();
    expect(NodeApi.last(editor, [9])).toBeUndefined();
    expect(NodeApi.leaf(editor, [9])).toBeUndefined();
    expect(NodeApi.parent(editor, null as any)).toBeUndefined();
  });
});
