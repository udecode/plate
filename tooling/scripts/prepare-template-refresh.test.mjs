import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  containsRetiredPackageReference,
  finalizeTemplateRefresh,
  isRetiredPackageName,
  normalizeCssImports,
  prepareTemplateRefresh,
  removeGeneratedSources,
  removeTemporaryBiomeOverrides,
  syncTooltipProvider,
} from './prepare-template-refresh.mjs';

test('classifies only retired scoped editor packages', () => {
  assert.equal(isRetiredPackageName('@platejs/ai'), true);
  assert.equal(isRetiredPackageName('@platejs/ai/react'), true);
  assert.equal(isRetiredPackageName('@udecode/cn'), true);
  assert.equal(isRetiredPackageName('@platejs/test'), false);
  assert.equal(isRetiredPackageName('@platejs/cli'), false);
  assert.equal(isRetiredPackageName('platejs/ai'), false);
  assert.equal(isRetiredPackageName('plitejs/react'), false);
});

test('detects retired package specifiers without matching prose', () => {
  assert.equal(
    containsRetiredPackageReference("import { AIPlugin } from '@platejs/ai';"),
    true
  );
  assert.equal(
    containsRetiredPackageReference("import { AIPlugin } from 'platejs/ai';"),
    false
  );
  assert.equal(
    containsRetiredPackageReference('// Replace @platejs/ai during migration.'),
    false
  );
});

test('removes retired dependencies and source files before regeneration', async () => {
  const templateDir = await mkdtemp(
    path.join(os.tmpdir(), 'prepare-template-refresh-')
  );
  const retiredFile = path.join(templateDir, 'src', 'retired.ts');
  const currentFile = path.join(templateDir, 'src', 'current.ts');

  try {
    await mkdir(path.join(templateDir, 'src'), { recursive: true });
    await mkdir(
      path.join(templateDir, 'src', 'app', 'api', 'ai', 'command', 'prompt'),
      { recursive: true }
    );
    await writeFile(
      path.join(templateDir, 'package.json'),
      JSON.stringify(
        {
          dependencies: {
            '@platejs/ai': '^53.0.0',
            platejs: '^53.0.0',
          },
          devDependencies: {
            '@platejs/test': '^1.0.0',
            '@udecode/cn': '^47.0.0',
          },
        },
        null,
        2
      )
    );
    await writeFile(retiredFile, "export * from '@platejs/ai/react';\n");
    await writeFile(currentFile, "export * from 'platejs/ai/react';\n");
    await writeFile(
      path.join(
        templateDir,
        'src',
        'app',
        'api',
        'ai',
        'command',
        'prompt',
        'index.ts'
      ),
      "export * from './getPrompt';\n"
    );

    const result = await prepareTemplateRefresh(templateDir);
    const packageJson = JSON.parse(
      await readFile(path.join(templateDir, 'package.json'), 'utf-8')
    );

    assert.deepEqual(result.dependencyNames, ['@platejs/ai', '@udecode/cn']);
    assert.deepEqual(result.sourceFiles, [
      'src/app/api/ai/command/prompt/index.ts',
      'src/retired.ts',
    ]);
    assert.deepEqual(packageJson.dependencies, { platejs: '^53.0.0' });
    assert.deepEqual(packageJson.devDependencies, {
      '@platejs/test': '^1.0.0',
    });
    assert.equal(
      await readFile(currentFile, 'utf-8'),
      "export * from 'platejs/ai/react';\n"
    );
    await assert.rejects(readFile(retiredFile, 'utf-8'), { code: 'ENOENT' });
  } finally {
    await rm(templateDir, { force: true, recursive: true });
  }
});

test('replaces generated editor sources while preserving the template utility', async () => {
  const templateDir = await mkdtemp(
    path.join(os.tmpdir(), 'prepare-template-generated-sources-')
  );
  const generatedFiles = [
    'src/app/api/ai/route.ts',
    'src/app/editor/page.tsx',
    'src/components/ui/legacy.tsx',
    'src/hooks/use-legacy.ts',
    'src/lib/legacy.ts',
  ];

  try {
    for (const relativePath of [...generatedFiles, 'src/lib/utils.ts']) {
      const filePath = path.join(templateDir, relativePath);

      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, 'export {};\n');
    }

    const removedSourceFiles = await removeGeneratedSources(templateDir);

    assert.deepEqual(
      removedSourceFiles.toSorted((a, b) => a.localeCompare(b)),
      generatedFiles.toSorted((a, b) => a.localeCompare(b))
    );

    for (const relativePath of generatedFiles) {
      await assert.rejects(readFile(path.join(templateDir, relativePath)), {
        code: 'ENOENT',
      });
    }

    assert.equal(
      await readFile(path.join(templateDir, 'src/lib/utils.ts'), 'utf-8'),
      'export {};\n'
    );
  } finally {
    await rm(templateDir, { force: true, recursive: true });
  }
});

test('moves CSS imports ahead of generated plugins', () => {
  assert.equal(
    normalizeCssImports(
      '@plugin "tailwind-scrollbar-hide";\n@import "tw-animate-css";\n\n@theme {}\n'
    ),
    '@import "tw-animate-css";\n\n@plugin "tailwind-scrollbar-hide";\n\n@theme {}\n'
  );
});

test('matches the root tooltip provider to the generated component', async () => {
  const templateDir = await mkdtemp(
    path.join(os.tmpdir(), 'prepare-template-tooltip-')
  );
  const layoutPath = path.join(templateDir, 'src/app/layout.tsx');
  const tooltipPath = path.join(templateDir, 'src/components/ui/tooltip.tsx');
  const layoutSource = `import localFont from 'next/font/local';

import { TooltipProvider } from '@/components/ui/tooltip';

export default function RootLayout({ children }) {
  return <body><TooltipProvider>{children}</TooltipProvider></body>;
}
`;

  try {
    await mkdir(path.dirname(layoutPath), { recursive: true });
    await mkdir(path.dirname(tooltipPath), { recursive: true });
    await writeFile(layoutPath, layoutSource);
    await writeFile(tooltipPath, 'export {};\n');

    assert.equal(await syncTooltipProvider(templateDir), false);

    await rm(tooltipPath);
    assert.equal(await syncTooltipProvider(templateDir), true);
    const layoutWithoutTooltip = await readFile(layoutPath, 'utf-8');

    assert.equal(layoutWithoutTooltip.includes('TooltipProvider'), false);

    await writeFile(tooltipPath, 'export {};\n');
    assert.equal(await syncTooltipProvider(templateDir), true);
    assert.equal(await readFile(layoutPath, 'utf-8'), layoutSource);
  } finally {
    await rm(templateDir, { force: true, recursive: true });
  }
});

test('rejects retired references after registry generation', async () => {
  const templateDir = await mkdtemp(
    path.join(os.tmpdir(), 'finalize-template-refresh-')
  );

  try {
    await mkdir(path.join(templateDir, 'src'), { recursive: true });
    await writeFile(
      path.join(templateDir, 'package.json'),
      JSON.stringify({ dependencies: { '@platejs/ai': '^53.0.0' } })
    );
    await writeFile(
      path.join(templateDir, 'src', 'editor.ts'),
      "export * from '@udecode/cn';\n"
    );

    await assert.rejects(finalizeTemplateRefresh(templateDir), {
      message: /Template refresh produced retired package references/,
    });
  } finally {
    await rm(templateDir, { force: true, recursive: true });
  }
});

test('removes the temporary barrel exemption before generated lint', async () => {
  const templateDir = await mkdtemp(
    path.join(os.tmpdir(), 'prepare-template-biome-')
  );
  const configPath = path.join(templateDir, 'biome.jsonc');

  try {
    await writeFile(
      configPath,
      '{\n  "performance": {\n    "noBarrelFile": "off" // tmp\n  }\n}\n'
    );

    assert.equal(await removeTemporaryBiomeOverrides(configPath), true);
    const configSource = await readFile(configPath, 'utf-8');

    assert.equal(configSource.includes('noBarrelFile'), false);
  } finally {
    await rm(templateDir, { force: true, recursive: true });
  }
});
