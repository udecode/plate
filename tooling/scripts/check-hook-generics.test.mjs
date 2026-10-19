import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { findHookGenerics } from './check-hook-generics.mjs';

const require = createRequire(import.meta.url);
const ts = require('@typescript/typescript6');

const compilerOptions = {
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  strict: true,
  target: ts.ScriptTarget.ES2022,
  types: [],
};

const scan = (source, exemptions = new Set()) => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'hook-generics-'));
  const file = path.join(repoRoot, 'hooks.ts');

  writeFileSync(file, `type Box<V> = { value: V };\n${source}`);

  return findHookGenerics({
    compilerOptions,
    entrypoints: [{ source: file, specifier: 'fixture' }],
    exemptions,
    repoRoot,
  });
};

const ids = (source, exemptions) =>
  scan(source, exemptions).findings.map(
    ({ file, name, symbol }) => `${file}#${symbol}#${name}`
  );

test('flags a type parameter no parameter supplies, under any hook name', () => {
  assert.deepEqual(
    ids('export function useAnything<V>(): Box<V> { return null!; }'),
    ['hooks.ts#useAnything#V']
  );
});

test('flags a type parameter that only a hook-supplied callback names', () => {
  assert.deepEqual(
    ids(
      'export function useEffectish<V>(effect: (editor: Box<V>) => void): void {}'
    ),
    ['hooks.ts#useEffectish#V']
  );
});

test('flags a type parameter that only a conditional check position names, through an alias', () => {
  assert.deepEqual(
    ids(`type Compatible<E, C> = E extends { value: unknown } ? C : never;
export function useCommandish<C, V>(command: C & Compatible<Box<V>, C>): void {}`),
    ['hooks.ts#useCommandish#V']
  );
});

test('flags a result type that only an optional options property supplies', () => {
  assert.deepEqual(
    ids(
      'export function useCreate<V>(options: { value?: V }): Box<V> { return null!; }'
    ),
    ['hooks.ts#useCreate#V']
  );
});

test('flags an unannotated hook whose result only optional input supplies', () => {
  assert.deepEqual(
    ids('export const useLoose = <T,>(value?: T) => value as T;'),
    ['hooks.ts#useLoose#T']
  );
});

test('flags an unannotated hook whose optional-only parameter sits mid-way through a long result', () => {
  const fields = Array.from({ length: 30 }, (_, i) => `field${i}: ${i}`).join(
    ', '
  );

  assert.deepEqual(
    ids(
      `export const useWide = <T,>(value?: T) => ({ ${fields}, middle: value as T, ${fields.replaceAll('field', 'tail')} });`
    ),
    ['hooks.ts#useWide#T']
  );
});

test('flags a hook declared through an annotated const', () => {
  assert.deepEqual(ids('export const useTyped: <V>() => Box<V> = null!;'), [
    'hooks.ts#useTyped#V',
  ]);
});

test('flags a parameter that a shadowing generic of the same name seems to supply', () => {
  assert.deepEqual(
    ids(
      'export function useShadow<V>(identity: <V>(value: V) => V): Box<V> { return null!; }'
    ),
    ['hooks.ts#useShadow#V']
  );
});

test('flags an unannotated hook whose optional-only parameter name holds a dollar sign', () => {
  assert.deepEqual(
    ids('export const useDollar = <$V,>(value?: $V) => value as $V;'),
    ['hooks.ts#useDollar#$V']
  );
});

test('flags a parameter that only a call-signature callback names', () => {
  assert.deepEqual(
    ids(`type Effect<V> = { (editor: Box<V>): void };
export function useCallable<V>(effect: Effect<V>): Box<V> { return null!; }`),
    ['hooks.ts#useCallable#V']
  );
});

test('accepts type parameters that input or the selected result supplies', () => {
  assert.deepEqual(
    ids(`export function usePath(): string;
export function usePath<T>(selector: (path: string) => T, options?: { equal?: (a: T, b: T) => boolean }): T;
export function usePath<T>(selector?: (path: string) => T): T | string { return selector ? selector('') : ''; }
export function useSelect<T>(selector: (state: string) => T): T { return selector(''); }
export function useRoot<const R extends string>(root?: R): string { return root ?? ''; }`),
    []
  );
});

test('exempts only the named file, symbol and type parameter', () => {
  assert.deepEqual(
    ids(
      `export function useEditor<V>(options?: { value?: V }): Box<V> { return null!; }
export function useOther<V>(options?: { value?: V }): Box<V> { return null!; }`,
      new Set(['hooks.ts#useEditor#V'])
    ),
    ['hooks.ts#useOther#V']
  );
});

test('reports a hook-named export with no call signature instead of skipping it', () => {
  assert.deepEqual(scan('export const useFlag = true;').problems, [
    'fixture: useFlag has no call signature',
  ]);
});

test('reports an entrypoint with no source or no exports instead of passing it', () => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'hook-generics-'));
  const empty = path.join(repoRoot, 'empty.ts');

  writeFileSync(empty, 'export {};\n');

  assert.deepEqual(
    findHookGenerics({
      compilerOptions,
      entrypoints: [
        { source: path.join(repoRoot, 'missing.ts'), specifier: 'missing' },
        { source: empty, specifier: 'empty' },
      ],
      repoRoot,
    }).problems,
    ['missing: no source file', 'empty: exports nothing']
  );
});
