export type SqlValue = ArrayBuffer | number | string | null;

export type RoomStorage = {
  readonly sql: {
    exec(
      query: string,
      ...bindings: SqlValue[]
    ): { toArray(): Array<Record<string, SqlValue>> };
  };
  transactionSync<T>(write: () => T): T;
};

export type RoomSocket = {
  close(code?: number, reason?: string): void;
  deserializeAttachment(): unknown;
  send(message: string): void;
  serializeAttachment(value: unknown): void;
};

export type RoomState = {
  acceptWebSocket(socket: RoomSocket): void;
  getWebSockets(): RoomSocket[];
  readonly id: Readonly<{ name?: string }>;
  readonly storage: RoomStorage;
};
