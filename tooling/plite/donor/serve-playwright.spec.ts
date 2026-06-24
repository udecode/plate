const scriptUrl = new URL('./serve-playwright.mjs', import.meta.url);

const runWithPort = async (port: string) => {
  const child = Bun.spawn({
    cmd: ['node', scriptUrl.pathname],
    env: {
      ...process.env,
      PORT: port,
    },
    stderr: 'pipe',
    stdout: 'pipe',
  });

  const [exitCode, stderr, stdout] = await Promise.all([
    child.exited,
    new Response(child.stderr).text(),
    new Response(child.stdout).text(),
  ]);

  return { exitCode, stderr, stdout };
};

describe('serve-playwright PORT validation', () => {
  test('rejects non-numeric PORT values before server startup', async () => {
    const result = await runWithPort('abc');

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain(
      'Invalid PORT "abc". PORT must be an integer from 1 to 65535.'
    );
  });

  test('rejects out-of-range PORT values before server startup', async () => {
    const result = await runWithPort('70000');

    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain(
      'Invalid PORT "70000". PORT must be an integer from 1 to 65535.'
    );
  });
});

describe('serve-playwright request failures', () => {
  test('returns 500 when serve-handler rejects before headers are sent', async () => {
    const { createPlaywrightRequestListener } = (await import(
      scriptUrl.href
    )) as {
      createPlaywrightRequestListener: (
        requestHandler: () => Promise<void>
      ) => (
        request: unknown,
        response: {
          destroy: () => void;
          end: (body: string) => void;
          headersSent: boolean;
          statusCode: number;
        }
      ) => void;
    };
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    const listener = createPlaywrightRequestListener(async () => {
      throw new Error('serve failed');
    });
    let destroyed = false;
    let ended = false;
    let responseBody = '';
    const response = {
      headersSent: false,
      statusCode: 200,
      destroy: () => {
        destroyed = true;
      },
      end: (body: string) => {
        ended = true;
        responseBody = body;
      },
    };

    try {
      listener({}, response);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(response.statusCode).toBe(500);
      expect(responseBody).toBe('Internal Server Error');
      expect(ended).toBe(true);
      expect(destroyed).toBe(false);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy.mock.calls[0]?.[0]).toBe(
        'Playwright server request failed:'
      );
      expect(errorSpy.mock.calls[0]?.[1]).toBeInstanceOf(Error);
    } finally {
      errorSpy.mockRestore();
    }
  });
});
