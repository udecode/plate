import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import * as PliteHistory from '../../src/history/index';

const expectedPliteHistoryRuntimeRootExports = ['History', 'history'];

describe('plite-history package README contract', () => {
  it('keeps public root runtime values exact', () => {
    assert.deepEqual(
      Object.keys(PliteHistory).sort(),
      expectedPliteHistoryRuntimeRootExports
    );
  });

  it('names the root history extension and History validator exports', () => {
    const readme = [
      'index.mdx',
      'history-extension-setup.mdx',
      'history-editor.mdx',
      'history.mdx',
    ]
      .map((file) =>
        readFileSync(
          fileURLToPath(
            new URL(
              `../../../../content/docs/plite/libraries/plite-history/${file}`,
              import.meta.url
            )
          ),
          'utf-8'
        )
      )
      .join('\n');

    assert.match(
      readme,
      /import \{ createEditor \} from "plitejs";[\s\S]*import \{ history \} from "plitejs\/history";/
    );
    assert.match(readme, /extensions: \[history\(\{ newBatchDelay: 500 \}\)\]/);
    assert.match(readme, /`newBatchDelay` defaults to 500 milliseconds/);
    assert.match(readme, /state\.history\.undos\(\)/);
    assert.match(readme, /editor\.update\.history\.undo\(\)/);
    assert.match(readme, /editor\.update\(\{ history: "skip" \}\)/);
    assert.doesNotMatch(readme, /editor\.api\.history/);
    assert.match(readme, /History\.isHistory\(value: unknown\)/);
    assert.match(readme, /`useEditor` installs history by default/);
    assert.match(
      readme,
      /version 4 envelope requires the current derived or named schema/
    );
    assert.doesNotMatch(
      readme,
      /Persist and restore validated history with version 3 JSON\./
    );
    assert.match(readme, /createEditor/);
  });
});
