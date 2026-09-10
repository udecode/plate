import { expect, test } from 'bun:test';

import { createProbeTransport } from './lifetime-browser-probe';

test('completed probe responses release transport authority without aborting', async () => {
  const transport = createProbeTransport();
  const controller = new AbortController();
  try {
    const response = await fetch('https://kit-probe.invalid', {
      signal: controller.signal,
    });
    const request = transport.requests[0];
    expect(transport.activeRequests()).toBe(1);
    request.send({ type: 'finish' });
    request.close();
    await response.text();
    expect(controller.signal.aborted).toBe(false);
    expect(transport.activeRequests()).toBe(0);
    expect(() => request.send({ type: 'late' })).toThrow();
  } finally {
    transport.requests.forEach((request) => request.close());
    transport.restore();
  }
});

test('open probe responses retain authority until aborted or completed', async () => {
  const transport = createProbeTransport();
  const controller = new AbortController();
  try {
    await fetch('https://kit-probe.invalid', { signal: controller.signal });
    expect(transport.activeRequests()).toBe(1);
    controller.abort();
    expect(transport.activeRequests()).toBe(0);
    transport.requests[0].close();
    expect(transport.activeRequests()).toBe(0);
  } finally {
    transport.requests.forEach((request) => request.close());
    transport.restore();
  }
});
