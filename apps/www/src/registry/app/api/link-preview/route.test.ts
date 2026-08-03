import { afterAll, describe, expect, it, mock } from 'bun:test';

const dnsLookup = mock(async () => [
  { address: '93.184.216.34', family: 4 as const },
]);
let pinnedAddress: string | undefined;
let pinnedFamily: number | undefined;

const request = mock(
  (
    _url: URL,
    options: {
      lookup: (
        hostname: string,
        options: { all?: boolean },
        callback: (
          error: Error | null,
          address: string | Array<{ address: string; family: number }>,
          family?: number
        ) => void
      ) => void;
    }
  ) => {
    const listeners = new Map<string, (error: Error) => void>();

    options.lookup(
      'rebinding.example',
      { all: true },
      (_error, result, family) => {
        const pinned = Array.isArray(result)
          ? result[0]
          : { address: result, family: family! };

        pinnedAddress = pinned.address;
        pinnedFamily = pinned.family;
      }
    );

    return {
      end: () => listeners.get('error')?.(new Error('stop after lookup')),
      on: (event: string, listener: (error: Error) => void) => {
        listeners.set(event, listener);
      },
    };
  }
);

mock.module('node:dns/promises', () => ({ lookup: dnsLookup }));
mock.module('node:http', () => ({ request }));
mock.module('node:https', () => ({ request }));

afterAll(() => {
  mock.restore();
});

describe('link preview request ownership', () => {
  it('pins the request transport to the address validated before fetch', async () => {
    const { NextRequest } = await import('next/server');
    const { GET } = await import(`./route?test=${Math.random()}`);
    const response = await GET(
      new NextRequest(
        'http://localhost/api/link-preview?url=https://rebinding.example'
      )
    );

    expect(response.status).toBe(422);
    expect(dnsLookup).toHaveBeenCalledTimes(1);
    expect(pinnedAddress).toBe('93.184.216.34');
    expect(pinnedFamily).toBe(4);
  });
});
