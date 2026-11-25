import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { connect } from 'node:net';
import { setTimeout as sleep } from 'node:timers/promises';

type Plist =
  | boolean
  | Buffer
  | number
  | string
  | Plist[]
  | { [key: string]: Plist };

const header = Buffer.from('bplist00');
const offsetSize = 4;
const refSize = 2;

const encodePlist = (root: Plist) => {
  const objects: Buffer[] = [];
  const add = (value: Plist): number => {
    const index = objects.length;

    objects.push(Buffer.alloc(0));
    objects[index] = encodeObject(value, add);

    return index;
  };

  add(root);

  const offsets: number[] = [];
  let offset = header.length;

  for (const object of objects) {
    offsets.push(offset);
    offset += object.length;
  }

  const table = Buffer.alloc(offsets.length * offsetSize);

  offsets.forEach((at, index) =>
    table.writeUIntBE(at, index * offsetSize, offsetSize)
  );

  const trailer = Buffer.alloc(32);

  trailer[6] = offsetSize;
  trailer[7] = refSize;
  trailer.writeBigUInt64BE(BigInt(objects.length), 8);
  trailer.writeBigUInt64BE(BigInt(offset), 24);

  return Buffer.concat([header, ...objects, table, trailer]);
};

const sized = (kind: number, count: number) => {
  if (count < 15) return Buffer.from([(kind << 4) | count]);

  const length = Buffer.alloc(9);

  length[0] = 0x13;
  length.writeBigInt64BE(BigInt(count), 1);

  return Buffer.concat([Buffer.from([(kind << 4) | 15]), length]);
};

const ref = (index: number) => {
  const bytes = Buffer.alloc(refSize);

  bytes.writeUIntBE(index, 0, refSize);

  return bytes;
};

const encodeObject = (value: Plist, add: (value: Plist) => number) => {
  if (typeof value === 'boolean') return Buffer.from([value ? 0x09 : 0x08]);
  if (typeof value === 'number') {
    const bytes = Buffer.alloc(9);

    bytes[0] = 0x13;
    bytes.writeBigInt64BE(BigInt(value), 1);

    return bytes;
  }
  if (Buffer.isBuffer(value)) {
    return Buffer.concat([sized(4, value.length), value]);
  }
  if (typeof value === 'string') {
    if (Buffer.byteLength(value) === value.length) {
      return Buffer.concat([
        sized(5, value.length),
        Buffer.from(value, 'ascii'),
      ]);
    }

    const utf16 = Buffer.from(value, 'utf16le').swap16();

    return Buffer.concat([sized(6, utf16.length / 2), utf16]);
  }
  if (Array.isArray(value)) {
    return Buffer.concat([
      sized(10, value.length),
      ...value.map((item) => ref(add(item))),
    ]);
  }

  const keys = Object.keys(value);
  const keyRefs = keys.map((key) => ref(add(key)));
  const valueRefs = keys.map((key) => ref(add(value[key])));

  return Buffer.concat([sized(13, keys.length), ...keyRefs, ...valueRefs]);
};

const decodePlist = (buffer: Buffer): Plist => {
  const trailer = buffer.subarray(buffer.length - 32);
  const offsetBytes = trailer[6];
  const refBytes = trailer[7];
  const count = Number(trailer.readBigUInt64BE(8));
  const tableOffset = Number(trailer.readBigUInt64BE(24));
  const uint = (at: number, size: number) => buffer.readUIntBE(at, size);
  const offsets = Array.from({ length: count }, (_, index) =>
    uint(tableOffset + index * offsetBytes, offsetBytes)
  );
  const parse = (index: number): Plist => {
    let at = offsets[index];
    const marker = buffer[at];
    const kind = marker >> 4;
    let length = marker & 15;

    at += 1;
    if (kind === 0) return marker === 0x09;
    if (kind === 1) {
      const size = 1 << length;

      return size === 8 ? Number(buffer.readBigInt64BE(at)) : uint(at, size);
    }
    if (kind === 2) {
      return length === 3 ? buffer.readDoubleBE(at) : buffer.readFloatBE(at);
    }
    if (length === 15) {
      const size = 1 << (buffer[at] & 15);

      length = uint(at + 1, size);
      at += 1 + size;
    }
    if (kind === 4) return buffer.subarray(at, at + length);
    if (kind === 5) return buffer.toString('ascii', at, at + length);
    if (kind === 6) {
      return Buffer.from(buffer.subarray(at, at + length * 2))
        .swap16()
        .toString('utf16le');
    }
    if (kind === 10) {
      return Array.from({ length }, (_, item) =>
        parse(uint(at + item * refBytes, refBytes))
      );
    }
    if (kind === 13) {
      const entries: Record<string, Plist> = {};

      for (let item = 0; item < length; item += 1) {
        entries[parse(uint(at + item * refBytes, refBytes)) as string] = parse(
          uint(at + (length + item) * refBytes, refBytes)
        );
      }

      return entries;
    }
    throw new Error(`Unsupported binary plist marker 0x${marker.toString(16)}`);
  };

  return parse(Number(trailer.readBigUInt64BE(16)));
};

type Message = { __argument: Record<string, Plist>; __selector: string };

type ProtocolReply = {
  error?: { message: string };
  id: number;
  result?: {
    result: { description?: string; objectId?: string; value?: unknown };
    wasThrown?: boolean;
  };
};

const settled = ({ error, result }: ProtocolReply) => {
  if (!result) {
    throw new Error(error?.message ?? 'The inspector command failed');
  }
  if (result.wasThrown) throw new Error(result.result.description);

  return result.result;
};

export type InspectorPageInfo = {
  appId: string;
  id: number;
  title: string;
  url: string;
};

export type InspectorPage = {
  close: () => void;
  evaluate: <T>(expression: string) => Promise<T>;
};

export const inspectorSocket = (udid: string) =>
  execFileSync('xcrun', ['simctl', 'getenv', udid, 'RWI_LISTEN_SOCKET'], {
    encoding: 'utf-8',
  }).trim();

export const connectWebInspector = async (socketPath: string) => {
  const connection = randomUUID().toUpperCase();
  const socket = connect(socketPath);
  const listeners = new Set<(message: Message) => void>();
  let pending = Buffer.alloc(0);

  socket.on('data', (chunk) => {
    pending = Buffer.concat([pending, chunk]);
    while (
      pending.length >= 4 &&
      pending.length >= 4 + pending.readUInt32BE(0)
    ) {
      const size = pending.readUInt32BE(0);
      const message = decodePlist(pending.subarray(4, 4 + size)) as Message;

      pending = pending.subarray(4 + size);
      for (const listener of listeners) listener(message);
    }
  });
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', resolve).once('error', reject);
  });

  const send = (selector: string, argument: Record<string, Plist>) => {
    const body = encodePlist({
      __argument: { WIRConnectionIdentifierKey: connection, ...argument },
      __selector: selector,
    });
    const head = Buffer.alloc(4);

    head.writeUInt32BE(body.length);
    socket.write(Buffer.concat([head, body]));
  };
  const next = (match: (message: Message) => boolean, timeout = 10_000) =>
    new Promise<Message>((resolve, reject) => {
      const timer = setTimeout(() => {
        listeners.delete(listener);
        reject(new Error('The Web Inspector did not answer in time'));
      }, timeout);
      const listener = (message: Message) => {
        if (!match(message)) return;
        clearTimeout(timer);
        listeners.delete(listener);
        resolve(message);
      };

      listeners.add(listener);
    });

  const safari = new Set<string>();
  const track = (app: Record<string, Plist>) => {
    if (app.WIRApplicationBundleIdentifierKey === 'com.apple.mobilesafari') {
      safari.add(app.WIRApplicationIdentifierKey as string);
    }
  };

  listeners.add(({ __argument, __selector }) => {
    if (__selector === '_rpc_reportConnectedApplicationList:') {
      for (const app of Object.values(
        __argument.WIRApplicationDictionaryKey as Record<
          string,
          Record<string, Plist>
        >
      )) {
        track(app);
      }
    } else if (__selector === '_rpc_applicationConnected:') {
      track(__argument);
    } else if (__selector === '_rpc_applicationDisconnected:') {
      safari.delete(__argument.WIRApplicationIdentifierKey as string);
    }
  });

  const applications = next(
    (message) => message.__selector === '_rpc_reportConnectedApplicationList:'
  );

  send('_rpc_reportIdentifier:', {});
  await applications;

  const safariPages = async (): Promise<InspectorPageInfo[]> => {
    const listings = await Promise.all(
      [...safari].map(async (appId) => {
        const listing = next(
          (message) =>
            message.__selector === '_rpc_applicationSentListing:' &&
            message.__argument.WIRApplicationIdentifierKey === appId,
          3000
        ).catch(() => null);

        send('_rpc_forwardGetListing:', { WIRApplicationIdentifierKey: appId });

        const answer = await listing;
        const entries = answer?.__argument.WIRListingKey ?? {};

        return Object.values(entries as Record<string, Record<string, Plist>>)
          .filter((page) => page.WIRTypeKey === 'WIRTypeWebPage')
          .map((page) => ({
            appId,
            id: page.WIRPageIdentifierKey as number,
            title: (page.WIRTitleKey as string) ?? '',
            url: (page.WIRURLKey as string) ?? '',
          }));
      })
    );

    return listings.flat();
  };

  const open = async (page: InspectorPageInfo): Promise<InspectorPage> => {
    const sender = randomUUID().toUpperCase();
    const route = {
      WIRApplicationIdentifierKey: page.appId,
      WIRPageIdentifierKey: page.id,
      WIRSenderKey: sender,
    };
    const replies = new Map<number, (reply: ProtocolReply) => void>();
    let id = 0;
    let target = '';
    let markCreated = () => {};
    const created = new Promise<void>((resolve) => {
      markCreated = resolve;
    });
    const listener = (message: Message) => {
      if (
        message.__selector !== '_rpc_applicationSentData:' ||
        message.__argument.WIRDestinationKey !== sender
      ) {
        return;
      }

      const event = JSON.parse(
        (message.__argument.WIRMessageDataKey as Buffer).toString()
      );

      if (event.error) {
        replies.get(event.id)?.(event);
        replies.delete(event.id);
      } else if (
        event.method === 'Target.targetCreated' &&
        !event.params.targetInfo.isProvisional
      ) {
        target = event.params.targetInfo.targetId;
        markCreated();
      } else if (event.method === 'Target.didCommitProvisionalTarget') {
        target = event.params.newTargetId;
      } else if (event.method === 'Target.dispatchMessageFromTarget') {
        const reply = JSON.parse(event.params.message) as ProtocolReply;

        replies.get(reply.id)?.(reply);
        replies.delete(reply.id);
      }
    };

    const command = (
      method: string,
      params: Record<string, unknown>,
      expression: string
    ) => {
      id += 1;

      const sent = id;
      const reply = new Promise<ProtocolReply>((resolve, reject) => {
        const timer = setTimeout(() => {
          replies.delete(sent);
          reject(
            new Error(
              `${method} of ${expression.replaceAll(/\s+/g, ' ').slice(0, 80)} got no answer from ${page.url} within 60 s`
            )
          );
        }, 60_000);

        replies.set(sent, (answer) => {
          clearTimeout(timer);
          resolve(answer);
        });
      });

      send('_rpc_forwardSocketData:', {
        ...route,
        WIRSocketDataKey: Buffer.from(
          JSON.stringify({
            id: sent,
            method: 'Target.sendMessageToTarget',
            params: {
              message: JSON.stringify({ id: sent, method, params }),
              targetId: target,
            },
          })
        ),
      });

      return reply;
    };

    listeners.add(listener);
    send('_rpc_forwardSocketSetup:', {
      ...route,
      WIRAutomaticallyPause: false,
    });
    await Promise.race([
      created,
      sleep(10_000, undefined, { ref: false }).then(() => {
        throw new Error(`No inspector target for ${page.url}`);
      }),
    ]);

    return {
      close: () => {
        listeners.delete(listener);
        send('_rpc_forwardDidClose:', route);
      },
      evaluate: async <T>(expression: string) => {
        const promise = settled(
          await command(
            'Runtime.evaluate',
            { expression: `Promise.resolve((${expression}))` },
            expression
          )
        );
        const value = settled(
          await command(
            'Runtime.awaitPromise',
            { promiseObjectId: promise.objectId, returnByValue: true },
            expression
          )
        );

        return value.value as T;
      },
    };
  };

  return { close: () => socket.end(), open, safariPages };
};
