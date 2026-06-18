#!/usr/bin/env bun

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const artifactPath = resolve(
  repoRoot,
  process.env.SLATE_BROWSER_MOBILE_PROOF_ARTIFACTS ??
    'test-results/release-proof/mobile-device-proof.json'
);
const rawRequired = process.env.SLATE_BROWSER_RAW_MOBILE_REQUIRED === '1';

const {
  assertSlateBrowserReleaseProof,
  createBrowserMobileReleaseProofArtifact,
  validateSlateBrowserReleaseProof,
} = await import(
  new URL('../../packages/browser/src/core/release-proof.ts', import.meta.url)
    .href
);

const rawMobileClaims = [
  'android-chrome-device-browser-text-input',
  'android-chrome-device-browser-ime-commit',
  'ios-safari-device-browser-text-input',
  'ios-safari-device-browser-ime-commit',
  'native-mobile-clipboard',
];

const readArtifacts = () => {
  if (!existsSync(artifactPath)) {
    throw new Error(
      `Missing raw mobile proof artifacts at ${artifactPath}. Run the Appium/device lane and write slate-browser release proof artifacts before claiming raw mobile support.`
    );
  }

  const parsed = JSON.parse(readFileSync(artifactPath, 'utf8'));

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed.artifacts)) {
    return parsed.artifacts;
  }

  throw new Error(
    `Expected ${artifactPath} to contain an artifact array or { "artifacts": [...] }`
  );
};

if (rawRequired) {
  const artifacts = readArtifacts();

  assertSlateBrowserReleaseProof({
    artifacts,
    claims: rawMobileClaims,
  });

  console.log(
    `[slate-browser-mobile-proof] raw mobile release proof passed: ${artifactPath}`
  );
} else {
  const scopedProxyResult = validateSlateBrowserReleaseProof({
    artifacts: [
      createBrowserMobileReleaseProofArtifact({
        passed: true,
        scenario: 'agent-browser-ios-proxy',
        transport: 'agent-browser-ios',
      }),
    ],
    claims: ['ios-safari-device-browser-ime-commit'],
  });

  if (scopedProxyResult.ok) {
    throw new Error(
      'agent-browser iOS proxy evidence was incorrectly accepted as raw iOS Safari IME proof'
    );
  }

  const scopedClipboardResult = validateSlateBrowserReleaseProof({
    artifacts: [
      createBrowserMobileReleaseProofArtifact({
        passed: true,
        scenario: 'appium-android-text-input',
        transport: 'appium-android',
      }),
      createBrowserMobileReleaseProofArtifact({
        passed: true,
        scenario: 'appium-ios-text-input',
        transport: 'appium-ios',
      }),
    ],
    claims: ['native-mobile-clipboard'],
  });

  if (scopedClipboardResult.ok) {
    throw new Error(
      'device text-input descriptors were incorrectly accepted as native mobile clipboard proof'
    );
  }

  console.log(
    '[slate-browser-mobile-proof] scoped release proof passed: semantic/proxy rows cannot satisfy raw mobile IME or clipboard claims'
  );
  console.log(
    `[slate-browser-mobile-proof] set SLATE_BROWSER_RAW_MOBILE_REQUIRED=1 and provide ${artifactPath} to prove raw Android/iOS device claims`
  );
}
