import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { repoRoot } from './check-plite.mjs';

test('source preload bypasses stale direct and transitive workspace artifacts', () => {
  const result = spawnSync(
    'bun',
    [
      '--preload',
      './config/plite-source-aliases.ts',
      '-e',
      [
        "const { BaseAIPlugin } = await import('@platejs/ai');",
        "const { createBaseEditor, BaseParagraphPlugin } = await import('@platejs/core');",
        "const { MarkdownPlugin } = await import('@platejs/markdown');",
        "const { ContentSlice } = await import('@platejs/plite');",
        "const { ExitBreakPlugin } = await import('@platejs/utils');",
        "createBaseEditor({ plugins: [BaseParagraphPlugin, BaseAIPlugin, MarkdownPlugin], schema: { id: 'source-aliases', version: 1 } });",
        'ContentSlice.closed([]);',
        'void ExitBreakPlugin;',
      ].join('\n'),
    ],
    {
      cwd: repoRoot,
      encoding: 'utf8',
    }
  );

  assert.equal(result.status, 0, result.stderr || result.stdout);
});
