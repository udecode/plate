import type {
  BrowserMobileProofPlatform,
  BrowserMobileSupportedClaim,
  BrowserMobileTransportId,
  BrowserMobileUnsupportedClaim,
} from '../transports/contracts';
import { classifyBrowserMobileTransportProof } from '../transports/contracts';
import type { ProofEvidenceClass } from './proof';

/** Browser proof claim that can block release-quality assertions. */
export type PliteBrowserReleaseClaim =
  | 'android-chrome-device-browser-text-input'
  | 'android-chrome-device-browser-ime-commit'
  | 'ios-safari-device-browser-text-input'
  | 'ios-safari-device-browser-ime-commit'
  | 'native-mobile-clipboard'
  | 'persistent-browser-caret-soak'
  | 'release-discipline-guards';

export type PliteBrowserMobileReleaseCapability =
  | BrowserMobileSupportedClaim
  | BrowserMobileUnsupportedClaim;

/** Raw-device browser proof artifact for mobile claims. */
export type PliteBrowserMobileDeviceProofArtifact = {
  capabilities: PliteBrowserMobileReleaseCapability[];
  evidenceClass: ProofEvidenceClass;
  kind: 'mobile-device';
  passed: boolean;
  platform: BrowserMobileProofPlatform;
  releaseGateCapable: boolean;
  scenario: string;
  transport: BrowserMobileTransportId;
};

/** Persistent-profile browser soak proof artifact. */
export type PliteBrowserPersistentSoakProofArtifact = {
  browserName: string;
  iterations: number;
  kind: 'persistent-browser-soak';
  passed: boolean;
  profilePersistence: 'ephemeral' | 'persistent';
  replayable: boolean;
  scenario: string;
};

/** Proof artifact for release-discipline guard coverage. */
export type PliteBrowserReleaseDisciplineProofArtifact = {
  guards: string[];
  kind: 'release-discipline';
  passed: boolean;
};

/** Union of browser proof artifacts accepted by release proof validation. */
export type PliteBrowserReleaseProofArtifact =
  | PliteBrowserMobileDeviceProofArtifact
  | PliteBrowserPersistentSoakProofArtifact
  | PliteBrowserReleaseDisciplineProofArtifact;

export type PliteBrowserReleaseProofOptions = {
  artifacts: readonly PliteBrowserReleaseProofArtifact[];
  claims: readonly PliteBrowserReleaseClaim[];
  requiredDisciplineGuards?: readonly string[];
  requiredSoakIterations?: number;
};

/** Result of validating browser release proof artifacts. */
export type PliteBrowserReleaseProofResult = {
  issues: string[];
  ok: boolean;
};

/** Required guard names for browser release-discipline proof. */
export const PLITE_BROWSER_RELEASE_DISCIPLINE_GUARDS = [
  'public-surface-contract',
  'public-field-hard-cut-contract',
  'escape-hatch-inventory-contract',
  'write-boundary-contract',
  'leaf-lifecycle-contract',
  'selection-rebase-contract',
  'rendered-dom-shape-contract',
  'destructive-leaf-boundary-gauntlet',
  'leaf-delete-parity',
  'compat-alias-hard-cut-contract',
] as const;

/** Create a raw-device mobile browser proof artifact. */
export const createBrowserMobileReleaseProofArtifact = ({
  passed,
  scenario,
  transport,
}: {
  passed: boolean;
  scenario: string;
  transport: BrowserMobileTransportId;
}): PliteBrowserMobileDeviceProofArtifact => {
  const proof = classifyBrowserMobileTransportProof(transport);

  return {
    capabilities: proof.supportedClaims,
    evidenceClass: proof.evidenceClass,
    kind: 'mobile-device',
    passed,
    platform: proof.platform,
    releaseGateCapable: proof.releaseGateCapable,
    scenario,
    transport,
  };
};

/** Create a persistent-profile browser soak proof artifact. */
export const createPersistentBrowserSoakProofArtifact = ({
  browserName,
  iterations,
  passed,
  profilePersistence,
  replayable,
  scenario,
}: Omit<
  PliteBrowserPersistentSoakProofArtifact,
  'kind'
>): PliteBrowserPersistentSoakProofArtifact => ({
  browserName,
  iterations,
  kind: 'persistent-browser-soak',
  passed,
  profilePersistence,
  replayable,
  scenario,
});

/** Create a release-discipline proof artifact. */
export const createReleaseDisciplineProofArtifact = ({
  guards,
  passed,
}: Omit<
  PliteBrowserReleaseDisciplineProofArtifact,
  'kind'
>): PliteBrowserReleaseDisciplineProofArtifact => ({
  guards: [...guards],
  kind: 'release-discipline',
  passed,
});

const hasDirectMobileProof = (
  artifacts: readonly PliteBrowserReleaseProofArtifact[],
  platform: BrowserMobileProofPlatform,
  capability: PliteBrowserMobileReleaseCapability
) =>
  artifacts.some((artifact) => {
    if (artifact.kind !== 'mobile-device' || !artifact.passed) {
      return false;
    }

    const proof = classifyBrowserMobileTransportProof(artifact.transport);

    return (
      proof.releaseGateCapable &&
      proof.evidenceClass === 'automated-direct' &&
      proof.platform === platform &&
      proof.supportedClaims.some((claim) => claim === capability)
    );
  });

const describeMobileClaim = (
  platform: BrowserMobileProofPlatform,
  capability: PliteBrowserMobileReleaseCapability
) => `${platform} ${capability}`;

const validateMobileClaim = (
  issues: string[],
  artifacts: readonly PliteBrowserReleaseProofArtifact[],
  platform: BrowserMobileProofPlatform,
  capability: PliteBrowserMobileReleaseCapability
) => {
  if (!hasDirectMobileProof(artifacts, platform, capability)) {
    issues.push(
      `Missing automated-direct release proof for ${describeMobileClaim(
        platform,
        capability
      )}`
    );
  }
};

const validatePersistentSoak = (
  issues: string[],
  artifacts: readonly PliteBrowserReleaseProofArtifact[],
  requiredSoakIterations: number
) => {
  const artifact = artifacts.find(
    (candidate) =>
      candidate.kind === 'persistent-browser-soak' &&
      candidate.passed &&
      candidate.profilePersistence === 'persistent' &&
      candidate.replayable &&
      candidate.iterations >= requiredSoakIterations
  );

  if (!artifact) {
    issues.push(
      `Missing persistent browser soak proof with at least ${requiredSoakIterations} replayable iterations`
    );
  }
};

const validateReleaseDiscipline = (
  issues: string[],
  artifacts: readonly PliteBrowserReleaseProofArtifact[],
  requiredDisciplineGuards: readonly string[]
) => {
  const artifact = artifacts.find(
    (candidate) =>
      candidate.kind === 'release-discipline' &&
      candidate.passed &&
      requiredDisciplineGuards.every((guard) =>
        candidate.guards.includes(guard)
      )
  );

  if (artifact) {
    return;
  }

  const incompleteArtifact = artifacts.find(
    (candidate) => candidate.kind === 'release-discipline' && candidate.passed
  );

  if (!incompleteArtifact || incompleteArtifact.kind !== 'release-discipline') {
    issues.push('Missing release discipline proof artifact');
    return;
  }

  const missing = requiredDisciplineGuards.filter(
    (guard) => !incompleteArtifact.guards.includes(guard)
  );

  if (missing.length > 0) {
    issues.push(`Missing release discipline guards: ${missing.join(', ')}`);
  }
};

/** Validate browser proof artifacts against requested release claims. */
export const validatePliteBrowserReleaseProof = ({
  artifacts,
  claims,
  requiredDisciplineGuards = PLITE_BROWSER_RELEASE_DISCIPLINE_GUARDS,
  requiredSoakIterations = 5,
}: PliteBrowserReleaseProofOptions): PliteBrowserReleaseProofResult => {
  const issues: string[] = [];

  for (const claim of claims) {
    switch (claim) {
      case 'android-chrome-device-browser-text-input':
        validateMobileClaim(
          issues,
          artifacts,
          'android-chrome',
          'device-browser-text-input'
        );
        break;
      case 'android-chrome-device-browser-ime-commit':
        validateMobileClaim(
          issues,
          artifacts,
          'android-chrome',
          'device-browser-ime-commit'
        );
        break;
      case 'ios-safari-device-browser-text-input':
        validateMobileClaim(
          issues,
          artifacts,
          'ios-safari',
          'device-browser-text-input'
        );
        break;
      case 'ios-safari-device-browser-ime-commit':
        validateMobileClaim(
          issues,
          artifacts,
          'ios-safari',
          'device-browser-ime-commit'
        );
        break;
      case 'native-mobile-clipboard':
        validateMobileClaim(
          issues,
          artifacts,
          'android-chrome',
          'native-mobile-clipboard'
        );
        validateMobileClaim(
          issues,
          artifacts,
          'ios-safari',
          'native-mobile-clipboard'
        );
        break;
      case 'persistent-browser-caret-soak':
        validatePersistentSoak(issues, artifacts, requiredSoakIterations);
        break;
      case 'release-discipline-guards':
        validateReleaseDiscipline(issues, artifacts, requiredDisciplineGuards);
        break;
    }
  }

  return {
    issues,
    ok: issues.length === 0,
  };
};

/** Throw when browser proof artifacts do not satisfy requested claims. */
export const assertPliteBrowserReleaseProof = (
  options: PliteBrowserReleaseProofOptions
) => {
  const result = validatePliteBrowserReleaseProof(options);

  if (!result.ok) {
    throw new Error(
      `Plite browser release proof failed:\n${result.issues
        .map((issue) => `- ${issue}`)
        .join('\n')}`
    );
  }

  return result;
};
