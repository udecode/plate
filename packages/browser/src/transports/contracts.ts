import type {
  BrowserMobileScenarioId,
  ProofEvidenceClass,
} from '../core/proof';

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

/** Selectors and setup script needed to drive one mobile example surface. */
export type BrowserMobileSurface = {
  debugJsonSelector: string;
  editorSelector: string;
  selectionPrepScript?: string;
};

/** Example route target for mobile browser proof. */
export type BrowserMobileTarget = {
  debugQuery?: string;
  example: string;
  port: number;
};

/** Fully resolved mobile browser proof target. */
export type BrowserMobileDescriptor = BrowserMobileTarget & {
  debugJsonSelector: string;
  editorSelector: string;
  hostReadyUrl: string;
  scenario: BrowserMobileScenarioId;
  selectionPrepScript?: string;
  transport: BrowserMobileTransportId;
  url: string;
};

/** Build the URL used by mobile browser transports for one example target. */
export const createBrowserMobileUrl = (
  { debugQuery = 'debug=1', example, port }: BrowserMobileTarget,
  host = 'localhost'
) =>
  `http://${host}:${port}/examples/${example}${debugQuery ? `?${debugQuery}` : ''}`;

const collapseToLeadingTextSelectionScript = `
(() => {
  const owner = document.querySelector('[data-plite-node="text"]');

  if (!owner) {
    throw new Error('Missing Plite text owner');
  }

  const walker = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT);
  const textLeaf = walker.nextNode();

  if (!textLeaf) {
    throw new Error('Missing Plite text leaf');
  }

  const selection = document.getSelection();

  if (!selection) {
    throw new Error('Missing window selection');
  }

  selection.removeAllRanges();
  selection.collapse(textLeaf, 1);

  return true;
})()
`.trim();

/** Resolve selectors and setup script for a mobile browser example. */
export const resolveBrowserMobileSurface = (
  example: string
): BrowserMobileSurface => {
  switch (example) {
    case 'android-split-join':
      return {
        debugJsonSelector: '#android-split-join-debug-json',
        editorSelector: '[data-plite-editor="true"]',
        selectionPrepScript: `
(() => {
  const owners = Array.from(
    document.querySelectorAll('#android-split-join [data-plite-node="text"]')
  );
  const owner = owners.find((node) => node.textContent?.includes('middle'));

  if (!owner) {
    throw new Error('Missing middle text owner');
  }

  const walker = document.createTreeWalker(owner, NodeFilter.SHOW_TEXT);
  const textNode = walker.nextNode();

  if (!(textNode instanceof Text)) {
    throw new Error('Missing middle text leaf');
  }

  const selection = document.getSelection();

  if (!selection) {
    throw new Error('Missing window selection');
  }

  selection.removeAllRanges();
  selection.collapse(textNode, 3);

  return true;
})()
        `.trim(),
      };
    case 'android-empty-rebuild':
      return {
        debugJsonSelector: '#android-empty-rebuild-debug-json',
        editorSelector: '[data-plite-editor="true"]',
      };
    case 'android-remove-range':
      return {
        debugJsonSelector: '#android-remove-range-debug-json',
        editorSelector: '[data-plite-editor="true"]',
        selectionPrepScript: `
(() => {
  const button = document.querySelector('[data-test-id="prepare-remove-range"]');

  if (!(button instanceof HTMLElement)) {
    throw new Error('Missing prepare remove range button');
  }
  button.click();
  return true;
})()
        `.trim(),
      };
    case 'placeholder':
    case 'placeholder-no-feff':
      return {
        debugJsonSelector: '#placeholder-ime-debug-json',
        editorSelector: '#placeholder-ime',
      };
    case 'inline-edge':
      return {
        debugJsonSelector: '#inline-edge-ime-debug-json',
        editorSelector: '#inline-edge',
        selectionPrepScript: collapseToLeadingTextSelectionScript,
      };
    case 'void-edge':
      return {
        debugJsonSelector: '#void-edge-ime-debug-json',
        editorSelector: '#void-edge',
        selectionPrepScript: collapseToLeadingTextSelectionScript,
      };
    default:
      throw new Error(`Unsupported browser-mobile example: ${example}`);
  }
};
