import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  PLITE_RELEASE_PROOF_EVENT,
  PLITE_RELEASE_PROOF_ARTIFACT_NAME,
  PLITE_RELEASE_PROOF_WORKFLOW_PATH,
  PLITE_RELEASE_READY_LANES,
  downloadPliteReleaseProofBundle,
  resolvePliteReleaseProofRequest,
  resolvePliteReleaseProofArtifact,
  validatePliteReleaseCheckout,
  validatePliteReleaseProofManifest,
  validatePliteReleaseProofRun,
  verifyPliteReleaseProofArtifacts,
  verifyPliteReleaseProofProducer,
} from './check-plite-release-proof.mjs';

const commit = 'a'.repeat(40);
const producerRepository = 'udecode/plate';
const producerRunId = 123_456;
const checkoutCommit = spawnSync('git', ['rev-parse', 'HEAD'], {
  encoding: 'utf-8',
}).stdout.trim();
const scriptPath = fileURLToPath(
  new URL('check-plite-release-proof.mjs', import.meta.url)
);

const sha256 = (value) => createHash('sha256').update(value).digest('hex');

const createFixture = () => {
  const directory = mkdtempSync(join(tmpdir(), 'plite-release-proof-'));
  const artifacts = new Map();
  const lanes = PLITE_RELEASE_READY_LANES.map((id) => {
    const path = `${id}.json`;
    const source = `${JSON.stringify({ commit, id, status: 'passed' })}\n`;

    writeFileSync(join(directory, path), source);
    artifacts.set(id, { path, source });

    const environment = {
      arch: 'arm64',
      os: 'macos',
      runtime: 'test',
    };

    if (id === 'raw-mobile') {
      environment.devices = [
        {
          browserName: 'Chrome',
          browserVersion: '1',
          deviceName: 'Android device',
          directAppium: true,
          model: 'Android model',
          osName: 'Android',
          osVersion: '1',
          platform: 'android-chrome',
          realDevice: true,
        },
        {
          browserName: 'Safari',
          browserVersion: '1',
          deviceName: 'iOS device',
          directAppium: true,
          model: 'iOS model',
          osName: 'iOS',
          osVersion: '1',
          platform: 'ios-safari',
          realDevice: true,
        },
      ];
    }
    if (id === 'persistent-browser-soak') {
      environment.browserName = 'Chromium';
      environment.browserVersion = '1';
      environment.persistentProfile = true;
      environment.profileName = 'plite-release';
    }

    return {
      artifacts: [{ path, sha256: sha256(source) }],
      capturedAt: '2026-08-23T00:00:00.000Z',
      command: `proof:${id}`,
      commit,
      environment,
      id,
      status: 'passed',
    };
  });
  const manifest = {
    commit,
    createdAt: '2026-08-23T00:01:00.000Z',
    lanes,
    producer: {
      event: 'workflow_dispatch',
      repository: producerRepository,
      runAttempt: 1,
      runId: producerRunId,
      workflowPath: '.github/workflows/plite-ci.yml',
    },
    profile: 'release-ready',
    schemaVersion: 1,
  };
  const manifestPath = join(directory, 'manifest.json');
  const writeManifest = () =>
    writeFileSync(manifestPath, `${JSON.stringify(manifest)}\n`);

  writeManifest();

  return { artifacts, directory, manifest, manifestPath, writeManifest };
};

const runProof = (expectedCommit = checkoutCommit) =>
  spawnSync(
    process.execPath,
    [
      scriptPath,
      '--profile',
      'release-ready',
      '--expected-commit',
      expectedCommit,
      '--producer-run-id',
      String(producerRunId),
    ],
    { encoding: 'utf-8' }
  );

const validateManifest = (manifest, expectedCommit = commit) =>
  validatePliteReleaseProofManifest({
    expectedCommit,
    expectedProducerRunAttempt: 1,
    expectedProducerRunId: producerRunId,
    manifest,
    profile: 'release-ready',
  });

const withFixture = (callback) => {
  const fixture = createFixture();

  try {
    callback(fixture);
  } finally {
    rmSync(fixture.directory, { force: true, recursive: true });
  }
};

const withFixtureAsync = async (callback) => {
  const fixture = createFixture();

  try {
    await callback(fixture);
  } finally {
    rmSync(fixture.directory, { force: true, recursive: true });
  }
};

test('accepts a complete current-commit release-ready artifact manifest', async () => {
  await withFixtureAsync(async ({ manifest, manifestPath }) => {
    assert.deepEqual(validateManifest(manifest), { issues: [], ok: true });
    assert.deepEqual(
      await verifyPliteReleaseProofArtifacts({ manifest, manifestPath }),
      { issues: [], ok: true }
    );
  });
});

test('refuses broad CLI proof without authoritative GitHub access', () => {
  const result = runProof();

  assert.notEqual(result.status, 0);
  assert.match(
    result.stderr,
    /PLITE_RELEASE_PROOF_GITHUB_TOKEN or GITHUB_TOKEN is required/
  );
});

test('keeps ordinary package publication independent of behavioral proof', () => {
  const result = spawnSync(process.execPath, [scriptPath, '--from-env'], {
    encoding: 'utf-8',
    env: {
      ...process.env,
      PLITE_RELEASE_CLAIM_PROFILE: '',
    },
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /package-only publication selected/);
});

test('rejects broad release proof when publish inputs differ from HEAD', () => {
  assert.deepEqual(
    validatePliteReleaseCheckout({
      declaredCommit: commit,
      headCommit: commit,
      statusOutput: '',
    }),
    { issues: [], ok: true }
  );

  const dirty = validatePliteReleaseCheckout({
    declaredCommit: commit,
    headCommit: commit,
    statusOutput: ' M packages/plitejs/src/index.ts\n?? forged-proof.json\n',
  });

  assert.equal(dirty.ok, false);
  assert.match(
    dirty.issues.join('\n'),
    /tracked or untracked changes.*packages\/plitejs\/src\/index\.ts.*forged-proof\.json/s
  );
});

test('falls back to GITHUB_SHA when the explicit commit input is blank', () => {
  assert.deepEqual(
    resolvePliteReleaseProofRequest({
      argv: ['--from-env'],
      env: {
        GITHUB_SHA: commit,
        PLITE_RELEASE_CLAIM_PROFILE: 'release-ready',
        PLITE_RELEASE_EXPECTED_COMMIT: '   ',
        PLITE_RELEASE_PROOF_MANIFEST: 'forged-local-manifest.json',
        PLITE_RELEASE_PROOF_RUN_ID: String(producerRunId),
      },
    }),
    {
      expectedCommit: commit,
      mode: 'claim',
      producerRunId: String(producerRunId),
      profile: 'release-ready',
    }
  );
});

test('rejects the removed caller-local manifest argument', () => {
  assert.throws(
    () =>
      resolvePliteReleaseProofRequest({
        argv: ['--manifest', 'forged-local-manifest.json'],
        env: {},
      }),
    /Unexpected argument: --manifest/
  );
});

test('accepts only a successful canonical producer run on the exact commit', async () => {
  const workflow = { id: 42, path: PLITE_RELEASE_PROOF_WORKFLOW_PATH };
  const run = {
    conclusion: 'success',
    event: PLITE_RELEASE_PROOF_EVENT,
    head_repository: { full_name: producerRepository },
    head_sha: commit,
    id: producerRunId,
    repository: { full_name: producerRepository },
    run_attempt: 1,
    status: 'completed',
    workflow_id: workflow.id,
  };
  const artifact = {
    digest: `sha256:${'c'.repeat(64)}`,
    expired: false,
    id: 789,
    name: PLITE_RELEASE_PROOF_ARTIFACT_NAME,
    size_in_bytes: 1024,
    workflow_run: {
      head_repository_id: 9,
      head_sha: commit,
      id: producerRunId,
      repository_id: 9,
    },
  };
  const options = {
    expectedCommit: commit,
    expectedRunId: producerRunId,
    run,
    workflow,
  };

  assert.deepEqual(validatePliteReleaseProofRun(options), {
    issues: [],
    ok: true,
  });

  const requests = [];
  const responses = [run, workflow, { artifacts: [artifact], total_count: 1 }];
  const resolved = await verifyPliteReleaseProofProducer({
    expectedCommit: commit,
    expectedRunId: producerRunId,
    fetchImpl: async (url, init) => {
      requests.push({ init, url });

      return {
        json: async () => responses.shift(),
        ok: true,
        status: 200,
      };
    },
    githubToken: 'test-token',
  });

  assert.deepEqual(resolved, {
    artifact,
    issues: [],
    ok: true,
    runAttempt: 1,
  });
  assert.match(requests[0].url, /\/actions\/runs\/123456$/);
  assert.match(requests[1].url, /\/actions\/workflows\/42$/);
  assert.match(
    requests[2].url,
    /\/actions\/runs\/123456\/artifacts\?name=plite-release-proof&per_page=100$/
  );
  assert.equal(requests[0].init.headers.authorization, 'Bearer test-token');

  const forged = validatePliteReleaseProofRun({
    ...options,
    run: {
      ...run,
      conclusion: 'failure',
      head_repository: { full_name: 'attacker/plate' },
      head_sha: 'b'.repeat(40),
      repository: { full_name: 'attacker/plate' },
    },
    workflow: { ...workflow, path: '.github/workflows/forged.yml' },
  });

  assert.equal(forged.ok, false);
  assert.match(forged.issues.join('\n'), /does not match/);
  assert.match(forged.issues.join('\n'), /did not complete successfully/);
  assert.match(forged.issues.join('\n'), /is not authoritative/);
});

test('accepts exactly one current, unexpired artifact owned by the producer run', () => {
  const artifact = {
    digest: `sha256:${'c'.repeat(64)}`,
    expired: false,
    id: 789,
    name: PLITE_RELEASE_PROOF_ARTIFACT_NAME,
    size_in_bytes: 1024,
    workflow_run: {
      head_repository_id: 9,
      head_sha: commit,
      id: producerRunId,
      repository_id: 9,
    },
  };

  assert.deepEqual(
    resolvePliteReleaseProofArtifact({
      expectedCommit: commit,
      expectedRunId: producerRunId,
      payload: { artifacts: [artifact], total_count: 1 },
    }),
    { artifact, issues: [], ok: true }
  );

  const forged = resolvePliteReleaseProofArtifact({
    expectedCommit: commit,
    expectedRunId: producerRunId,
    payload: {
      artifacts: [
        {
          ...artifact,
          digest: null,
          expired: true,
          workflow_run: {
            ...artifact.workflow_run,
            head_sha: 'b'.repeat(40),
            id: producerRunId + 1,
          },
        },
        { ...artifact, id: 790 },
      ],
      total_count: 2,
    },
  });

  assert.equal(forged.ok, false);
  assert.match(forged.issues.join('\n'), /exactly one/);
});

test('rejects stale, expired, or digest-free producer artifact metadata', () => {
  const result = resolvePliteReleaseProofArtifact({
    expectedCommit: commit,
    expectedRunId: producerRunId,
    payload: {
      artifacts: [
        {
          digest: null,
          expired: true,
          id: 789,
          name: PLITE_RELEASE_PROOF_ARTIFACT_NAME,
          size_in_bytes: 1024,
          workflow_run: {
            head_repository_id: 10,
            head_sha: 'b'.repeat(40),
            id: producerRunId + 1,
            repository_id: 9,
          },
        },
      ],
      total_count: 1,
    },
  });

  assert.equal(result.ok, false);
  assert.match(result.issues.join('\n'), /expired/);
  assert.match(result.issues.join('\n'), /SHA-256 digest/);
  assert.match(result.issues.join('\n'), /artifact run .* does not match/);
  assert.match(result.issues.join('\n'), /artifact commit .* does not match/);
  assert.match(
    result.issues.join('\n'),
    /head repository is not authoritative/
  );
});

test('downloads and extracts the exact GitHub artifact selected by ID and digest', async () => {
  const archive = Buffer.from('producer-owned archive');
  const requests = [];
  const result = await downloadPliteReleaseProofBundle({
    artifact: {
      digest: `sha256:${sha256(archive)}`,
      id: 789,
    },
    extractZipImpl: async (archivePath, options) => {
      assert.deepEqual(readFileSync(archivePath), archive);
      options.onEntry({
        externalFileAttributes: 0o10_0644 << 16,
        fileName: 'manifest.json',
      });
      writeFileSync(join(options.dir, 'manifest.json'), '{}\n');
    },
    fetchImpl: async (url, init) => {
      requests.push({ init, url });

      return {
        arrayBuffer: async () => archive,
        ok: true,
        status: 200,
      };
    },
    githubToken: 'test-token',
  });

  try {
    assert.equal(readFileSync(result.manifestPath, 'utf-8'), '{}\n');
    assert.match(
      requests[0].url,
      /\/repos\/udecode\/plate\/actions\/artifacts\/789\/zip$/
    );
    assert.equal(requests[0].init.headers.authorization, 'Bearer test-token');
  } finally {
    rmSync(result.temporaryDirectory, { force: true, recursive: true });
  }
});

test('rejects a downloaded archive whose bytes do not match GitHub metadata', async () => {
  let extracted = false;

  await assert.rejects(
    downloadPliteReleaseProofBundle({
      artifact: {
        digest: `sha256:${'c'.repeat(64)}`,
        id: 789,
      },
      extractZipImpl: async () => {
        extracted = true;
      },
      fetchImpl: async () => ({
        arrayBuffer: async () => Buffer.from('tampered archive'),
        ok: true,
        status: 200,
      }),
      githubToken: 'test-token',
    }),
    /archive digest does not match/
  );
  assert.equal(extracted, false);
});

test('rejects traversal and symlink entries before archive extraction', async () => {
  const archive = Buffer.from('unsafe archive');

  for (const entry of [
    { externalFileAttributes: 0o10_0644 << 16, fileName: '../manifest.json' },
    { externalFileAttributes: 0o12_0777 << 16, fileName: 'manifest.json' },
  ]) {
    await assert.rejects(
      downloadPliteReleaseProofBundle({
        artifact: {
          digest: `sha256:${sha256(archive)}`,
          id: 789,
        },
        extractZipImpl: async (_archivePath, options) => {
          options.onEntry(entry);
        },
        fetchImpl: async () => ({
          arrayBuffer: async () => archive,
          ok: true,
          status: 200,
        }),
        githubToken: 'test-token',
      }),
      /unsafe path|contains symlink/
    );
  }
});

test('rejects stale commits and incomplete lane coverage', () => {
  withFixture(({ manifest }) => {
    manifest.commit = 'b'.repeat(40);
    manifest.lanes.pop();

    const result = validateManifest(manifest);

    assert.equal(result.ok, false);
    assert.match(result.issues.join('\n'), /manifest commit .* does not match/);
    assert.match(result.issues.join('\n'), /Missing release-ready proof lane/);
  });
});

test('rejects failed lanes and per-lane commit mismatches', () => {
  withFixture(({ manifest }) => {
    manifest.lanes[0].commit = 'b'.repeat(40);
    manifest.lanes[0].status = 'failed';

    const result = validateManifest(manifest);

    assert.equal(result.ok, false);
    assert.match(result.issues.join('\n'), /did not pass/);
    assert.match(result.issues.join('\n'), /does not prove commit/);
  });
});

test('rejects proof that is not bound to the canonical producer run', () => {
  withFixture(({ manifest }) => {
    manifest.producer.runId = producerRunId + 1;
    manifest.producer.runAttempt = 2;
    manifest.producer.repository = 'attacker/plate';
    manifest.producer.workflowPath = '.github/workflows/forged.yml';

    const result = validateManifest(manifest);

    assert.equal(result.ok, false);
    assert.match(result.issues.join('\n'), /producer run .* does not match/);
    assert.match(
      result.issues.join('\n'),
      /producer attempt .* does not match/
    );
    assert.match(
      result.issues.join('\n'),
      /producer repository .* is not authoritative/
    );
    assert.match(
      result.issues.join('\n'),
      /producer workflow .* is not authoritative/
    );
  });
});

test('rejects missing raw-device and persistent-profile identity', () => {
  withFixture(({ manifest }) => {
    const rawMobile = manifest.lanes.find((lane) => lane.id === 'raw-mobile');
    const persistentSoak = manifest.lanes.find(
      (lane) => lane.id === 'persistent-browser-soak'
    );

    delete rawMobile.environment.devices;
    delete persistentSoak.environment.profileName;

    const result = validateManifest(manifest);

    assert.equal(result.ok, false);
    assert.match(
      result.issues.join('\n'),
      /raw-mobile is missing raw-device identity/
    );
    assert.match(
      result.issues.join('\n'),
      /persistent-browser-soak is missing persistent browser profile identity/
    );
  });
});

test('rejects missing and tampered artifact files', async () => {
  await withFixtureAsync(
    async ({ artifacts, directory, manifest, manifestPath }) => {
      const chromium = artifacts.get('browser-chromium');
      const firefox = artifacts.get('browser-firefox');

      rmSync(join(directory, chromium.path));
      writeFileSync(
        join(directory, firefox.path),
        `${firefox.source}tampered\n`
      );

      const result = await verifyPliteReleaseProofArtifacts({
        manifest,
        manifestPath,
      });

      assert.equal(result.ok, false);
      assert.match(
        result.issues.join('\n'),
        /browser-chromium artifact 0 is missing/
      );
      assert.match(
        result.issues.join('\n'),
        /browser-firefox artifact 0 digest does not match/
      );
    }
  );
});

test('rejects artifact traversal and symlinks that escape the proof bundle', async () => {
  const outsideDirectory = mkdtempSync(join(tmpdir(), 'plite-proof-outside-'));

  try {
    const outsidePath = join(outsideDirectory, 'outside.json');
    const outsideSource = '{"status":"passed"}\n';

    writeFileSync(outsidePath, outsideSource);
    await withFixtureAsync(async ({ directory, manifest, manifestPath }) => {
      manifest.lanes[0].artifacts = [
        {
          path: relative(directory, outsidePath),
          sha256: sha256(outsideSource),
        },
      ];
      const result = await verifyPliteReleaseProofArtifacts({
        manifest,
        manifestPath,
      });

      assert.equal(result.ok, false);
      assert.match(
        result.issues.join('\n'),
        /escapes the release proof bundle/
      );
    });
    await withFixtureAsync(async ({ directory, manifest, manifestPath }) => {
      const symlinkPath = join(directory, 'escaped.json');

      symlinkSync(outsidePath, symlinkPath);
      manifest.lanes[0].artifacts = [
        { path: 'escaped.json', sha256: sha256(outsideSource) },
      ];
      const result = await verifyPliteReleaseProofArtifacts({
        manifest,
        manifestPath,
      });

      assert.equal(result.ok, false);
      assert.match(
        result.issues.join('\n'),
        /escapes the release proof bundle/
      );
    });
  } finally {
    rmSync(outsideDirectory, { force: true, recursive: true });
  }
});
