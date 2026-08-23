import { describe, expect, test } from 'bun:test';

import {
  assertPliteRawMobileProof,
  PLITE_RAW_MOBILE_SCENARIOS,
  type PliteRawMobileReceipt,
  validatePliteRawMobileProof,
} from '../../src/core';

const hash = 'a'.repeat(64);
const commit = 'b'.repeat(40);

const receipt = (
  platform: 'android-chrome' | 'ios-safari',
  scenario: (typeof PLITE_RAW_MOBILE_SCENARIOS)[number]
): PliteRawMobileReceipt => ({
  artifacts: {
    video: { path: `${platform}-${scenario.id}.mp4`, sha256: hash },
  },
  browser: {
    name: platform === 'android-chrome' ? 'Chrome' : 'Safari',
    version: '1',
  },
  build: { appUrl: 'https://device.example/mobile-lab', commit },
  capturedAt: '2026-08-01T12:00:00.000Z',
  device: {
    model: 'Device model',
    name: 'Device name',
    osName: platform === 'android-chrome' ? 'Android' : 'iOS',
    osVersion: '1',
    realDevice: true,
  },
  directAppium: true,
  platform,
  receiptSha256: hash,
  replay: [{ action: scenario.id }],
  scenario: scenario.id,
  schemaVersion: 1,
  snapshots: [
    {
      domText: 'same',
      eventTrace: ['beforeinput'],
      modelText: 'same',
      modelValue: [{ children: [{ text: 'same' }], type: 'paragraph' }],
      nativeSelection: { anchorOffset: 4, focusOffset: 4 },
      screenshot: { path: `${platform}-${scenario.id}.png`, sha256: hash },
      semanticSelection: { anchor: [0, 0, 4], focus: [0, 0, 4] },
      updateCount: scenario.updateCount,
    },
  ],
  transport: platform === 'android-chrome' ? 'appium-android' : 'appium-ios',
});

const completeBundle = () => ({
  receipts: (['android-chrome', 'ios-safari'] as const).flatMap((platform) =>
    PLITE_RAW_MOBILE_SCENARIOS.map((scenario) => receipt(platform, scenario))
  ),
  schemaVersion: 1 as const,
});

describe('raw mobile proof receipts', () => {
  test('accepts the complete direct-Appium Android and iOS matrix', () => {
    expect(
      validatePliteRawMobileProof({
        bundle: completeBundle(),
        expectedCommit: commit,
      })
    ).toEqual({
      issues: [],
      ok: true,
    });
    expect(() =>
      assertPliteRawMobileProof({
        bundle: completeBundle(),
        expectedCommit: commit,
      })
    ).not.toThrow();
  });

  test('rejects receipts captured from a different commit', () => {
    const bundle = completeBundle();
    bundle.receipts[0] = {
      ...bundle.receipts[0],
      build: {
        ...bundle.receipts[0].build,
        commit: 'c'.repeat(40),
      },
    };

    const result = validatePliteRawMobileProof({
      bundle,
      expectedCommit: commit,
    });

    expect(result.ok).toBe(false);
    expect(result.issues[0]).toContain('was captured from commit');
  });

  test('decodes untrusted bundles without throwing', () => {
    for (const bundle of [null, {}, { receipts: [], schemaVersion: 0 }]) {
      expect(() =>
        validatePliteRawMobileProof({ bundle, expectedCommit: commit })
      ).not.toThrow();
      expect(
        validatePliteRawMobileProof({ bundle, expectedCommit: commit }).ok
      ).toBe(false);
    }

    expect(
      validatePliteRawMobileProof({
        bundle: completeBundle(),
        expectedCommit: 'not-a-commit',
      }).issues
    ).toEqual(['expectedCommit must be a 40-character Git commit']);
  });

  test('fails closed for missing, proxy, divergent, and duplicate receipts', () => {
    const bundle = completeBundle();
    const [first] = bundle.receipts;
    const result = validatePliteRawMobileProof({
      bundle: {
        ...bundle,
        receipts: [
          {
            ...first,
            directAppium: false,
            snapshots: [
              {
                ...first.snapshots[0],
                domText: 'diverged',
                updateCount: 9,
              },
            ],
            transport: 'agent-browser-ios',
          } as unknown as PliteRawMobileReceipt,
          first,
        ],
      },
      expectedCommit: commit,
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContain(
      'android-chrome/tap is not direct appium-android proof'
    );
    expect(result.issues).toContain(
      'android-chrome/tap snapshot 0 model and DOM text diverge'
    );
    expect(result.issues).toContain(
      'android-chrome/tap expected 0 semantic updates, got 9'
    );
    expect(result.issues).toContain(
      'Duplicate raw mobile receipt android-chrome/tap'
    );
    expect(result.issues).toContain(
      'Missing raw mobile receipt ios-safari/native-clipboard'
    );
  });
});
