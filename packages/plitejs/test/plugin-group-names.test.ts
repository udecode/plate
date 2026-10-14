import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, definePlugin } from 'plitejs';

const builtInTransactionKeys = () => {
  let keys: string[] = [];

  createEditor().update((tx) => {
    keys = Object.keys(tx).filter((key) => key !== 'plugin');
  });

  return keys;
};

describe('plugin group names', () => {
  it('refuses a plugin group named after a built-in transaction member', () => {
    const keys = builtInTransactionKeys();

    assert.ok(keys.includes('blocks'));
    for (const key of keys) {
      const UpdateGroup = definePlugin(key, {
        update: () => ({ run: () => undefined }),
      });
      const ReadGroup = definePlugin(key, {
        read: () => ({ peek: () => undefined }),
      });

      assert.throws(
        () => createEditor({ plugins: [UpdateGroup] }),
        /is reserved by the editor core\./,
        `update group ${key}`
      );
      assert.throws(
        () => createEditor({ plugins: [ReadGroup] }),
        /is reserved by the editor core\./,
        `read group ${key}`
      );
    }
  });
});
