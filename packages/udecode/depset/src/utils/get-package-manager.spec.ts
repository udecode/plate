import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test';

const detectMock = mock();

mock.module('@antfu/ni', () => ({
  detect: detectMock,
}));

const loadModule = async () =>
  import(`./get-package-manager?test=${Math.random().toString(36).slice(2)}`);

describe('getPackageManager', () => {
  const originalUserAgent = process.env.npm_config_user_agent;

  afterEach(() => {
    detectMock.mockReset();

    if (originalUserAgent === undefined) {
      delete process.env.npm_config_user_agent;
    } else {
      process.env.npm_config_user_agent = originalUserAgent;
    }
  });

  afterAll(() => {
    mock.restore();
  });

  it('normalizes detected package manager variants', async () => {
    const { getPackageManager } = await loadModule();

    detectMock.mockResolvedValueOnce('yarn@berry');
    await expect(getPackageManager('/tmp')).resolves.toBe('yarn');

    detectMock.mockResolvedValueOnce('pnpm@10.0.0');
    await expect(getPackageManager('/tmp')).resolves.toBe('pnpm');

    detectMock.mockResolvedValueOnce('bun');
    await expect(getPackageManager('/tmp')).resolves.toBe('bun');
  });

  it('falls back to npm_config_user_agent when detection fails', async () => {
    const { getPackageManager } = await loadModule();

    detectMock.mockResolvedValueOnce(null);
    process.env.npm_config_user_agent = 'pnpm/10.0.0 node/v22.0.0';

    await expect(getPackageManager('/tmp')).resolves.toBe('pnpm');
  });

  it('normalizes yarn from the fallback user agent and defaults empty agents to npm', async () => {
    const { getPackageManager } = await loadModule();

    detectMock.mockResolvedValueOnce(null);
    process.env.npm_config_user_agent = 'yarn/4.0.0 npm/? node/v22.0.0';
    await expect(getPackageManager('/tmp')).resolves.toBe('yarn');

    detectMock.mockResolvedValueOnce(null);
    delete process.env.npm_config_user_agent;
    await expect(getPackageManager('/tmp')).resolves.toBe('npm');
  });

  it('returns npm when nothing matches or fallback is disabled', async () => {
    const { getPackageManager } = await loadModule();

    detectMock.mockResolvedValue(null);
    process.env.npm_config_user_agent = 'unknown/1.0.0';

    await expect(
      getPackageManager('/tmp', { withFallback: false })
    ).resolves.toBe('npm');
    await expect(getPackageManager('/tmp')).resolves.toBe('npm');
  });

  it('forwards the programmatic option to detection and supports bun fallback', async () => {
    const { getPackageManager } = await loadModule();

    detectMock.mockResolvedValueOnce('npm');
    await expect(
      getPackageManager('/tmp/project', { programmatic: false })
    ).resolves.toBe('npm');
    expect(detectMock).toHaveBeenCalledWith({
      cwd: '/tmp/project',
      programmatic: false,
    });

    detectMock.mockResolvedValueOnce(null);
    process.env.npm_config_user_agent = 'bun/1.2.0 node/v22.0.0';

    await expect(getPackageManager('/tmp')).resolves.toBe('bun');
  });
});
