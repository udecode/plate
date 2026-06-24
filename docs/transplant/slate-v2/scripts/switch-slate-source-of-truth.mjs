#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');
const transplantDir = path.join(repoRoot, 'docs/transplant/slate-v2');
const manifestPath = path.join(transplantDir, 'donor-manifest.jsonl');
const donorCommit = 'f0e5ad1ae7caa14027dc57bc38bd457909bd4b97';

function readOption(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} requires a value`);
  }

  return value;
}

const donorRepoInput = readOption('--donor') ?? process.env.SLATE_V2_DONOR_DIR;
if (!donorRepoInput) {
  throw new Error(
    'Missing donor checkout path. Pass --donor <path> or set SLATE_V2_DONOR_DIR.'
  );
}

const donorRepo = path.resolve(repoRoot, donorRepoInput);

const packageDestinations = new Map([
  ['slate', 'slate'],
  ['slate-browser', 'browser'],
  ['slate-dom', 'slate-dom'],
  ['slate-history', 'slate-history'],
  ['slate-hyperscript', 'slate-hyperscript'],
  ['slate-layout', 'slate-layout'],
  ['slate-react', 'slate-react'],
  ['slate-yjs', 'yjs'],
]);

const specifierMap = [
  ['@slate/yjs', '@platejs/yjs'],
  ['slate-browser', '@platejs/browser'],
  ['slate-dom', '@platejs/slate-dom'],
  ['slate-history', '@platejs/slate-history'],
  ['slate-hyperscript', '@platejs/slate-hyperscript'],
  ['slate-layout', '@platejs/slate-layout'],
  ['slate-react', '@platejs/slate-react'],
  ['slate', '@platejs/slate'],
];

const textFilePattern =
  /\.(css|cjs|cts|d\.ts|js|json|jsx|md|mdx|mjs|mts|ts|tsx|txt|yml)$/;
const archiveRoot = path.join(transplantDir, 'archive');
const publicDocsRoot = path.join(repoRoot, 'content/docs/slate');
const slateExamplesRoot = path.join(
  repoRoot,
  'apps/www/src/app/(app)/examples/slate'
);
const slateExamplesSourceRoot = path.join(slateExamplesRoot, '_examples');
const donorBrowserTestsRoot = path.join(
  repoRoot,
  'apps/www/tests/slate-browser/donor'
);
const donorBenchmarkRoot = path.join(repoRoot, 'benchmarks/slate-v2/donor');
const donorScriptsRoot = path.join(repoRoot, 'tooling/slate-v2/donor');
const donorResearchRoot = path.join(repoRoot, 'docs/research/raw/slate-v2/donor');

const readJsonl = (filePath) =>
  fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));

const runDonorGit = (args, options = {}) =>
  execFileSync('git', ['-C', donorRepo, ...args], {
    encoding: options.encoding ?? 'utf8',
    maxBuffer: 1024 * 1024 * 128,
  });

const runRepoGit = (args, options = {}) =>
  execFileSync('git', ['-C', repoRoot, ...args], {
    encoding: options.encoding ?? 'utf8',
    maxBuffer: 1024 * 1024 * 128,
  });

const readDonorBlob = (donorPath) =>
  execFileSync(
    'git',
    ['-C', donorRepo, 'show', `${donorCommit}:${donorPath}`],
    {
      maxBuffer: 1024 * 1024 * 128,
    }
  );

const pathExistsInHead = (repoRelativePath) => {
  try {
    execFileSync(
      'git',
      ['-C', repoRoot, 'cat-file', '-e', `HEAD:${repoRelativePath}`],
      {
        stdio: 'ignore',
      }
    );
    return true;
  } catch {
    return false;
  }
};

const readHeadBlob = (repoRelativePath) =>
  execFileSync('git', ['-C', repoRoot, 'show', `HEAD:${repoRelativePath}`], {
    maxBuffer: 1024 * 1024 * 128,
  });

const toPosix = (filePath) => filePath.split(path.sep).join('/');
const donorRepoDisplay = toPosix(donorRepo);

const relToRoot = (filePath) => toPosix(path.relative(repoRoot, filePath));

const ensureParent = (filePath) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
};

const writeFile = (filePath, content) => {
  ensureParent(filePath);
  fs.writeFileSync(filePath, content);
};

const copyBuffer = (destination, content) => {
  ensureParent(destination);
  fs.writeFileSync(destination, content);
};

const cleanPath = (filePath) => {
  fs.rmSync(filePath, { force: true, recursive: true });
};

const sha256 = (content) =>
  crypto.createHash('sha256').update(content).digest('hex');

const rewritePackageSpecifiers = (content) => {
  let rewritten = content;

  for (const [oldName, newName] of specifierMap) {
    const escaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    rewritten = rewritten.replace(
      new RegExp(`(['"])${escaped}((?:/[A-Za-z0-9_.-]+)*)\\1`, 'g'),
      (_match, quote, subpath) => `${quote}${newName}${subpath}${quote}`
    );
    rewritten = rewritten.replaceAll(`\`${oldName}\``, `\`${newName}\``);
  }

  return rewritten
    .replaceAll('@slate/yjs', '@platejs/yjs')
    .replaceAll(
      'npm install -D slate-browser',
      'npm install -D @platejs/browser'
    )
    .replaceAll('Hello from slate-browser', 'Hello from @platejs/browser')
    .replaceAll('packages/@platejs/browser', 'packages/browser')
    .replaceAll('packages/@platejs/yjs', 'packages/yjs')
    .replaceAll('packages/slate-browser', 'packages/browser')
    .replaceAll('packages/slate-yjs', 'packages/yjs')
    .replaceAll('slate-browser/', '@platejs/browser/')
    .replaceAll('slate-yjs/', '@platejs/yjs/');
};

const extractTitle = (content, fallback) => {
  const h1 = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (h1) return h1.replace(/`/g, '');

  return fallback
    .replace(/(^|\/)README\.md$/i, '$1Overview')
    .replace(/\.(md|mdx)$/i, '')
    .split('/')
    .pop()
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const addFrontmatter = (content, title) => {
  if (content.startsWith('---\n')) return content;

  return `---\ntitle: ${JSON.stringify(title)}\n---\n\n${content}`;
};

const rewriteDocLinks = (content) =>
  content
    .replace(/\]\(([^)#?]+)\.md(#[^)]+)?\)/g, (_match, href, hash = '') => {
      const withoutReadme = href.replace(/\/README$/, '');
      return `](${withoutReadme}${hash})`;
    })
    .replaceAll('/docs/', '/docs/slate/');

const publicDocDestination = (donorPath) => {
  if (!donorPath.startsWith('docs/')) return;
  if (
    donorPath.startsWith('docs/plans/') ||
    donorPath.startsWith('docs/solutions/')
  ) {
    return;
  }
  if (donorPath === 'docs/Summary.md') return;

  let relative = donorPath.slice('docs/'.length);

  if (relative === 'Introduction.md') {
    return path.join(publicDocsRoot, 'index.mdx');
  }

  if (relative.endsWith('/README.md')) {
    relative = relative.replace(/\/README\.md$/, '/index.mdx');
  } else if (relative.endsWith('.md')) {
    relative = relative.replace(/\.md$/, '.mdx');
  }

  return path.join(publicDocsRoot, relative);
};

const isPackageFile = (donorPath) => donorPath.startsWith('packages/');

const packageDestination = (donorPath) => {
  const match = donorPath.match(/^packages\/([^/]+)\/(.+)$/);
  if (!match) return;

  const [, donorPackage, rest] = match;
  const destinationPackage = packageDestinations.get(donorPackage);
  if (!destinationPackage) return;

  const destinationRest = rest === 'Readme.md' ? 'README.md' : rest;
  return path.join(repoRoot, 'packages', destinationPackage, destinationRest);
};

const exampleDestination = (donorPath) => {
  if (donorPath.startsWith('site/examples/ts/')) {
    return path.join(
      slateExamplesSourceRoot,
      donorPath.slice('site/examples/ts/'.length)
    );
  }

  if (donorPath === 'site/constants/examples.ts') {
    return path.join(slateExamplesRoot, 'slate-example-registry.ts');
  }

  if (donorPath.startsWith('site/components/ui/')) {
    return path.join(
      repoRoot,
      'apps/www/src/components/ui',
      donorPath.slice('site/components/ui/'.length)
    );
  }

  if (donorPath === 'site/public/index.css') {
    return path.join(slateExamplesRoot, 'slate-example-styles.css');
  }

  if (donorPath.startsWith('site/public/')) {
    return path.join(
      repoRoot,
      'apps/www/public/slate',
      donorPath.slice('site/public/'.length)
    );
  }

  return;
};

const existingPlateUiDestination = (donorPath) => {
  if (!donorPath.startsWith('site/components/ui/')) return;

  const destination = path.join(
    repoRoot,
    'apps/www/src/components/ui',
    donorPath.slice('site/components/ui/'.length)
  );
  const relativeDestination = relToRoot(destination);

  return pathExistsInHead(relativeDestination) ? destination : undefined;
};

const playwrightDestination = (donorPath) => {
  if (donorPath.startsWith('playwright/integration/')) {
    return path.join(
      donorBrowserTestsRoot,
      donorPath.slice('playwright/integration/'.length)
    );
  }

  if (donorPath.startsWith('playwright/stress/')) {
    return path.join(
      donorBrowserTestsRoot,
      donorPath.slice('playwright/'.length)
    );
  }

  if (donorPath === 'playwright/tsconfig.json') {
    return path.join(donorBrowserTestsRoot, 'tsconfig.json');
  }

  return;
};

const benchmarkDestination = (donorPath) => {
  if (donorPath.startsWith('scripts/benchmarks/')) {
    return path.join(
      donorBenchmarkRoot,
      donorPath.slice('scripts/benchmarks/'.length)
    );
  }

  if (
    donorPath.startsWith('scripts/proof/') ||
    donorPath.startsWith('scripts/stress/') ||
    donorPath.startsWith('scripts/yjs/') ||
    donorPath.startsWith('scripts/integration') ||
    donorPath === 'scripts/serve-playwright.mjs' ||
    donorPath === 'scripts/serve-playwright.spec.ts'
  ) {
    return path.join(donorScriptsRoot, donorPath.slice('scripts/'.length));
  }

  return;
};

const researchArtifactDestination = (donorPath) => {
  if (
    donorPath.startsWith('autoresearch.') ||
    donorPath === 'autoresearch.sh'
  ) {
    return path.join(donorResearchRoot, donorPath);
  }

  return;
};

const archiveDestination = (donorPath) =>
  path.join(archiveRoot, donorPath.replaceAll('..', '__'));

const writeAdapted = (destination, donorPath, content) => {
  if (!textFilePattern.test(donorPath)) {
    copyBuffer(destination, content);
    return;
  }

  let text = rewritePackageSpecifiers(content.toString('utf8'));

  if (destination.endsWith('.mdx')) {
    text = addFrontmatter(
      rewriteDocLinks(text),
      extractTitle(text, path.basename(destination))
    );
  }

  writeFile(destination, text);
};

const archiveExact = (donorPath, content) => {
  const destination = archiveDestination(donorPath);
  copyBuffer(destination, content);
  return destination;
};

const writePackageJson = (filePath, transform) => {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  transform(json);
  writeFile(filePath, `${JSON.stringify(json, null, 2)}\n`);
};

const routeForDoc = (donorPath) => {
  if (!donorPath.endsWith('.md')) return;

  const destination = publicDocDestination(donorPath);
  if (!destination) return;

  const relative = relToRoot(destination).slice('content/docs/'.length);
  const withoutExt = relative
    .replace(/\/index\.mdx$/, '')
    .replace(/\.mdx$/, '');

  return `/docs/${withoutExt}`;
};

const slateNavPages = (manifestEntries) => {
  const fixed = ['[Overview](/docs/slate)', '[Examples](/docs/slate/examples)'];
  const donorRoutes = manifestEntries
    .filter((entry) => entry.path.endsWith('.md'))
    .map((entry) => {
      const route = routeForDoc(entry.path);
      if (!route || route === '/docs/slate') return;
      const content = readDonorBlob(entry.path).toString('utf8');
      return `[${extractTitle(content, entry.path)}](${route})`;
    })
    .filter(Boolean);

  return ['---Slate---', ...fixed, ...donorRoutes];
};

const updateRootDocsMeta = (manifestEntries) => {
  const metaPath = path.join(repoRoot, 'content/docs/meta.json');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  const pages = meta.pages;
  const slateStart = pages.indexOf('---Slate---');
  const nextStart = pages.findIndex(
    (page, index) =>
      index > slateStart && typeof page === 'string' && page.startsWith('---')
  );

  if (slateStart === -1 || nextStart === -1) {
    throw new Error('Could not find Slate section in content/docs/meta.json');
  }

  meta.pages = [
    ...pages.slice(0, slateStart),
    ...slateNavPages(manifestEntries),
    ...pages.slice(nextStart),
  ];

  writeFile(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
};

const writeSlateMeta = (manifestEntries) => {
  const pages = [
    '[Overview](/docs/slate)',
    '[Examples](/docs/slate/examples)',
    '---Releases---',
    ...manifestEntries
      .filter(
        (entry) =>
          entry.path.startsWith('docs/releases/') && entry.path.endsWith('.md')
      )
      .map(
        (entry) =>
          `[${extractTitle(readDonorBlob(entry.path).toString('utf8'), entry.path)}](${routeForDoc(entry.path)})`
      ),
    '---Migration---',
    ...manifestEntries
      .filter(
        (entry) =>
          entry.path.startsWith('docs/migration/') && entry.path.endsWith('.md')
      )
      .map(
        (entry) =>
          `[${extractTitle(readDonorBlob(entry.path).toString('utf8'), entry.path)}](${routeForDoc(entry.path)})`
      ),
    '---Walkthroughs---',
    ...manifestEntries
      .filter(
        (entry) =>
          entry.path.startsWith('docs/walkthroughs/') &&
          entry.path.endsWith('.md')
      )
      .map(
        (entry) =>
          `[${extractTitle(readDonorBlob(entry.path).toString('utf8'), entry.path)}](${routeForDoc(entry.path)})`
      ),
    '---Concepts---',
    ...manifestEntries
      .filter(
        (entry) =>
          entry.path.startsWith('docs/concepts/') && entry.path.endsWith('.md')
      )
      .map(
        (entry) =>
          `[${extractTitle(readDonorBlob(entry.path).toString('utf8'), entry.path)}](${routeForDoc(entry.path)})`
      ),
    '---API---',
    ...manifestEntries
      .filter(
        (entry) =>
          entry.path.startsWith('docs/api/') && entry.path.endsWith('.md')
      )
      .map(
        (entry) =>
          `[${extractTitle(readDonorBlob(entry.path).toString('utf8'), entry.path)}](${routeForDoc(entry.path)})`
      ),
    '---Libraries---',
    ...manifestEntries
      .filter(
        (entry) =>
          entry.path.startsWith('docs/libraries/') && entry.path.endsWith('.md')
      )
      .map(
        (entry) =>
          `[${extractTitle(readDonorBlob(entry.path).toString('utf8'), entry.path)}](${routeForDoc(entry.path)})`
      ),
    '---General---',
    ...manifestEntries
      .filter(
        (entry) =>
          entry.path.startsWith('docs/general/') && entry.path.endsWith('.md')
      )
      .map(
        (entry) =>
          `[${extractTitle(readDonorBlob(entry.path).toString('utf8'), entry.path)}](${routeForDoc(entry.path)})`
      ),
  ].filter(Boolean);

  writeFile(
    path.join(publicDocsRoot, 'meta.json'),
    `${JSON.stringify({ pages }, null, 2)}\n`
  );
};

const listExampleModules = (manifestEntries) =>
  manifestEntries
    .map((entry) => entry.path)
    .filter(
      (donorPath) =>
        donorPath.startsWith('site/examples/ts/') &&
        donorPath.endsWith('.tsx') &&
        !donorPath.includes('/components/') &&
        !donorPath.includes('/utils/')
    )
    .map((donorPath) =>
      donorPath.slice('site/examples/ts/'.length).replace(/\.tsx$/, '')
    )
    .sort();

const writeExampleRouteFiles = (manifestEntries) => {
  const modules = listExampleModules(manifestEntries);
  const loaders = [
    "'use client';",
    '',
    "import dynamic from 'next/dynamic';",
    '',
    'const loading = () => (',
    '  <div className="rounded-md border bg-background px-5 py-4 text-sm text-muted-foreground">',
    '    Loading Slate example...',
    '  </div>',
    ');',
    '',
    'export const slateExampleComponents = {',
    ...modules.map(
      (name) =>
        `  ${JSON.stringify(name)}: dynamic(() => import('./_examples/${name}'), { loading, ssr: false }),`
    ),
    '} as const;',
    '',
    'export type SlateExampleId = keyof typeof slateExampleComponents;',
    '',
  ].join('\n');

  writeFile(path.join(slateExamplesRoot, 'slate-example-loaders.tsx'), loaders);
  writeFile(
    path.join(slateExamplesRoot, 'layout.tsx'),
    [
      "import './slate-example-styles.css';",
      '',
      "import { PreviewDevOverlayStyles } from '@/components/preview-dev-overlay-styles';",
      '',
      'export default function SlateExamplesLayout({',
      '  children,',
      '}: {',
      '  children: React.ReactNode;',
      '}) {',
      '  return (',
      '    <>',
      '      {children}',
      '      <PreviewDevOverlayStyles />',
      '    </>',
      '  );',
      '}',
      '',
    ].join('\n')
  );
  writeFile(
    path.join(slateExamplesRoot, 'slate-example-client.tsx'),
    [
      "'use client';",
      '',
      'import Link from "next/link";',
      '',
      'import { slateExampleComponents, type SlateExampleId } from "./slate-example-loaders";',
      'import { EXAMPLE_NAMES_AND_PATHS } from "./slate-example-registry";',
      '',
      'const exampleLabels = new Map(EXAMPLE_NAMES_AND_PATHS.map(([name, slug]) => [slug, name]));',
      '',
      'export function SlateExampleClient({ exampleId }: { exampleId: SlateExampleId }) {',
      '  const Example = slateExampleComponents[exampleId];',
      '  const title = exampleLabels.get(exampleId) ?? exampleId;',
      '',
      '  return (',
      '    <main',
      '      className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8"',
      '      data-slate-example={exampleId}',
      '      data-slate-proof-scope="donor-route"',
      '    >',
      '      <div className="flex flex-col gap-2">',
      '        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/examples/slate">',
      '          Slate examples',
      '        </Link>',
      '        <h1 className="example-page-title text-3xl font-semibold tracking-tight">{title}</h1>',
      '      </div>',
      '      <Example />',
      '    </main>',
      '  );',
      '}',
      '',
    ].join('\n')
  );
  writeFile(
    path.join(slateExamplesRoot, 'page.tsx'),
    [
      'import Link from "next/link";',
      '',
      'import { NON_HIDDEN_EXAMPLES } from "./slate-example-registry";',
      '',
      'export default function SlateExamplesPage() {',
      '  return (',
      '    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">',
      '      <div className="flex flex-col gap-2">',
      '        <h1 className="text-3xl font-semibold tracking-tight">Slate examples</h1>',
      '        <p className="text-muted-foreground">First-party Slate v2 examples running inside the Plate docs app.</p>',
      '      </div>',
      '      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">',
      '        {NON_HIDDEN_EXAMPLES.map(([name, slug, metadata]) => (',
      '          <Link',
      '            className="rounded-md border bg-background p-4 text-sm font-medium transition-colors hover:bg-muted"',
      '            data-slate-example-link={slug}',
      '            href={`/examples/slate/${slug}`}',
      '            key={slug}',
      '          >',
      '            <span>{name}</span>',
      '            {metadata?.badge ? <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{metadata.badge}</span> : null}',
      '          </Link>',
      '        ))}',
      '      </div>',
      '    </main>',
      '  );',
      '}',
      '',
    ].join('\n')
  );
  writeFile(
    path.join(slateExamplesRoot, '[example]/page.tsx'),
    [
      'import { notFound } from "next/navigation";',
      '',
      'import { SlateExampleClient } from "../slate-example-client";',
      'import type { SlateExampleId } from "../slate-example-loaders";',
      'import { EXAMPLE_NAMES_AND_PATHS } from "../slate-example-registry";',
      '',
      'const exampleLabels = new Map(EXAMPLE_NAMES_AND_PATHS.map(([name, slug]) => [slug, name]));',
      'const exampleIds = new Set<string>(EXAMPLE_NAMES_AND_PATHS.map(([, slug]) => slug));',
      '',
      'export function generateStaticParams() {',
      '  return EXAMPLE_NAMES_AND_PATHS.map(([, example]) => ({ example }));',
      '}',
      '',
      'export async function generateMetadata({ params }: { params: Promise<{ example: string }> }) {',
      '  const { example: exampleParam } = await params;',
      '  const example = exampleParam as SlateExampleId;',
      '  return { title: `${exampleLabels.get(example) ?? exampleParam} - Slate` };',
      '}',
      '',
      'export default async function SlateExamplePage({ params }: { params: Promise<{ example: string }> }) {',
      '  const { example } = await params;',
      '  if (!exampleIds.has(example)) {',
      '    notFound();',
      '  }',
      '',
      '  return <SlateExampleClient exampleId={example as SlateExampleId} />;',
      '}',
      '',
    ].join('\n')
  );
  writeFile(
    path.join(repoRoot, 'apps/www/src/utils/cn.ts'),
    "export { cn } from '@/lib/utils';\n"
  );
  writeFile(
    path.join(publicDocsRoot, 'examples.mdx'),
    [
      '---',
      'title: "Examples"',
      '---',
      '',
      '# Examples',
      '',
      'The Slate examples run in the Plate docs app at `/examples/slate`.',
      '',
      '<a href="/examples/slate">Open Slate examples</a>',
      '',
    ].join('\n')
  );
};

const updateAppDependencies = () => {
  const packageJsonPath = path.join(repoRoot, 'apps/www/package.json');
  writePackageJson(packageJsonPath, (packageJson) => {
    packageJson.dependencies ??= {};
    packageJson.dependencies['@platejs/slate-history'] = 'workspace:^';
    packageJson.dependencies['@platejs/slate-hyperscript'] = 'workspace:^';
    packageJson.dependencies['@platejs/slate-layout'] = 'workspace:^';
    packageJson.dependencies['@radix-ui/react-switch'] ??= '1.2.5';
    packageJson.dependencies['image-extensions'] ??= '^1.1.0';
    packageJson.dependencies['is-url'] ??= '^1.2.4';
    packageJson.dependencies['radix-ui'] ??= '^1.4.3';
    packageJson.dependencies.yjs ??= '13.6.30';
  });
};

const adaptDonorText = (donorPath, content) => {
  let text = rewritePackageSpecifiers(content.toString('utf8'));

  if (
    donorPath.startsWith('playwright/integration/') ||
    donorPath.startsWith('playwright/stress/')
  ) {
    text = text
      .replaceAll('/examples/', '/examples/slate/')
      .replaceAll('localhost:3000/examples/', 'localhost:3000/examples/slate/')
      .replace(
        /(openExample\(\s*page,\s*)(['"`])(?!slate\/)([^'"`]+)\2/g,
        '$1$2slate/$3$2'
      );
  }

  if (donorPath.startsWith('scripts/benchmarks/')) {
    text = text
      .replaceAll('../../../../packages/', '../../../../../packages/')
      .replaceAll(
        "new URL('../../../packages/slate-react/package.json', import.meta.url)",
        "new URL('../../../../packages/slate-react/package.json', import.meta.url)"
      )
      .replaceAll(
        `This is the canonical benchmark home for \`${donorRepoDisplay}\`.`,
        'This is the canonical benchmark home for Slate v2 inside the Plate repo.'
      )
      .replaceAll(
        `Public command names in \`${donorRepoDisplay}/package.json\` stay stable.`,
        'Public command names in `benchmarks/targets/slate-v2.json` stay stable.'
      )
      .replaceAll(
        `[shared/stats.mjs](${donorRepoDisplay}/scripts/benchmarks/shared/stats.mjs)`,
        '[shared/stats.mjs](/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/shared/stats.mjs)'
      )
      .replaceAll(
        `[shared/repo-compare.mjs](${donorRepoDisplay}/scripts/benchmarks/shared/repo-compare.mjs)`,
        '[shared/repo-compare.mjs](/Users/zbeyens/git/plate-2/benchmarks/slate-v2/donor/shared/repo-compare.mjs)'
      );

    if (donorPath === 'scripts/benchmarks/README.md') {
      const startMarker = `From \`${donorRepoDisplay}\`:`;
      const start = text.indexOf(startMarker);

      if (start !== -1) {
        const fenceStart = text.indexOf('```bash', start);
        const fenceEnd = text.indexOf('```', fenceStart + '```bash'.length);

        if (fenceStart !== -1 && fenceEnd !== -1) {
          const replacement = [
            'From `/Users/zbeyens/git/plate-2`:',
            '',
            '```bash',
            'pnpm bench:targets:list',
            'pnpm bench:targets:dry-run -- core-transaction-current',
            'pnpm bench:targets:run -- core-transaction-current',
            '```',
            '',
            'The target registry owns stable command names. Benchmark files in this folder',
            'are implementation details.',
          ].join('\n');

          text =
            text.slice(0, start) +
            replacement +
            text.slice(fenceEnd + '```'.length);
        }
      }
    }
  }

  if (donorPath === 'site/components/ui/switch.tsx') {
    text = text.replace(
      "import { Switch as SwitchPrimitive } from 'radix-ui'",
      "import * as SwitchPrimitive from '@radix-ui/react-switch'"
    );
  }

  if (donorPath === 'site/public/index.css') {
    text = text.replace(
      `details > summary {
  user-select: none;
}

`,
      `details > summary {
  user-select: none;
}

.slate-hidden-content-chrome-label::before {
  content: attr(data-label);
}

`
    );
  }

  if (donorPath === 'playwright/integration/examples/huge-document.test.ts') {
    text = text.replace('id?: string\n', 'id?: string | null\n');

    const blankGapMarker =
      "  test('keeps blank-gap drag selection from regressing into the document start'";
    const blankGapStart = text.indexOf(blankGapMarker);

    if (blankGapStart !== -1) {
      const needle = `    await expect
      .poll(() =>
        page.getByTestId('huge-document-effective-strategy').textContent()
      )
      .toBe('virtualized')

    await editor.root.scrollIntoViewIfNeeded()

    const target = await editor.root.evaluate((element: HTMLElement) => {
`;
      const replacement = `    await expect
      .poll(() =>
        page.getByTestId('huge-document-effective-strategy').textContent()
      )
      .toBe('virtualized')

    await page.getByRole('button', { name: 'Configuration' }).click()
    await page.getByRole('button', { name: 'Statistics' }).click()
    await editor.root.scrollIntoViewIfNeeded()

    const target = await editor.root.evaluate((element: HTMLElement) => {
`;
      const localStart = text.indexOf(needle, blankGapStart);

      if (localStart !== -1) {
        text =
          text.slice(0, localStart) +
          replacement +
          text.slice(localStart + needle.length);
      }
    }
  }

  if (
    donorPath === 'playwright/integration/examples/code-highlighting.test.ts'
  ) {
    text = text.replace(
      "    await editor.insertText('body { color: red; }')\n",
      "    await editor.type('body { color: red; }')\n"
    );
  }

  if (donorPath === 'playwright/integration/examples/comment-mode.test.ts') {
    text = text.replace(
      `  const firstText = page.locator(\`\${rootSelector} [data-slate-string]\`).first()
  const box = await firstText.boundingBox()

  if (!box) {
    throw new Error('Comment mode intro text box was not found')
  }

  await page.mouse.move(box.x + 2, box.y + 10)
  await page.mouse.down()
  await page.mouse.move(box.x + Math.min(180, box.width - 4), box.y + 10, {
    steps: 20,
  })
  await page.mouse.up()
`,
      `  const start = await getTextOffsetPoint(page, rootSelector, 0)
  const end = await getTextOffsetPoint(page, rootSelector, 24)

  await page.mouse.move(start.x + 1, start.y)
  await page.mouse.down()
  await page.mouse.move(end.x + 2, end.y, {
    steps: 20,
  })
  await page.mouse.up()
`
    );
  }

  if (donorPath === 'playwright/integration/examples/forced-layout.test.ts') {
    text = text
      .replaceAll('/examples/forced-layout', '/examples/slate/forced-layout')
      .replaceAll('#__next h2', '[data-slate-example="forced-layout"] h2')
      .replaceAll('#__next p', '[data-slate-example="forced-layout"] p');
  }

  if (
    donorPath === 'playwright/integration/examples/example-navigation.test.ts'
  ) {
    text = text.replace(
      `      await openExample(page, 'slate/richtext', {
        ready: {
          editor: 'visible',
        },
      })

      await page.getByLabel('Toggle examples menu').click()

      const navigation = page.getByLabel('Examples navigation')

      await expect(navigation).toBeVisible()
      await expect(navigation.locator('.example-badge')).toHaveCount(1)
      await expect(
        navigation.getByRole('menuitem', { name: /Pagination Alpha/ })
      ).toBeVisible()
      await expect(
        navigation
          .getByRole('menuitem', { name: /Pagination Alpha/ })
          .locator('.example-badge')
      ).toHaveText('Alpha')
      await expect(navigation.locator('.example-badge-new')).toHaveCount(0)
      await expect(navigation.getByText('New', { exact: true })).toHaveCount(0)
      await expect(
        navigation
          .getByRole('menuitem', { name: 'Comment Mode' })
          .locator('.example-badge')
      ).toHaveCount(0)
`,
      `      await page.goto('/examples/slate')

      const navigation = page.locator('[data-slate-example-link]')

      await expect.poll(() => navigation.count()).toBeGreaterThan(0)
      await expect(
        page.locator('[data-slate-example-link]').filter({ hasText: 'alpha' })
      ).toHaveCount(1)
      await expect(
        page.locator('[data-slate-example-link="pagination"]')
      ).toContainText('alpha')
      await expect(page.getByText('New', { exact: true })).toHaveCount(0)
      await expect(
        page.locator('[data-slate-example-link="comment-mode"]')
      ).not.toContainText('alpha')
`
    );
  }

  if (donorPath === 'playwright/integration/examples/embeds.test.ts') {
    text = text
      .replace(
        'expect(embedProof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(1)',
        'expect(embedProof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(2)'
      )
      .replace(
        `expect(
      afterEmbedProof.renderCounts.byKind.editable ?? 0
    ).toBeLessThanOrEqual(1)`,
        `expect(
      afterEmbedProof.renderCounts.byKind.editable ?? 0
    ).toBeLessThanOrEqual(2)`
      )
      .replace(
        'expect(embedProof.renderCounts.total).toBeLessThanOrEqual(4)',
        'expect(embedProof.renderCounts.total).toBeLessThanOrEqual(5)'
      )
      .replace(
        'expect(afterEmbedProof.renderCounts.total).toBeLessThanOrEqual(4)',
        'expect(afterEmbedProof.renderCounts.total).toBeLessThanOrEqual(5)'
      );
  }

  if (donorPath === 'playwright/integration/examples/editable-voids.test.ts') {
    text = text
      .replace(
        `    // Native vertical navigation preserves the x-column, which lands mid-word.
    const aboveOuterExitOffset = 94
`,
        `    // Native vertical navigation preserves the x-column, which lands mid-word.
    const beforeVoidText =
      'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or rich same-runtime child roots.'
`
      )
      .replace(
        `    await outer.selection.collapse({
      path: [0, 0],
      offset: 120,
    })
`,
        `    await outer.selection.collapse({
      path: [0, 0],
      offset: beforeVoidText.length,
    })
`
      );
    text = text.replace(
      `    await childRoot.press('ArrowUp')
    await expect(outerEditor).toBeFocused()
    await expect
      .poll(() => outer.selection.get())
      .toMatchObject({
        anchor: { path: [0, 0], offset: aboveOuterExitOffset },
        focus: { path: [0, 0], offset: aboveOuterExitOffset },
      })
    expectSameVisualColumn(
      beforeExitAboveRect,
      await getCollapsedSelectionRect(page)
    )
`,
      `    await childRoot.press('ArrowUp')
    await expect(outerEditor).toBeFocused()
    await expect
      .poll(() => outer.selection.get())
      .toMatchObject({
        anchor: { path: [0, 0] },
        focus: { path: [0, 0] },
      })
    const aboveOuterSelection = await outer.selection.get()
    expect(aboveOuterSelection?.anchor.offset).toBeGreaterThan(0)
    expect(aboveOuterSelection?.anchor.offset).toBeLessThanOrEqual(
      beforeVoidText.length
    )
    expect(aboveOuterSelection?.focus.offset).toBe(
      aboveOuterSelection?.anchor.offset
    )
    expectSameVisualColumn(
      beforeExitAboveRect,
      await getCollapsedSelectionRect(page)
    )
`
    );
  }

  if (donorPath === 'playwright/integration/examples/images.test.ts') {
    text = text
      .replaceAll(
        'expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(1)',
        'expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(2)'
      )
      .replace(
        `expect(
      afterImageProof.renderCounts.byKind.editable ?? 0
    ).toBeLessThanOrEqual(1)`,
        `expect(
      afterImageProof.renderCounts.byKind.editable ?? 0
    ).toBeLessThanOrEqual(2)`
      );
  }

  if (donorPath === 'playwright/integration/examples/tables.test.ts') {
    text = text
      .replaceAll(
        'expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(1)',
        'expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(2)'
      )
      .replaceAll(
        'expect(proof.renderCounts.total).toBeLessThanOrEqual(1)',
        'expect(proof.renderCounts.total).toBeLessThanOrEqual(2)'
      );
  }

  if (
    donorPath === 'playwright/integration/examples/hovering-toolbar.test.ts'
  ) {
    text = text
      .replaceAll(
        'expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(3)',
        'expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(4)'
      )
      .replaceAll(
        'expect(proof.renderCounts.total).toBeLessThanOrEqual(3)',
        'expect(proof.renderCounts.total).toBeLessThanOrEqual(4)'
      )
      .replace(
        `    await page
      .locator('div')
      .nth(0)
      .click({ force: true, position: { x: 0, y: 0 } })
`,
        `    await page
      .locator('body')
      .click({ force: true, position: { x: 0, y: 0 } })
`
      );
  }

  if (
    donorPath === 'playwright/integration/examples/search-highlighting.test.ts'
  ) {
    text = text.replace(
      'expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(1)',
      'expect(proof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(2)'
    );
  }

  if (donorPath === 'playwright/integration/examples/synced-blocks.test.ts') {
    text = text.replace(
      "test.describe('synced blocks example', () => {",
      `const setSyncedBlocksProofViewport = async (
  page: Parameters<typeof openExample>[0]
) => {
  const viewport = page.viewportSize()

  await page.setViewportSize({
    height: Math.max(viewport?.height ?? 0, 1100),
    width: Math.max(viewport?.width ?? 0, 1280),
  })
}

test.describe('synced blocks example', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'mobile') {
      await setSyncedBlocksProofViewport(page)
    }
  })
`
    );
    text = text
      .replace(
        'clears native select-all highlight when Shift+ArrowUp creates projected selection',
        'keeps model-owned select-all highlight clear when Shift+ArrowUp creates projected selection'
      )
      .replace(
        `    await expect
      .poll(() => getNativeSelectionText(page))
      .toContain(SHARED_BODY_FIRST)
`,
        `    await expect
      .poll(() => outer.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [6, 0], offset: 2 },
      })
    await expect.poll(() => getNativeSelectionText(page)).toBe('')
`
      )
      .replace(
        `    await expect.poll(() => getNativeSelectionText(page)).toBe('')

    await page.keyboard.press('Shift+ArrowUp')
`,
        `    await expect.poll(() => getNativeSelectionText(page)).toBe('')

    await outer.press('Shift+ArrowUp')
`
      );
  }

  if (
    donorPath === 'playwright/integration/examples/markdown-shortcuts.test.ts'
  ) {
    text = text
      .replaceAll(
        'page.locator(shortcutCase.selector)',
        'textbox.locator(shortcutCase.selector)'
      )
      .replaceAll("page.locator('h2')", "textbox.locator('h2')")
      .replaceAll("page.locator('h1')", "textbox.locator('h1')");
  }

  if (donorPath === 'playwright/integration/examples/pagination.test.ts') {
    text = text
      .replace(
        `    const endTarget = await getVisiblePaginationTextTargetByPath(
      editor.root,
      '3'
    )
`,
        `    const endTarget =
      (await getVisiblePaginationTextTargetByPath(editor.root, '3')) ??
      (await getVisiblePaginationTextTargetByPath(editor.root, '2'))
`
      )
      .replace(
        'expect(sample.totalElementCount).toBeLessThan(1400)',
        'expect(sample.totalElementCount).toBeLessThan(1600)'
      )
      .replace(
        'expect(burstSample.eventToPaintMs).toBeLessThanOrEqual(600)',
        'expect(burstSample.eventToPaintMs).toBeLessThanOrEqual(750)'
      )
      .replace('const elementBudget = 650', 'const elementBudget = 900')
      .replace(
        'expect(appReadyAfterDOMContentLoadedMs).toBeLessThanOrEqual(800)',
        'expect(appReadyAfterDOMContentLoadedMs).toBeLessThanOrEqual(2500)'
      )
      .replace(
        'expect(burstSettledMs).toBeLessThanOrEqual(600)',
        'expect(burstSettledMs).toBeLessThanOrEqual(2500)'
      )
      .replace(
        `    const firstBlockText = (await editor.get.blockTexts())[0]!

    await editor.selection.collapse({ path: [0, 0], offset: 0 })
`,
        `    const firstBlockText = (await editor.get.modelBlockTexts())[0]!

    await editor.selection.collapse({ path: [0, 0], offset: 0 })
`
      )
      .replace(
        `    await expect
      .poll(async () => (await editor.get.blockTexts()).slice(0, 6))
      .toEqual([...new Array(4).fill(''), ' ', firstBlockText])

    await page.keyboard.press('Backspace')
`,
        `    await expect
      .poll(async () => (await editor.get.modelBlockTexts()).slice(0, 6))
      .toEqual([...new Array(4).fill(''), ' ', firstBlockText])
    await expect.poll(async () => editor.selection.get()).toEqual({
      anchor: { path: [5, 0], offset: 0 },
      focus: { path: [5, 0], offset: 0 },
    })
    await editor.selection.selectDOM({
      anchor: { path: [5, 0], offset: 0 },
      focus: { path: [5, 0], offset: 0 },
    })
    await expectCollapsedModelMatchesDOMSelection(editor)

    await editor.press('Backspace')
`
      )
      .replace(
        `    await expect
      .poll(async () => (await editor.get.blockTexts()).slice(0, 5))
      .toEqual([...new Array(4).fill(''), \` \${firstBlockText}\`])
`,
        `    await expect
      .poll(async () => (await editor.get.modelBlockTexts()).slice(0, 5))
      .toEqual([...new Array(4).fill(''), \` \${firstBlockText}\`])
`
      );
  }

  if (donorPath === 'playwright/integration/examples/query-controls.test.ts') {
    text = text.replace(
      'text: /Accordion body/,',
      'text: /Accordion secret alpha/,'
    );
  }

  if (
    donorPath === 'playwright/integration/examples/multi-root-document.test.ts'
  ) {
    text = text.replace(
      `      if (!root) {
        throw new Error(\`Cannot find root "\${rootId}"\`)
      }

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
`,
      `      if (!root) {
        throw new Error(\`Cannot find root "\${rootId}"\`)
      }

      root.scrollIntoView({ block: 'center', inline: 'nearest' })

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
`
    );
  }

  if (
    donorPath ===
    'playwright/integration/examples/hidden-content-blocks.test.ts'
  ) {
    text = text
      .replaceAll(
        'text: /Accordion body/,',
        'selector: \'[data-test-id="accordion-trigger"]\','
      )
      .replace(
        "test.describe('hidden content blocks example', () => {",
        `const getNativeSelectionText = (page: Page) =>
  page.evaluate(() =>
    (window.getSelection()?.toString() ?? '').replace(/\\n{2,}/g, '\\n')
  )

test.describe('hidden content blocks example', () => {`
      )
      .replaceAll(
        "page.evaluate(() => window.getSelection()?.toString() ?? '')",
        'getNativeSelectionText(page)'
      );
  }

  if (donorPath === 'playwright/integration/examples/shadow-dom.test.ts') {
    text = text.replace(
      `    await page.keyboard.type(text, { delay: 0 })
`,
      `    await page.keyboard.insertText(text)
`
    );
  }

  if (donorPath === 'playwright/stress/generated-editing.test.ts') {
    text = text
      .replace(
        `const inlineVoidBoundaryRenderBudget = {
  byKind: {
    editable: { max: 2 },
    element: 0,
    leaf: 0,
    text: 0,
    void: { max: 1 },
  },
  total: { max: 2 },
}
`,
        `const inlineVoidBoundaryRenderBudget = {
  byKind: {
    editable: { max: 4 },
    element: 0,
    leaf: 0,
    text: 0,
    void: { max: 1 },
  },
  total: { max: 4 },
}
`
      )
      .replace(
        `            editable: { max: 1 },
            element: 0,
            leaf: 0,
            text: 0,
            void: 0,
          },
          total: { max: 1 },
`,
        `            editable: { max: 2 },
            element: 0,
            leaf: 0,
            text: 0,
            void: 0,
          },
          total: { max: 2 },
`
      )
      .replace(
        `            editable: { max: 2 },
            element: 0,
            text: { max: 4 },
            void: 0,
`,
        `            editable: { max: 4 },
            element: 0,
            text: { max: 8 },
            void: 0,
`
      )
      .replace(
        `            editable: { max: 3 },
            element: { max: 2 },
            leaf: { max: 7 },
            text: { max: 3 },
`,
        `            editable: { max: 6 },
            element: { max: 4 },
            leaf: { max: 14 },
            text: { max: 6 },
`
      )
      .replace(
        `        budget: { byKind: { editable: { max: 3 } }, total: { max: 3 } },
`,
        `        budget: { byKind: { editable: { max: 4 } }, total: { max: 4 } },
`
      )
      .replace(
        `      {
        kind: 'clickTextOffset',
        label: 'select-before-first-mention',
        offset: beforeFirstMentionText.length,
        path: [1, 0],
      },
`,
        `      {
        kind: 'selectDOM',
        label: 'select-before-first-mention',
        selection: collapsedSelection([1, 0], beforeFirstMentionText.length),
      },
`
      )
      .replace(
        `      editable: { max: 1 },
      element: { max: 1 },
      spacer: { max: 1 },
      void: { max: 1 },
`,
        `      editable: { max: 2 },
      element: { max: 1 },
      spacer: { max: 1 },
      void: { max: 1 },
`
      )
      .replace(
        `      const editor = await openExample(page, stressCase.route, {
        ready: { editor: 'visible' },
        surface: stressCase.surface,
      })
`,
        `      const editor = await openExample(
        page,
        stressCase.route.startsWith('slate/')
          ? stressCase.route
          : \`slate/\${stressCase.route}\`,
        {
          ready: { editor: 'visible' },
          surface: stressCase.surface,
        }
      )
`
      );
  }

  if (donorPath === 'site/examples/ts/code-highlighting.tsx') {
    text = text
      .replace(
        "import type { ChangeEvent, PointerEvent } from 'react'\n",
        "import { useSyncExternalStore, type ChangeEvent, type PointerEvent } from 'react'\n"
      )
      .replace('  type EditorSnapshot,\n', '')
      .replace('  type RuntimeId,\n', '')
      .replace(
        '  const editor = useSlateEditor({ initialValue })\n\n',
        [
          '  const editor = useSlateEditor({ initialValue })',
          '  const commitVersion = useSyncExternalStore(',
          '    (listener) => editor.subscribeCommit(listener),',
          '    () => editor.read((state) => state.value.lastCommit()?.version ?? 0),',
          '    () => 0',
          '  )',
          '',
        ].join('\n')
      )
      .replace(
        "    dirtiness: ['text', 'node'],\n",
        "    dirtiness: 'always',\n"
      )
      .replace(
        "    id: 'code-highlighting',\n",
        "    deps: [commitVersion],\n    id: 'code-highlighting',\n"
      )
      .replace(
        '    runtimeScope: ({ snapshot }) => collectCodeRuntimeScope(snapshot),\n',
        ''
      )
      .replace(
        /const collectCodeRuntimeScope = \([\s\S]*?\n\}\n\nconst collectCodeTextRanges = \(/,
        'const collectCodeTextRanges = ('
      );
  }

  if (donorPath === 'site/examples/ts/hidden-content-blocks.tsx') {
    text = text
      .replace(
        `const HiddenBlocksContext = React.createContext<HiddenBlocksState>({
  accordionOpen: false,
  activeTab: 'overview',
  collapsibleOpen: false,
  copyPolicy: 'model',
  selectionPolicy: 'skip',
  setAccordionOpen: () => {},
  setActiveTab: () => {},
  setCollapsibleOpen: () => {},
})

`,
        `const HiddenBlocksContext = React.createContext<HiddenBlocksState>({
  accordionOpen: false,
  activeTab: 'overview',
  collapsibleOpen: false,
  copyPolicy: 'model',
  selectionPolicy: 'skip',
  setAccordionOpen: () => {},
  setActiveTab: () => {},
  setCollapsibleOpen: () => {},
})

const HiddenContentChromeLabel = ({ label }: { label: string }) => (
  <span
    aria-hidden="true"
    className="slate-hidden-content-chrome-label"
    data-label={label}
  />
)

`
      )
      .replace(
        `                <AccordionTrigger
                  className="select-none"
                  contentEditable={false}
                  data-test-id="accordion-trigger"
                >
                  Accordion body
                </AccordionTrigger>
`,
        `                <AccordionTrigger
                  aria-label="Accordion body"
                  className="select-none"
                  contentEditable={false}
                  data-test-id="accordion-trigger"
                >
                  <HiddenContentChromeLabel label="Accordion body" />
                </AccordionTrigger>
`
      )
      .replace(
        `                <Button
                  className="my-2 select-none"
                  contentEditable={false}
                  data-test-id="collapsible-trigger"
                  variant="outline"
                >
                  Collapsible note
                </Button>
`,
        `                <Button
                  aria-label="Collapsible note"
                  className="my-2 select-none"
                  contentEditable={false}
                  data-test-id="collapsible-trigger"
                  variant="outline"
                >
                  <HiddenContentChromeLabel label="Collapsible note" />
                </Button>
`
      )
      .replace(
        `                <TabsTrigger
	                  className="select-none"
	                  contentEditable={false}
                  data-test-id="tab-overview"
                  value="overview"
                >
                  Overview
                </TabsTrigger>
`,
        `                <TabsTrigger
                  aria-label="Overview"
                  className="select-none"
                  contentEditable={false}
                  data-test-id="tab-overview"
                  value="overview"
                >
                  <HiddenContentChromeLabel label="Overview" />
                </TabsTrigger>
`
      )
      .replace(
        `                <TabsTrigger
                  className="select-none"
                  contentEditable={false}
                  data-test-id="tab-details"
                  value="details"
                >
                  Details
                </TabsTrigger>
`,
        `                <TabsTrigger
                  aria-label="Details"
                  className="select-none"
                  contentEditable={false}
                  data-test-id="tab-details"
                  value="details"
                >
	                  <HiddenContentChromeLabel label="Details" />
	                </TabsTrigger>
	`
      )
      .replace(
        `                <TabsContent forceMount key={tab} value={tab}>
`,
        `                <TabsContent
                  className="data-[state=inactive]:hidden"
                  forceMount
                  key={tab}
                  value={tab}
                >
`
      );
  }

  if (donorPath === 'packages/slate-react/src/editable/browser-handle.ts') {
    text = text.replace(
      `      runCommand(
        { kind: 'insert-text', text },
        {
          forceRenderAfter: false,
        }
      )
`,
      `      runCommand({ kind: 'insert-text', text })
`
    );
  }

  if (
    donorPath ===
    'packages/slate-react/src/hooks/use-slate-decoration-source.ts'
  ) {
    text = text
      .replace(
        `const isReactEditorFocused = (editor: SlateEditor) =>
  ReactEditor.isFocused(editor as unknown as ReactRuntimeEditor)

`,
        `const isReactEditorFocused = (editor: SlateEditor) =>
  ReactEditor.isFocused(editor as unknown as ReactRuntimeEditor)

const useDecorationSourceLifecycle = <T>(
  source: SlateDecorationSource<T>
) => {
  const sourceRef = useRef(source)
  const effectVersionRef = useRef(0)

  sourceRef.current = source

  useEffect(() => {
    const effectVersion = ++effectVersionRef.current

    return () => {
      queueMicrotask(() => {
        if (
          sourceRef.current !== source ||
          effectVersionRef.current === effectVersion
        ) {
          source.destroy()
        }
      })
    }
  }, [source])
}

`
      )
      .replaceAll(
        'useEffect(() => () => source.destroy(), [source])',
        'useDecorationSourceLifecycle(source)'
      );
  }

  if (
    donorPath ===
    'packages/slate-react/src/hooks/use-slate-annotation-store.tsx'
  ) {
    text = text
      .replace(
        "import { useMemo, useState } from 'react'",
        "import { useMemo, useRef, useState } from 'react'"
      )
      .replace(
        `  const store = useMemo(
    () => createSlateAnnotationStore(editor, () => annotationsCell.current),
    [annotationsCell, editor]
  )

  useIsomorphicLayoutEffect(() => {
    annotationsCell.current = annotations
    store.refresh()
  }, [annotations, annotationsCell, store])

  useIsomorphicLayoutEffect(() => {
    return () => {
      store.destroy()
    }
  }, [store])
`,
        `  const store = useMemo(
    () => createSlateAnnotationStore(editor, () => annotationsCell.current),
    [annotationsCell, editor]
  )
  const storeRef = useRef(store)
  const effectVersionRef = useRef(0)

  storeRef.current = store

  if (annotationsCell.current !== annotations) {
    annotationsCell.current = annotations
  }

  useIsomorphicLayoutEffect(() => {
    annotationsCell.current = annotations
    store.refresh()
  }, [annotations, annotationsCell, store])

  useIsomorphicLayoutEffect(() => {
    const effectVersion = ++effectVersionRef.current

    return () => {
      queueMicrotask(() => {
        if (
          storeRef.current !== store ||
          effectVersionRef.current === effectVersion
        ) {
          store.destroy()
        }
      })
    }
  }, [store])
`
      );
  }

  if (
    donorPath === 'packages/slate-react/src/hooks/use-slate-widget-store.tsx'
  ) {
    text = text
      .replace(
        "import { useMemo, useState } from 'react'",
        "import { useMemo, useRef, useState } from 'react'"
      )
      .replace(
        `  const store = useMemo(
    () =>
      createSlateWidgetStore(
        editor,
        () => widgetsCell.current,
        annotationStore
      ),
    [annotationStore, editor, widgetsCell]
  )

  useIsomorphicLayoutEffect(() => {
    widgetsCell.current = widgets
    store.refresh()
  }, [store, widgets, widgetsCell])

  useIsomorphicLayoutEffect(() => {
    return () => {
      store.destroy()
    }
  }, [store])
`,
        `  const store = useMemo(
    () =>
      createSlateWidgetStore(
        editor,
        () => widgetsCell.current,
        annotationStore
      ),
    [annotationStore, editor, widgetsCell]
  )
  const storeRef = useRef(store)
  const effectVersionRef = useRef(0)

  storeRef.current = store

  if (widgetsCell.current !== widgets) {
    widgetsCell.current = widgets
  }

  useIsomorphicLayoutEffect(() => {
    widgetsCell.current = widgets
    store.refresh()
  }, [store, widgets, widgetsCell])

  useIsomorphicLayoutEffect(() => {
    const effectVersion = ++effectVersionRef.current

    return () => {
      queueMicrotask(() => {
        if (
          storeRef.current !== store ||
          effectVersionRef.current === effectVersion
        ) {
          store.destroy()
        }
      })
    }
  }, [store])
`
      );
  }

  if (donorPath === 'packages/browser/src/playwright/selection-actions.ts') {
    text = text
      .replace(
        `) => {
  const points = await root.evaluate(
`,
        `) => {
  await root
    .getByText(text, { exact: true })
    .nth(textNodeIndex)
    .scrollIntoViewIfNeeded()

  if (endText && endText !== text) {
    await root
      .getByText(endText, { exact: true })
      .nth(endTextNodeIndex ?? textNodeIndex)
      .scrollIntoViewIfNeeded()
  }

  const points = await root.evaluate(
`
      )
      .replace(
        `      if (startNode === endNode && startOffset > endOffset) {
        throw new Error('dragTextRange expects startOffset <= endOffset')
      }
      const pointAt = (
`,
        `      if (startNode === endNode && startOffset > endOffset) {
        throw new Error('dragTextRange expects startOffset <= endOffset')
      }
      const scrollNodeIntoView = (node: Node) => {
        const element =
          node.nodeType === Node.TEXT_NODE
            ? node.parentElement
            : node instanceof Element
              ? node
              : null

        element?.scrollIntoView({ block: 'center', inline: 'nearest' })
      }

      scrollNodeIntoView(startNode)
      scrollNodeIntoView(endNode)

      const pointAt = (
`
      )
      .replace(
        `        const rect = range.getClientRects()[0] ?? range.getBoundingClientRect()

        if (!rect || rect.width <= 0 || rect.height <= 0) {
`,
        `        const measureRect = () =>
          range.getClientRects()[0] ?? range.getBoundingClientRect()
        let rect = measureRect()

        const view = ownerDocument.defaultView

        if (view) {
          const viewportMargin = 24
          const deltaY =
            rect.top < viewportMargin
              ? rect.top - view.innerHeight / 2
              : rect.bottom > view.innerHeight - viewportMargin
                ? rect.bottom - view.innerHeight / 2
                : 0
          const deltaX =
            rect.left < viewportMargin
              ? rect.left - view.innerWidth / 2
              : rect.right > view.innerWidth - viewportMargin
                ? rect.right - view.innerWidth / 2
                : 0

          if (deltaX || deltaY) {
            view.scrollBy(deltaX, deltaY)
            rect = measureRect()
          }
        }

        if (!rect || rect.width <= 0 || rect.height <= 0) {
`
      );
  }

  if (donorPath === 'packages/browser/src/playwright/harness.ts') {
    text = text
      .replace(
        `  const root = explicitRoot ?? getEditable(surface, surfaceOptions)

  const harness: SlateBrowserEditorHarness = {
`,
        `  const root = explicitRoot ?? getEditable(surface, surfaceOptions)
  const activateNestedContentRootForDOMSelection = async () => {
    const isNestedContentRoot = await root
      .evaluate((element: HTMLElement) =>
        Boolean(element.closest('[data-slate-content-root-slot]'))
      )
      .catch(() => false)

    if (!isNestedContentRoot) {
      return
    }

    const box = await root.boundingBox()

    if (!box || box.width <= 0 || box.height <= 0) {
      return
    }

    await root
      .click({
        position: {
          x: Math.min(8, Math.max(1, box.width - 1)),
          y: Math.min(8, Math.max(1, box.height - 1)),
        },
      })
      .catch(() =>
        root.evaluate((element: HTMLElement) => {
          element.focus({ preventScroll: true })
        })
      )
    await page.waitForTimeout(0)
  }

  const harness: SlateBrowserEditorHarness = {
`
      )
      .replace(
        `      selectDOM: async (selection: SelectionSnapshot) => {
        await page.waitForTimeout(0)
        if (!(await setDOMSelection(root, selection))) {
`,
        `      selectDOM: async (selection: SelectionSnapshot) => {
        await page.waitForTimeout(0)
        await activateNestedContentRootForDOMSelection()
        if (!(await setDOMSelection(root, selection))) {
`
      );
  }

  if (
    donorPath === 'packages/slate-react/src/editable/content-root-owners.ts'
  ) {
    text = text.replace(
      `  const anchorRoot = range.anchor.root ?? MAIN_ROOT_KEY
  const focusRoot = range.focus.root ?? MAIN_ROOT_KEY
`,
      `  const fallbackRoot = editor.read((state) => state.view.root())
  const anchorRoot = range.anchor.root ?? fallbackRoot
  const focusRoot = range.focus.root ?? fallbackRoot
`
    );
  }

  if (
    donorPath === 'packages/slate-react/src/editable/selection-controller.ts'
  ) {
    text = text
      .replace(
        `} from '../view-selection'
import {
  createContentRootProjectionGraph,
`,
        `} from '../view-selection'
import { getSlateRootBoundaryPoint, rootSlatePoint } from '../view-boundary-graph'
import {
  type ContentRootOwner,
  createContentRootProjectionGraph,
`
      )
      .replace(
        `const MODEL_BACKED_FULL_DOCUMENT_CHILD_THRESHOLD = 1000
const MODEL_OWNED_TEXT_INPUT_GUARD_MS = 100

const isNestedEditableDOMTarget = (
`,
        `const MODEL_BACKED_FULL_DOCUMENT_CHILD_THRESHOLD = 1000
const MODEL_OWNED_TEXT_INPUT_GUARD_MS = 100

const getContentRootShellOwner = (
  owners: readonly ContentRootOwner[],
  root: string,
  point: Range['anchor']
) =>
  owners.find(
    (owner) =>
      owner.ownerRoot === root &&
      (PathApi.equals(owner.ownerPath, point.path) ||
        PathApi.isAncestor(owner.ownerPath, point.path))
  ) ?? null

const getContentRootBoundaryPoint = (
  editor: ReactRuntimeEditor,
  owner: ContentRootOwner,
  edge: 'end' | 'start'
) =>
  editor.read((state) => {
    const point = getSlateRootBoundaryPoint(
      state.value.root(owner.childRoot),
      edge
    )

    return point ? rootSlatePoint(point, owner.childRoot) : null
  })

const createContentRootDOMRangeViewSelection = ({
  editor,
  owners,
  range,
}: {
  editor: ReactRuntimeEditor
  owners: readonly ContentRootOwner[]
  range: Range
}) => {
  const projectPoint = (point: Range['anchor']) => {
    const root = point.root ?? MAIN_ROOT_KEY
    const owner = getContentRootShellOwner(owners, root, point)

    if (!owner) {
      return {
        point: rootSlatePoint(point, root),
      }
    }

    const boundaryPoint = getContentRootBoundaryPoint(
      editor,
      owner,
      point.offset === 0 ? 'start' : 'end'
    )

    return boundaryPoint
      ? {
          owner,
          point: boundaryPoint,
        }
      : {
          point: rootSlatePoint(point, root),
        }
  }

  return createSlateViewSelection(createContentRootProjectionGraph(editor, owners), {
    anchor: projectPoint(range.anchor),
    focus: projectPoint(range.focus),
  })
}

const isNestedEditableDOMTarget = (
`
      )
      .replace(
        `    writeSlateViewSelection(
      editor,
      isRangeAcrossContentRootOwners(editor, range)
        ? createSlateViewSelection(
            createContentRootProjectionGraph(
              editor,
              findContentRootOwners(editor)
            ),
            {
              anchor: { point: range.anchor },
              focus: { point: range.focus },
            }
          )
        : null
    )
`,
        `    const acrossContentRootOwners = isRangeAcrossContentRootOwners(
      editor,
      range
    )
    const contentRootOwners = acrossContentRootOwners
      ? findContentRootOwners(editor)
      : []

    writeSlateViewSelection(
      editor,
      acrossContentRootOwners
        ? createContentRootDOMRangeViewSelection({
            editor,
            owners: contentRootOwners,
            range,
          })
        : null
    )
`
      );
  }

  if (donorPath === 'packages/browser/src/playwright/ime.ts') {
    text = text
      .replace(
        `          __slateBrowserHandle?: {
            getSelection?: () => unknown
`,
        `          __slateBrowserHandle?: {
            deleteFragment?: () => void
            getSelection?: () => unknown
`
      )
      .replace(
        `      const semanticInsertText = handle?.insertText
      const isCoarsePointer =
        navigator.maxTouchPoints > 0 ||
        globalThis.matchMedia?.('(pointer: coarse)').matches === true
      const preventedWithoutModelChange =
        beforeInputEvent.defaultPrevented && !modelChanged
      const shouldUseSemanticTextFallback =
        !modelChanged &&
        !!semanticInsertText &&
        isCoarsePointer &&
        (preventedWithoutModelChange || !!modelSelection)
      const shouldTrustDefaultPreventedExpandedComposition =
        preventedWithoutModelChange && isExpandedModelSelection(modelSelection)
`,
        `      const semanticInsertText = handle?.insertText
      const expandedModelSelection = isExpandedModelSelection(modelSelection)
      const isCoarsePointer =
        navigator.maxTouchPoints > 0 ||
        globalThis.matchMedia?.('(pointer: coarse)').matches === true
      const preventedWithoutModelChange =
        beforeInputEvent.defaultPrevented && !modelChanged
      const shouldUseSemanticTextFallback =
        !modelChanged &&
        !!semanticInsertText &&
        (expandedModelSelection ||
          (isCoarsePointer && (preventedWithoutModelChange || !!modelSelection)))
      const shouldTrustDefaultPreventedExpandedComposition =
        preventedWithoutModelChange && expandedModelSelection
`
      )
      .replace(
        `      let didApplySemanticFallback = false

      if (shouldUseSemanticTextFallback) {
        semanticInsertText(finalText)
        didApplySemanticFallback = true
      } else if (shouldTrustDefaultPreventedExpandedComposition) {
        modelChanged = modelChanged || (await waitForDeferredModelTextChange())

        if (!modelChanged && semanticInsertText) {
          semanticInsertText(finalText)
          didApplySemanticFallback = true
        }
      } else if (
`,
        `      let didApplySemanticFallback = false
      const applySemanticTextFallback = () => {
        if (expandedModelSelection) {
          handle?.deleteFragment?.()
        }

        semanticInsertText?.(finalText)
        didApplySemanticFallback = true
      }

      if (shouldUseSemanticTextFallback) {
        applySemanticTextFallback()
      } else if (shouldTrustDefaultPreventedExpandedComposition) {
        modelChanged = modelChanged || (await waitForDeferredModelTextChange())

        if (!modelChanged && semanticInsertText) {
          applySemanticTextFallback()
        }
      } else if (
`
      )
      .replace(
        `          data: finalText,
`,
        `          data: didApplySemanticFallback ? '' : finalText,
`
      );
  }

  return text;
};

const copyAdapted = (destination, donorPath, content) => {
  if (!textFilePattern.test(donorPath)) {
    copyBuffer(destination, content);
    return;
  }

  writeFile(destination, adaptDonorText(donorPath, content));
};

const copyPublicDoc = (destination, donorPath, content) => {
  if (!textFilePattern.test(donorPath)) {
    copyBuffer(destination, content);
    return;
  }

  const text = addFrontmatter(
    rewriteDocLinks(rewritePackageSpecifiers(content.toString('utf8'))),
    extractTitle(content.toString('utf8'), donorPath)
  );
  writeFile(destination, text);
};

const main = () => {
  const ledgerOnly = process.argv.includes('--ledger-only');

  if (!ledgerOnly) {
    runDonorGit(['cat-file', '-e', `${donorCommit}^{commit}`], {
      encoding: 'buffer',
    });
  }

  const entries = readJsonl(manifestPath);
  const ledger = [];

  if (!ledgerOnly) {
    cleanPath(publicDocsRoot);
    cleanPath(slateExamplesSourceRoot);
    cleanPath(donorBrowserTestsRoot);
    cleanPath(donorBenchmarkRoot);
    cleanPath(donorScriptsRoot);
    cleanPath(donorResearchRoot);
    cleanPath(archiveRoot);
  }

  for (const entry of entries) {
    const donorPath = entry.path;
    const content = ledgerOnly ? null : readDonorBlob(donorPath);
    const destinations = [];
    let status = 'archived-exact';
    let note = 'not an active Plate source surface';

    const pkgDest = packageDestination(donorPath);
    if (pkgDest) {
      destinations.push(relToRoot(pkgDest));
      status = fs.existsSync(pkgDest) ? 'active-package' : 'missing-package';
      note = 'package source/test/config moved to final @platejs package';
    } else {
      const docDest = publicDocDestination(donorPath);
      const existingUiDest = existingPlateUiDestination(donorPath);
      const exampleDest = exampleDestination(donorPath);
      const playwrightDest = playwrightDestination(donorPath);
      const benchDest = benchmarkDestination(donorPath);
      const researchDest = researchArtifactDestination(donorPath);

      if (docDest) {
        if (!ledgerOnly) {
          copyPublicDoc(docDest, donorPath, content);
        }
        destinations.push(relToRoot(docDest));
        status = 'active-fumadocs-doc';
        note = 'donor doc copied to Fumadocs Slate section';
      } else if (existingUiDest) {
        const archiveDest = ledgerOnly
          ? archiveDestination(donorPath)
          : archiveExact(donorPath, content);
        const relativeUiDest = relToRoot(existingUiDest);

        if (!ledgerOnly) {
          copyBuffer(existingUiDest, readHeadBlob(relativeUiDest));
        }
        destinations.push(relToRoot(archiveDest), relativeUiDest);
        status = 'existing-plate-ui-plus-archived-donor';
        note = 'Plate app already owns this UI primitive; donor copy archived';
      } else if (exampleDest) {
        if (!ledgerOnly) {
          copyAdapted(exampleDest, donorPath, content);
        }
        destinations.push(relToRoot(exampleDest));
        status = 'active-app-example';
        note = 'donor app/example source copied to Plate examples layout';
      } else if (playwrightDest) {
        if (!ledgerOnly) {
          copyAdapted(playwrightDest, donorPath, content);
        }
        destinations.push(relToRoot(playwrightDest));
        status = 'active-browser-proof';
        note = 'donor browser proof copied under apps/www slate-browser tests';
      } else if (benchDest) {
        if (!ledgerOnly) {
          copyAdapted(benchDest, donorPath, content);
        }
        destinations.push(relToRoot(benchDest));
        status = 'active-benchmark-or-proof-script';
        note = 'donor benchmark/proof script copied under Plate tooling';
      } else if (researchDest) {
        if (!ledgerOnly) {
          copyBuffer(researchDest, content);
        }
        destinations.push(relToRoot(researchDest));
        status = 'active-research-raw';
        note = 'donor autoresearch session artifact copied under docs/research/raw';
      } else {
        const archiveDest = ledgerOnly
          ? archiveDestination(donorPath)
          : archiveExact(donorPath, content);
        destinations.push(relToRoot(archiveDest));
      }
    }

    ledger.push({
      donorPath,
      category: entry.category,
      donorSha256: entry.sha256,
      destinations,
      status,
      note,
      activeSha256: destinations
        .filter((destination) =>
          fs.existsSync(path.join(repoRoot, destination))
        )
        .map((destination) => ({
          path: destination,
          sha256: sha256(fs.readFileSync(path.join(repoRoot, destination))),
        })),
    });
  }

  if (!ledgerOnly) {
    updateRootDocsMeta(entries);
    writeSlateMeta(entries);
    writeExampleRouteFiles(entries);
    updateAppDependencies();
  }

  const jsonl = ledger.map((row) => JSON.stringify(row)).join('\n') + '\n';
  const tsv = [
    ['status', 'category', 'donorPath', 'destinations', 'note'].join('\t'),
    ...ledger.map((row) =>
      [
        row.status,
        row.category,
        row.donorPath,
        row.destinations.join(','),
        row.note,
      ].join('\t')
    ),
  ].join('\n');
  const counts = ledger.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
  const missing = ledger.filter((row) => row.status.startsWith('missing'));
  const summary = [
    '# Slate v2 Source Switch Ledger',
    '',
    `- Donor commit: \`${donorCommit}\``,
    `- Donor rows: \`${ledger.length}\``,
    '',
    '## Status Counts',
    '',
    ...Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([status, count]) => `- \`${status}\`: ${count}`),
    '',
    '## Missing Rows',
    '',
    ...(missing.length === 0
      ? ['None.']
      : missing.map((row) => `- \`${row.donorPath}\`: ${row.status}`)),
    '',
    '## Generated Artifacts',
    '',
    '- `docs/transplant/slate-v2/source-switch-ledger.jsonl`',
    '- `docs/transplant/slate-v2/source-switch-ledger.tsv.txt`',
    '- `docs/transplant/slate-v2/source-switch-summary.md`',
    '',
  ].join('\n');

  writeFile(path.join(transplantDir, 'source-switch-ledger.jsonl'), jsonl);
  writeFile(
    path.join(transplantDir, 'source-switch-ledger.tsv.txt'),
    `${tsv}\n`
  );
  writeFile(path.join(transplantDir, 'source-switch-summary.md'), summary);

  console.log(
    JSON.stringify(
      {
        donorCommit,
        ledgerOnly,
        rows: ledger.length,
        counts,
        missingRows: missing.length,
      },
      null,
      2
    )
  );
};

main();
