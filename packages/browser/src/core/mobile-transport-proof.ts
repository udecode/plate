import type { ProofEvidenceClass } from './proof';

/** Supported automation transport ids for mobile browser proof. */
export type BrowserMobileTransportId =
  | 'agent-browser-ios'
  | 'appium-android'
  | 'appium-ios';

/** Browser platform represented by a mobile transport. */
export type BrowserMobileProofPlatform = 'android-chrome' | 'ios-safari';

/** Claims a transport can support with its current proof channel. */
export type BrowserMobileSupportedClaim =
  | 'debug-snapshot'
  | 'device-browser-ime-commit'
  | 'device-browser-text-input';

/** Claims a transport explicitly cannot prove. */
export type BrowserMobileUnsupportedClaim =
  | 'device-browser-ime-commit'
  | 'glide-typing'
  | 'human-soft-keyboard'
  | 'native-mobile-clipboard'
  | 'voice-input';

/** Proof capability matrix entry for one mobile browser transport. */
export type BrowserMobileTransportProof = {
  evidenceClass: ProofEvidenceClass;
  platform: BrowserMobileProofPlatform;
  releaseGateCapable: boolean;
  supportedClaims: BrowserMobileSupportedClaim[];
  transport: BrowserMobileTransportId;
  unsupportedClaims: BrowserMobileUnsupportedClaim[];
};

const DIRECT_DEVICE_SUPPORTED_CLAIMS = [
  'device-browser-text-input',
  'device-browser-ime-commit',
  'debug-snapshot',
] satisfies readonly BrowserMobileSupportedClaim[];

const DIRECT_DEVICE_UNSUPPORTED_CLAIMS = [
  'native-mobile-clipboard',
  'human-soft-keyboard',
  'glide-typing',
  'voice-input',
] satisfies readonly BrowserMobileUnsupportedClaim[];

/** Classify the proof strength and claim coverage of a mobile transport. */
export const classifyBrowserMobileTransportProof = (
  transport: BrowserMobileTransportId
): BrowserMobileTransportProof => {
  switch (transport) {
    case 'appium-android':
      return {
        evidenceClass: 'automated-direct',
        platform: 'android-chrome',
        releaseGateCapable: true,
        supportedClaims: [...DIRECT_DEVICE_SUPPORTED_CLAIMS],
        transport,
        unsupportedClaims: [...DIRECT_DEVICE_UNSUPPORTED_CLAIMS],
      };
    case 'appium-ios':
      return {
        evidenceClass: 'automated-direct',
        platform: 'ios-safari',
        releaseGateCapable: true,
        supportedClaims: [...DIRECT_DEVICE_SUPPORTED_CLAIMS],
        transport,
        unsupportedClaims: [...DIRECT_DEVICE_UNSUPPORTED_CLAIMS],
      };
    case 'agent-browser-ios':
      return {
        evidenceClass: 'automated-proxy',
        platform: 'ios-safari',
        releaseGateCapable: false,
        supportedClaims: ['device-browser-text-input', 'debug-snapshot'],
        transport,
        unsupportedClaims: [
          'native-mobile-clipboard',
          'device-browser-ime-commit',
          'human-soft-keyboard',
          'glide-typing',
          'voice-input',
        ],
      };
  }
};

/** Return the proof capability matrix for every known mobile transport. */
export const getBrowserMobileTransportProofMatrix = () =>
  (
    [
      'appium-android',
      'appium-ios',
      'agent-browser-ios',
    ] satisfies BrowserMobileTransportId[]
  ).map(classifyBrowserMobileTransportProof);
