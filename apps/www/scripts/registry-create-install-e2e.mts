import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createRegistryResponse } from '../src/lib/registry-response';

const appRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const repoRoot = path.resolve(appRoot, '../..');
const shadcnOrigin = 'https://ui.shadcn.com';
const shadcnBin = path.join(appRoot, 'node_modules/.bin/shadcn');
const pnpmEntrypoint = process.env.npm_execpath;

if (!pnpmEntrypoint) {
  throw new Error('Run this gate through pnpm so it can resolve pnpm itself.');
}

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
    ) as { files?: string[] };

    await fs.mkdir(target, { recursive: true });
    await fs.copyFile(packageJsonPath, path.join(target, 'package.json'));

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
const cases = [
  { base: 'base', code: 'b0', style: 'nova' },
  { base: 'radix', code: 'b1VlIttI', style: 'luma' },
] as const;

try {
  for (const testCase of cases) {
    const name = `plate-${testCase.base}-${testCase.style}`;
    const start = plateRequests.length;

    await run(
      shadcnBin,
      [
        'create',
        '@plate/editor-basic',
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
      {
        CI: '1',
        PATH: `${binRoot}:${process.env.PATH}`,
        REGISTRY_URL: registryUrl,
        npm_config_link_workspace_packages: 'true',
        npm_config_prefer_workspace_packages: 'true',
        npm_config_user_agent: 'pnpm/10.18.3',
      }
    );

    const project = path.join(projectsRoot, name);
    const expectedPath = `/r/${testCase.base}-${testCase.style}/editor-basic.json`;
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
          'plate-editor.tsx'
        );
        await fs.access(candidate);
        return candidate;
      })
    );
    const packageJson = JSON.parse(
      await fs.readFile(path.join(project, 'package.json'), 'utf-8')
    ) as { dependencies?: Record<string, string> };
    const plateDependency = packageJson.dependencies?.platejs;

    if (!plateDependency?.startsWith('workspace:')) {
      throw new Error(
        `${name} did not install the local platejs artifact: ${plateDependency}`
      );
    }

    await run(
      process.execPath,
      [pnpmEntrypoint, '--dir', project, 'build'],
      workspace,
      {
        npm_config_link_workspace_packages: 'true',
        npm_config_prefer_workspace_packages: 'true',
      }
    );

    console.info(
      JSON.stringify({
        editorPath,
        name,
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
