import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { findValueSpreads } from './check-value-records.mjs';

const scan = (source) => {
  const root = mkdtempSync(path.join(tmpdir(), 'value-records-'));

  mkdirSync(path.join(root, 'src'));
  writeFileSync(
    path.join(root, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: { strict: true, target: 'ES2022', types: [] },
      include: ['src'],
    })
  );
  writeFileSync(path.join(root, 'src/values.ts'), source);

  return findValueSpreads(path.join(root, 'tsconfig.json')).map(
    ({ kind, line }) => `${kind}:${line}`
  );
};

test('flags each spread and rest that drops a document value’s records', () => {
  const found = scan(`type Doc = {
  children: readonly unknown[];
  records?: Readonly<Record<string, unknown>>;
  roots?: Readonly<Record<string, readonly unknown[]>>;
};
type Tx = { children: () => readonly unknown[]; records: { put(): void } };
declare const withValueRecords: <T>(value: T, store: unknown) => T;
declare const doc: Doc;
declare const tx: Tx;
export const replaced = { ...doc, children: [] };
export const attached = withValueRecords({ ...doc, children: [] }, null);
export const { roots: _roots, ...withoutRoots } = doc;
export const { records: _records, ...content } = doc;
export const transaction = { ...tx };
export const copy = <V extends Doc>(value: V) => ({ ...value });
`);

  assert.deepEqual(found, ['spread:10', 'rest:12', 'spread:15']);
});
