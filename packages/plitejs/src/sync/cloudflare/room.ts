import type { Value } from '../../interfaces/editor';
import {
  createSyncServer,
  type SyncConnect,
  type SyncConnection,
  type SyncConnectionSnapshot,
  type SyncServerOptions,
} from '../server/server';
import type { SyncStorage } from '../server/storage';
import type { RoomSocket, RoomState } from './platform';
import { sqliteStorage } from './storage';

declare const WebSocketPair: new () => { 0: unknown; 1: RoomSocket };

const PROTOCOL = 'editor-sync.1';
const MAX_TOKEN = 4096;

type Attachment = Readonly<{
  connection: SyncConnectionSnapshot;
  token: string;
  version: 1;
}>;

type Held = Readonly<{ connection: SyncConnection; token: string }>;

const answer = (status: number) => new Response(null, { status });

/**
 * Runs a sync room's connections on a Durable Object's hibernatable sockets.
 * Each socket keeps its connection as an attachment, so a socket that
 * outlives the object's memory goes on where it was when the object wakes.
 */
export class SyncRoomHost {
  readonly #held = new Map<RoomSocket, Held>();
  readonly #server: Readonly<{ connect: SyncConnect }>;
  readonly #state: RoomState;

  constructor(state: RoomState, server: Readonly<{ connect: SyncConnect }>) {
    this.#server = server;
    this.#state = state;

    const room = state.id.name;

    for (const socket of state.getWebSockets()) {
      const attachment = socket.deserializeAttachment() as Attachment | null;

      if (attachment?.version === 1 && room) {
        this.#hold(socket, room, attachment.token, attachment.connection);
      } else {
        socket.close(1011, 'The room lost this connection.');
      }
    }
  }

  fetch(request: Request): Response {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return answer(426);
    }
    const room = this.#state.id.name;

    if (!room) return answer(400);

    const [protocol, token, ...rest] = (
      request.headers.get('Sec-WebSocket-Protocol') ?? ''
    )
      .split(',')
      .map((part) => part.trim());

    if (
      protocol !== PROTOCOL ||
      !token ||
      token.length > MAX_TOKEN ||
      rest.length > 0
    ) {
      return answer(401);
    }

    const { 0: client, 1: socket } = new WebSocketPair();

    this.#state.acceptWebSocket(socket);
    this.#hold(socket, room, token);
    this.#saveEveryConnection();

    const init: ResponseInit & { webSocket: unknown } = {
      headers: { 'Sec-WebSocket-Protocol': PROTOCOL },
      status: 101,
      webSocket: client,
    };

    return new Response(null, init);
  }

  async webSocketMessage(socket: RoomSocket, data: ArrayBuffer | string) {
    if (typeof data !== 'string') return;

    const held = this.#held.get(socket);

    if (!held) return;

    try {
      await held.connection.receive(data);
    } catch (error) {
      console.error('The sync room failed a turn.', error);
    } finally {
      this.#saveEveryConnection();
    }
  }

  /** Before compatibility date 2026-04-07 the platform does not answer the close itself. */
  webSocketClose(socket: RoomSocket) {
    socket.close();
    this.#drop(socket);
  }

  webSocketError(socket: RoomSocket) {
    this.#drop(socket);
  }

  #hold(
    socket: RoomSocket,
    room: string,
    token: string,
    restored?: SyncConnectionSnapshot
  ) {
    const connection = this.#server.connect(
      (data) => socket.send(data),
      { room, token },
      restored
    );

    this.#held.set(socket, { connection, token });
  }

  #drop(socket: RoomSocket) {
    this.#held.get(socket)?.connection.close();
    this.#held.delete(socket);
  }

  /** The platform hibernates only once no handler runs. */
  #saveEveryConnection() {
    for (const [socket, { connection, token }] of this.#held) {
      const attachment: Attachment = {
        connection: connection.snapshot(),
        token,
        version: 1,
      };

      try {
        socket.serializeAttachment(attachment);
      } catch {
        socket.close(1009, 'The connection outgrew what the room can keep.');
        this.#drop(socket);
      }
    }
  }
}

export type SyncRoomOptions<
  V extends Value,
  TPlugins extends readonly unknown[],
> = Omit<SyncServerOptions<V, TPlugins>, 'storage' | 'unload'>;

export const roomServer = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  state: RoomState,
  options: SyncRoomOptions<V, TPlugins>,
  storage: (real: SyncStorage) => SyncStorage = (real) => real
) =>
  createSyncServer({
    ...options,
    storage: storage(sqliteStorage(state.id.name ?? '', state.storage)),
    unload: 'host',
  });

/**
 * A Durable Object class that holds one sync room, named by the object's
 * name, in the object's SQLite storage. A tab connects with the WebSocket
 * subprotocols `editor-sync.1` and its token.
 */
export const syncRoom = <V extends Value, TPlugins extends readonly unknown[]>(
  options: SyncRoomOptions<V, TPlugins>
): new (state: RoomState, env: unknown) => SyncRoomHost =>
  class SyncRoom extends SyncRoomHost {
    constructor(state: RoomState, _env: unknown) {
      super(state, roomServer(state, options));
    }
  };
