import type { SyncHello, SyncServerMessage } from '../protocol';

export type Clock = Readonly<{
  now: () => number;
  random: () => number;
  wait: (ms: number, fire: () => void) => () => void;
}>;

export const systemClock: Clock = {
  now: () => Date.now(),
  random: () => Math.random(),
  wait: (ms, fire) => {
    const timer = setTimeout(fire, ms);

    return () => clearTimeout(timer);
  },
};

export type Dial = (
  events: Readonly<{
    closed: () => void;
    open: () => void;
    text: (data: string) => void;
  }>
) => Readonly<{ close: () => void; send: (data: string) => void }>;

export type SyncEvent =
  | SyncServerMessage
  | Readonly<{ type: 'closed' }>
  | Readonly<{ type: 'unanswered' }>;

export type SyncPeer = Readonly<{
  hello: () => SyncHello;
  receive: (event: SyncEvent) => void;
}>;

export type SyncLink = Readonly<{
  close: () => void;
  hold: (frame: string | null) => void;
  rejoin: () => void;
}>;

export type SyncTransport = Readonly<{
  connect: (peer: SyncPeer) => SyncLink;
}>;

const ANSWER_DEADLINES = [5000, 10_000, 20_000];
const FIRST_RECONNECT = 250;
const LAST_RECONNECT = 10_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const isChange = (value: unknown) => isRecord(value) && value.version === 3;

const isEntry = (value: unknown) =>
  isRecord(value) &&
  isChange(value.change) &&
  isCount(value.seq) &&
  isCount(value.version) &&
  typeof value.writer === 'string';

const isRefusal = (message: Record<string, unknown>) =>
  message.reason === 'epoch'
    ? typeof message.epoch === 'string'
    : typeof message.reason === 'string';

const RECEIPT_STATUSES = new Set([
  'accepted',
  'duplicate',
  'refused',
  'satisfied',
]);

export const readServerMessage = (data: string): SyncServerMessage | null => {
  let message: unknown;

  try {
    message = JSON.parse(data);
  } catch {
    return null;
  }

  if (!isRecord(message)) return null;

  const valid = (() => {
    switch (message.type) {
      case 'entries': {
        return (
          isCount(message.from) &&
          Array.isArray(message.entries) &&
          message.entries.every(isEntry)
        );
      }
      case 'receipt': {
        return (
          isCount(message.seq) &&
          isCount(message.version) &&
          typeof message.writer === 'string' &&
          typeof message.status === 'string' &&
          RECEIPT_STATUSES.has(message.status) &&
          (message.status === 'refused'
            ? isRefusal(message)
            : message.published === undefined || isChange(message.published))
        );
      }
      case 'refused': {
        return isRefusal(message);
      }
      case 'snapshot': {
        return isRecord(message.document) && isCount(message.version);
      }
      case 'welcome': {
        return (
          typeof message.epoch === 'string' &&
          typeof message.schema === 'string' &&
          isCount(message.version)
        );
      }
      default: {
        return false;
      }
    }
  })();

  return valid ? (message as SyncServerMessage) : null;
};

export const socketTransport = (
  dial: Dial,
  clock: Clock = systemClock
): SyncTransport => ({
  connect: (peer) => {
    let socket: ReturnType<Dial> | null = null;
    let open = false;
    let welcomed = false;
    let ended = false;
    let frame: string | null = null;
    let frameTries = 0;
    let helloTries = 0;
    let reconnectDelay = FIRST_RECONNECT;
    let cancelHello = () => {};
    let cancelFrame = () => {};
    let cancelReconnect = () => {};

    const sendFrame = () => {
      cancelFrame();
      if (!open || !welcomed || frame === null) return;
      if (frameTries >= ANSWER_DEADLINES.length) return;
      socket?.send(frame);
      cancelFrame = clock.wait(ANSWER_DEADLINES[frameTries], () => {
        frameTries += 1;
        if (frameTries < ANSWER_DEADLINES.length) {
          sendFrame();

          return;
        }
        peer.receive({ type: 'unanswered' });
        // A live room answers the hello, so only a dead socket misses its waits and reconnects.
        rejoin();
      });
    };

    const sendHello = () => {
      cancelHello();
      cancelFrame();
      if (!open) return;
      welcomed = false;
      socket?.send(JSON.stringify(peer.hello()));
      cancelHello = clock.wait(ANSWER_DEADLINES[helloTries], () => {
        helloTries += 1;
        if (helloTries < ANSWER_DEADLINES.length) sendHello();
        else socket?.close();
      });
    };

    const rejoin = () => {
      helloTries = 0;
      sendHello();
    };

    const redial = () => {
      const delay = reconnectDelay * (0.5 + clock.random() / 2);

      reconnectDelay = Math.min(reconnectDelay * 2, LAST_RECONNECT);
      cancelReconnect = clock.wait(delay, start);
    };

    const start = () => {
      if (ended) return;
      try {
        socket = dial({
          closed: () => {
            if (!open && socket === null) return;
            open = false;
            welcomed = false;
            socket = null;
            cancelHello();
            cancelFrame();
            if (ended) return;
            peer.receive({ type: 'closed' });
            redial();
          },
          open: () => {
            open = true;
            helloTries = 0;
            frameTries = 0;
            sendHello();
          },
          text: (data) => {
            const message = readServerMessage(data);

            if (!message || ended) return;
            if (message.type === 'welcome' || message.type === 'refused') {
              cancelHello();
              welcomed = message.type === 'welcome';
              if (welcomed) reconnectDelay = FIRST_RECONNECT;
            }
            peer.receive(message);
            if (message.type === 'welcome') sendFrame();
          },
        });
      } catch {
        redial();
      }
    };

    start();

    return {
      close: () => {
        ended = true;
        cancelHello();
        cancelFrame();
        cancelReconnect();
        socket?.close();
        socket = null;
      },
      hold: (next) => {
        if (next === frame) return;
        frame = next;
        frameTries = 0;
        sendFrame();
      },
      rejoin,
    };
  },
});
