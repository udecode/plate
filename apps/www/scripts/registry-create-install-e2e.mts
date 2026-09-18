import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium, type Locator } from '@playwright/test';

import { createRegistryResponse } from '../src/lib/registry-response';

const appRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = path.resolve(appRoot, '../..');
const shadcnOrigin = 'https://ui.shadcn.com';
const shadcnBin = path.join(appRoot, 'node_modules/.bin/shadcn');
const pnpmEntrypoint = process.env.npm_execpath;
const supportedItems = [
  'editor-basic',
  'ai',
  'dnd',
  'table',
  'editor-ai',
] as const;
const requestedItems = process.argv.slice(2);

if (requestedItems.includes('--help')) {
  console.info(
    'Usage: pnpm --filter www test:create-install [editor-basic|ai|dnd|table|editor-ai ...]'
  );
  process.exit(0);
}
const items = requestedItems.length
  ? [...new Set(requestedItems)]
  : ['editor-basic'];
for (const item of items) {
  if (!supportedItems.some((supported) => supported === item)) {
    throw new Error(`Unsupported registry proof item: ${item}`);
  }
}

if (!pnpmEntrypoint) {
  throw new Error('Run this gate through pnpm so it can resolve pnpm itself.');
}
const pnpmCommand = pnpmEntrypoint;

process.chdir(appRoot);

const workspace = await fs.mkdtemp(
  path.join(os.tmpdir(), 'plate-create-local-')
);
const projectsRoot = path.join(workspace, 'projects');
const binRoot = path.join(workspace, 'bin');
const plateRequests: string[] = [];

async function run(
  command: string,
  args: string[],
  cwd: string,
  environment: Partial<NodeJS.ProcessEnv> = {}
) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...environment },
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited ${code ?? signal}`));
    });
  });
}

async function getAvailablePort() {
  const server = http.createServer();

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const serverAddress = server.address();

  if (!serverAddress || typeof serverAddress === 'string') {
    throw new Error('Could not allocate a browser-proof port');
  }

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  return serverAddress.port;
}

async function waitForCount(locator: Locator, expected: number) {
  const deadline = Date.now() + 10_000;

  while (Date.now() < deadline) {
    if ((await locator.count()) === expected) return;
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 50);
    });
  }

  throw new Error(
    `Expected ${expected} matching elements, received ${await locator.count()}`
  );
}

async function verifyInstalledEditorCommands(project: string) {
  const port = await getAvailablePort();
  const server = spawn(
    process.execPath,
    [pnpmCommand, '--dir', project, 'start', '--port', String(port)],
    {
      cwd: workspace,
      env: process.env,
      stdio: 'ignore',
    }
  );
  const origin = `http://127.0.0.1:${port}`;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

  try {
    const deadline = Date.now() + 30_000;
    let ready = false;

    while (Date.now() < deadline) {
      if (server.exitCode !== null) {
        throw new Error(`Installed editor server exited ${server.exitCode}`);
      }

      try {
        const response = await fetch(`${origin}/editor`);
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        // The installed server has not started accepting requests yet.
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 100);
      });
    }

    if (!ready) {
      throw new Error('Installed editor server did not become ready');
    }

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const runtimeErrors: string[] = [];

    page.on('pageerror', (error) => runtimeErrors.push(String(error)));
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        !message.text().startsWith('Failed to load resource:')
      ) {
        runtimeErrors.push(message.text());
      }
    });
    page.on('requestfailed', (request) => {
      if (request.url().startsWith(origin)) {
        runtimeErrors.push(
          `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'request failed'}`
        );
      }
    });

    await page.goto(`${origin}/editor`);
    const editor = page.locator('[contenteditable="true"]').first();
    const toolbar = page.locator('[data-slot="fixed-toolbar"]');
    const menuTriggers = toolbar.locator('[data-slot="dropdown-menu-trigger"]');

    await editor.waitFor();
    await toolbar.waitFor();
    await editor
      .locator('[data-editor-node="element"][data-editor-path="1"]')
      .click();

    const headings = editor.locator('h2');
    const initialHeadingCount = await headings.count();

    await menuTriggers.first().click();
    await page
      .getByRole('menuitem', { name: 'Heading 2', exact: true })
      .click();
    await waitForCount(headings, initialHeadingCount + 1);
    await page.waitForFunction(
      () => document.activeElement?.getAttribute('contenteditable') === 'true'
    );

    const turnInto = menuTriggers.nth(1);
    await turnInto.focus();
    await turnInto.press('Enter');
    const textItem = page.getByRole('menuitemradio', {
      name: 'Text',
      exact: true,
    });
    await textItem.focus();
    await textItem.press('Enter');
    await waitForCount(headings, initialHeadingCount);

    await editor.pressSequentially('/');
    const slashHeading = page.getByRole('option', {
      name: 'Heading 2',
      exact: true,
    });
    await slashHeading.waitFor();
    await slashHeading.focus();
    await slashHeading.press('Enter');
    await waitForCount(headings, initialHeadingCount + 1);

    const insertedHeading = headings.last();
    await insertedHeading.click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Indent', exact: true }).click();
    await insertedHeading.waitFor();

    if (
      !(await insertedHeading.evaluate((element) =>
        element.classList.contains('editor-indent-1')
      ))
    ) {
      throw new Error(
        'Installed Block Menu did not indent the selected heading'
      );
    }

    const keyboardText = editor.locator('kbd');
    const initialKeyboardTextCount = await keyboardText.count();

    await insertedHeading.click();
    await insertedHeading.press('End');
    await toolbar.getByRole('button', { name: 'More formatting' }).click();
    await page
      .getByRole('menuitem', { name: 'Keyboard input', exact: true })
      .click();
    await page.waitForFunction(
      () => document.activeElement?.getAttribute('contenteditable') === 'true'
    );
    await editor.pressSequentially('K');
    await waitForCount(keyboardText, initialKeyboardTextCount + 1);

    if (runtimeErrors.length > 0) {
      throw new Error(
        `Installed editor reported runtime errors:\n${runtimeErrors.join('\n')}`
      );
    }
  } finally {
    await browser?.close();

    if (server.exitCode === null) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          server.kill('SIGKILL');
          resolve();
        }, 5000);

        server.once('exit', () => {
          clearTimeout(timeout);
          resolve();
        });
        server.kill('SIGTERM');
      });
    }
  }
}

async function copyPackages(sourceRoot: string, targetRoot: string) {
  await fs.mkdir(targetRoot, { recursive: true });

  for (const entry of await fs.readdir(sourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const source = path.join(sourceRoot, entry.name);
    const packageJsonPath = path.join(source, 'package.json');

    try {
      await fs.access(packageJsonPath);
    } catch {
      continue;
    }

    const target = path.join(targetRoot, entry.name);
    const packageJson = JSON.parse(
      await fs.readFile(packageJsonPath, 'utf-8')
    ) as {
      dependencies?: Record<string, string>;
      dependenciesMeta?: Record<string, { injected?: boolean }>;
      files?: string[];
    };

    for (const [dependency, version] of Object.entries(
      packageJson.dependencies ?? {}
    )) {
      if (version.startsWith('workspace:')) {
        packageJson.dependenciesMeta ??= {};
        packageJson.dependenciesMeta[dependency] = { injected: true };
      }
    }

    await fs.mkdir(target, { recursive: true });
    await fs.writeFile(
      path.join(target, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    try {
      await fs.cp(path.join(source, 'dist'), path.join(target, 'dist'), {
        recursive: true,
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }

    for (const filePattern of packageJson.files ?? []) {
      const relativePath = filePattern.replace(/\/\*\*\/\*$/, '');
      if (relativePath === 'dist') continue;

      try {
        await fs.cp(
          path.join(source, relativePath),
          path.join(target, relativePath),
          { recursive: true }
        );
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      }
    }
  }
}

await fs.mkdir(projectsRoot, { recursive: true });
await fs.mkdir(binRoot, { recursive: true });
await fs.writeFile(
  path.join(workspace, 'package.json'),
  JSON.stringify({ name: 'plate-create-local-proof', private: true }, null, 2)
);
await fs.writeFile(
  path.join(workspace, 'pnpm-workspace.yaml'),
  [
    'linkWorkspacePackages: true',
    'preferWorkspacePackages: true',
    'allowBuilds:',
    '  esbuild: true',
    '  msw: false',
    'packages:',
    "  - 'projects/*'",
    "  - 'packages/*'",
    '',
  ].join('\n')
);
await fs.writeFile(
  path.join(binRoot, 'pnpm'),
  [
    '#!/usr/bin/env node',
    "const { existsSync, renameSync } = require('node:fs');",
    "const { spawnSync } = require('node:child_process');",
    "const { join } = require('node:path');",
    "const nestedWorkspace = join(process.cwd(), 'pnpm-workspace.yaml');",
    'if (existsSync(nestedWorkspace)) {',
    '  renameSync(nestedWorkspace, join(process.cwd(), "pnpm-workspace.template.yaml"));',
    '}',
    `const result = spawnSync(process.execPath, [${JSON.stringify(pnpmEntrypoint)}, ...process.argv.slice(2)], { env: process.env, stdio: 'inherit' });`,
    'if (result.error) throw result.error;',
    'process.exit(result.status ?? 1);',
    '',
  ].join('\n'),
  { mode: 0o755 }
);
await copyPackages(
  path.join(repoRoot, 'packages'),
  path.join(workspace, 'packages')
);

const proxy = http.createServer((request, response) => {
  void (async () => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      const address = proxy.address();

      if (!address || typeof address === 'string') {
        throw new Error('Directory proxy has no TCP address');
      }

      const proxyOrigin = `http://127.0.0.1:${address.port}`;

      if (requestUrl.pathname === '/r/registries.json') {
        const upstream = await fetch(`${shadcnOrigin}/r/registries.json`);
        const directory = (await upstream.json()) as Array<
          Record<string, unknown> & { name?: string }
        >;
        const plate = directory.find((entry) => entry.name === '@plate') ?? {
          name: '@plate',
        };

        plate.url = `${proxyOrigin}/plate/r/{style}/{name}.json`;
        if (!directory.includes(plate)) directory.push(plate);

        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify(directory));
        return;
      }

      const plateMatch = requestUrl.pathname.match(
        /^\/plate\/r\/([^/]+)\/([^/]+)$/
      );

      if (plateMatch) {
        const [, style, fileName] = plateMatch;
        const platePath = `/r/${style}/${fileName}`;
        const payload = await createRegistryResponse({
          directory: 'r',
          fileName,
          origin: `${proxyOrigin}/plate`,
          style,
        });

        plateRequests.push(platePath);
        response.writeHead(payload ? 200 : 404, {
          'content-type': payload ? 'application/json' : 'text/plain',
        });
        response.end(payload ? JSON.stringify(payload) : 'Not found');
        return;
      }

      const upstream = await fetch(
        `${shadcnOrigin}${requestUrl.pathname}${requestUrl.search}`
      );
      const body = Buffer.from(await upstream.arrayBuffer());

      response.writeHead(upstream.status, {
        'content-type':
          upstream.headers.get('content-type') ?? 'application/octet-stream',
      });
      response.end(body);
    } catch (error) {
      response.writeHead(500, { 'content-type': 'text/plain' });
      response.end(error instanceof Error ? error.stack : String(error));
    }
  })();
});

await new Promise<void>((resolve) => {
  proxy.listen(0, '127.0.0.1', resolve);
});
const address = proxy.address();

if (!address || typeof address === 'string') {
  throw new Error('Directory proxy failed to listen');
}

const registryUrl = `http://127.0.0.1:${address.port}/r`;
const styles = [
  { base: 'base', code: 'b0', style: 'nova' },
  { base: 'radix', code: 'b1VlIttI', style: 'luma' },
] as const;
const cases = items.flatMap((item) =>
  styles.map((style) => ({ ...style, item }))
);

try {
  for (const testCase of cases) {
    const name = `plate-${testCase.item}-${testCase.base}-${testCase.style}`;
    const start = plateRequests.length;
    const environment = {
      CI: '1',
      PATH: `${binRoot}:${process.env.PATH}`,
      REGISTRY_URL: registryUrl,
      npm_config_link_workspace_packages: 'true',
      npm_config_prefer_workspace_packages: 'true',
      npm_config_user_agent: 'pnpm/10.18.3',
    };

    await run(
      shadcnBin,
      [
        'create',
        testCase.item === 'editor-ai'
          ? '@plate/editor-ai'
          : '@plate/editor-basic',
        '--preset',
        testCase.code,
        '--base',
        testCase.base,
        '--template',
        'next',
        '--name',
        name,
        '--no-monorepo',
        '--silent',
        '--cwd',
        projectsRoot,
      ],
      projectsRoot,
      environment
    );

    const project = path.join(projectsRoot, name);
    if (
      testCase.item === 'ai' ||
      testCase.item === 'dnd' ||
      testCase.item === 'table'
    ) {
      await run(
        shadcnBin,
        [
          'add',
          `@plate/${testCase.item}`,
          ...(testCase.item === 'table' ? ['@plate/dnd'] : []),
          '--yes',
          '--overwrite',
          '--cwd',
          project,
        ],
        project,
        environment
      );
      const appDirectory = await Promise.any(
        ['app', 'src/app'].map(async (directory) => {
          const candidate = path.join(project, directory);
          await fs.access(candidate);
          return candidate;
        })
      );
      const kit =
        testCase.item === 'ai'
          ? 'AIKit'
          : testCase.item === 'table'
            ? 'TableKit'
            : 'DndKit';
      const initialValue =
        testCase.item === 'table'
          ? [
              {
                type: 'table',
                columnWidths: [120, 180],
                children: ['First', 'Second'].map((row) => ({
                  type: 'tableRow',
                  children: ['left', 'right'].map((column) => ({
                    type: 'tableCell',
                    children: [
                      {
                        type: 'paragraph',
                        children: [{ text: `${row} ${column}` }],
                      },
                    ],
                  })),
                })),
              },
            ]
          : [
              { type: 'paragraph', children: [{ text: 'First block' }] },
              { type: 'paragraph', children: [{ text: 'Second block' }] },
            ];
      const proofDirectory = path.join(appDirectory, 'kit-proof');
      await fs.mkdir(proofDirectory, { recursive: true });
      await fs.writeFile(
        path.join(proofDirectory, 'page.tsx'),
        `'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';
import { ${kit} } from '@/components/editor/${testCase.item}';
${testCase.item === 'table' ? "import { DndKit } from '@/components/editor/dnd';\n" : ''}
import { Editor, EditorContainer } from '@/components/editor/editor';

export default function KitProof() {
  const editor = useCreateEditor({
    plugins: ${testCase.item === 'table' ? '[...TableKit, ...DndKit]' : kit},
    initialValue: ${JSON.stringify(initialValue)},
  });
  return (
    <EditorRoot editor={editor}>
      <EditorContainer><Editor /></EditorContainer>
    </EditorRoot>
  );
}
`
      );
    }
    const expectedPath = `/r/${testCase.base}-${testCase.style}/${testCase.item}.json`;
    const requests = plateRequests.slice(start);

    if (!requests.includes(expectedPath)) {
      throw new Error(
        `${name} did not request ${expectedPath}: ${requests.join(', ')}`
      );
    }

    await fs.access(path.join(project, 'components.json'));
    const editorPath = await Promise.any(
      ['components', 'src/components'].map(async (directory) => {
        const candidate = path.join(
          project,
          directory,
          'editor',
          'rich-text-editor.tsx'
        );
        await fs.access(candidate);
        return candidate;
      })
    );
    const packageJson = JSON.parse(
      await fs.readFile(path.join(project, 'package.json'), 'utf-8')
    ) as {
      dependencies?: Record<string, string>;
      dependenciesMeta?: Record<string, { injected?: boolean }>;
    };
    const plateDependency = packageJson.dependencies?.platejs;

    if (!plateDependency?.startsWith('workspace:')) {
      throw new Error(
        `${name} did not install the local platejs artifact: ${plateDependency}`
      );
    }

    packageJson.dependenciesMeta = {
      ...packageJson.dependenciesMeta,
      platejs: { injected: true },
    };
    await fs.writeFile(
      path.join(project, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    await run(process.execPath, [pnpmEntrypoint, 'install'], project);

    const consumerRequire = createRequire(path.join(project, 'package.json'));
    const plateRequire = createRequire(
      consumerRequire.resolve('platejs/package.json')
    );
    const peerModules = ['react', 'react-dom'];
    if (packageJson.dependencies?.['react-dnd']) peerModules.push('react-dnd');

    for (const peer of peerModules) {
      const consumerPath = await fs.realpath(consumerRequire.resolve(peer));
      const platePath = await fs.realpath(plateRequire.resolve(peer));
      if (consumerPath !== platePath) {
        throw new Error(
          `${name} resolved separate ${peer} modules: ${consumerPath} and ${platePath}`
        );
      }
    }

    const nextConfigPath = path.join(project, 'next.config.ts');
    const nextConfig = await fs.readFile(nextConfigPath, 'utf-8');
    const configExport = 'export default nextConfig';
    if (!nextConfig.includes(configExport)) {
      throw new Error(`${name} has an unsupported Next.js config export`);
    }
    // The nested Git project cannot infer its disposable pnpm workspace root.
    await fs.writeFile(
      nextConfigPath,
      nextConfig.replace(
        configExport,
        `nextConfig.turbopack = {
  ...nextConfig.turbopack,
  root: ${JSON.stringify(await fs.realpath(workspace))},
};

${configExport}`
      )
    );

    await run(
      process.execPath,
      [pnpmEntrypoint, '--dir', project, 'build'],
      workspace,
      {
        npm_config_link_workspace_packages: 'true',
        npm_config_prefer_workspace_packages: 'true',
      }
    );

    if (testCase.item === 'editor-ai') {
      await verifyInstalledEditorCommands(project);
    }

    console.info(
      JSON.stringify({
        editorPath,
        item: testCase.item,
        commandProof: testCase.item === 'editor-ai',
        kitProofRoute:
          testCase.item === 'ai' ||
          testCase.item === 'dnd' ||
          testCase.item === 'table'
            ? '/kit-proof'
            : null,
        name,
        peerModules,
        plateDependency,
        requests: requests.length,
      })
    );
  }
} finally {
  await new Promise<void>((resolve, reject) => {
    proxy.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  if (process.env.PLATE_CREATE_KEEP_TEMP !== '1') {
    await fs.rm(workspace, { force: true, recursive: true });
  } else {
    console.info(JSON.stringify({ workspace }));
  }
}
