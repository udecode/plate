// Guarded DevTools relay for the device lane
// (docs/plans/2026-10-02-proof-device-lane.md): a WebSocket endpoint in front
// of Chrome's that refuses every command able to synthesize input.
//
// Node loads this file directly for tooling/device, so it has no relative
// imports and only erasable TypeScript.

import { createHash } from 'node:crypto';
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
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

export const devToolsCommand = <T>(
  upstreamPort: number,
  method: string,
  params: object
) =>
  new Promise<T>((resolve, reject) => {
    const socket = new WebSocket(
      `ws://127.0.0.1:${upstreamPort}/devtools/browser`
    );
    const fail = (error: Error) => {
      clearTimeout(timer);
      socket.close();
      reject(error);
    };
    const timer = setTimeout(() => {
      fail(new Error(`Chrome did not answer ${method} within 10 s.`));
    }, 10_000);

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ id: 1, method, params }));
    });
    socket.addEventListener('message', (event) => {
      const reply = JSON.parse(String(event.data)) as {
        error?: { message: string };
        id?: number;
        result?: T;
      };

      if (reply.id !== 1) return;
      if (reply.error) {
        fail(new Error(`${method}: ${reply.error.message}`));
        return;
      }
      clearTimeout(timer);
      socket.close();
      resolve(reply.result as T);
    });
    socket.addEventListener('error', () => {
      fail(new Error(`The DevTools socket failed during ${method}.`));
    });
  });

type DeviceMessage = {
  id?: number;
  method?: string;
  params?: {
    sessionId?: string;
    targetInfo?: { openerId?: string; targetId: string; type: string };
    waitingForDebugger?: boolean;
  };
  sessionId?: string;
};

/**
 * Serve a DevTools endpoint that forwards to `upstreamPort` and refuses every
 * `Input.*` command on every session, plus the two channels that could carry
 * one past the relay: the legacy `Target.sendMessageToTarget` wrapper and
 * `Target.exposeDevToolsProtocol`, which gives page script its own DevTools
 * connection.
 *
 * Playwright's connectOverCDP waits for every page it attaches to, so one hung
 * tab the run does not own would stall the connect.
 */
export const startGuardedEndpoint = async ({
  port = 0,
  targetIds,
  upstreamPort,
}: {
  port?: number;
  targetIds: string[];
  upstreamPort: number;
}): Promise<GuardedEndpoint> => {
  const upstream = `http://127.0.0.1:${upstreamPort}`;
  const owned = new Set(targetIds);
  const refused: GuardedEndpoint['refused'] = [];
  const sockets = new Set<Duplex>();
  const proxy = async (request: IncomingMessage, response: ServerResponse) => {
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
  };
  const server: Server = createServer((request, response) => {
    void proxy(request, response);
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
    const foreignSessions = new Set<string>();
    const relayIds = new Set<number>();
    // Playwright numbers its commands up from 1.
    let nextRelayId = 2 ** 30;
    const close = () => {
      sockets.delete(socket);
      socket.destroy();
      device.close();
    };
    const sendFromRelay = (
      method: string,
      params: object,
      sessionId?: string
    ) => {
      const id = nextRelayId;

      nextRelayId += 1;
      relayIds.add(id);
      device.send(
        JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) })
      );
    };
    const dropForeign = (text: string) => {
      if (
        relayIds.size === 0 &&
        foreignSessions.size === 0 &&
        !text.includes('"Target.attachedToTarget"')
      ) {
        return false;
      }

      const message = JSON.parse(text) as DeviceMessage;

      if (message.id !== undefined) return relayIds.delete(message.id);
      if (message.sessionId) return foreignSessions.has(message.sessionId);
      if (message.method === 'Target.detachedFromTarget') {
        return foreignSessions.delete(message.params?.sessionId ?? '');
      }
      if (message.method !== 'Target.attachedToTarget' || !message.params) {
        return false;
      }

      const { sessionId, targetInfo, waitingForDebugger } = message.params;

      if (!sessionId || !targetInfo || targetInfo.type === 'browser') {
        return false;
      }
      if (owned.has(targetInfo.targetId)) return false;
      if (targetInfo.openerId && owned.has(targetInfo.openerId)) {
        owned.add(targetInfo.targetId);
        return false;
      }
      foreignSessions.add(sessionId);
      if (waitingForDebugger) {
        sendFromRelay('Runtime.runIfWaitingForDebugger', {}, sessionId);
      }
      sendFromRelay('Target.detachFromTarget', { sessionId });
      return true;
    };

    device.addEventListener('open', () => {
      for (const message of pending.splice(0)) device.send(message);
    });
    device.addEventListener('message', (event) => {
      const text = String(event.data);

      if (dropForeign(text)) return;
      socket.write(encodeFrame(Buffer.from(text, 'utf-8')));
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
