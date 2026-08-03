import type {
  BrowserMobileProofPlatform,
  BrowserMobileTransportId,
} from './mobile-transport-proof';

/** Exact scenario matrix required for raw Android and iOS release proof. */
export const PLITE_RAW_MOBILE_SCENARIOS = [
  { id: 'tap', updateCount: 0 },
  { id: 'double-tap', updateCount: 0 },
  { id: 'long-press', updateCount: 0 },
  { id: 'selection-handle-forward', updateCount: 0 },
  { id: 'selection-handle-backward', updateCount: 0 },
  { id: 'cross-inline-selection', updateCount: 0 },
  { id: 'cross-block-selection', updateCount: 0 },
  { id: 'selection-autoscroll', updateCount: 0 },
  { id: 'swipe-collapsed', updateCount: 0 },
  { id: 'swipe-expanded', updateCount: 0 },
  { id: 'inline-void-boundary', updateCount: 0 },
  { id: 'enter', updateCount: 1 },
  { id: 'backspace', updateCount: 1 },
  { id: 'autocapitalization', updateCount: 1 },
  { id: 'composition-ime', updateCount: 1 },
  { id: 'native-clipboard', updateCount: 1 },
] as const;

/** Identifier for one required raw-mobile device scenario. */
export type PliteRawMobileScenarioId =
  (typeof PLITE_RAW_MOBILE_SCENARIOS)[number]['id'];

/** Relative artifact path paired with its independent readback digest. */
export type PliteRawMobileArtifactPointer = {
  path: string;
  sha256: string;
};

/** Model, DOM, selection, event, and visual evidence captured at one step. */
export type PliteRawMobileSnapshot = {
  domText: string;
  eventTrace: readonly string[];
  modelText: string;
  modelValue: unknown;
  nativeSelection: unknown;
  screenshot: PliteRawMobileArtifactPointer;
  semanticSelection: unknown;
  updateCount: number;
};

/** Direct-Appium receipt for one scenario on one real mobile device. */
export type PliteRawMobileReceipt = {
  artifacts: {
    video: PliteRawMobileArtifactPointer;
  };
  browser: {
    name: 'Chrome' | 'Safari';
    version: string;
  };
  build: {
    appUrl: string;
    commit: string;
  };
  capturedAt: string;
  device: {
    model: string;
    name: string;
    osName: 'Android' | 'iOS';
    osVersion: string;
    realDevice: true;
  };
  directAppium: true;
  platform: BrowserMobileProofPlatform;
  receiptSha256: string;
  replay: readonly unknown[];
  scenario: PliteRawMobileScenarioId;
  schemaVersion: 1;
  snapshots: readonly PliteRawMobileSnapshot[];
  transport: Extract<
    BrowserMobileTransportId,
    'appium-android' | 'appium-ios'
  >;
};

/** Complete raw-device receipt matrix consumed by the release gate. */
export type PliteRawMobileReceiptBundle = {
  receipts: readonly PliteRawMobileReceipt[];
  schemaVersion: 1;
};

/** Validation result for a raw-mobile receipt bundle. */
export type PliteRawMobileProofResult = {
  issues: string[];
  ok: boolean;
};

const isSha256 = (value: string) => /^[\da-f]{64}$/i.test(value);

const validatePointer = (
  issues: string[],
  label: string,
  pointer: PliteRawMobileArtifactPointer | undefined
) => {
  if (!pointer?.path) issues.push(`${label} is missing an artifact path`);
  if (!pointer || !isSha256(pointer.sha256)) {
    issues.push(`${label} is missing a SHA-256 digest`);
  }
};

/** Validate a complete direct-Appium Android and iOS raw-device matrix. */
export const validatePliteRawMobileProof = (
  bundle: PliteRawMobileReceiptBundle
): PliteRawMobileProofResult => {
  const issues: string[] = [];

  if (bundle.schemaVersion !== 1) {
    return {
      issues: ['Raw mobile proof bundle must use schemaVersion 1'],
      ok: false,
    };
  }

  const seen = new Set<string>();

  for (const receipt of bundle.receipts) {
    const label = `${receipt.platform}/${receipt.scenario}`;
    const expectedTransport =
      receipt.platform === 'android-chrome' ? 'appium-android' : 'appium-ios';
    const expectedBrowser =
      receipt.platform === 'android-chrome' ? 'Chrome' : 'Safari';
    const expectedOs = receipt.platform === 'android-chrome' ? 'Android' : 'iOS';
    const scenario = PLITE_RAW_MOBILE_SCENARIOS.find(
      (candidate) => candidate.id === receipt.scenario
    );

    if (seen.has(label)) issues.push(`Duplicate raw mobile receipt ${label}`);
    seen.add(label);

    if (receipt.schemaVersion !== 1) {
      issues.push(`${label} must use receipt schemaVersion 1`);
    }
    if (
      receipt.directAppium !== true ||
      receipt.transport !== expectedTransport
    ) {
      issues.push(`${label} is not direct ${expectedTransport} proof`);
    }
    if (
      receipt.device?.realDevice !== true ||
      receipt.device?.osName !== expectedOs ||
      !receipt.device?.name ||
      !receipt.device?.model ||
      !receipt.device?.osVersion
    ) {
      issues.push(`${label} is missing real-device identity`);
    }
    if (
      receipt.browser?.name !== expectedBrowser ||
      !receipt.browser?.version
    ) {
      issues.push(`${label} is missing ${expectedBrowser} identity`);
    }
    if (
      !receipt.build?.appUrl ||
      !receipt.build?.commit ||
      !Number.isFinite(Date.parse(receipt.capturedAt))
    ) {
      issues.push(`${label} is missing build or capture identity`);
    }
    if (!isSha256(receipt.receiptSha256)) {
      issues.push(`${label} is missing a receipt SHA-256 digest`);
    }
    if (receipt.replay.length === 0) {
      issues.push(`${label} is missing replay steps`);
    }
    if (receipt.snapshots.length === 0) {
      issues.push(`${label} is missing semantic snapshots`);
    } else {
      receipt.snapshots.forEach((snapshot, index) => {
        const snapshotLabel = `${label} snapshot ${index}`;

        if (
          !Array.isArray(snapshot.eventTrace) ||
          snapshot.eventTrace.length === 0
        ) {
          issues.push(`${snapshotLabel} is missing an event trace`);
        }
        if (snapshot.modelText !== snapshot.domText) {
          issues.push(`${snapshotLabel} model and DOM text diverge`);
        }
        if (
          snapshot.modelValue === undefined ||
          snapshot.nativeSelection == null ||
          snapshot.semanticSelection == null
        ) {
          issues.push(`${snapshotLabel} is missing model or selection state`);
        }
        if (!Number.isInteger(snapshot.updateCount) || snapshot.updateCount < 0) {
          issues.push(`${snapshotLabel} has an invalid update count`);
        }
        validatePointer(issues, `${snapshotLabel} screenshot`, snapshot.screenshot);
      });

      const finalSnapshot = receipt.snapshots.at(-1)!;

      if (scenario && finalSnapshot.updateCount !== scenario.updateCount) {
        issues.push(
          `${label} expected ${scenario.updateCount} semantic updates, got ${finalSnapshot.updateCount}`
        );
      }
    }

    validatePointer(issues, `${label} video`, receipt.artifacts?.video);
  }

  for (const platform of [
    'android-chrome',
    'ios-safari',
  ] satisfies BrowserMobileProofPlatform[]) {
    for (const scenario of PLITE_RAW_MOBILE_SCENARIOS) {
      const key = `${platform}/${scenario.id}`;

      if (!seen.has(key)) issues.push(`Missing raw mobile receipt ${key}`);
    }
  }

  return { issues, ok: issues.length === 0 };
};

/** Throw when a raw-device receipt bundle is incomplete or non-direct. */
export const assertPliteRawMobileProof = (
  bundle: PliteRawMobileReceiptBundle
) => {
  const result = validatePliteRawMobileProof(bundle);

  if (!result.ok) {
    throw new Error(
      `Plite raw mobile proof failed:\n${result.issues
        .map((issue) => `- ${issue}`)
        .join('\n')}`
    );
  }

  return result;
};
