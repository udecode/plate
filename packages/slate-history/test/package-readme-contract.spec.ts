import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import * as SlateHistory from '../src/index';

const expectedSlateHistoryRuntimeRootExports = ['History', 'history'];

describe('slate-history package README contract', () => {
  it('keeps public root runtime values exact', () => {
    assert.deepEqual(
      Object.keys(SlateHistory).sort(),
      expectedSlateHistoryRuntimeRootExports
    );
  });

  it('names the root history extension and History validator exports', () => {
    const readme = readFileSync(
      fileURLToPath(new URL('../Readme.md', import.meta.url)),
      'utf8'
    );

    assert.match(
      readme,
      /import \{ History, history \} from '@platejs\/slate-history'/
    );
    assert.match(readme, /extensions: \[history\(\)\]/);
    assert.match(readme, /state\.history\.get\(\)/);
    assert.match(readme, /tx\.history\.undo\(\)/);
    assert.match(readme, /editor\.api\.history/);
    assert.match(readme, /History\.isHistory\(state\.history\.get\(\)\)/);
    assert.match(readme, /History\.isHistory\(value\)/);
    assert.match(readme, /`useSlateEditor` installs history by default/);
    assert.doesNotMatch(readme, /createReactEditor/);
  });
});
