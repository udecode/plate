import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { validateBetaPreState } from './guard-beta-pre-release.mjs';
import {
  buildMainToNextSyncPullRequest,
  buildPromotePullRequest,
  formatMainToNextSyncResolutionReport,
  getMainToNextChangelogResolution,
  getMainToNextSyncMetadataFiles,
  getStableVersion,
  mainToNextSyncBranch,
  mergeChangelogsForMainToNextSync,
  resolvePackageManifestForMainToNextSync,
  verifyMainToNextResolvedFile,
} from './release-branch-prs.mjs';
import {
  getReleasePlan,
  isPublishDisabled,
  resolveReleaseChannel,
} from './release-packages.mjs';

const releaseWorkflowPath = new URL(
  '../../.github/workflows/release.yml',
  import.meta.url
);
const promoteWorkflowPath = new URL(
  '../../.github/workflows/promote.yml',
  import.meta.url
);
const autoRetargetWorkflowPath = new URL(
  '../../.github/workflows/auto-retarget.yml',
  import.meta.url
);
const verifyChangesetsWorkflowPath = new URL(
  '../../.github/workflows/verify-changesets.yml',
  import.meta.url
);
const verifyMainToNextSyncWorkflowPath = new URL(
  '../../.github/workflows/verify-main-to-next-sync.yml',
  import.meta.url
);
const packageJsonPath = new URL('../../package.json', import.meta.url);
const releasePackagesPath = new URL('./release-packages.mjs', import.meta.url);
const nextConfigPath = new URL(
  '../../apps/www/next.config.ts',
  import.meta.url
);

test('release workflow uses the pruned GitHub Release path', async () => {
  const workflow = await readFile(releaseWorkflowPath, 'utf8');

  assert.match(workflow, /branches:\s*\n\s*-\s*main\s*\n\s*-\s*next/);
  assert.match(
    workflow,
    /github\.repository == 'udecode\/plate' \|\| vars\.RELEASE_VERSION_PR_TEST == 'true'/
  );
  assert.match(
    workflow,
    /github\.ref == 'refs\/heads\/main' \|\| github\.ref == 'refs\/heads\/next'/
  );
  assert.match(workflow, /Guard release channel/);
  assert.match(
    workflow,
    /main cannot publish while \.changeset\/pre\.json exists/
  );
  assert.match(workflow, /node tooling\/scripts\/guard-beta-pre-release\.mjs/);
  assert.match(workflow, /npm_tag=latest/);
  assert.match(
    workflow,
    /NPM_CONFIG_TAG:\s*\$\{\{ steps\.release_channel\.outputs\.npm_tag \}\}/
  );
  assert.match(
    workflow,
    /PLATE_DISABLE_PUBLISH:\s*\$\{\{ github\.repository != 'udecode\/plate' \}\}/
  );
  assert.match(
    workflow,
    /PLATE_RELEASE_CHANNEL:\s*\$\{\{ steps\.release_channel\.outputs\.channel \}\}/
  );
  assert.match(
    workflow,
    /versionPullRequestNumber:\s*\$\{\{ steps\.changesets\.outputs\.pullRequestNumber \}\}/
  );
  assert.match(workflow, /createGithubReleases:\s*false/);
  assert.match(workflow, /version:\s*pnpm ci:version/);
  assert.match(workflow, /publish:\s*pnpm ci:release/);
  assert.match(
    workflow,
    /github\.repository == 'udecode\/plate' && steps\.changesets\.outputs\.published == 'true'/
  );
  assert.match(workflow, /node tooling\/scripts\/published-package-tags\.mjs/);
  assert.match(workflow, /refs\/tags\/\$\{tag\}:refs\/tags\/\$\{tag\}/);
  assert.match(
    workflow,
    /node tooling\/scripts\/sync-version-package-releases\.mjs --pr "\$RELEASE_PR" --from v49/
  );
  assert.match(
    workflow,
    /git status --porcelain --untracked-files=all -- apps\/www\/src\/generated\/release-index\.json/
  );
  assert.match(workflow, /node tooling\/scripts\/release-notes\.mjs/);
  assert.match(workflow, /anthropics\/claude-code-action\/base-action/);
  assert.match(workflow, /PRERELEASE_FLAG=\(\)/);
  assert.match(workflow, /--prerelease/);
  assert.match(
    workflow,
    /node tooling\/scripts\/release-notes\.mjs add-package-changelogs "\$\{RAW_PATH\}\.final"/
  );
  assert.match(workflow, /touch "\$\{RAW_PATH\}\.final\.validated"/);
  assert.match(
    workflow,
    /-f "\$\{RAW_PATH\}\.final" && -f "\$\{RAW_PATH\}\.final\.validated"/
  );
  assert.match(workflow, /Ignoring unvalidated AI-rewritten release notes/);
  assert.match(workflow, /gh release (create|edit)/);
  assert.match(workflow, /sync-release-artifacts:/);
  assert.match(
    workflow,
    /needs\.release\.outputs\.published == 'true' && github\.ref_name == 'main' && github\.repository == 'udecode\/plate'/
  );
  assert.match(workflow, /sync-main-to-next:/);
  assert.match(
    workflow,
    /needs:\s*\n\s*-\s*release\s*\n\s*-\s*sync-release-artifacts/
  );
  assert.match(
    workflow,
    /always\(\) && needs\.release\.result == 'success' && \(needs\.sync-release-artifacts\.result == 'success' \|\| needs\.sync-release-artifacts\.result == 'skipped'\) && github\.ref_name == 'main' && needs\.release\.outputs\.versionPullRequestNumber == ''/
  );
  assert.doesNotMatch(
    workflow,
    /sync-main-to-next:[\s\S]*needs\.release\.outputs\.published == 'true'/
  );
  assert.match(
    workflow,
    /node tooling\/scripts\/release-branch-prs\.mjs sync-main-to-next/
  );
  assert.match(workflow, /contents:\s*write/);
  assert.match(workflow, /persist-credentials:\s*true/);
  assert.doesNotMatch(workflow, /sync-release-docs/);
  assert.doesNotMatch(workflow, /global-release/);
  assert.doesNotMatch(workflow, /pr-analyzer/);
  assert.doesNotMatch(workflow, /snapshot:/);
  assert.doesNotMatch(workflow, /release\/\*\*/);
});

test('promote workflow exits beta mode and creates next to main PR', async () => {
  const workflow = await readFile(promoteWorkflowPath, 'utf8');

  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /dry_run:/);
  assert.match(workflow, /default:\s*true/);
  assert.match(workflow, /Set false only when ready to push next/);
  assert.match(workflow, /if:\s*github\.ref == 'refs\/heads\/next'/);
  assert.match(workflow, /ref:\s*next/);
  assert.match(workflow, /pnpm changeset pre exit/);
  assert.match(workflow, /pnpm ci:version/);
  assert.match(workflow, /packages\/plate\/package\.json/);
  assert.match(workflow, /\[skip release\]/);
  assert.match(workflow, /git push origin next/);
  assert.match(
    workflow,
    /node tooling\/scripts\/release-branch-prs\.mjs "\$\{args\[@\]\}"/
  );
  assert.match(workflow, /promote --version "\$VERSION"/);
  assert.match(workflow, /--dry-run/);
});

test('release branch PR helpers build promote and sync PRs', () => {
  assert.equal(getStableVersion('54.0.0-beta.3'), '54.0.0');
  assert.equal(getStableVersion('54.1.2'), '54.1.2');
  assert.throws(() => getStableVersion('54.0'), /Invalid package version/);

  const promotePullRequest = buildPromotePullRequest({
    version: '54.0.0-beta.0',
  });

  assert.equal(promotePullRequest.base, 'main');
  assert.equal(promotePullRequest.head, 'next');
  assert.equal(promotePullRequest.title, 'chore: promote v54.0.0 to stable');
  assert.match(promotePullRequest.body, /publishes Plate packages to npm/);
  assert.match(promotePullRequest.body, /Create a merge commit/);
  assert.match(promotePullRequest.body, /not a style preference/);
  assert.match(promotePullRequest.body, /Wait for `release\.yml` on `main`/);
  assert.match(
    promotePullRequest.body,
    /Merge the generated `main -> next` sync PR/
  );
  assert.match(promotePullRequest.body, /empty file diff can be correct/);
  assert.match(promotePullRequest.body, /pnpm changeset pre enter beta/);

  const syncPullRequest = buildMainToNextSyncPullRequest();

  assert.equal(syncPullRequest.base, 'next');
  assert.equal(syncPullRequest.head, mainToNextSyncBranch);
  assert.equal(
    syncPullRequest.title,
    'chore: sync main to next [skip release]'
  );
  assert.match(syncPullRequest.body, /stable fixes from `main`/);
  assert.match(syncPullRequest.body, /sync\/main-to-next/);
  assert.match(syncPullRequest.body, /Release metadata conflicts/);
  assert.match(syncPullRequest.body, /not a style preference/);
  assert.match(syncPullRequest.body, /empty file diff can still be correct/);
  assert.match(
    syncPullRequest.body,
    /carries the `main` merge commit back into `next`/
  );
});

test('main to next sync PR reports automated release metadata resolution', () => {
  const report = {
    changelogs: [
      {
        file: 'packages/core/CHANGELOG.md',
        insertedStableVersions: ['53.1.8'],
        refreshedStableVersions: ['53.1.2'],
      },
    ],
    checks: ['verified by test'],
    packageManifests: [
      {
        file: 'packages/core/package.json',
        keptVersion: '54.0.0-beta.1',
        mainVersion: '53.1.8',
        packageName: '@platejs/core',
      },
    ],
    preJsonFiles: [{ file: '.changeset/pre.json' }],
  };
  const body = buildMainToNextSyncPullRequest({
    resolutionReport: report,
  }).body;
  const formatted = formatMainToNextSyncResolutionReport(report);

  assert.match(body, /Automated release metadata resolution/);
  assert.match(
    body,
    /kept next\/beta version `54\.0\.0-beta\.1` over main\/stable `53\.1\.8`/
  );
  assert.match(body, /inserted stable sections `53\.1\.8`/);
  assert.match(body, /refreshed stable sections `53\.1\.2` from main/);
  assert.match(body, /kept next beta pre-release state/);
  assert.match(formatted, /verified by test/);
});

test('main to next sync keeps beta package versions', () => {
  const resolved = resolvePackageManifestForMainToNextSync({
    ours: JSON.stringify({
      description: 'test',
      name: '@platejs/core',
      version: '54.0.0-beta.1',
    }),
    theirs: JSON.stringify({
      description: 'test',
      name: '@platejs/core',
      version: '53.1.8',
    }),
  });

  assert.deepEqual(JSON.parse(resolved), {
    description: 'test',
    name: '@platejs/core',
    version: '54.0.0-beta.1',
  });
  assert.throws(
    () =>
      resolvePackageManifestForMainToNextSync({
        ours: '{"name":"@platejs/core","version":"54.0.0-beta.1"}',
        theirs:
          '{"name":"@platejs/core","description":"changed","version":"53.1.8"}',
      }),
    /changed fields other than version/
  );
});

test('main to next sync verifier checks package, pre-state, and changelog output', () => {
  const nextPackage = JSON.stringify({
    description: 'test',
    name: '@platejs/core',
    version: '54.0.0-beta.1',
  });
  const mainPackage = JSON.stringify({
    description: 'test',
    name: '@platejs/core',
    version: '53.1.8',
  });

  assert.deepEqual(
    verifyMainToNextResolvedFile({
      file: 'packages/core/package.json',
      ours: nextPackage,
      resolved: nextPackage,
      theirs: mainPackage,
    }),
    {
      file: 'packages/core/package.json',
      message: 'kept package version 54.0.0-beta.1',
      type: 'package-manifest',
    }
  );
  assert.throws(
    () =>
      verifyMainToNextResolvedFile({
        file: 'packages/core/package.json',
        ours: nextPackage,
        resolved: mainPackage,
        theirs: mainPackage,
      }),
    /downgraded next\/beta version/
  );
  assert.throws(
    () =>
      verifyMainToNextResolvedFile({
        file: 'packages/core/package.json',
        ours: nextPackage,
        resolved: JSON.stringify({
          description: 'third state',
          name: '@platejs/core',
          version: '54.0.0-beta.1',
        }),
        theirs: mainPackage,
      }),
    /match neither next nor main/
  );

  assert.deepEqual(
    verifyMainToNextResolvedFile({
      file: '.changeset/pre.json',
      ours: '{"mode":"pre","tag":"beta"}\n',
      resolved: '{"mode":"pre","tag":"beta"}\n',
      theirs: '{}\n',
    }),
    {
      file: '.changeset/pre.json',
      message: 'kept next beta pre-release state',
      type: 'pre-json',
    }
  );
  assert.throws(
    () =>
      verifyMainToNextResolvedFile({
        file: '.changeset/pre.json',
        ours: '{"mode":"pre","tag":"beta"}\n',
        resolved: '{}\n',
        theirs: '{}\n',
      }),
    /did not keep next beta pre-release state/
  );

  const oursChangelog = [
    '# @platejs/core',
    '',
    '## 54.0.0-beta.1',
    '',
    '### Minor Changes',
    '',
    '- Beta minor.',
    '',
    '## 53.1.2',
    '',
    '### Patch Changes',
    '',
    '- Existing stable patch.',
    '',
  ].join('\n');
  const theirsChangelog = [
    '# @platejs/core',
    '',
    '## 53.1.8',
    '',
    '### Patch Changes',
    '',
    '- Main patch.',
    '',
    '## 53.1.2',
    '',
    '### Patch Changes',
    '',
    '- Existing stable patch from main.',
    '',
  ].join('\n');
  const changelogResolution = getMainToNextChangelogResolution({
    ours: oursChangelog,
    theirs: theirsChangelog,
  });

  assert.deepEqual(
    verifyMainToNextResolvedFile({
      file: 'packages/core/CHANGELOG.md',
      ours: oursChangelog,
      resolved: changelogResolution.content,
      theirs: theirsChangelog,
    }),
    {
      file: 'packages/core/CHANGELOG.md',
      insertedStableVersions: ['53.1.8'],
      message: 'inserted stable sections 53.1.8',
      type: 'changelog',
    }
  );
  assert.throws(
    () =>
      verifyMainToNextResolvedFile({
        file: 'packages/core/CHANGELOG.md',
        ours: oursChangelog,
        resolved: oursChangelog,
        theirs: theirsChangelog,
      }),
    /does not match the deterministic main-to-next changelog merge/
  );
  assert.throws(
    () =>
      verifyMainToNextResolvedFile({
        file: 'packages/core/CHANGELOG.md',
        ours: oursChangelog,
        resolved: `${changelogResolution.content}\n=======\n`,
        theirs: theirsChangelog,
      }),
    /still contains merge conflict markers/
  );
});

test('main to next sync verifier scopes metadata files to synced changes', () => {
  assert.deepEqual(
    getMainToNextSyncMetadataFiles({
      mainChangedFiles: [
        '.github/workflows/verify-main-to-next-sync.yml',
        'tooling/scripts/release-branch-prs.mjs',
      ],
      resolvedChangedFiles: [],
    }),
    []
  );
  assert.deepEqual(
    getMainToNextSyncMetadataFiles({
      mainChangedFiles: [
        'packages/basic-nodes/CHANGELOG.md',
        'packages/basic-nodes/package.json',
      ],
      resolvedChangedFiles: ['packages/core/CHANGELOG.md'],
    }),
    [
      'packages/basic-nodes/CHANGELOG.md',
      'packages/basic-nodes/package.json',
      'packages/core/CHANGELOG.md',
    ]
  );
});

test('main to next sync keeps beta changelog sections above stable history', () => {
  const resolved = mergeChangelogsForMainToNextSync({
    ours: [
      '# @platejs/core',
      '',
      '## 54.0.0-beta.1',
      '',
      '### Minor Changes',
      '',
      '- Beta minor.',
      '',
      '## 54.0.0-beta.0',
      '',
      '### Major Changes',
      '',
      '- Beta major.',
      '',
      '## 53.1.2',
      '',
      '### Patch Changes',
      '',
      '- Existing stable patch.',
      '',
      '## 1.0.0',
      '',
      '### Major Changes',
      '',
      '- Existing old stable release.',
      '',
      '## 1.0.0-next.61',
      '',
      '### Patch Changes',
      '',
      '- Existing old prerelease.',
      '',
    ].join('\n'),
    theirs: [
      '# @platejs/core',
      '',
      '## 53.1.8',
      '',
      '### Patch Changes',
      '',
      '- Main patch.',
      '',
      '## 53.1.7',
      '',
      '### Patch Changes',
      '',
      '- Previous main patch.',
      '',
      '## 53.1.2',
      '',
      '### Patch Changes',
      '',
      '- Existing stable patch from main.',
      '',
      '## 1.0.0',
      '',
      '### Major Changes',
      '',
      '- Existing old stable release from main.',
      '',
      '## 1.0.0-next.61',
      '',
      '### Patch Changes',
      '',
      '- Existing old prerelease.',
      '',
    ].join('\n'),
  });

  assert.equal(
    [...resolved.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]).join(','),
    '54.0.0-beta.1,54.0.0-beta.0,53.1.8,53.1.7,53.1.2,1.0.0,1.0.0-next.61'
  );
  assert.match(resolved, /- Main patch\./);
  assert.match(resolved, /- Existing stable patch from main\./);
  assert.ok(
    resolved.indexOf('## 1.0.0\n') < resolved.indexOf('## 1.0.0-next.61')
  );
  assert.match(resolved, /- Existing old stable release from main\./);
  assert.doesNotMatch(resolved, /<<<<<<<|=======|>>>>>>>/);
});

test('main to next sync inserts stable changelog sections between existing anchors', () => {
  const resolved = mergeChangelogsForMainToNextSync({
    ours: [
      '# @platejs/core',
      '',
      '## 54.0.0-beta.1',
      '',
      '### Minor Changes',
      '',
      '- Beta minor.',
      '',
      '## 53.1.8',
      '',
      '### Patch Changes',
      '',
      '- Existing synced stable patch.',
      '',
      '## 53.1.2',
      '',
      '### Patch Changes',
      '',
      '- Existing older stable patch.',
      '',
    ].join('\n'),
    theirs: [
      '# @platejs/core',
      '',
      '## 53.1.8',
      '',
      '### Patch Changes',
      '',
      '- Existing synced stable patch from main.',
      '',
      '## 53.1.6',
      '',
      '### Patch Changes',
      '',
      '- Main patch released between sync anchors.',
      '',
      '## 53.1.2',
      '',
      '### Patch Changes',
      '',
      '- Existing older stable patch from main.',
      '',
    ].join('\n'),
  });

  assert.equal(
    [...resolved.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]).join(','),
    '54.0.0-beta.1,53.1.8,53.1.6,53.1.2'
  );
  assert.match(resolved, /- Main patch released between sync anchors\./);
  assert.match(resolved, /- Existing synced stable patch from main\./);
  assert.match(resolved, /- Existing older stable patch from main\./);
});

test('main to next sync appends stable changelog sections after beta-only history', () => {
  const resolved = mergeChangelogsForMainToNextSync({
    ours: [
      '# @platejs/core',
      '',
      '## 54.0.0-beta.1',
      '',
      '### Minor Changes',
      '',
      '- Beta minor.',
      '',
      '## 54.0.0-beta.0',
      '',
      '### Major Changes',
      '',
      '- Beta major.',
      '',
    ].join('\n'),
    theirs: [
      '# @platejs/core',
      '',
      '## 53.1.8',
      '',
      '### Patch Changes',
      '',
      '- Main patch.',
      '',
      '## 53.1.7',
      '',
      '### Patch Changes',
      '',
      '- Previous main patch.',
      '',
    ].join('\n'),
  });

  assert.equal(
    [...resolved.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]).join(','),
    '54.0.0-beta.1,54.0.0-beta.0,53.1.8,53.1.7'
  );
});

test('main to next sync keeps stable sections after the last matched anchor', () => {
  const resolved = mergeChangelogsForMainToNextSync({
    ours: [
      '# @platejs/core',
      '',
      '## 54.0.0-beta.1',
      '',
      '### Minor Changes',
      '',
      '- Beta minor.',
      '',
      '## 53.1.8',
      '',
      '### Patch Changes',
      '',
      '- Existing synced stable patch.',
      '',
    ].join('\n'),
    theirs: [
      '# @platejs/core',
      '',
      '## 53.1.8',
      '',
      '### Patch Changes',
      '',
      '- Existing synced stable patch from main.',
      '',
      '## 53.1.7',
      '',
      '### Patch Changes',
      '',
      '- Main patch after the final shared anchor.',
      '',
    ].join('\n'),
  });

  assert.equal(
    [...resolved.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]).join(','),
    '54.0.0-beta.1,53.1.8,53.1.7'
  );
  assert.match(resolved, /- Main patch after the final shared anchor\./);
});

test('auto-retarget workflow moves non-patch changesets from main to next', async () => {
  const workflow = await readFile(autoRetargetWorkflowPath, 'utf8');

  assert.match(workflow, /pull_request_target:/);
  assert.match(workflow, /branches:\s*\n\s*-\s*main/);
  assert.match(
    workflow,
    /github\.event\.pull_request\.head\.repo\.full_name != github\.repository/
  );
  assert.match(workflow, /github\.event\.pull_request\.head\.ref != 'next'/);
  assert.match(workflow, /github\.event\.repository\.default_branch/);
  assert.match(workflow, /getChangesetReleaseType/);
  assert.match(workflow, /releaseType !== 'minor' && releaseType !== 'major'/);
  assert.match(workflow, /branch:\s*'next'/);
  assert.match(workflow, /base:\s*'next'/);
  assert.match(workflow, /retargeted-to-next/);
  assert.match(workflow, /main` only accepts patch changes/);
});

test('verify changesets workflow blocks non-patch releases on main', async () => {
  const workflow = await readFile(verifyChangesetsWorkflowPath, 'utf8');
  const preJsonGuardIndex = workflow.indexOf(
    '.changeset/pre.json must not be committed to main'
  );
  const promoteExemptionIndex = workflow.indexOf(
    'Verification exempt: next -> main promotion PR.'
  );

  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /-\s*main/);
  assert.match(workflow, /-\s*next/);
  assert.match(workflow, /-\s*'release\/\*\*'/);
  assert.match(workflow, /merge_group:/);
  assert.match(workflow, /headRef === 'next' && baseRef === 'main'/);
  assert.match(
    workflow,
    /\(headRef === 'main' \|\| headRef === 'sync\/main-to-next'\) && baseRef === 'next'/
  );
  assert.match(
    workflow,
    /\.changeset\/pre\.json must not be committed to main/
  );
  assert.ok(preJsonGuardIndex > 0);
  assert.ok(promoteExemptionIndex > preJsonGuardIndex);
  assert.match(workflow, /Missing changeset/);
  assert.match(workflow, /skip-changeset/);
  assert.match(workflow, /getChangesetValidationErrors/);
  assert.match(
    workflow,
    /releaseType === 'minor' \|\| releaseType === 'major'/
  );
  assert.match(workflow, /Only patch bumps are allowed/);
});

test('verify main-to-next sync workflow checks only sync PR metadata', async () => {
  const workflow = await readFile(verifyMainToNextSyncWorkflowPath, 'utf8');

  assert.match(workflow, /name:\s*Verify main-to-next sync/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /branches:\s*\n\s*-\s*next/);
  assert.match(
    workflow,
    /github\.event\.pull_request\.head\.ref == 'sync\/main-to-next'/
  );
  assert.match(
    workflow,
    /ref:\s*\$\{\{ github\.event\.pull_request\.head\.sha \}\}/
  );
  assert.match(workflow, /fetch-depth:\s*0/);
  assert.match(
    workflow,
    /node tooling\/scripts\/release-branch-prs\.mjs verify-main-to-next-sync/
  );
});

test('package scripts expose CI version and release commands only', async () => {
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

  assert.equal(
    packageJson.scripts['ci:version'],
    'pnpm changeset version && pnpm install --no-frozen-lockfile'
  );
  assert.equal(
    packageJson.scripts['ci:release'],
    'node tooling/scripts/release-packages.mjs'
  );
  assert.equal(
    packageJson.scripts['g:release:beta'],
    'node tooling/scripts/release-packages.mjs --channel beta'
  );
  assert.equal(packageJson.scripts['g:release:next'], 'pnpm g:release:beta');
  assert.doesNotMatch(
    Object.values(packageJson.scripts).join('\n'),
    /changeset publish --tag (?:next|beta)/
  );
  assert.equal(packageJson.scripts['release:releases'], undefined);
});

test('beta package release uses an explicit npm beta tag', async () => {
  const releasePackages = await readFile(releasePackagesPath, 'utf8');

  assert.equal(resolveReleaseChannel({ argv: [], env: {} }), 'latest');
  assert.equal(
    resolveReleaseChannel({ argv: ['--channel', 'beta'], env: {} }),
    'beta'
  );
  assert.equal(
    resolveReleaseChannel({ argv: ['--channel=beta'], env: {} }),
    'beta'
  );
  assert.equal(
    resolveReleaseChannel({ argv: [], env: { PLATE_RELEASE_CHANNEL: 'beta' } }),
    'beta'
  );
  assert.equal(
    resolveReleaseChannel({ argv: [], env: { GITHUB_REF_NAME: 'next' } }),
    'beta'
  );
  assert.deepEqual(getReleasePlan('latest'), {
    release: ['pnpm', ['release']],
  });
  assert.deepEqual(getReleasePlan('beta'), {
    build: ['pnpm', ['build']],
    hidePreStateForPublish: true,
    publish: ['pnpm', ['changeset', 'publish', '--tag', 'beta']],
  });
  assert.equal(
    isPublishDisabled({ env: { PLATE_DISABLE_PUBLISH: 'false' } }),
    false
  );
  assert.equal(
    isPublishDisabled({ env: { PLATE_DISABLE_PUBLISH: 'true' } }),
    true
  );
  assert.match(
    releasePackages,
    /Skipping npm publish for Version PR workflow testing/
  );
  assert.match(releasePackages, /pre\.json\.beta-publish-backup/);
  assert.match(
    releasePackages,
    /runCommand\('pnpm', \['changeset', 'publish', '--tag', 'beta'\]\)/
  );
});

test('beta pre-release guard requires active beta pre mode', () => {
  assert.doesNotThrow(() => validateBetaPreState({ mode: 'pre', tag: 'beta' }));

  assert.throws(
    () => validateBetaPreState({ mode: 'exit', tag: 'beta' }),
    /active Changesets pre-release mode/
  );
  assert.throws(
    () => validateBetaPreState({ mode: 'pre', tag: 'next' }),
    /beta pre-release tag/
  );
  assert.throws(
    () => validateBetaPreState({ mode: 'pre' }),
    /beta pre-release tag/
  );
});

test('release docs keep old migration route redirects', async () => {
  const nextConfig = await readFile(nextConfigPath, 'utf8');

  assert.match(
    nextConfig,
    /source:\s*'\/docs\/migration'[\s\S]*destination:\s*'\/docs\/releases'|destination:\s*'\/docs\/releases'[\s\S]*source:\s*'\/docs\/migration'/
  );
  assert.match(
    nextConfig,
    /source:\s*'\/cn\/docs\/migration'[\s\S]*destination:\s*'\/cn\/docs\/releases'|destination:\s*'\/cn\/docs\/releases'[\s\S]*source:\s*'\/cn\/docs\/migration'/
  );
});
