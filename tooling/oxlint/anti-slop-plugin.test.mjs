import { describe, expect, it } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const oxlint = fileURLToPath(
  new URL('../../node_modules/.bin/oxlint', import.meta.url)
);
const pluginPath = fileURLToPath(
  new URL('anti-slop-plugin.mjs', import.meta.url)
);

const lint = (lines) => {
  const directory = mkdtempSync(join(tmpdir(), 'anti-slop-'));

  try {
    const configPath = join(directory, 'oxlintrc.json');
    const filePath = join(directory, 'case.ts');

    writeFileSync(
      configPath,
      JSON.stringify({
        categories: { correctness: 'off' },
        jsPlugins: [{ name: 'anti-slop', specifier: pluginPath }],
        rules: {
          'anti-slop/no-chained-type-assertions': 'error',
          'anti-slop/no-unsafe-dictionary-type': 'error',
        },
      })
    );
    writeFileSync(filePath, lines.join('\n'));

    const { stdout } = spawnSync(
      oxlint,
      ['-c', configPath, '--format', 'json', filePath],
      { encoding: 'utf-8' }
    );

    return JSON.parse(stdout).diagnostics.map(
      ({ code, labels }) => `${labels[0].span.line} ${code}`
    );
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
};

describe('Plate Anti-Slop policy', () => {
  it('preserves explicit top-type bridges but rejects accidental chains', () => {
    expect(
      lint([
        'declare const value: string;',
        'export const unknownBridge = value as unknown as number;',
        'export const accidental = value as string as number;',
        'export const trailingTop = value as string as unknown;',
        'export const nested = value as string as unknown as number;',
        'export const anyBridge = value as any as number;',
      ])
    ).toEqual([
      '3 anti-slop(no-chained-type-assertions)',
      '4 anti-slop(no-chained-type-assertions)',
      '5 anti-slop(no-chained-type-assertions)',
    ]);
  });

  it('distinguishes local assertion types from declared dictionary contracts', () => {
    expect(
      lint([
        'declare const value: unknown;',
        'export const local = value as Record<string, any>;',
        'export type Declared = Record<string, any>;',
      ])
    ).toEqual(['3 anti-slop(no-unsafe-dictionary-type)']);
  });

  it('preserves explicit any propagation and JSX host declarations', () => {
    expect(
      lint([
        'type IsAny<T> = 0 extends 1 & T ? true : false;',
        'export type Fallback<T> = IsAny<T> extends true ? Record<string, any> : T;',
        'export type Inverted<T> = IsAny<T> extends true ? T : Record<string, any>;',
        'declare global { namespace JSX { interface IntrinsicElements { [name: string]: any } } }',
        'export interface OtherElements { [name: string]: any }',
      ])
    ).toEqual([
      '3 anti-slop(no-unsafe-dictionary-type)',
      '5 anti-slop(no-unsafe-dictionary-type)',
    ]);
  });

  it('preserves safe unknown dictionaries and the explicit AnyObject escape hatch', () => {
    expect(
      lint([
        'export type Safe = Record<string, unknown>;',
        'export type AnyObject = Record<string, any>;',
        'export type OtherObject = Record<string, any>;',
      ])
    ).toEqual(['3 anti-slop(no-unsafe-dictionary-type)']);
  });
});
