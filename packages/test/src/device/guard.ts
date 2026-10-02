// Guarded DevTools relay for the device lane
// (docs/plans/2026-10-02-proof-device-lane.md): a WebSocket endpoint in front
// of Chrome's that refuses every command able to synthesize input.
//
// Node loads this file directly for tooling/device, so it has no relative
// imports and only erasable TypeScript.

import { createHash } from 'node:crypto';
import { createServer, type IncomingMessage, type Server } from 'node:http';
import type { Duplex } from 'node:stream';

export type GuardedEndpoint = {
  close: () => Promise<void>;
  endpoint: string;
  refused: Array<{ method: string; sessionId: string | null }>;
};

// Playwright multiplexes every session over the browser WebSocket, so
// refusing `Input.*` here covers its internal sessions.

const WS_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

const encodeFrame = (payload: Buffer, opcode = 0x1) => {
  const { length } = payload;
  const header =
    length < 126
      ? Buffer.from([0x80 | opcode, length])
      : length < 65_536
        ? Buffer.from([0x80 | opcode, 126, length >> 8, length & 0xff])
        : Buffer.concat([
            Buffer.from([0x80 | opcode, 127]),
            (() => {
              const size = Buffer.alloc(8);
              size.writeBigUInt64BE(BigInt(length));
              return size;
            })(),
          ]);

  return Buffer.concat([header, payload]);
};

const relayClient = (
  socket: Duplex,
  onMessage: (text: string) => void,
  onClose: () => void
) => {
  let buffer = Buffer.alloc(0);
  let fragments: Buffer[] = [];

  socket.on('data', (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);

    for (;;) {
      if (buffer.length < 2) return;

      const fin = (buffer[0] & 0x80) !== 0;
      const opcode = buffer[0] & 0x0f;
      const masked = (buffer[1] & 0x80) !== 0;
      let length = buffer[1] & 0x7f;
      let offset = 2;

      if (length === 126) {
        if (buffer.length < 4) return;
        length = buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (buffer.length < 10) return;
        length = Number(buffer.readBigUInt64BE(2));
        offset = 10;
      }

      const maskOffset = offset;

      if (masked) offset += 4;
      if (buffer.length < offset + length) return;

      const payload = Buffer.from(buffer.subarray(offset, offset + length));

      if (masked) {
        for (let index = 0; index < payload.length; index++) {
          payload[index] ^= buffer[maskOffset + (index % 4)];
        }
      }

      buffer = buffer.subarray(offset + length);

      if (opcode === 0x8) {
        socket.end(encodeFrame(Buffer.alloc(0), 0x8));
        onClose();
        return;
      }
      if (opcode === 0x9) {
        socket.write(encodeFrame(payload, 0xa));
        continue;
      }
      if (opcode === 0xa) continue;

      fragments.push(payload);
      if (fin) {
        onMessage(Buffer.concat(fragments).toString('utf-8'));
        fragments = [];
      }
    }
  });
  socket.on('close', onClose);
  socket.on('error', onClose);
};

type RelayedCommand = { id: number; method?: string; sessionId?: string };

// Anything else is not a DevTools command, and the relay drops its client.
const parseCommand = (text: string): RelayedCommand | null => {
  let value: unknown;

  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof value !== 'object' || value === null) return null;

  const { id, method, sessionId } = value as Record<string, unknown>;

  return typeof id === 'number' &&
    (method === undefined || typeof method === 'string') &&
    (sessionId === undefined || typeof sessionId === 'string')
    ? { id, method, sessionId }
    : null;
};

/**
 * Serve a DevTools endpoint that forwards to `upstreamPort` and refuses every
 * `Input.*` command on every session, plus the two channels that could carry
 * one past the relay: the legacy `Target.sendMessageToTarget` wrapper and
 * `Target.exposeDevToolsProtocol`, which gives page script its own DevTools
 * connection.
 */
export const startGuardedEndpoint = async ({
  port = 0,
  upstreamPort,
}: {
  port?: number;
  upstreamPort: number;
}): Promise<GuardedEndpoint> => {
  const upstream = `http://127.0.0.1:${upstreamPort}`;
  const refused: GuardedEndpoint['refused'] = [];
  const sockets = new Set<Duplex>();
  const server: Server = createServer(async (request, response) => {
    try {
      const upstreamResponse = await fetch(`${upstream}${request.url}`);
      const upstreamBody = await upstreamResponse.text();
      const body = upstreamBody.replaceAll(
        new RegExp(`ws://(localhost|127\\.0\\.0\\.1):${upstreamPort}`, 'g'),
        `ws://127.0.0.1:${address().port}`
      );

      response.writeHead(upstreamResponse.status, {
        'content-type': 'application/json',
      });
      response.end(body);
    } catch (error) {
      response.writeHead(502);
      response.end(String(error));
    }
  });
  const address = () => server.address() as { port: number };

  server.on('upgrade', (request: IncomingMessage, socket: Duplex) => {
    const key = request.headers['sec-websocket-key'];

    if (!key) {
      socket.destroy();
      return;
    }

    sockets.add(socket);
    socket.write(
      [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${createHash('sha1')
          .update(key + WS_GUID)
          .digest('base64')}`,
        '',
        '',
      ].join('\r\n')
    );

    const device = new WebSocket(
      `ws://127.0.0.1:${upstreamPort}${request.url}`
    );
    const pending: string[] = [];
    const close = () => {
      sockets.delete(socket);
      socket.destroy();
      device.close();
    };

    device.addEventListener('open', () => {
      for (const message of pending.splice(0)) device.send(message);
    });
    device.addEventListener('message', (event) => {
      socket.write(encodeFrame(Buffer.from(String(event.data), 'utf-8')));
    });
    device.addEventListener('close', close);
    device.addEventListener('error', close);

    relayClient(
      socket,
      (text) => {
        const message = parseCommand(text);

        if (!message) {
          close();
          return;
        }

        if (
          message.method?.startsWith('Input.') ||
          message.method === 'Target.sendMessageToTarget' ||
          message.method === 'Target.exposeDevToolsProtocol'
        ) {
          refused.push({
            method: message.method,
            sessionId: message.sessionId ?? null,
          });
          socket.write(
            encodeFrame(
              Buffer.from(
                JSON.stringify({
                  error: {
                    code: -32_000,
                    message: `The device lane refuses ${message.method}; input must come from real touches.`,
                  },
                  id: message.id,
                  ...(message.sessionId
                    ? { sessionId: message.sessionId }
                    : {}),
                })
              )
            )
          );
          return;
        }

        if (device.readyState === WebSocket.OPEN) device.send(text);
        else pending.push(text);
      },
      close
    );
  });

  await new Promise<void>((resolve) => {
    server.listen(port, '127.0.0.1', resolve);
  });

  return {
    close: async () => {
      for (const socket of sockets) socket.destroy();
      server.closeAllConnections();
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    },
    endpoint: `http://127.0.0.1:${address().port}`,
    refused,
  };
};
