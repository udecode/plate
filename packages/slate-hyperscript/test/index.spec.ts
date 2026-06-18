import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { jsx as slateJsx } from '../src';

type FixtureModule = {
  input: Record<string, unknown> | unknown[];
  output: Record<string, unknown> | unknown[];
  skip?: boolean;
};

const readFixtureField = (value: Record<string, unknown>, key: string) => {
  if (key === 'children' && typeof value.read === 'function') {
    return value.read(
      (state: {
        runtime?: { snapshot: () => { children: unknown } };
        value: { get: () => { roots?: { main?: unknown } } | unknown };
      }) => state.runtime?.snapshot().children ?? state.value.get()
    );
  }

  if (key === 'selection' && typeof value.read === 'function') {
    return value.read((state: { selection: { get: () => unknown } }) =>
      state.selection.get()
    );
  }

  if (key === 'children' && typeof value.getChildren === 'function') {
    return value.getChildren();
  }

  if (key === 'selection' && typeof value.getSelection === 'function') {
    return value.getSelection();
  }

  if (key === 'marks' && typeof value.getMarks === 'function') {
    return value.getMarks();
  }

  return value[key];
};

const fixturesDir = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'fixtures'
);

const isFixtureFile = (file: string) =>
  (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx')) &&
  !file.endsWith('custom-types.ts') &&
  !file.endsWith('type-guards.ts') &&
  !file.startsWith('.') &&
  file !== 'index.js';

const fixtureNameRe = /\.hsx\.tsx$|\.tsx$|\.ts$|\.js$/u;

const getFixtureName = (file: string) => file.replace(fixtureNameRe, '');

const runFixtures = (path: string) => {
  describe(basename(path), () => {
    for (const file of readdirSync(path).sort()) {
      const fixturePath = resolve(path, file);
      const stat = statSync(fixturePath);

      if (stat.isDirectory()) {
        runFixtures(fixturePath);
        continue;
      }

      if (!stat.isFile() || !isFixtureFile(file)) continue;

      const name = getFixtureName(file);
      const source = readFileSync(fixturePath, 'utf8');
      const testFn = /\bexport const skip\s*=\s*true\b/.test(source)
        ? it.skip
        : it;

      testFn(name, async () => {
        const { input, output } = (await import(
          pathToFileURL(fixturePath).href
        )) as FixtureModule;

        const actual = Array.isArray(output)
          ? input
          : Object.fromEntries(
              Object.keys(output).map((key) => [
                key,
                readFixtureField(input as Record<string, unknown>, key),
              ])
            );

        expect(actual).toEqual(output);
      });
    }
  });
};

describe('@platejs/slate-hyperscript', () => {
  it('rejects numeric children instead of dropping them', () => {
    expect(() => slateJsx('element', {}, 0)).toThrow(
      'Unexpected hyperscript child object: 0'
    );
  });

  it('ignores direct JSX no-op children', () => {
    expect(slateJsx('element', {}, null, undefined, false)).toEqual({
      children: [],
    });
  });

  it('does not let selection props overwrite child points', () => {
    expect(
      slateJsx(
        'selection',
        { anchor: null, focus: null },
        slateJsx('anchor', { offset: 1, path: [0, 0] }),
        slateJsx('focus', { offset: 2, path: [0, 0] })
      )
    ).toEqual({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
  });

  runFixtures(fixturesDir);
});
