import { describe, expect, it } from 'bun:test';

import {
  appendMarkdownStreamSource,
  clearMarkdownStreamSession,
  getMarkdownStreamCurrentPath,
  getMarkdownStreamMdxName,
  getMarkdownStreamRuntimeState,
  getMarkdownStreamSource,
  setMarkdownStreamCurrentPath,
  setMarkdownStreamMdxName,
  setMarkdownStreamRuntimeState,
} from './markdownStreamSession';

describe('markdownStreamSession', () => {
  it('accumulates and clears insert streaming runtime state', () => {
    const editor = {} as any;

    expect(getMarkdownStreamSource(editor)).toBe('');
    expect(getMarkdownStreamCurrentPath(editor)).toBeNull();
    expect(getMarkdownStreamMdxName(editor)).toBeNull();
    expect(getMarkdownStreamRuntimeState(editor)).toBeUndefined();

    expect(appendMarkdownStreamSource(editor, 'hello')).toBe('hello');
    expect(appendMarkdownStreamSource(editor, ' world')).toBe('hello world');

    setMarkdownStreamCurrentPath(editor, [2]);
    setMarkdownStreamMdxName(editor, 'Callout');
    setMarkdownStreamRuntimeState(editor, {
      replayStartOffset: 4,
      source: 'hello world',
      stableBlockCount: 1,
      startPath: [0],
    });

    expect(getMarkdownStreamSource(editor)).toBe('hello world');
    expect(getMarkdownStreamCurrentPath(editor)).toEqual([2]);
    expect(getMarkdownStreamMdxName(editor)).toBe('Callout');
    expect(getMarkdownStreamRuntimeState(editor)).toEqual({
      replayStartOffset: 4,
      source: 'hello world',
      stableBlockCount: 1,
      startPath: [0],
    });

    clearMarkdownStreamSession(editor);

    expect(getMarkdownStreamSource(editor)).toBe('');
    expect(getMarkdownStreamCurrentPath(editor)).toBeNull();
    expect(getMarkdownStreamMdxName(editor)).toBeNull();
    expect(getMarkdownStreamRuntimeState(editor)).toBeUndefined();
  });
});
