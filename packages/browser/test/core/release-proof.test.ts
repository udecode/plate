import { describe, expect, test } from 'bun:test';

import {
  assertPliteBrowserReleaseProof,
  createBrowserMobileReleaseProofArtifact,
  createReleaseDisciplineProofArtifact,
  PLITE_BROWSER_RELEASE_DISCIPLINE_GUARDS,
  type PliteBrowserMobileDeviceProofArtifact,
  validatePliteBrowserReleaseProof,
} from '../../src/core';

describe('release proof helpers', () => {
  test('accepts direct Appium mobile proof and release discipline artifacts', () => {
    const artifacts = [
      createBrowserMobileReleaseProofArtifact({
        passed: true,
        scenario: 'placeholder-ime',
        transport: 'appium-android',
      }),
      createBrowserMobileReleaseProofArtifact({
        passed: true,
        scenario: 'inline-edge-ime',
        transport: 'appium-ios',
      }),
      createReleaseDisciplineProofArtifact({
        guards: [...PLITE_BROWSER_RELEASE_DISCIPLINE_GUARDS],
        passed: true,
      }),
    ];

    expect(
      validatePliteBrowserReleaseProof({
        artifacts,
        claims: [
          'android-chrome-device-browser-text-input',
          'android-chrome-device-browser-ime-commit',
          'ios-safari-device-browser-text-input',
          'ios-safari-device-browser-ime-commit',
          'release-discipline-guards',
        ],
      })
    ).toEqual({ issues: [], ok: true });
  });

  test('does not let semantic or proxy mobile proof satisfy raw device claims', () => {
    const result = validatePliteBrowserReleaseProof({
      artifacts: [
        createBrowserMobileReleaseProofArtifact({
          passed: true,
          scenario: 'placeholder-ime',
          transport: 'agent-browser-ios',
        }),
      ],
      claims: ['ios-safari-device-browser-ime-commit'],
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual([
      'Missing automated-direct release proof for ios-safari device-browser-ime-commit',
    ]);
  });

  test('does not let forged proxy mobile fields satisfy raw device claims', () => {
    const result = validatePliteBrowserReleaseProof({
      artifacts: [
        {
          capabilities: [
            'device-browser-text-input',
            'device-browser-ime-commit',
          ],
          evidenceClass: 'automated-direct',
          kind: 'mobile-device',
          passed: true,
          platform: 'ios-safari',
          releaseGateCapable: true,
          scenario: 'placeholder-ime',
          transport: 'agent-browser-ios',
        } satisfies PliteBrowserMobileDeviceProofArtifact,
      ],
      claims: ['ios-safari-device-browser-ime-commit'],
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual([
      'Missing automated-direct release proof for ios-safari device-browser-ime-commit',
    ]);
  });

  test('keeps native mobile clipboard outside the release claim without explicit direct evidence', () => {
    const android = createBrowserMobileReleaseProofArtifact({
      passed: true,
      scenario: 'placeholder-ime',
      transport: 'appium-android',
    });
    const ios = createBrowserMobileReleaseProofArtifact({
      passed: true,
      scenario: 'inline-edge-ime',
      transport: 'appium-ios',
    });

    const result = validatePliteBrowserReleaseProof({
      artifacts: [android, ios],
      claims: ['native-mobile-clipboard'],
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual([
      'Missing automated-direct release proof for android-chrome native-mobile-clipboard',
      'Missing automated-direct release proof for ios-safari native-mobile-clipboard',
    ]);
  });

  test('requires all release discipline guards', () => {
    const result = validatePliteBrowserReleaseProof({
      artifacts: [
        createReleaseDisciplineProofArtifact({
          guards: ['public-surface-contract'],
          passed: true,
        }),
      ],
      claims: ['release-discipline-guards'],
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual([
      'Missing release discipline guards: public-field-hard-cut-contract, escape-hatch-inventory-contract, write-boundary-contract, leaf-lifecycle-contract, selection-rebase-contract, rendered-dom-shape-contract, destructive-leaf-boundary-gauntlet, leaf-delete-parity, compat-alias-hard-cut-contract',
    ]);
  });

  test('accepts a later complete release discipline artifact', () => {
    const result = validatePliteBrowserReleaseProof({
      artifacts: [
        createReleaseDisciplineProofArtifact({
          guards: ['public-surface-contract'],
          passed: true,
        }),
        createReleaseDisciplineProofArtifact({
          guards: [...PLITE_BROWSER_RELEASE_DISCIPLINE_GUARDS],
          passed: true,
        }),
      ],
      claims: ['release-discipline-guards'],
    });

    expect(result).toEqual({ issues: [], ok: true });
  });

  test('throws with actionable release proof failures', () => {
    expect(() =>
      assertPliteBrowserReleaseProof({
        artifacts: [
          {
            capabilities: ['device-browser-ime-commit'],
            evidenceClass: 'automated-direct',
            kind: 'mobile-device',
            passed: false,
            platform: 'android-chrome',
            releaseGateCapable: true,
            scenario: 'placeholder-ime',
            transport: 'appium-android',
          } satisfies PliteBrowserMobileDeviceProofArtifact,
        ],
        claims: ['android-chrome-device-browser-ime-commit'],
      })
    ).toThrow(
      /Missing automated-direct release proof for android-chrome device-browser-ime-commit/
    );
  });
});
