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
  { id: 'cross-block-text-selection', updateCount: 0 },
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
  transport: Extract<BrowserMobileTransportId, 'appium-android' | 'appium-ios'>;
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

/** Untrusted raw-mobile bundle and the exact source commit it must prove. */
export type PliteRawMobileProofOptions = {
  bundle: unknown;
  expectedCommit: string;
};

const isSha256 = (value: string) => /^[\da-f]{64}$/i.test(value);
const isGitCommit = (value: string) => /^[\da-f]{40}$/i.test(value);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const validatePointer = (issues: string[], label: string, pointer: unknown) => {
  if (!isRecord(pointer) || typeof pointer.path !== 'string' || !pointer.path) {
    issues.push(`${label} is missing an artifact path`);
  }
  if (
    !isRecord(pointer) ||
    typeof pointer.sha256 !== 'string' ||
    !isSha256(pointer.sha256)
  ) {
    issues.push(`${label} is missing a SHA-256 digest`);
  }
};

/** Validate a complete direct-Appium Android and iOS raw-device matrix. */
export const validatePliteRawMobileProof = ({
  bundle,
  expectedCommit,
}: PliteRawMobileProofOptions): PliteRawMobileProofResult => {
  const issues: string[] = [];

  if (!isGitCommit(expectedCommit)) {
    return {
      issues: ['expectedCommit must be a 40-character Git commit'],
      ok: false,
    };
  }
  if (!isRecord(bundle) || bundle.schemaVersion !== 1) {
    return {
      issues: ['Raw mobile proof bundle must use schemaVersion 1'],
      ok: false,
    };
  }
  if (!Array.isArray(bundle.receipts)) {
    return {
      issues: ['Raw mobile proof bundle must contain a receipts array'],
      ok: false,
    };
  }

  const seen = new Set<string>();

  for (const [receiptIndex, receipt] of bundle.receipts.entries()) {
    if (!isRecord(receipt)) {
      issues.push(`Raw mobile receipt ${receiptIndex} must be an object`);
      continue;
    }

    const { platform } = receipt;
    const scenarioId = receipt.scenario;
    const label =
      typeof platform === 'string' && typeof scenarioId === 'string'
        ? `${platform}/${scenarioId}`
        : `receipt ${receiptIndex}`;
    const isSupportedPlatform =
      platform === 'android-chrome' || platform === 'ios-safari';
    const expectedTransport =
      platform === 'android-chrome' ? 'appium-android' : 'appium-ios';
    const expectedBrowser = platform === 'android-chrome' ? 'Chrome' : 'Safari';
    const expectedOs = platform === 'android-chrome' ? 'Android' : 'iOS';
    const scenario = PLITE_RAW_MOBILE_SCENARIOS.find(
      (candidate) => candidate.id === scenarioId
    );

    if (seen.has(label)) issues.push(`Duplicate raw mobile receipt ${label}`);
    seen.add(label);

    if (receipt.schemaVersion !== 1) {
      issues.push(`${label} must use receipt schemaVersion 1`);
    }
    if (!isSupportedPlatform || !scenario) {
      issues.push(`${label} has an unsupported platform or scenario`);
    }
    if (!receipt.directAppium || receipt.transport !== expectedTransport) {
      issues.push(`${label} is not direct ${expectedTransport} proof`);
    }
    const { device } = receipt;
    if (
      !isRecord(device) ||
      device.realDevice !== true ||
      device.osName !== expectedOs ||
      typeof device.name !== 'string' ||
      !device.name ||
      typeof device.model !== 'string' ||
      !device.model ||
      typeof device.osVersion !== 'string' ||
      !device.osVersion
    ) {
      issues.push(`${label} is missing real-device identity`);
    }
    const { browser } = receipt;
    if (
      !isRecord(browser) ||
      browser.name !== expectedBrowser ||
      typeof browser.version !== 'string' ||
      !browser.version
    ) {
      issues.push(`${label} is missing ${expectedBrowser} identity`);
    }
    const { build } = receipt;
    if (
      !isRecord(build) ||
      typeof build.appUrl !== 'string' ||
      !build.appUrl ||
      typeof build.commit !== 'string' ||
      !build.commit ||
      typeof receipt.capturedAt !== 'string' ||
      !Number.isFinite(Date.parse(receipt.capturedAt))
    ) {
      issues.push(`${label} is missing build or capture identity`);
    } else if (build.commit.toLowerCase() !== expectedCommit.toLowerCase()) {
      issues.push(
        `${label} was captured from commit ${build.commit}; expected ${expectedCommit}`
      );
    }
    if (
      typeof receipt.receiptSha256 !== 'string' ||
      !isSha256(receipt.receiptSha256)
    ) {
      issues.push(`${label} is missing a receipt SHA-256 digest`);
    }
    if (!Array.isArray(receipt.replay) || receipt.replay.length === 0) {
      issues.push(`${label} is missing replay steps`);
    }
    if (!Array.isArray(receipt.snapshots) || receipt.snapshots.length === 0) {
      issues.push(`${label} is missing semantic snapshots`);
    } else {
      receipt.snapshots.forEach((snapshot, index) => {
        const snapshotLabel = `${label} snapshot ${index}`;

        if (!isRecord(snapshot)) {
          issues.push(`${snapshotLabel} must be an object`);
          return;
        }
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
        if (
          typeof snapshot.updateCount !== 'number' ||
          !Number.isInteger(snapshot.updateCount) ||
          snapshot.updateCount < 0
        ) {
          issues.push(`${snapshotLabel} has an invalid update count`);
        }
        validatePointer(
          issues,
          `${snapshotLabel} screenshot`,
          snapshot.screenshot
        );
      });

      const finalSnapshot = receipt.snapshots.at(-1);

      if (
        scenario &&
        isRecord(finalSnapshot) &&
        typeof finalSnapshot.updateCount === 'number' &&
        finalSnapshot.updateCount !== scenario.updateCount
      ) {
        issues.push(
          `${label} expected ${scenario.updateCount} semantic updates, got ${finalSnapshot.updateCount}`
        );
      }
    }

    const { artifacts } = receipt;
    validatePointer(
      issues,
      `${label} video`,
      isRecord(artifacts) ? artifacts.video : undefined
    );
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
  options: PliteRawMobileProofOptions
) => {
  const result = validatePliteRawMobileProof(options);

  if (!result.ok) {
    throw new Error(
      `Plite raw mobile proof failed:\n${result.issues
        .map((issue) => `- ${issue}`)
        .join('\n')}`
    );
  }

  return result;
};
