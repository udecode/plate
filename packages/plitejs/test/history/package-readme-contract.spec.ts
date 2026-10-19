import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import * as HistoryAPI from '../../src/history/index';

const expectedHistoryRuntimeRootExports = ['History', 'history'];

describe('history documentation contract', () => {
  it('keeps public root runtime values exact', () => {
    assert.deepEqual(
      Object.keys(HistoryAPI).sort(),
      expectedHistoryRuntimeRootExports
    );
  });

  it('documents default history, editing commands, and validated persistence', () => {
    const readme = readFileSync(
      fileURLToPath(
        new URL(
          '../../../../content/docs/(guides)/history.mdx',
          import.meta.url
        )
      ),
      'utf-8'
    );

    assert.match(readme, /import \{ createEditor \} from ['"]platejs['"]/);
    assert.match(readme, /Plate tracks local undo and redo batches by default/);
    assert.match(readme, /editor\.read\.history\.hasUndo\(\)/);
    assert.match(readme, /editor\.api\.history\.undo\(\)/);
    assert.match(readme, /editor\.update\(\{ history: "skip" \}\)/);
    assert.match(readme, /History\.isHistory\(value: unknown\)/);
    assert.match(readme, /import \{ History \} from ['"]platejs\/history['"]/);
    assert.match(readme, /History\.toJSON\(editor\)/);
    assert.match(readme, /History\.fromJSON\(/);
    assert.match(readme, /tx\.history\.restore\(decoded\)/);
    assert.match(readme, /validated version 4 JSON/);
    assert.match(
      readme,
      /Schema identity is always derived or named; `null` is invalid/
    );
    assert.match(readme, /Failed decoding leaves\s+editor state untouched/);
  });
});
