import { createEditor } from '../create-editor';
import {
  combineMatchOptions,
  combineTransformMatchOptions,
  getMatch,
  getQueryOptions,
  match,
} from './match';

describe('match', () => {
  describe('when predicate is an object', () => {
    it('match object properties', () => {
      const obj: any = { a: 'a', b: 'b' };
      expect(match(obj, [], { a: 'a' })).toBe(true);
      expect(match(obj, [], { a: ['a', 'b'] })).toBe(true);
      expect(match(obj, [], { a: ['c', 'b'] })).toBe(false);
      expect(match(obj, [], { a: 'a', b: 'b' })).toBe(true);
      expect(match(obj, [], { a: 'a', b: 'c' })).toBe(false);
      expect(match(obj, [], { a: 'a', b: 'b', c: 'c' } as any)).toBe(false);
      expect(match(obj, [], { c: 'c' } as any)).toBe(false);
    });

    it('match nodes by type', () => {
      const paragraph = { children: [], type: 'paragraph' };
      const heading = { children: [], type: 'heading' };

      expect(match(paragraph, [], { type: 'paragraph' })).toBe(true);
      expect(match(heading, [], { type: 'paragraph' })).toBe(false);
      expect(match(paragraph, [], { type: ['paragraph', 'heading'] })).toBe(
        true
      );
      expect(match(heading, [], { type: ['paragraph', 'heading'] })).toBe(true);
    });
  });

  describe('when predicate is a function', () => {
    it('use function result', () => {
      const obj: any = { a: 'a', b: 'b' };
      expect(match(obj, [], () => true)).toBe(true);
      expect(match(obj, [], () => false)).toBe(false);
    });
  });
});

describe('getMatch', () => {
  const editor = createEditor();

  describe('when no conditions are provided', () => {
    it('returns undefined', () => {
      expect(getMatch(editor, {})).toBeUndefined();
      expect(getMatch(editor)).toBeUndefined();
    });
  });

  describe('when text option is provided', () => {
    it('match text nodes', () => {
      const matchFn = getMatch(editor, { text: true });
      expect(matchFn!({ text: 'test' }, [])).toBe(true);
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(false);
    });

    it('match non-text nodes when false', () => {
      const matchFn = getMatch(editor, { text: false });
      expect(matchFn!({ text: 'test' }, [])).toBe(false);
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(true);
    });
  });

  describe('when empty option is provided', () => {
    it('match empty nodes', () => {
      const matchFn = getMatch(editor, { empty: true });
      expect(matchFn!({ text: '' }, [])).toBe(true);
      expect(matchFn!({ text: 'test' }, [])).toBe(false);
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(true);
      expect(matchFn!({ children: [{ text: 'test' }], type: 'p' }, [])).toBe(
        false
      );
    });

    it('match non-empty nodes when false', () => {
      const matchFn = getMatch(editor, { empty: false });
      expect(matchFn!({ text: '' }, [])).toBe(false);
      expect(matchFn!({ text: 'test' }, [])).toBe(true);
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(false);
      expect(matchFn!({ children: [{ text: 'test' }], type: 'p' }, [])).toBe(
        true
      );
    });
  });

  describe('when block option is provided', () => {
    it('match block nodes', () => {
      const matchFn = getMatch(editor, { block: true });
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(true);
      expect(matchFn!({ text: 'test' }, [])).toBe(false);
    });
  });

  describe('when id option is provided', () => {
    it('match nodes with id', () => {
      const matchFn = getMatch(editor, { id: true });
      expect(matchFn!({ id: '123', children: [], type: 'p' }, [])).toBe(true);
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(false);
    });

    it('match specific id', () => {
      const matchFn = getMatch(editor, { id: '123' });
      expect(matchFn!({ id: '123', children: [], type: 'p' }, [])).toBe(true);
      expect(matchFn!({ id: '456', children: [], type: 'p' }, [])).toBe(false);
    });
  });

  describe('when match option is provided', () => {
    it('handle object predicate', () => {
      const matchFn = getMatch(editor, { match: { type: 'paragraph' } });
      expect(matchFn!({ children: [], type: 'paragraph' }, [])).toBe(true);
      expect(matchFn!({ children: [], type: 'heading' }, [])).toBe(false);
    });

    it('handle function predicate', () => {
      const matchFn = getMatch(editor, {
        match: (n: any) => n.type === 'paragraph',
      });
      expect(matchFn!({ children: [], type: 'paragraph' }, [])).toBe(true);
      expect(matchFn!({ children: [], type: 'heading' }, [])).toBe(false);
    });
  });

  describe('when multiple options are provided', () => {
    it('combine all conditions', () => {
      const matchFn = getMatch(editor, {
        empty: true,
        match: { type: 'paragraph' },
        text: false,
      });

      expect(matchFn!({ children: [], type: 'paragraph' }, [])).toBe(true);
      expect(
        matchFn!({ children: [{ text: 'test' }], type: 'paragraph' }, [])
      ).toBe(false);
      expect(matchFn!({ text: '' }, [])).toBe(false);
      expect(matchFn!({ children: [], type: 'heading' }, [])).toBe(false);
    });
  });
});

describe('getQueryOptions', () => {
  it('normalizes location and predicate options together', () => {
    const editor = createEditor({
      children: [{ type: 'p', children: [{ text: 'word' }] }] as any,
      selection: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
    });

    const options = getQueryOptions(editor, {
      at: editor.children[0],
      match: { type: 'p' },
    });

    expect(options.at).toEqual([0]);
    expect(options.match(editor.children[0] as any, [0])).toBe(true);
  });
});

describe('combineMatchOptions', () => {
  it('requires both the base predicate and the option predicate to match', () => {
    const editor = createEditor();
    const combined = combineMatchOptions(
      editor,
      (node: any) => node.kind === 'allowed',
      { match: { type: 'p' } }
    );

    expect(
      combined({ children: [], kind: 'allowed', type: 'p' } as any, [])
    ).toBe(true);
    expect(
      combined({ children: [], kind: 'blocked', type: 'p' } as any, [])
    ).toBe(false);
    expect(
      combined({ children: [], kind: 'allowed', type: 'blockquote' } as any, [])
    ).toBe(false);
  });
});

describe('combineTransformMatchOptions', () => {
  it('defaults to the explicit path node when at is a path', () => {
    const editor = createEditor({
      children: [
        { type: 'p', children: [{ text: 'one' }] },
        { type: 'blockquote', children: [{ text: 'two' }] },
      ] as any,
    });

    const combined = combineTransformMatchOptions(editor, undefined, {
      at: [1],
    }) as any;

    expect(combined(editor.children[1] as any, [1])).toBe(true);
    expect(combined(editor.children[0] as any, [0])).toBe(false);
  });

  it('defaults to block elements when no match option is provided', () => {
    const editor = createEditor();
    const combined = combineTransformMatchOptions(editor) as any;

    expect(combined({ children: [], type: 'p' } as any, [0])).toBe(true);
    expect(combined({ text: 'word' } as any, [0, 0])).toBe(false);
  });

  it('uses the explicit match option instead of forcing the default block match', () => {
    const editor = createEditor();
    const combined = combineTransformMatchOptions(editor, undefined, {
      match: { text: 'word' },
    }) as any;

    expect(combined({ text: 'word' } as any, [0, 0])).toBe(true);
    expect(combined({ children: [], type: 'p' } as any, [0])).toBe(false);
  });
});
