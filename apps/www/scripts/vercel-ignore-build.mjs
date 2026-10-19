// Vercel's Ignored Build Step: exit 0 skips the deployment, exit 1 builds it.
// Runs before install, so it uses only Node and git.
import { execFileSync } from 'node:child_process';

const IGNORED = [
  // next.config.ts imports this one file from docs/.
  /^docs\/(?!plite\/reference\/public-route-map\.json$)/,
  /^\.(agents|changeset|claude|codex|github|vscode)\//,
  /^(apps\/plite|benchmarks|execution|skills|templates)\//,
  // Package builds read tooling/config, tooling/entrypoints and these scripts
  // with their imports.
  /^tooling\/(?!config\/|entrypoints\/|scripts\/(check-package-build-artifacts|check-package-declaration-brands|finalize-plate-declarations|fix-declaration-specifiers|plite-internal-symbols)\.mjs$)/,
  /\.md$/,
  /\.(spec|test)\.[cm]?[jt]sx?$/,
  /(^|\/)(__snapshots__|__tests__)\//,
  /^packages\/[^/]+\/test\//,
  /^apps\/www\/(tests\/|playwright[^/]*\.config\.ts$)/,
  /^(\.gitignore|\.mcp\.json|bunfig\.toml|languine\.json|lefthook\.yml|LICENSE|oxfmt\.config\.ts|oxlint\.config\.ts|skills-lock\.json)$/,
];

const git = (...args) =>
  execFileSync('git', args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();

const hasCommit = (sha) => {
  try {
    git('cat-file', '-e', `${sha}^{commit}`);
    return true;
  } catch {
    return false;
  }
};

const decide = (skip, reason) => {
  console.log(`${skip ? 'Skip' : 'Build'}: ${reason}`);
  process.exit(skip ? 0 : 1);
};

// A push can carry several commits, so diff against the last deployed commit.
// Vercel clones shallowly; when that commit is missing, build to be safe.
const base = process.env.VERCEL_GIT_PREVIOUS_SHA;
if (!base || !hasCommit(base)) {
  decide(false, `no previous deployment commit ${base ?? ''} in the clone`);
}

const head = process.env.VERCEL_GIT_COMMIT_SHA ?? 'HEAD';
if (
  process.env.VERCEL_GIT_COMMIT_MESSAGE === 'Version Packages' &&
  hasCommit(`${head}^`) &&
  git('rev-parse', `${head}^`) === base
) {
  decide(true, 'Version Packages is the only undeployed commit');
}
const changed = git(
  '-C',
  git('rev-parse', '--show-toplevel'),
  'diff',
  '--name-only',
  base,
  head
)
  .split('\n')
  .filter(Boolean);
const deployed = changed.find(
  (file) => !IGNORED.some((pattern) => pattern.test(file))
);

if (deployed) decide(false, `${deployed} changed since ${base}`);
decide(
  true,
  `${changed.length} changed files since ${base} do not affect the site`
);
