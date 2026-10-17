import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'hand-drive.mjs'
);
const DEMO = 'apps/www/src/registry/examples/widget-demo.tsx';
const WIDGET = 'apps/www/src/registry/components/editor/widget.tsx';
const DOC = 'content/docs/widget.mdx';
const LOADERS =
  'apps/www/src/app/(app)/examples/plite/plite-example-loaders.tsx';
const EDITED = Date.parse('2026-01-01T00:00:00.000Z');
const SETTLE_MS = 5000;

const item = (name, type, file, extra = {}) => ({
  files: [{ path: file, type }],
  name,
  type,
  ...extra,
});

function checkout(items, docs) {
  const root = mkdtempSync(path.join(tmpdir(), 'hand-drive-'));
  const write = (file, text) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  };
  const writeAtEdit = (file, text) => {
    write(file, text);
    utimesSync(path.join(root, file), EDITED / 1000, EDITED / 1000);
  };
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf-8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  writeAtEdit(
    'apps/www/src/__registry__/registry-metadata.json',
    JSON.stringify({ registries: { base: { items } } })
  );
  for (const { path: file } of items.flatMap((each) => each.files)) {
    writeAtEdit(`apps/www/src/registry/${file}`, 'export {};\n');
  }
  for (const [file, text] of Object.entries(docs)) writeAtEdit(file, text);
  git('init', '-q');
  git('add', '-A');
  git(
    '-c',
    'user.name=t',
    '-c',
    'user.email=t@t',
    'commit',
    '-q',
    '-m',
    'base'
  );

  const dir = path.join(root, 'drive');
  const run = (args, input) =>
    spawnSync(
      process.execPath,
      [SCRIPT, ...args, '--root', root, '--dir', dir],
      {
        cwd: root,
        encoding: 'utf-8',
        input,
      }
    );
  return { dir, git, root, run, write };
}

const widgetCheckout = (docs = {}) =>
  checkout(
    [
      item('widget', 'registry:component', 'components/editor/widget.tsx', {
        meta: { docs: [{ route: '/docs/widget' }], examples: ['widget-demo'] },
      }),
      item('widget-demo', 'registry:example', 'examples/widget-demo.tsx', {
        registryDependencies: ['@plate/widget'],
      }),
    ],
    {
      [DOC]: '# Widget\n\n<ComponentPreview name="widget-demo" />\n',
      'content/docs/widget.cn.mdx':
        '# Widget\n\n<ComponentPreview name="widget-demo" />\n',
      'content/docs/(guides)/install.mdx':
        '# Install\n\n```mdx\n<ComponentPreview name="widget-demo" />\n```\n',
      ...docs,
    }
  );

const cellsOf = (stdout) =>
  stdout
    .trim()
    .split('\n')
    .map((line) => line.replace(/^\S+\s+/, ''))
    .sort();

const visit = (overrides) => ({
  at: '2026-10-13T20:00:00.000Z',
  errors: [],
  frame: false,
  path: '/docs/widget',
  rendered: EDITED + 60_000,
  theme: 'light',
  webdriver: false,
  width: 1280,
  ...overrides,
});

const writeJsonl = (file, records) => {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(
    file,
    records.map((record) => `${JSON.stringify(record)}\n`).join('')
  );
};

test('scope asks for every English page that shows an example, at desktop width', () => {
  const { run } = widgetCheckout();
  const result = run(['scope', DEMO]);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(cellsOf(result.stdout), [
    '/blocks/widget-demo desktop',
    '/docs/components/widget desktop',
    '/docs/examples/widget desktop',
    '/docs/widget desktop',
  ]);
});

test('check covers a docs route that names a section with a visit to its page', () => {
  const { dir, run } = checkout(
    [
      item('widget', 'registry:component', 'components/editor/widget.tsx', {
        meta: { docs: [{ route: '/docs/widget#usage' }] },
      }),
    ],
    { [DOC]: '# Widget\n' }
  );
  writeJsonl(path.join(dir, 'visits.jsonl'), [
    visit({}),
    visit({ path: '/docs/components/widget' }),
  ]);
  const result = run(['check', WIDGET]);

  assert.equal(result.status, 0, result.stdout);
});

test('scope gives a component its own demo page, however many pages show it', () => {
  const { run } = checkout(
    [
      item('widget', 'registry:component', 'components/editor/widget.tsx', {
        meta: { docs: [{ route: '/docs/widget' }], examples: ['widget-demo'] },
      }),
      ...['widget', 'a', 'b', 'c', 'd', 'e', 'f', 'g'].map((name) =>
        item(`${name}-demo`, 'registry:example', `examples/${name}-demo.tsx`, {
          registryDependencies: ['@plate/widget'],
        })
      ),
    ],
    { [DOC]: '# Widget\n\n<ComponentPreview name="widget-demo" />\n' }
  );
  const cells = cellsOf(run(['scope', WIDGET]).stdout);

  assert.ok(cells.includes('/blocks/widget-demo desktop'), cells.join('\n'));
});

const sharedCheckout = (shared) =>
  checkout(
    [
      shared,
      ...['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((name) =>
        item(`${name}-demo`, 'registry:example', `examples/${name}-demo.tsx`, {
          registryDependencies: [`@plate/${shared.name}`],
        })
      ),
    ],
    {}
  );

test('scope asks a file shared by more than six pages for screenshots on its own pages and a load check on the rest', () => {
  const { run } = sharedCheckout(
    item('shared', 'registry:ui', 'components/ui/shared.tsx', {
      meta: { docs: [{ route: '/docs/shared' }] },
    })
  );
  const result = run([
    'scope',
    'apps/www/src/registry/components/ui/shared.tsx',
  ]);

  assert.deepEqual(cellsOf(result.stdout), [
    '/blocks/a-demo load',
    '/blocks/b-demo load',
    '/blocks/c-demo load',
    '/blocks/d-demo load',
    '/blocks/e-demo load',
    '/blocks/f-demo load',
    '/blocks/g-demo load',
    '/docs/shared desktop',
  ]);
});

test('check keeps an error the agent saw on a load cell over a later clean webdriver visit', () => {
  const { dir, run } = sharedCheckout(
    item('shared', 'registry:ui', 'components/ui/shared.tsx', {
      meta: { docs: [{ route: '/docs/shared' }] },
    })
  );
  writeJsonl(path.join(dir, 'visits.jsonl'), [
    visit({ errors: ['boom'], path: '/blocks/a-demo', sent: EDITED + 61_000 }),
    visit({ path: '/blocks/a-demo', sent: EDITED + 62_000, webdriver: true }),
  ]);
  const line = run(['check', 'apps/www/src/registry/components/ui/shared.tsx'])
    .stdout.split('\n')
    .find((each) => each.includes('/blocks/a-demo load'));

  assert.match(line, /^error .*boom/);
});

test('check meets a load cell the agent never drove with a clean webdriver visit', () => {
  const { dir, run } = sharedCheckout(
    item('shared', 'registry:ui', 'components/ui/shared.tsx', {
      meta: { docs: [{ route: '/docs/shared' }] },
    })
  );
  writeJsonl(path.join(dir, 'visits.jsonl'), [
    visit({ path: '/blocks/a-demo', sent: EDITED + 62_000, webdriver: true }),
  ]);
  const line = run(['check', 'apps/www/src/registry/components/ui/shared.tsx'])
    .stdout.split('\n')
    .find((each) => each.includes('/blocks/a-demo load'));

  assert.match(line, /^covered /);
});

test('scope asks a file with no page of its own for screenshots of one page that shows it', () => {
  const { run } = sharedCheckout(
    item('use-shared', 'registry:hook', 'hooks/use-shared.ts')
  );
  const cells = cellsOf(
    run(['scope', 'apps/www/src/registry/hooks/use-shared.ts']).stdout
  );

  assert.ok(cells.includes('/blocks/a-demo desktop'), cells.join('\n'));
});

const pliteLoader = (name) => ({
  [LOADERS]: `export const loaders = {\n  '${name}': createPliteExampleLoader(() => import('@/registry/examples/${name}')),\n};\n`,
});

test('scope adds the Plite example page of a registry demo the Plite loaders import', () => {
  const { run } = widgetCheckout(pliteLoader('widget-demo'));

  assert.ok(
    cellsOf(run(['scope', DEMO]).stdout).includes(
      '/examples/plite/widget-demo desktop'
    )
  );
});

test('scope adds the Plite example page of a demo when the component it shows changes', () => {
  const { run } = widgetCheckout(pliteLoader('widget-demo'));

  assert.ok(
    cellsOf(run(['scope', WIDGET]).stdout).includes(
      '/examples/plite/widget-demo desktop'
    )
  );
});

test('scope asks for Chinese pages only when the changed file is Chinese', () => {
  const { run } = checkout(
    [
      item('widget-demo', 'registry:example', 'examples/widget-demo.tsx', {
        files: [
          { path: 'examples/widget-demo.tsx', type: 'registry:example' },
          {
            path: 'examples/values/widget-value.tsx',
            type: 'registry:example',
          },
          {
            path: 'examples/values/cn/widget-value.tsx',
            type: 'registry:example',
          },
        ],
        meta: { docs: [{ route: '/docs/widget' }] },
      }),
    ],
    {
      [DOC]: '# Widget\n',
      'content/docs/(guides)/install.mdx': '# Install\n',
      'content/docs/widget.cn.mdx': '# Widget\n',
    }
  );

  assert.deepEqual(
    [
      'content/docs/(guides)/install.mdx',
      'content/docs/widget.cn.mdx',
      'apps/www/src/registry/examples/values/cn/widget-value.tsx',
    ].map((file) => cellsOf(run(['scope', file]).stdout)),
    [
      ['/docs/install desktop'],
      ['/cn/docs/widget desktop'],
      ['/cn/docs/examples/widget desktop', '/cn/docs/widget desktop'],
    ]
  );
});

const unmappedOf = (stdout) =>
  stdout
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('  ')[0]);

test('scope reports a browser-visible file no source maps instead of dropping it', () => {
  const { run } = widgetCheckout();

  assert.deepEqual(
    unmappedOf(
      run(['scope', 'content/docs/meta.json', 'apps/www/next.config.ts']).stdout
    ),
    ['unmapped content/docs/meta.json', 'unmapped apps/www/next.config.ts']
  );
});

test('scope reports a deleted docs page as unmapped instead of asking for its old route', () => {
  const { root, run } = widgetCheckout();
  rmSync(path.join(root, DOC));

  assert.deepEqual(unmappedOf(run(['scope', DOC]).stdout), [`unmapped ${DOC}`]);
});

test('scope leaves out files that render nothing, and keeps registry build scripts, env files and package code', () => {
  const { run } = widgetCheckout();
  const files = [
    'apps/www/scripts/build-registry.mts',
    'apps/www/README.md',
    'apps/www/playwright.config.ts',
    'apps/www/.gitignore',
    'apps/www/.env.local',
    'config/plite-test-jsx.js',
    'packages/core/src/notes.txt',
    'packages/core/src/index.ts',
  ];

  assert.deepEqual(unmappedOf(run(['scope', ...files]).stdout), [
    'unmapped apps/www/scripts/build-registry.mts',
    'unmapped apps/www/.env.local',
    'unmapped packages/core/src/index.ts',
  ]);
});

test('a route record stops applying once its file changes', () => {
  const { run, write } = widgetCheckout({
    'apps/www/src/app/layout.tsx': 'export {};\n',
  });
  run([
    'route',
    'apps/www/src/app/layout.tsx',
    '--none',
    'adds a dev-only beacon',
  ]);
  const before = run(['scope', 'apps/www/src/app/layout.tsx']).stdout;
  write('apps/www/src/app/layout.tsx', 'export const visible = true;\n');
  const after = run(['scope', 'apps/www/src/app/layout.tsx']).stdout;

  assert.deepEqual(
    [before.trim(), after.trim().split('  ')[0]],
    ['', 'unmapped apps/www/src/app/layout.tsx']
  );
});

function visitedWidget(...visits) {
  const fixture = widgetCheckout();
  writeJsonl(path.join(fixture.dir, 'visits.jsonl'), visits.map(visit));
  const cell = (stdout, key = '/docs/widget desktop') =>
    stdout
      .split('\n')
      .find((line) => line.replace(/^\S+\s+/, '').startsWith(key));
  return { ...fixture, cell };
}

test('check calls a visit stale once any file its cell covers changes after it', () => {
  const { cell, run, write } = visitedWidget({});
  const before = cell(run(['check', DEMO, DOC]).stdout);
  write(DOC, '# Widget, edited\n\n<ComponentPreview name="widget-demo" />\n');
  const after = cell(run(['check', DEMO, DOC]).stdout);

  assert.deepEqual(
    [before.split(' ')[0], after.split(' ')[0]],
    ['covered', 'stale']
  );
});

test('check counts a page only once it rendered 5 s after the last edit to its files', () => {
  const states = [SETTLE_MS - 1, SETTLE_MS].map((age) => {
    const { cell, run } = visitedWidget({ rendered: EDITED + age });
    return cell(run(['check', DOC]).stdout).split(' ')[0];
  });

  assert.deepEqual(states, ['stale', 'covered']);
});

test('check does not count a visit with no render time, however late it arrived', () => {
  const { cell, run } = visitedWidget({
    at: new Date(EDITED + 60_000).toISOString(),
    rendered: undefined,
  });

  assert.match(cell(run(['check', DOC]).stdout), /^stale .*has no render time/);
});

test('check reports an error from a page with no render time that arrived after the last edit, over an earlier clean visit', () => {
  const { cell, run } = visitedWidget(
    { sent: 1000 },
    {
      at: new Date(EDITED + 60_000).toISOString(),
      errors: ['the server answered 500'],
      rendered: undefined,
      sent: 2000,
    }
  );

  assert.match(
    cell(run(['check', DOC]).stdout),
    /^error .*the server answered 500/
  );
});

test('check ignores an error from a page with no render time that arrived before the last edit', () => {
  const { cell, run } = visitedWidget({
    at: new Date(EDITED - 1000).toISOString(),
    errors: ['boom'],
    rendered: undefined,
  });

  assert.match(cell(run(['check', DOC]).stdout), /^stale .*has no render time/);
});

test('check covers a deleted page its route record maps once the page rendered 5 s after that record', () => {
  const states = [EDITED + 60_000, Date.now() + 60_000].map((rendered) => {
    const { cell, root, run } = visitedWidget({ rendered });
    rmSync(path.join(root, DOC));
    run(['route', DOC, '/docs/widget']);
    return cell(run(['check', DOC]).stdout).split(' ')[0];
  });

  assert.deepEqual(states, ['stale', 'covered']);
});

test('check does not count a webdriver visit as a hand drive', () => {
  const { cell, run } = visitedWidget({ webdriver: true });

  assert.match(
    cell(run(['check', DOC]).stdout),
    /^open .*only a webdriver visit/
  );
});

test('check does not count a page shown inside a frame, such as a block preview, as a visit to that page', () => {
  const { cell, run } = visitedWidget({
    frame: true,
    path: '/blocks/widget-demo',
  });

  assert.match(
    cell(run(['check', DEMO]).stdout, '/blocks/widget-demo desktop'),
    /^open /
  );
});

test('check covers a page only from a light visit at desktop width', () => {
  const states = [{ theme: 'dark' }, { width: 375 }, {}].map((overrides) => {
    const { cell, run } = visitedWidget(overrides);
    return cell(run(['check', DOC]).stdout).split(' ')[0];
  });

  assert.deepEqual(states, ['open', 'open', 'covered']);
});

test('check reports the error the page showed', () => {
  const { cell, run } = visitedWidget({}, { errors: ['page not found'] });

  assert.match(cell(run(['check', DOC]).stdout), /^error .*page not found/);
});

test('check orders visits by when the page sent them, so an older clean visit that arrives late does not hide an error', () => {
  const { cell, run } = visitedWidget(
    { errors: ['page not found'], sent: 2000 },
    { sent: 1000 }
  );

  assert.match(cell(run(['check', DOC]).stdout), /^error /);
});

test('check lets an error visit win a tie with a clean visit sent the same millisecond', () => {
  const { cell, run } = visitedWidget(
    { errors: ['boom'], sent: 2000 },
    { sent: 2000 }
  );

  assert.match(cell(run(['check', DOC]).stdout), /^error .*boom/);
});

const stop = (fixture, transcript, input = {}) => {
  const transcriptPath = path.join(fixture.root, 'transcript.jsonl');
  writeFileSync(
    transcriptPath,
    transcript.map((line) => JSON.stringify(line)).join('\n')
  );
  return fixture.run(
    ['--hook'],
    JSON.stringify({
      stop_hook_active: false,
      transcript_path: transcriptPath,
      ...input,
    })
  );
};

const claudeEdit = (root, file) => ({
  message: {
    content: [
      {
        input: { file_path: path.join(root, file) },
        name: 'Edit',
        type: 'tool_use',
      },
    ],
    role: 'assistant',
  },
  type: 'assistant',
});

const codexFileChange = (file, change, status = 'completed') => ({
  payload: {
    completed_at_ms: 1_791_828_390_307,
    item: {
      changes: { [file]: change },
      id: 'exec-106678b3-207e-454d-91d3-a43a1742ff3f',
      status,
      stderr: '',
      stdout: 'Success. Updated the following files:\n',
      type: 'FileChange',
    },
    started_at_ms: 1_791_828_390_307,
    thread_id: '01a13149-9cf2-7622-83d3-40cdb70fb04c',
    turn_id: '01a1314a-9e17-7863-8a3d-74e2575efc34',
    type: 'item_completed',
  },
  timestamp: '2026-10-12T18:06:30.307Z',
  type: 'event_msg',
});

const codexPatchCall = (patch) => ({
  payload: {
    input: `text(await tools.apply_patch(${JSON.stringify(patch)}))`,
    name: 'exec',
    type: 'custom_tool_call',
  },
  type: 'response_item',
});

const ownerSays = (text) => ({
  message: { content: text, role: 'user' },
  type: 'user',
});

test('the stop hook blocks a Claude Code session that edited a page nobody drove', () => {
  const fixture = widgetCheckout();
  const result = stop(fixture, [claudeEdit(fixture.root, DOC)]);

  assert.equal(JSON.parse(result.stdout).decision, 'block');
});

test('the stop hook blocks a Codex session whose applied patch changed a page nobody drove', () => {
  const fixture = widgetCheckout();
  const file = path.join(fixture.root, DOC);
  const result = stop(fixture, [
    codexPatchCall(`*** Begin Patch\n*** Update File: ${file}\n*** End Patch`),
    codexFileChange(file, {
      type: 'update',
      unified_diff: '@@ -1 +1 @@\n-# Widget\n+# Widgets\n',
    }),
  ]);

  assert.equal(JSON.parse(result.stdout).decision, 'block');
});

test('the stop hook blocks a Codex session that moved a file onto a docs page', () => {
  const fixture = widgetCheckout();
  const result = stop(fixture, [
    codexFileChange(path.join(fixture.root, 'notes.txt'), {
      move_path: path.join(fixture.root, DOC),
      type: 'update',
      unified_diff: '',
    }),
  ]);

  assert.equal(JSON.parse(result.stdout).decision, 'block');
});

test('the stop hook blocks a Codex session that deleted a docs page', () => {
  const fixture = widgetCheckout();
  const file = path.join(fixture.root, DOC);
  rmSync(file);
  const result = stop(fixture, [
    codexFileChange(file, { content: '# Widget\n', type: 'delete' }),
  ]);

  assert.equal(JSON.parse(result.stdout).decision, 'block');
});

test('the stop hook ignores a Codex patch that failed and a patch the owner only quoted', () => {
  const fixture = widgetCheckout();
  const file = path.join(fixture.root, DOC);
  const result = stop(fixture, [
    ownerSays(`what does this do?\n*** Update File: ${DOC}`),
    codexFileChange(file, { type: 'update', unified_diff: '' }, 'failed'),
  ]);

  assert.equal(result.stdout, '');
});

test('the stop hook lets the stop through after a block, while background work runs, or for edits before the owner says skip drive', async (t) => {
  const fixture = widgetCheckout();
  const edit = claudeEdit(fixture.root, DOC);
  const cases = {
    'after a block': [[edit], { stop_hook_active: true }, ''],
    'background work': [[edit], { background_tasks: [{ id: 'b1' }] }, ''],
    'skip drive': [[edit, ownerSays('skip drive, docs only')], {}, ''],
    'an edit after skip drive': [[ownerSays('skip drive'), edit], {}, 'block'],
  };
  for (const [name, [transcript, input, decision]] of Object.entries(cases)) {
    await t.test(name, () => {
      const { stdout } = stop(fixture, transcript, input);
      assert.equal(stdout && JSON.parse(stdout).decision, decision);
    });
  }
});
