const environmentUrl = new URL('../src/utils/environment.ts', import.meta.url)
  .href;

const getEnvironmentSupport = async (
  userAgent: string,
  inputEventPrototype: string,
  platform = ''
) => {
  const child = Bun.spawn({
    cmd: [
      process.execPath,
      '--eval',
      `
delete globalThis.navigator
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: {
    platform: ${JSON.stringify(platform)},
    userAgent: ${JSON.stringify(userAgent)},
  },
})
Object.defineProperty(globalThis, 'InputEvent', {
  configurable: true,
  value: class InputEvent ${inputEventPrototype},
})

const env = await import(${JSON.stringify(environmentUrl)})
console.log(JSON.stringify({
  hasBeforeInputSupport: Boolean(env.HAS_BEFORE_INPUT_SUPPORT),
  isApple: Boolean(env.IS_APPLE),
}))
      `,
    ],
    stderr: 'pipe',
    stdout: 'pipe',
  });

  const [exitCode, stderr, stdout] = await Promise.all([
    child.exited,
    child.stderr.text(),
    child.stdout.text(),
  ]);

  expect(stderr).toBe('');
  expect(exitCode).toBe(0);

  return JSON.parse(stdout) as {
    hasBeforeInputSupport: boolean;
    isApple: boolean;
  };
};

describe('plite-dom environment', () => {
  test('enables beforeinput support when InputEvent exposes target ranges', async () => {
    const environment = await getEnvironmentSupport(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      `{
        getTargetRanges() {
          return []
        }
      }`
    );

    expect(environment.hasBeforeInputSupport).toBe(true);
  });

  test('disables beforeinput support when target ranges are unavailable', async () => {
    const environment = await getEnvironmentSupport(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '{}'
    );

    expect(environment.hasBeforeInputSupport).toBe(false);
  });

  test('does not special-case old Chrome when target ranges are available', async () => {
    const environment = await getEnvironmentSupport(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36',
      `{
        getTargetRanges() {
          return []
        }
      }`
    );

    expect(environment.hasBeforeInputSupport).toBe(true);
  });

  test('prefers the browser platform when the user agent is spoofed', async () => {
    const environment = await getEnvironmentSupport(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      '{}',
      'MacIntel'
    );

    expect(environment.isApple).toBe(true);
  });
});
