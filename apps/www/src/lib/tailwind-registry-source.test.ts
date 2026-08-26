import { describe, expect, it } from 'bun:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import tailwind from '@tailwindcss/postcss';
import postcss from 'postcss';

describe('Tailwind registry source discovery', () => {
  it('excludes generated registry payloads from utility scanning', async () => {
    const globalsPath = path.resolve(import.meta.dir, '../app/globals.css');
    const source = await readFile(globalsPath, 'utf-8');
    const result = await postcss([tailwind()]).process(source, {
      from: globalsPath,
    });

    expect(source).toContain('@source not "../../public/r"');
    expect(source).toContain('@source not "../__registry__"');
    expect(result.css).toContain("[class*='size-']");
    expect(result.css).not.toMatch(/svg:not\(\[class\*=\\/);
  });
});
