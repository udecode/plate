import { describe, expect, it } from 'bun:test';

import { getMarkdownRewrite } from './proxy';

describe('docs markdown negotiation', () => {
  it('rewrites English docs to LLM markdown routes', () => {
    expect(getMarkdownRewrite('/docs/controlled')).toBe('/llm/controlled');
    expect(getMarkdownRewrite('/docs/controlled.md')).toBe(
      '/llm/controlled.md'
    );
  });

  it('rewrites CN docs to localized LLM markdown routes', () => {
    expect(getMarkdownRewrite('/cn/docs/controlled')).toBe(
      '/cn/llm/controlled'
    );
    expect(getMarkdownRewrite('/cn/docs/controlled.md')).toBe(
      '/cn/llm/controlled.md'
    );
  });

  it('ignores non-doc routes', () => {
    expect(getMarkdownRewrite('/editors')).toBeNull();
  });
});
