import { createEditor } from '../create-editor';
import { getMatch, match } from './match';

describe('match', () => {
  describe('when predicate is an object', () => {
    it('should match object properties', () => {
      const obj: any = { a: 'a', b: 'b' };
      expect(match(obj, [], { a: 'a' })).toBe(true);
      expect(match(obj, [], { a: ['a', 'b'] })).toBe(true);
      expect(match(obj, [], { a: ['c', 'b'] })).toBe(false);
      expect(match(obj, [], { a: 'a', b: 'b' })).toBe(true);
      expect(match(obj, [], { a: 'a', b: 'c' })).toBe(false);
      expect(match(obj, [], { a: 'a', b: 'b', c: 'c' } as any)).toBe(false);
      expect(match(obj, [], { c: 'c' } as any)).toBe(false);
    });

    it('should match nodes by type', () => {
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
    it('should use function result', () => {
      const obj: any = { a: 'a', b: 'b' };
      expect(match(obj, [], () => true)).toBe(true);
      expect(match(obj, [], () => false)).toBe(false);
    });
  });
});

describe('getMatch', () => {
  const editor = createEditor();

  describe('when no conditions are provided', () => {
    it('should return undefined', () => {
      expect(getMatch(editor, {})).toBeUndefined();
      expect(getMatch(editor)).toBeUndefined();
    });
  });

  describe('when text option is provided', () => {
    it('should match text nodes', () => {
      const matchFn = getMatch(editor, { text: true });
      expect(matchFn!({ text: 'test' }, [])).toBe(true);
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(false);
    });

    it('should match non-text nodes when false', () => {
      const matchFn = getMatch(editor, { text: false });
      expect(matchFn!({ text: 'test' }, [])).toBe(false);
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(true);
    });
  });

  describe('when empty option is provided', () => {
    it('should match empty nodes', () => {
      const matchFn = getMatch(editor, { empty: true });
      expect(matchFn!({ text: '' }, [])).toBe(true);
      expect(matchFn!({ text: 'test' }, [])).toBe(false);
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(true);
      expect(matchFn!({ children: [{ text: 'test' }], type: 'p' }, [])).toBe(
        false
      );
    });

    it('should match non-empty nodes when false', () => {
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
    it('should match block nodes', () => {
      const matchFn = getMatch(editor, { block: true });
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(true);
      expect(matchFn!({ text: 'test' }, [])).toBe(false);
    });
  });

  describe('when id option is provided', () => {
    it('should match nodes with id', () => {
      const matchFn = getMatch(editor, { id: true });
      expect(matchFn!({ id: '123', children: [], type: 'p' }, [])).toBe(true);
      expect(matchFn!({ children: [], type: 'p' }, [])).toBe(false);
    });

    it('should match specific id', () => {
      const matchFn = getMatch(editor, { id: '123' });
      expect(matchFn!({ id: '123', children: [], type: 'p' }, [])).toBe(true);
      expect(matchFn!({ id: '456', children: [], type: 'p' }, [])).toBe(false);
    });
  });

  describe('when match option is provided', () => {
    it('should handle object predicate', () => {
      const matchFn = getMatch(editor, { match: { type: 'paragraph' } });
      expect(matchFn!({ children: [], type: 'paragraph' }, [])).toBe(true);
      expect(matchFn!({ children: [], type: 'heading' }, [])).toBe(false);
    });

    it('should handle function predicate', () => {
      const matchFn = getMatch(editor, {
        match: (n: any) => n.type === 'paragraph',
      });
      expect(matchFn!({ children: [], type: 'paragraph' }, [])).toBe(true);
      expect(matchFn!({ children: [], type: 'heading' }, [])).toBe(false);
    });
  });

  describe('when multiple options are provided', () => {
    it('should combine all conditions', () => {
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
