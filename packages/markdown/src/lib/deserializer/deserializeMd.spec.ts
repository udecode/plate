import { createTestEditor } from '../__tests__/createTestEditor';
import {
  deserializeMd,
  markdownToAstProcessor,
  markdownToSlateNodes,
} from './deserializeMd';

describe('deserializeMd', () => {
  it('falls back to the safe markdown path for incomplete mdx tails', () => {
    const editor = createTestEditor();
    const onError = mock();

    expect(deserializeMd(editor, '<u>', { onError: onError as any })).toEqual([
      {
        children: [{ text: '<u>' }],
        type: 'p',
      },
    ]);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('wraps top-level text results from custom rules in paragraphs', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(editor, 'plain', {
        rules: {
          p: {
            deserialize: () => ({ text: 'wrapped' }),
          },
        } as any,
      })
    ).toEqual([
      {
        children: [{ text: 'wrapped' }],
        type: 'p',
      },
    ]);
  });

  it('returns an empty result and calls onError when withoutMdx is true and parsing fails', () => {
    const editor = createTestEditor();
    const onError = mock();
    const brokenRemarkPlugin = (() => {
      throw new Error('boom');
    }) as any;

    expect(
      deserializeMd(editor, '**bold**', {
        onError: onError as any,
        remarkPlugins: [brokenRemarkPlugin],
        withoutMdx: true,
      })
    ).toEqual([]);
    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError as any).mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect((onError as any).mock.calls[0]?.[0].message).toBe('boom');
  });
});

describe('markdownToAstProcessor', () => {
  it('returns the parsed mdast root', () => {
    const editor = createTestEditor();
    const ast = markdownToAstProcessor(editor, '# Title');

    expect(ast.type).toBe('root');
    expect(ast.children[0]?.type).toBe('heading');
  });
});

describe('markdownToSlateNodes', () => {
  it('preserves explicit space tokens when memoization keeps them', () => {
    const editor = createTestEditor();

    expect(
      markdownToSlateNodes(editor, 'one\n\n\n\ntwo', {
        memoize: true,
        parser: { exclude: [], trim: false },
      })
    ).toEqual([
      {
        _memo: 'one',
        children: [{ text: 'one' }],
        type: 'p',
      },
      {
        _memo: '\n\n\n\n',
        children: [{ text: '' }],
        type: 'p',
      },
      {
        _memo: 'two',
        children: [{ text: 'two' }],
        type: 'p',
      },
    ]);
  });

  it('attaches raw block text to memoized output nodes', () => {
    const editor = createTestEditor();

    expect(
      markdownToSlateNodes(editor, 'one\n\n\ntwo', { memoize: true })
    ).toEqual([
      {
        _memo: 'one',
        children: [{ text: 'one' }],
        type: 'p',
      },
      {
        _memo: 'two',
        children: [{ text: 'two' }],
        type: 'p',
      },
    ]);
  });
});
