import { describe, expect, test } from 'bun:test';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../../..', import.meta.url));

const runRootScript = (script: string, env = process.env) =>
  spawnSync('bun', ['run', script], {
    cwd: repoRoot,
    encoding: 'utf-8',
    env,
  });

describe('mobile device proof command', () => {
  test('runs scoped proof from the repository root', () => {
    const result = runRootScript('test:mobile-device-proof', {
      ...process.env,
      GITHUB_SHA: 'a'.repeat(40),
      PLITE_RELEASE_EXPECTED_COMMIT: '   ',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      'scoped proof classification passed: proxy transports and incomplete receipts cannot satisfy raw mobile claims'
    );
  });

  test('fails raw proof closed when device artifacts are absent', () => {
    const artifactPath = resolve(
      repoRoot,
      'test-results/release-proof/missing-mobile-device-proof-for-command-test.json'
    );
    const result = runRootScript('test:mobile-device-proof:raw', {
      ...process.env,
      PLITE_BROWSER_MOBILE_PROOF_ARTIFACTS: artifactPath,
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr + result.stdout).toContain(
      `Missing raw mobile proof artifacts at ${artifactPath}`
    );
  });
});
