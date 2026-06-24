import {
  type BrowserMobileDescriptor,
  type BrowserMobileTarget,
  createBrowserMobileUrl,
  resolveBrowserMobileSurface,
} from './contracts';

/** Default iOS device label used by agent-browser proof scripts. */
export const AGENT_BROWSER_IOS_DEVICE_DEFAULT = 'iPhone 17 Pro';

/** Default iOS session label used by agent-browser proof scripts. */
export const AGENT_BROWSER_IOS_SESSION_DEFAULT = 'ios-proof';

/** Create the agent-browser descriptor for an iOS Safari proof target. */
export const createAgentBrowserIosDescriptor = (
  target: BrowserMobileTarget,
  scenario: BrowserMobileDescriptor['scenario']
): BrowserMobileDescriptor => {
  const surface = resolveBrowserMobileSurface(target.example);

  return {
    ...target,
    ...surface,
    hostReadyUrl: createBrowserMobileUrl(target),
    scenario,
    transport: 'agent-browser-ios',
    url: createBrowserMobileUrl(target),
  };
};

/** Build the agent-browser batch script for a descriptor. */
export const buildAgentBrowserIosBatch = (
  descriptor: BrowserMobileDescriptor
) =>
  JSON.stringify(
    [
      ['open', descriptor.url],
      ['wait', '2000'],
      ['click', descriptor.editorSelector],
      ...(descriptor.selectionPrepScript
        ? [['eval', descriptor.selectionPrepScript]]
        : []),
      ['type', descriptor.editorSelector, 'sushi'],
      [
        'eval',
        `document.querySelector("${descriptor.debugJsonSelector}")?.textContent`,
      ],
    ],
    null,
    2
  );
