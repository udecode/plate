import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { healthRoutes, sessionPages } from './page-health.mjs';

const preview = (name) => `# Page\n\n<ComponentPreview name="${name}" />\n`;

const item = (name, type, meta) => ({
  files: [{ path: `examples/${name}.tsx`, type }],
  name,
  type,
  ...(meta && { meta }),
});

const files = {
  'apps/www/src/__registry__/registry-metadata.json': JSON.stringify({
    registries: {
      base: {
        items: [
          item('table', 'registry:component', { examples: ['table-demo'] }),
          item('toolbar', 'registry:component'),
          item('table-demo', 'registry:example'),
          item('widget-demo', 'registry:example'),
          item('fresh-demo', 'registry:example'),
          item('pro-iframe-demo', 'registry:example'),
        ],
      },
    },
  }),
  'apps/www/src/app/(app)/docs/[[...slug]]/page.tsx': 'export {};\n',
  'apps/www/src/app/(app)/docs/examples/html-export/page.tsx': 'export {};\n',
  'apps/www/src/app/(app)/docs/examples/server-side/page.tsx': 'export {};\n',
  'apps/www/src/app/(app)/docs/plugins/page.tsx': 'export {};\n',
  'apps/www/src/app/cn/docs/examples/html-export/page.tsx': 'export {};\n',
  'apps/www/src/app/cn/docs/examples/server-side/page.tsx': 'export {};\n',
  'apps/www/src/app/cn/docs/plugins/page.tsx': 'export {};\n',
  'apps/www/src/generated/release-index.json': JSON.stringify(
    ['v54.0.0', 'v53.1.0', 'v52.3.0'].map((tag) => ({ tag }))
  ),
  'apps/www/src/app/(app)/examples/plite/plite-example-registry.ts': [
    "export const UPSTREAM_PLITE_EXAMPLE_PATHS = ['android-tests', 'richtext'] as const;",
    "export const EXAMPLE_NAMES_AND_PATHS = [['Android Tests', 'android-tests'], ['Rich Text', 'richtext'], ['Pagination', 'pagination'], ['Secret', 'secret']] as const;",
    "export const HIDDEN_EXAMPLES = ['android-tests', 'secret'] as const;",
    '',
  ].join('\n'),
  'content/docs/back.mdx': preview('back-demo'),
  'content/docs/find.mdx': preview('find-demo'),
  'content/docs/guide.mdx': '# Guide\n',
  'content/docs/lost.mdx': preview('lost-demo'),
  'content/docs/table.cn.mdx': preview('table-demo'),
  'content/docs/table.mdx': preview('table-demo'),
};

const root = mkdtempSync(path.join(tmpdir(), 'page-health-'));
for (const [file, text] of Object.entries(files)) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), text);
}
assert.equal(spawnSync('git', ['init', '-q'], { cwd: root }).status, 0);

const stable = new Set([
  '/blocks/playground',
  '/docs/back',
  '/docs/examples/server-side',
  '/docs/examples/slate-to-html',
  '/docs/examples/widget',
  '/docs/find-replace',
  '/docs/table',
]);

test('each session page lands in one tier beside its reference page', async () => {
  const pages = await sessionPages(root, {
    stableStatus: async (page) => (stable.has(page) ? 200 : 404),
    betaOnly: new Set(['/docs/back', '/docs/examples/fresh']),
    twins: new Map([
      ['/docs/examples/html-export', '/docs/examples/slate-to-html'],
      ['/docs/find', '/docs/find-replace'],
    ]),
  });

  assert.deepEqual(
    pages.map(({ page, reference, tier }) => [tier, page, reference]),
    [
      [
        'R1',
        '/examples/plite/richtext',
        'https://www.slatejs.org/examples/richtext',
      ],
      ['R2', '/blocks/playground', 'https://platejs.org/blocks/playground'],
      [
        'R2',
        '/docs/examples/html-export',
        'https://platejs.org/docs/examples/slate-to-html',
      ],
      [
        'R2',
        '/docs/examples/server-side',
        'https://platejs.org/docs/examples/server-side',
      ],
      [
        'R2',
        '/docs/examples/widget',
        'https://platejs.org/docs/examples/widget',
      ],
      ['R2', '/docs/find', 'https://platejs.org/docs/find-replace'],
      ['R2', '/docs/table', 'https://platejs.org/docs/table'],
      ['R3', '/examples/plite/pagination', undefined],
      ['R3', '/examples/plite/secret', undefined],
      ['R4', '/docs/examples/fresh', undefined],
      ['unresolved', '/docs/back', undefined],
      ['unresolved', '/docs/lost', undefined],
    ]
  );
});

test('the health run opens component, Chinese and docs app routes, waiting for an editor only where a demo renders', async () => {
  assert.deepEqual(await healthRoutes(root), [
    { editor: true, route: '/blocks/playground' },
    { editor: true, route: '/cn/docs/examples/html-export' },
    { editor: false, route: '/cn/docs/examples/server-side' },
    { editor: false, route: '/cn/docs/plugins' },
    { editor: true, route: '/cn/docs/table' },
    { editor: true, route: '/docs/back' },
    { editor: true, route: '/docs/components/table' },
    { editor: false, route: '/docs/components/toolbar' },
    { editor: true, route: '/docs/examples/fresh' },
    { editor: true, route: '/docs/examples/html-export' },
    { editor: false, route: '/docs/examples/pro-iframe' },
    { editor: false, route: '/docs/examples/server-side' },
    { editor: true, route: '/docs/examples/table' },
    { editor: true, route: '/docs/examples/widget' },
    { editor: true, route: '/docs/find' },
    { editor: false, route: '/docs/guide' },
    { editor: true, route: '/docs/lost' },
    { editor: false, route: '/docs/plugins' },
    { editor: false, route: '/docs/releases/52' },
    { editor: true, route: '/docs/table' },
    { editor: true, route: '/examples/plite/android-tests' },
    { editor: true, route: '/examples/plite/pagination' },
    { editor: true, route: '/examples/plite/richtext' },
    { editor: true, route: '/examples/plite/secret' },
  ]);
});
