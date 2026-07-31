import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { schema } from '@platejs/plite';

import { MarkdownPlugin } from '../MarkdownPlugin';
import { compileMarkdownCodecs } from './markdownCodecs';

const elementPlugin = (name: string) =>
  createBasePlugin({
    name,
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });

describe('Markdown node codec compiler', () => {
  it('orders decode claims by priority and caches the compiled editor view', () => {
    const LowPlugin = elementPlugin('low').extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/markdown': {
          decode: ({ type }) => ({
            children: [{ text: '' }],
            type,
          }),
          from: 'toc',
          kind: 'node',
          priority: 10,
        },
      }),
    }));
    const HighPlugin = elementPlugin('high').extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/markdown': {
          decode: ({ type }) => ({
            children: [{ text: '' }],
            type,
          }),
          from: 'toc',
          kind: 'node',
          priority: 20,
        },
      }),
    }));
    const editor = createBaseEditor({
      plugins: [LowPlugin, HighPlugin, MarkdownPlugin],
    });
    const first = compileMarkdownCodecs(editor);

    expect(first.decodeBySource.get('toc')?.map(({ owner }) => owner)).toEqual([
      'high',
      'low',
    ]);
    expect(compileMarkdownCodecs(editor)).toBe(first);
  });

  it('does not compile codecs from disabled plugins', () => {
    const DisabledPlugin = elementPlugin('disabled')
      .extend(({ defineCodecs }) => ({
        codecs: defineCodecs({
          'text/markdown': {
            decode: ({ type }) => ({
              children: [{ text: '' }],
              type,
            }),
            from: 'toc',
            kind: 'node',
          },
        }),
      }))
      .configure({ enabled: false });
    const editor = createBaseEditor({
      plugins: [DisabledPlugin, MarkdownPlugin],
    });
    const compiled = compileMarkdownCodecs(editor);

    expect(compiled.decodeBySource.has('toc')).toBe(false);
    expect(compiled.rules.disabled).toBeUndefined();
  });

  it('rejects ambiguous equal-priority decode claims from one target', () => {
    const ConflictPlugin = elementPlugin('conflict').extend(
      ({ defineCodecs }) => ({
        codecs: defineCodecs({
          'text/markdown': [
            {
              decode: ({ type }) => ({
                children: [{ text: '' }],
                type,
              }),
              from: 'toc',
              kind: 'node',
            },
            {
              decode: ({ type }) => ({
                children: [{ text: '' }],
                type,
              }),
              from: 'toc',
              kind: 'node',
            },
          ],
        }),
      })
    );
    const editor = createBaseEditor({
      plugins: [ConflictPlugin, MarkdownPlugin],
    });

    expect(() => compileMarkdownCodecs(editor)).toThrow(
      'equal-priority decode claims'
    );
  });

  it('rejects unknown declaration fields at the runtime boundary', () => {
    const declaration = {
      decode: () => ({
        children: [{ text: '' }],
        type: 'invalid' as const,
      }),
      from: 'toc' as const,
      kind: 'node' as const,
      typo: true,
    };
    const InvalidPlugin = elementPlugin('invalid').extend(
      ({ defineCodecs }) => ({
        codecs: defineCodecs({
          'text/markdown': declaration,
        }),
      })
    );
    const editor = createBaseEditor({
      plugins: [InvalidPlugin, MarkdownPlugin],
    });

    expect(() => compileMarkdownCodecs(editor)).toThrow('unknown field "typo"');
  });
});
