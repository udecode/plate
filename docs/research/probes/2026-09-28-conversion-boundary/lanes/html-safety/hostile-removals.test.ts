import { expect, test } from 'bun:test';
import { writeFileSync } from 'node:fs';

import { parseHtmlAst } from '../../../../../../packages/platejs/src/lib/plugins/html/htmlAst';

// Siblings that alternate kept and removed nodes, each kept one carrying a handler.
const hostile = (pairs: number) =>
  '<p onclick="x()">k</p><script></script>'.repeat(pairs);
const time = (run: () => unknown) => {
  const startedAt = performance.now();

  run();

  return Math.round(performance.now() - startedAt);
};

test('source safety pass stays linear under many removals', () => {
  const rows = [5000, 10_000, 20_000, 33_000].map((pairs) => {
    const source = hostile(pairs);
    const parsed = parseHtmlAst(source, 'slice');

    expect(parsed.ok && parsed.ast.diagnostics.length).toBe(pairs * 2);

    return {
      bytes: source.length,
      ms: time(() => parseHtmlAst(source, 'slice')),
      pairs,
    };
  });

  writeFileSync(`${import.meta.dir}/hostile-removals.json`, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(rows);
}, 600_000);
