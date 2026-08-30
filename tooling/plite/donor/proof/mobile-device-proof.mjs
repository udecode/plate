#!/usr/bin/env bun

// CLI reports proof scope and artifact paths.

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = fileURLToPath(new URL('../../../..', import.meta.url));
const artifactPath = resolve(
  repoRoot,
  process.env.PLITE_BROWSER_MOBILE_PROOF_ARTIFACTS ??
    'test-results/release-proof/mobile-device-proof.json'
);
const rawRequired = process.env.PLITE_BROWSER_RAW_MOBILE_REQUIRED === '1';
const expectedCommit =
  process.env.PLITE_RELEASE_EXPECTED_COMMIT?.trim() ||
  process.env.GITHUB_SHA?.trim() ||
  execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();

const {
  assertPliteRawMobileProof,
  classifyBrowserMobileTransportProof,
  validatePliteRawMobileProof,
} = await import(
  pathToFileURL(resolve(repoRoot, 'packages/test/src/proof/index.ts')).href
);

const readArtifacts = () => {
  if (!existsSync(artifactPath)) {
    throw new Error(
      `Missing raw mobile proof artifacts at ${artifactPath}. Run the Appium/device lane and write plite-browser release proof artifacts before claiming raw mobile support.`
    );
  }

  const parsed = JSON.parse(readFileSync(artifactPath, 'utf8'));

  if (parsed?.schemaVersion === 1 && Array.isArray(parsed.receipts)) {
    return parsed;
  }

  throw new Error(
    `Expected ${artifactPath} to contain a schemaVersion 1 raw mobile receipt bundle`
  );
};

const stableStringify = (value) => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
};

const digest = (value) => createHash('sha256').update(value).digest('hex');

const verifyPointer = (pointer, label) => {
  const filePath = resolve(dirname(artifactPath), pointer.path);

  if (!existsSync(filePath)) {
    throw new Error(`${label} artifact is missing at ${filePath}`);
  }
  if (digest(readFileSync(filePath)) !== pointer.sha256) {
    throw new Error(`${label} artifact digest does not match ${filePath}`);
  }
};

const verifyReadback = (bundle) => {
  for (const receipt of bundle.receipts) {
    const { receiptSha256, ...payload } = receipt;
    const label = `${receipt.platform}/${receipt.scenario}`;

    if (digest(stableStringify(payload)) !== receiptSha256) {
      throw new Error(`${label} receipt digest does not match its payload`);
    }

    verifyPointer(receipt.artifacts.video, `${label} video`);
    receipt.snapshots.forEach((snapshot, index) => {
      verifyPointer(snapshot.screenshot, `${label} snapshot ${index}`);
    });
  }
};

if (rawRequired) {
  const bundle = readArtifacts();

  assertPliteRawMobileProof({ bundle, expectedCommit });
  verifyReadback(bundle);

  console.log(
    `[plite-browser-mobile-proof] raw direct-Appium matrix and independent artifact readback passed: ${artifactPath}`
  );
} else {
  const proxyProof = classifyBrowserMobileTransportProof('agent-browser-ios');

  if (
    proxyProof.releaseGateCapable ||
    proxyProof.supportedClaims.includes('device-browser-ime-commit')
  ) {
    throw new Error(
      'agent-browser iOS proxy evidence was incorrectly accepted as raw iOS Safari IME proof'
    );
  }

  const directProof = [
    classifyBrowserMobileTransportProof('appium-android'),
    classifyBrowserMobileTransportProof('appium-ios'),
  ];

  if (
    directProof.some((proof) =>
      proof.supportedClaims.includes('native-mobile-clipboard')
    )
  ) {
    throw new Error(
      'device text-input descriptors were incorrectly accepted as native mobile clipboard proof'
    );
  }

  const incompleteRawResult = validatePliteRawMobileProof({
    bundle: { receipts: [], schemaVersion: 1 },
    expectedCommit,
  });

  if (incompleteRawResult.ok) {
    throw new Error('an incomplete raw mobile receipt matrix was accepted');
  }

  console.log(
    '[plite-browser-mobile-proof] scoped proof classification passed: proxy transports and incomplete receipts cannot satisfy raw mobile claims'
  );
  console.log(
    `[plite-browser-mobile-proof] set PLITE_BROWSER_RAW_MOBILE_REQUIRED=1 and provide ${artifactPath} to prove raw Android/iOS device claims`
  );
}
