import {
  type BrowserMobileDescriptor,
  type BrowserMobileTarget,
  createBrowserMobileUrl,
  resolveBrowserMobileSurface,
} from './contracts';

/** Default Android SDK root used by local Appium proof scripts. */
export const ANDROID_SDK_ROOT_DEFAULT =
  '/opt/homebrew/Caskroom/android-platform-tools/37.0.0';

/** Default Android emulator UDID used by local Appium proof scripts. */
export const APPIUM_ANDROID_EMULATOR_DEFAULT = 'emulator-5554';

/** Default iOS simulator/device name used by local Appium proof scripts. */
export const APPIUM_IOS_DEVICE_DEFAULT = 'iPhone 17 Pro';

/** Create the Appium Android descriptor for a Chrome proof target. */
export const createAppiumAndroidDescriptor = (
  target: BrowserMobileTarget,
  scenario: BrowserMobileDescriptor['scenario']
): BrowserMobileDescriptor => {
  const surface = resolveBrowserMobileSurface(target.example);

  return {
    ...target,
    ...surface,
    hostReadyUrl: createBrowserMobileUrl(target),
    scenario,
    transport: 'appium-android',
    url: createBrowserMobileUrl(target, '10.0.2.2'),
  };
};

/** Create the Appium Android session payload for Chrome. */
export const createAppiumSessionPayload = (udid: string) => ({
  capabilities: {
    alwaysMatch: {
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': udid,
      'appium:newCommandTimeout': 60,
      'appium:udid': udid,
      browserName: 'Chrome',
      platformName: 'Android',
    },
    firstMatch: [{}],
  },
});

/** Create the Appium iOS descriptor for a Safari proof target. */
export const createAppiumIosDescriptor = (
  target: BrowserMobileTarget,
  scenario: BrowserMobileDescriptor['scenario']
): BrowserMobileDescriptor => {
  const surface = resolveBrowserMobileSurface(target.example);

  return {
    ...target,
    ...surface,
    hostReadyUrl: createBrowserMobileUrl(target),
    scenario,
    transport: 'appium-ios',
    url: createBrowserMobileUrl(target),
  };
};

/** Create the Appium iOS session payload for Safari. */
export const createAppiumIosSessionPayload = ({
  deviceName,
  udid,
}: {
  deviceName: string;
  udid?: string;
}) => ({
  capabilities: {
    alwaysMatch: {
      'appium:automationName': 'XCUITest',
      'appium:deviceName': deviceName,
      'appium:newCommandTimeout': 60,
      'appium:noReset': true,
      ...(udid ? { 'appium:udid': udid } : {}),
      browserName: 'Safari',
      platformName: 'iOS',
    },
    firstMatch: [{}],
  },
});
