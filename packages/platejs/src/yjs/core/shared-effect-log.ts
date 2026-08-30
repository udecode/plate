import * as Y from 'yjs';

import {
  decodeEditorEffect,
  encodeEditorEffect,
  type EditorEffect,
  type EditorEffectCollabReplay,
  type EditorEffectType,
  type SerializedEditorEffect,
  assertEditorJsonValue,
} from '../../core';
import {
  plitePointToYjsRelativePosition,
  pliteRangeToYjsRelativeRange,
  yjsRelativePositionToPlitePoint,
  yjsRelativeRangeToPliteRange,
} from './selection';

const SHARED_EFFECT_EVENT_FORMAT = 1;
const SHARED_EFFECT_CHECKPOINT_FORMAT = 1;
const SHARED_EFFECT_ACK_FORMAT = 1;
const SHARED_EFFECT_AUTHORITY_FORMAT = 1;
const DEFAULT_COMPACTION_THRESHOLD = 256;
const CHECKPOINT_KEY = 'current';
const AUTHORITY_KEY = 'authority';
const RETIRED_PEERS_SUFFIX = 'shared-effect-retired-peers';
const LOCAL_COMPACTION_AUTHORITIES = new WeakMap<
  Y.Map<unknown>,
  YjsSharedEffectLog
>();

type YjsSharedEffectEvent = Readonly<{
  effect: SerializedEditorEffect;
  format: typeof SHARED_EFFECT_EVENT_FORMAT;
  id: string;
  recipients: readonly string[];
  replay: EditorEffectCollabReplay;
  sequence: number;
  source: string;
}>;

type YjsSharedEffectWatermarks = Readonly<Record<string, number>>;

type YjsSharedEffectCheckpoint = Readonly<{
  effects: readonly SerializedEditorEffect[];
  format: typeof SHARED_EFFECT_CHECKPOINT_FORMAT;
  id: string;
  through: YjsSharedEffectWatermarks;
}>;

type YjsSharedEffectAck = Readonly<{
  active: boolean;
  consumed: readonly string[];
  format: typeof SHARED_EFFECT_ACK_FORMAT;
  through: YjsSharedEffectWatermarks;
}>;

type YjsSharedEffectAuthority = Readonly<{
  authorityId: string;
  format: typeof SHARED_EFFECT_AUTHORITY_FORMAT;
  peerId: string;
}>;

type YjsSharedEffectLogOptions = Readonly<{
  authorityId?: string;
  captureSnapshotEffects: () => readonly EditorEffect[];
  onCheckpoint: () => void;
  peerId: string;
  threshold?: number;
}>;

export type PendingYjsSharedEffects = Readonly<{
  effects: readonly EditorEffect[];
  eventIds: readonly string[];
}>;

export type PreparedYjsSharedEffects = readonly SerializedEditorEffect[];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const deepFreeze = <T>(value: T): T => {
  if (value === null || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);

  return value;
};

const readSerializedEffect = (
  input: unknown
): SerializedEditorEffect | undefined => {
  if (
    !isRecord(input) ||
    typeof input.key !== 'string' ||
    input.key.length === 0 ||
    !Number.isSafeInteger(input.version) ||
    (input.version as number) < 1 ||
    !Object.hasOwn(input, 'value')
  ) {
    return undefined;
  }

  try {
    assertEditorJsonValue(input.value, 'Yjs shared effect value');
    return Object.freeze({
      key: input.key,
      value: deepFreeze(structuredClone(input.value)),
      version: input.version as number,
    });
  } catch {
    // Invalid effect-log metadata is excluded from the shared payload.
  }

  return undefined;
};

const getEventId = (source: string, sequence: number): string =>
  `${source}:${String(sequence)}`;

const getCheckpointEventId = (id: string): string => `@checkpoint:${id}`;

const CANONICAL_SOURCE_PATTERN = /^(?:0|[1-9]\d*)$/;

const isCanonicalSource = (source: string): boolean => {
  if (!CANONICAL_SOURCE_PATTERN.test(source)) return false;

  const clientId = Number(source);

  return Number.isSafeInteger(clientId) && clientId >= 0;
};

const readSharedEffectAuthority = (
  input: unknown
): YjsSharedEffectAuthority | undefined => {
  if (
    !isRecord(input) ||
    input.format !== SHARED_EFFECT_AUTHORITY_FORMAT ||
    typeof input.authorityId !== 'string' ||
    input.authorityId.length === 0 ||
    typeof input.peerId !== 'string' ||
    !isCanonicalSource(input.peerId)
  ) {
    return undefined;
  }

  return Object.freeze({
    authorityId: input.authorityId,
    format: SHARED_EFFECT_AUTHORITY_FORMAT,
    peerId: input.peerId,
  });
};

const readEventId = (
  input: unknown
): Readonly<{ sequence: number; source: string }> | undefined => {
  if (typeof input !== 'string') return undefined;

  const separator = input.indexOf(':');

  if (separator < 1 || separator !== input.lastIndexOf(':')) return undefined;

  const source = input.slice(0, separator);
  const sequence = Number(input.slice(separator + 1));

  if (
    !isCanonicalSource(source) ||
    !Number.isSafeInteger(sequence) ||
    sequence < 1 ||
    input !== getEventId(source, sequence)
  ) {
    return undefined;
  }

  return Object.freeze({ sequence, source });
};

const readRecipients = (input: unknown): readonly string[] | undefined => {
  if (!Array.isArray(input)) return undefined;

  const recipients = new Set<string>();

  for (const peerId of input) {
    if (typeof peerId !== 'string' || !isCanonicalSource(peerId)) {
      return undefined;
    }

    recipients.add(peerId);
  }

  return Object.freeze([...recipients].sort());
};

const readWatermarks = (
  input: unknown
): YjsSharedEffectWatermarks | undefined => {
  if (!isRecord(input)) return undefined;

  const entries: Array<readonly [string, number]> = [];

  for (const [source, value] of Object.entries(input)) {
    if (
      !isCanonicalSource(source) ||
      !Number.isSafeInteger(value) ||
      (value as number) < 0
    ) {
      return undefined;
    }

    entries.push([source, value as number]);
  }

  return Object.freeze(Object.fromEntries(entries));
};

const createCheckpointId = (through: YjsSharedEffectWatermarks): string =>
  JSON.stringify(
    Object.entries(through).sort(([left], [right]) =>
      left < right ? -1 : left > right ? 1 : 0
    )
  );

const readSharedEffectCheckpoint = (
  input: unknown
): YjsSharedEffectCheckpoint | undefined => {
  if (
    !isRecord(input) ||
    input.format !== SHARED_EFFECT_CHECKPOINT_FORMAT ||
    typeof input.id !== 'string' ||
    !Array.isArray(input.effects)
  ) {
    return undefined;
  }

  const through = readWatermarks(input.through);
  const effects = input.effects.map(readSerializedEffect);

  if (
    !through ||
    input.id !== createCheckpointId(through) ||
    effects.some((effect) => effect === undefined)
  ) {
    return undefined;
  }

  return Object.freeze({
    effects: Object.freeze(effects as SerializedEditorEffect[]),
    format: SHARED_EFFECT_CHECKPOINT_FORMAT,
    id: input.id,
    through,
  });
};

const readSharedEffectAck = (
  input: unknown
): YjsSharedEffectAck | undefined => {
  if (
    !isRecord(input) ||
    input.format !== SHARED_EFFECT_ACK_FORMAT ||
    typeof input.active !== 'boolean' ||
    !Array.isArray(input.consumed)
  ) {
    return undefined;
  }

  const through = readWatermarks(input.through);
  const consumed = input.consumed.map((eventId) =>
    readEventId(eventId) ? (eventId as string) : undefined
  );

  if (!through || consumed.some((eventId) => eventId === undefined)) {
    return undefined;
  }

  return Object.freeze({
    active: input.active,
    consumed: Object.freeze([...new Set<string>(consumed as string[])].sort()),
    format: SHARED_EFFECT_ACK_FORMAT,
    through,
  });
};

const serializeYjsId = (id: { client: number; clock: number }) =>
  Object.freeze({ client: id.client, clock: id.clock });

const serializeRelativePosition = (position: Y.RelativePosition) =>
  Object.freeze({
    ...(position.type ? { type: serializeYjsId(position.type) } : {}),
    ...(position.tname ? { tname: position.tname } : {}),
    ...(position.item ? { item: serializeYjsId(position.item) } : {}),
    assoc: position.assoc,
  });

const readSharedEffectEvent = (
  input: unknown
): YjsSharedEffectEvent | undefined => {
  if (
    !isRecord(input) ||
    input.format !== SHARED_EFFECT_EVENT_FORMAT ||
    typeof input.source !== 'string' ||
    !isCanonicalSource(input.source) ||
    !Number.isSafeInteger(input.sequence) ||
    (input.sequence as number) < 1 ||
    typeof input.id !== 'string' ||
    !isRecord(input.effect) ||
    (input.replay !== 'latest' && input.replay !== 'live')
  ) {
    return undefined;
  }

  const sequence = input.sequence as number;

  if (input.id !== getEventId(input.source, sequence)) {
    return undefined;
  }

  const effect = readSerializedEffect(input.effect);
  const recipients = readRecipients(input.recipients);

  if (
    !effect ||
    !recipients ||
    (input.replay === 'latest' && recipients.length > 0)
  ) {
    return undefined;
  }

  return Object.freeze({
    effect,
    format: SHARED_EFFECT_EVENT_FORMAT,
    id: input.id,
    recipients,
    replay: input.replay,
    sequence,
    source: input.source,
  });
};

/**
 * Stable, causally ordered transport for shared editor effects.
 *
 * Consumption uses per-source watermarks and a sparse out-of-order set. Live
 * events persist their causal recipients so late joins and reconnects remain
 * distinct. One explicit authority atomically checkpoints a safe prefix.
 */
export class YjsSharedEffectLog {
  private readonly acknowledgements: Y.Map<unknown>;
  private active = false;
  private readonly authorityId: string | undefined;
  private readonly captureSnapshotEffects: () => readonly EditorEffect[];
  private checkpointInput: unknown = undefined;
  private checkpointRead = false;
  private readonly checkpointStore: Y.Map<unknown>;
  private compactionRequested = false;
  private readonly compactionOrigin = {};
  private readonly consumedCheckpointIds = new Set<string>();
  private readonly consumedOutOfOrder = new Map<string, Set<number>>();
  private readonly consumedThrough = new Map<string, number>();
  private readonly doc: Y.Doc;
  private readonly effects: Y.Array<unknown>;
  private readonly nextSequenceBySource = new Map<string, number>();
  private readonly onCheckpoint: () => void;
  private pendingCheckpoint?: YjsSharedEffectCheckpoint;
  private readonly pendingEvents = new Map<string, YjsSharedEffectEvent>();
  private pendingHead = 0;
  private pendingOrder: string[] = [];
  private readonly resolveEffectType: (
    key: string
  ) => EditorEffectType | undefined;
  private readonly retiredPeers: Y.Map<unknown>;
  private readonly root: Y.XmlElement;
  private readonly peerId: string;
  private readonly threshold: number;
  private readonly acknowledgementsObserver = (): void => {
    this.compactionRequested = true;
  };
  private readonly checkpointObserver = (
    event: Y.YMapEvent<unknown>,
    transaction: Y.Transaction
  ): void => {
    if (event.keysChanged.has(AUTHORITY_KEY)) {
      this.compactionRequested = true;
    }
    if (!event.keysChanged.has(CHECKPOINT_KEY)) return;

    this.refreshCheckpoint();
    if (!this.isInternalTransaction(transaction)) this.onCheckpoint();
  };

  constructor(
    doc: Y.Doc,
    rootName: string,
    root: Y.XmlElement,
    resolveEffectType: (key: string) => EditorEffectType | undefined,
    options: YjsSharedEffectLogOptions
  ) {
    this.doc = doc;
    this.effects = doc.getArray(`${rootName}:shared-effect-events`);
    this.acknowledgements = doc.getMap(`${rootName}:shared-effect-acks`);
    this.checkpointStore = doc.getMap(`${rootName}:shared-effect-checkpoint`);
    this.retiredPeers = doc.getMap(`${rootName}:${RETIRED_PEERS_SUFFIX}`);
    this.resolveEffectType = resolveEffectType;
    this.root = root;
    this.authorityId = options.authorityId;
    this.captureSnapshotEffects = options.captureSnapshotEffects;
    this.onCheckpoint = options.onCheckpoint;
    this.peerId = options.peerId;
    this.threshold = options.threshold ?? DEFAULT_COMPACTION_THRESHOLD;

    if (!isCanonicalSource(this.peerId)) {
      throw new Error('Yjs shared effect peer ID must be a client ID.');
    }
    if (this.authorityId !== undefined && this.authorityId.length === 0) {
      throw new Error('Yjs shared effect authority ID must not be empty.');
    }
    if (!Number.isSafeInteger(this.threshold) || this.threshold < 1) {
      throw new Error(
        'Yjs shared effect compaction threshold must be positive.'
      );
    }
    this.assertAuthorityAvailable();

    this.restoreAcknowledgement();
    this.refreshCheckpoint();

    for (const [source, sequence] of Object.entries(
      this.pendingCheckpoint?.through ?? {}
    )) {
      this.nextSequenceBySource.set(source, sequence);
    }

    for (const input of this.effects.toArray()) {
      const event = readSharedEffectEvent(input);

      if (!event) continue;

      this.nextSequenceBySource.set(
        event.source,
        Math.max(
          this.nextSequenceBySource.get(event.source) ?? 0,
          event.sequence
        )
      );
      this.enqueue(event);
    }
  }

  activate(): void {
    if (this.active) return;

    let claimedAuthority = false;
    const previousAcknowledgement = this.acknowledgements.get(this.peerId);

    this.assertAuthorityAvailable();

    this.active = true;
    this.acknowledgements.observe(this.acknowledgementsObserver);
    this.checkpointStore.observe(this.checkpointObserver);

    try {
      if (this.authorityId !== undefined) {
        LOCAL_COMPACTION_AUTHORITIES.set(this.checkpointStore, this);
        claimedAuthority =
          this.checkpointStore.get(AUTHORITY_KEY) === undefined;
      }
      this.doc.transact(() => {
        if (this.authorityId !== undefined) {
          this.checkpointStore.set(AUTHORITY_KEY, this.createAuthorityRecord());
        }
        this.publishAcknowledgement();
      }, this.compactionOrigin);
    } catch (error) {
      this.acknowledgements.unobserve(this.acknowledgementsObserver);
      this.checkpointStore.unobserve(this.checkpointObserver);
      this.active = false;
      if (LOCAL_COMPACTION_AUTHORITIES.get(this.checkpointStore) === this) {
        LOCAL_COMPACTION_AUTHORITIES.delete(this.checkpointStore);
      }
      this.doc.transact(() => {
        if (previousAcknowledgement === undefined) {
          this.acknowledgements.delete(this.peerId);
        } else {
          this.acknowledgements.set(this.peerId, previousAcknowledgement);
        }
        if (claimedAuthority && this.isActiveAuthority()) {
          this.checkpointStore.delete(AUTHORITY_KEY);
        }
      }, this.compactionOrigin);

      throw error;
    }
  }

  destroy(): void {
    if (!this.active) return;

    this.active = false;
    this.acknowledgements.unobserve(this.acknowledgementsObserver);
    this.checkpointStore.unobserve(this.checkpointObserver);
    if (LOCAL_COMPACTION_AUTHORITIES.get(this.checkpointStore) === this) {
      LOCAL_COMPACTION_AUTHORITIES.delete(this.checkpointStore);
    }
    this.doc.transact(() => {
      this.publishAcknowledgement();
    }, this.compactionOrigin);
  }

  isInternalTransaction(transaction: Y.Transaction): boolean {
    return transaction.origin === this.compactionOrigin;
  }

  prepare(effects: readonly EditorEffect[]): PreparedYjsSharedEffects {
    return effects.map((effect) => {
      if (this.resolveEffectType(effect.type.key) !== effect.type) {
        throw new Error(
          `Yjs shared effect "${effect.type.key}" is not installed on this editor.`
        );
      }
      if (effect.type.collab !== 'shared') {
        throw new Error(
          `Yjs shared effect "${effect.type.key}" must use collab: "shared".`
        );
      }

      const encoded = encodeEditorEffect(effect);
      const transport = effect.type.collabTransport;

      if (!transport) return encoded;

      const value = transport.encode(effect.value, this.collabEncodeContext());

      assertEditorJsonValue(
        value,
        `Yjs shared effect "${effect.type.key}" transport value`
      );

      return Object.freeze({
        ...encoded,
        value: deepFreeze(structuredClone(value)),
      });
    });
  }

  append(effects: PreparedYjsSharedEffects): void {
    if (effects.length === 0) return;

    const source = String(this.doc.clientID);
    let sequence = this.nextSequenceBySource.get(source) ?? 0;
    const activePeers = this.activePeerIds();
    const events = effects.map((effect): YjsSharedEffectEvent => {
      const type = this.resolveEffectType(effect.key);

      if (!type || type.collab !== 'shared') {
        throw new Error(`Unknown Yjs shared effect "${effect.key}".`);
      }
      if (sequence >= Number.MAX_SAFE_INTEGER) {
        throw new Error('Yjs shared effect sequence is exhausted.');
      }

      sequence += 1;

      return Object.freeze({
        effect,
        format: SHARED_EFFECT_EVENT_FORMAT,
        id: getEventId(source, sequence),
        recipients:
          type.collabReplay === 'live' ? activePeers : Object.freeze([]),
        replay: type.collabReplay,
        sequence,
        source,
      });
    });

    this.effects.push(events);
    this.nextSequenceBySource.set(source, sequence);
    for (const event of events) {
      this.markConsumed(event);
    }
    this.publishAcknowledgement();
  }

  observe(
    observer: (event: Y.YArrayEvent<unknown>, tx: Y.Transaction) => void
  ): void {
    this.effects.observe(observer);
  }

  unobserve(
    observer: (event: Y.YArrayEvent<unknown>, tx: Y.Transaction) => void
  ): void {
    this.effects.unobserve(observer);
  }

  pending(): PendingYjsSharedEffects {
    const blockedSources = new Set<string>();
    const effects: EditorEffect[] = [];
    const eventIds: string[] = [];
    const nextSequenceBySource = new Map<string, number>();
    const checkpoint = this.pendingCheckpoint;

    if (checkpoint && !this.hasConsumedCheckpoint(checkpoint)) {
      try {
        for (const serialized of checkpoint.effects) {
          const effect = this.decodeEffect(serialized, 'latest');

          if (effect) effects.push(effect);
        }
      } catch {
        return Object.freeze({ effects: [], eventIds: [] });
      }

      eventIds.push(getCheckpointEventId(checkpoint.id));
      for (const [source, sequence] of Object.entries(checkpoint.through)) {
        nextSequenceBySource.set(source, sequence + 1);
      }

      for (const input of this.effects.toArray()) {
        const event = readSharedEffectEvent(input);

        if (!event) continue;
        if (event.sequence <= (checkpoint.through[event.source] ?? 0)) {
          continue;
        }
        if (blockedSources.has(event.source)) continue;

        const nextSequence =
          nextSequenceBySource.get(event.source) ??
          (checkpoint.through[event.source] ?? 0) + 1;

        if (event.sequence !== nextSequence) {
          blockedSources.add(event.source);

          continue;
        }

        if (this.hasConsumed(event)) {
          if (event.replay === 'latest') {
            try {
              const effect = this.decodeEffect(event.effect, event.replay);

              if (effect) effects.push(effect);
              this.pendingEvents.delete(event.id);
            } catch {
              blockedSources.add(event.source);

              continue;
            }
          } else {
            this.pendingEvents.delete(event.id);
          }
        } else if (!this.shouldDeliver(event)) {
          eventIds.push(event.id);
        } else {
          try {
            const effect = this.decodeEffect(event.effect, event.replay);

            if (effect) effects.push(effect);
            eventIds.push(event.id);
          } catch {
            blockedSources.add(event.source);

            continue;
          }
        }

        nextSequenceBySource.set(event.source, event.sequence + 1);
      }

      this.trimPendingOrder();

      return Object.freeze({ effects, eventIds });
    }

    for (
      let index = this.pendingHead;
      index < this.pendingOrder.length;
      index++
    ) {
      const eventId = this.pendingOrder[index];
      const event = eventId ? this.pendingEvents.get(eventId) : undefined;

      if (!event) continue;
      if (blockedSources.has(event.source)) continue;
      if (this.hasConsumed(event)) {
        if (event.replay === 'latest') {
          try {
            const effect = this.decodeEffect(event.effect, event.replay);

            if (effect) effects.push(effect);
          } catch {
            blockedSources.add(event.source);

            continue;
          }
        }
        this.pendingEvents.delete(event.id);

        continue;
      }

      const nextSequence =
        nextSequenceBySource.get(event.source) ??
        (this.consumedThrough.get(event.source) ?? 0) + 1;

      if (event.sequence !== nextSequence) {
        blockedSources.add(event.source);

        continue;
      }

      if (!this.shouldDeliver(event)) {
        eventIds.push(event.id);
        nextSequenceBySource.set(event.source, event.sequence + 1);

        continue;
      }

      try {
        const effect = this.decodeEffect(event.effect, event.replay);

        if (effect) effects.push(effect);
        eventIds.push(event.id);
        nextSequenceBySource.set(event.source, event.sequence + 1);
      } catch {
        // Keep the event pending so a peer with the matching codec can retry it.
        blockedSources.add(event.source);
      }
    }

    this.trimPendingOrder();

    return Object.freeze({ effects, eventIds });
  }

  acknowledge(eventIds: readonly string[]): void {
    for (const eventId of eventIds) {
      const checkpoint = this.pendingCheckpoint;

      if (checkpoint && eventId === getCheckpointEventId(checkpoint.id)) {
        this.markCheckpointConsumed(checkpoint);
        this.pendingCheckpoint = undefined;
        continue;
      }

      const event = this.pendingEvents.get(eventId);

      if (event) {
        this.markConsumed(event);
        this.pendingEvents.delete(eventId);
      }
    }
    this.trimPendingOrder();
    this.publishAcknowledgement();
    this.tryCompact();
  }

  receive(event: Y.YArrayEvent<unknown>): void {
    let removed = false;

    this.refreshCheckpoint();

    for (const change of event.changes.delta) {
      if (change.insert) {
        for (const input of change.insert) {
          const inserted = readSharedEffectEvent(input);

          if (inserted) this.enqueue(inserted);
        }
      }
      removed ||= (change.delete ?? 0) > 0;
    }

    if (removed) {
      this.pruneRemovedPendingEvents();
    }
  }

  retirePeer(peerId: string): void {
    if (!isCanonicalSource(peerId)) {
      throw new Error('A retired Yjs shared effect peer must be a client ID.');
    }
    if (
      !this.active ||
      this.authorityId === undefined ||
      !this.isActiveAuthority()
    ) {
      throw new Error(
        'Only the active Yjs shared effect compaction authority may retire a peer.'
      );
    }
    if (peerId === this.peerId) {
      throw new Error(
        'The Yjs shared effect compaction authority cannot retire itself.'
      );
    }

    this.doc.transact(() => {
      this.retiredPeers.set(peerId, true);
    }, this.compactionOrigin);
    this.compactionRequested = true;
    this.tryCompact();
  }

  settle(): void {
    if (!this.compactionRequested) return;

    this.tryCompact();
  }

  private decodeEffect(
    serialized: SerializedEditorEffect,
    replay: EditorEffectCollabReplay
  ): EditorEffect | undefined {
    const type = this.resolveEffectType(serialized.key);

    if (!type || type.collab !== 'shared') {
      throw new Error(`Unknown Yjs shared effect "${serialized.key}".`);
    }
    if (type.collabReplay !== replay) {
      throw new Error(
        `Yjs shared effect "${serialized.key}" changed replay semantics.`
      );
    }

    const transport = type.collabTransport;

    if (!transport) return decodeEditorEffect(type, serialized);
    if (serialized.version !== type.codec?.version) {
      throw new Error(
        `Unsupported Yjs shared effect "${type.key}" version ${String(serialized.version)}.`
      );
    }

    const value = transport.decode(
      serialized.value,
      this.collabDecodeContext()
    );

    return value === undefined
      ? undefined
      : decodeEditorEffect(
          type,
          encodeEditorEffect(Object.freeze({ type, value }))
        );
  }

  private assertAuthorityAvailable(): void {
    if (this.authorityId === undefined) return;

    const localAuthority = LOCAL_COMPACTION_AUTHORITIES.get(
      this.checkpointStore
    );
    const authorityInput = this.checkpointStore.get(AUTHORITY_KEY);
    const authority = readSharedEffectAuthority(authorityInput);

    if (localAuthority && localAuthority !== this) {
      throw new Error(
        'Yjs shared effect compaction already has a local authority.'
      );
    }
    if (
      authorityInput !== undefined &&
      authority?.authorityId !== this.authorityId
    ) {
      throw new Error(
        authority
          ? `Yjs shared effect compaction already has authority "${authority.authorityId}".`
          : 'Yjs shared effect compaction has an invalid persisted authority.'
      );
    }
  }

  private createAuthorityRecord(): YjsSharedEffectAuthority {
    if (this.authorityId === undefined) {
      throw new Error(
        'Yjs shared effect compaction authority is not configured.'
      );
    }

    return Object.freeze({
      authorityId: this.authorityId,
      format: SHARED_EFFECT_AUTHORITY_FORMAT,
      peerId: this.peerId,
    });
  }

  private isActiveAuthority(): boolean {
    if (this.authorityId === undefined) return false;

    const authority = readSharedEffectAuthority(
      this.checkpointStore.get(AUTHORITY_KEY)
    );

    return (
      authority?.authorityId === this.authorityId &&
      authority.peerId === this.peerId
    );
  }

  private hasConsumedCheckpoint(
    checkpoint: YjsSharedEffectCheckpoint
  ): boolean {
    return this.consumedCheckpointIds.has(checkpoint.id);
  }

  private markCheckpointConsumed(checkpoint: YjsSharedEffectCheckpoint): void {
    this.consumedCheckpointIds.add(checkpoint.id);
    for (const [source, sequence] of Object.entries(checkpoint.through)) {
      let consumedThrough = Math.max(
        this.consumedThrough.get(source) ?? 0,
        sequence
      );
      const outOfOrder = this.consumedOutOfOrder.get(source);

      if (outOfOrder) {
        for (const consumed of outOfOrder) {
          if (consumed <= consumedThrough) outOfOrder.delete(consumed);
        }
        while (outOfOrder.delete(consumedThrough + 1)) {
          consumedThrough += 1;
        }
        if (outOfOrder.size === 0) {
          this.consumedOutOfOrder.delete(source);
        }
      }
      this.consumedThrough.set(source, consumedThrough);
      this.nextSequenceBySource.set(
        source,
        Math.max(this.nextSequenceBySource.get(source) ?? 0, consumedThrough)
      );
    }
  }

  private hasConsumed(event: YjsSharedEffectEvent): boolean {
    return (
      event.sequence <= (this.consumedThrough.get(event.source) ?? 0) ||
      this.consumedOutOfOrder.get(event.source)?.has(event.sequence) === true
    );
  }

  private collabDecodeContext() {
    return Object.freeze({
      point: (value: unknown) => {
        if (!isRecord(value)) return null;

        try {
          return yjsRelativePositionToPlitePoint(
            this.root,
            Y.createRelativePositionFromJSON(value)
          );
        } catch {
          return null;
        }
      },
      range: (value: unknown) => {
        if (
          !isRecord(value) ||
          !isRecord(value.anchor) ||
          !isRecord(value.focus)
        ) {
          return null;
        }

        try {
          return yjsRelativeRangeToPliteRange(this.root, {
            anchor: Y.createRelativePositionFromJSON(value.anchor),
            focus: Y.createRelativePositionFromJSON(value.focus),
          });
        } catch {
          return null;
        }
      },
    });
  }

  private collabEncodeContext() {
    return Object.freeze({
      point: (point: Parameters<typeof plitePointToYjsRelativePosition>[1]) =>
        serializeRelativePosition(
          plitePointToYjsRelativePosition(this.root, point)
        ),
      range: (range: Parameters<typeof pliteRangeToYjsRelativeRange>[1]) => {
        const relative = pliteRangeToYjsRelativeRange(this.root, range);

        return Object.freeze({
          anchor: serializeRelativePosition(relative.anchor),
          focus: serializeRelativePosition(relative.focus),
        });
      },
    });
  }

  private enqueue(event: YjsSharedEffectEvent): void {
    if (
      (this.hasConsumed(event) && event.replay !== 'latest') ||
      this.pendingEvents.has(event.id)
    ) {
      return;
    }

    this.pendingEvents.set(event.id, event);
    this.pendingOrder.push(event.id);
  }

  private markConsumed(event: YjsSharedEffectEvent): void {
    let consumedThrough = this.consumedThrough.get(event.source) ?? 0;

    if (event.sequence <= consumedThrough) return;

    if (event.sequence > consumedThrough + 1) {
      const outOfOrder =
        this.consumedOutOfOrder.get(event.source) ?? new Set<number>();

      outOfOrder.add(event.sequence);
      this.consumedOutOfOrder.set(event.source, outOfOrder);

      return;
    }

    consumedThrough = event.sequence;
    const outOfOrder = this.consumedOutOfOrder.get(event.source);

    while (outOfOrder?.delete(consumedThrough + 1)) {
      consumedThrough += 1;
    }

    if (outOfOrder?.size === 0) {
      this.consumedOutOfOrder.delete(event.source);
    }
    this.consumedThrough.set(event.source, consumedThrough);
  }

  private currentWatermarks(
    events: readonly YjsSharedEffectEvent[] = []
  ): YjsSharedEffectWatermarks {
    const entries = new Map<string, number>(
      Object.entries(
        readSharedEffectCheckpoint(this.checkpointStore.get(CHECKPOINT_KEY))
          ?.through ?? {}
      )
    );

    for (const event of events) {
      entries.set(
        event.source,
        Math.max(entries.get(event.source) ?? 0, event.sequence)
      );
    }

    return Object.freeze(Object.fromEntries(entries));
  }

  private publishAcknowledgement(): void {
    const through: YjsSharedEffectWatermarks = Object.freeze(
      Object.fromEntries(this.consumedThrough)
    );
    const consumed = Object.freeze(
      [...this.consumedOutOfOrder]
        .flatMap(([source, sequences]) =>
          [...sequences].map((sequence) => getEventId(source, sequence))
        )
        .sort()
    );
    const previous = readSharedEffectAck(
      this.acknowledgements.get(this.peerId)
    );

    if (
      previous &&
      previous.active === this.active &&
      Object.keys(previous.through).length === Object.keys(through).length &&
      Object.entries(through).every(
        ([source, sequence]) => previous.through[source] === sequence
      ) &&
      previous.consumed.length === consumed.length &&
      consumed.every((eventId, index) => previous.consumed[index] === eventId)
    ) {
      return;
    }

    this.acknowledgements.set(
      this.peerId,
      Object.freeze({
        active: this.active,
        consumed,
        format: SHARED_EFFECT_ACK_FORMAT,
        through,
      }) satisfies YjsSharedEffectAck
    );
  }

  private restoreAcknowledgement(): void {
    const acknowledgement = readSharedEffectAck(
      this.acknowledgements.get(this.peerId)
    );

    if (!acknowledgement) return;

    for (const [source, sequence] of Object.entries(acknowledgement.through)) {
      this.consumedThrough.set(source, sequence);
      this.nextSequenceBySource.set(source, sequence);
    }
    for (const eventId of acknowledgement.consumed) {
      const identity = readEventId(eventId);

      if (!identity) continue;
      if (
        identity.sequence <= (this.consumedThrough.get(identity.source) ?? 0)
      ) {
        continue;
      }

      const consumed =
        this.consumedOutOfOrder.get(identity.source) ?? new Set<number>();

      consumed.add(identity.sequence);
      this.consumedOutOfOrder.set(identity.source, consumed);
      this.nextSequenceBySource.set(
        identity.source,
        Math.max(
          this.nextSequenceBySource.get(identity.source) ?? 0,
          identity.sequence
        )
      );
    }
  }

  private activePeerIds(): readonly string[] {
    const peerIds: string[] = [];

    for (const [peerId, input] of this.acknowledgements.entries()) {
      if (
        isCanonicalSource(peerId) &&
        !this.isPeerRetired(peerId) &&
        readSharedEffectAck(input)?.active === true
      ) {
        peerIds.push(peerId);
      }
    }

    return Object.freeze(peerIds.sort());
  }

  private shouldDeliver(event: YjsSharedEffectEvent): boolean {
    return (
      event.replay === 'latest' ||
      (!this.isPeerRetired(this.peerId) &&
        event.recipients.includes(this.peerId))
    );
  }

  private isPeerRetired(peerId: string): boolean {
    return this.retiredPeers.get(peerId) === true;
  }

  private refreshCheckpoint(): void {
    const input = this.checkpointStore.get(CHECKPOINT_KEY);

    if (this.checkpointRead && Object.is(input, this.checkpointInput)) return;

    this.checkpointInput = input;
    this.checkpointRead = true;

    const checkpoint = readSharedEffectCheckpoint(input);

    if (!checkpoint) {
      this.pendingCheckpoint = undefined;
      return;
    }

    for (const [source, sequence] of Object.entries(checkpoint.through)) {
      this.nextSequenceBySource.set(
        source,
        Math.max(this.nextSequenceBySource.get(source) ?? 0, sequence)
      );
    }
    this.pendingCheckpoint = this.hasConsumedCheckpoint(checkpoint)
      ? undefined
      : checkpoint;
  }

  private tryCompact(): void {
    this.compactionRequested = false;

    if (
      !this.active ||
      this.authorityId === undefined ||
      !this.isActiveAuthority() ||
      this.effects.length < this.threshold
    ) {
      return;
    }

    const events: YjsSharedEffectEvent[] = [];

    for (const input of this.effects.toArray()) {
      const event = readSharedEffectEvent(input);

      if (!event) return;
      events.push(event);
    }
    if (!this.hasContiguousEventSequences(events)) return;

    const through = this.currentWatermarks(events);

    if (!this.isAcknowledgedByEveryRecipient(events)) return;

    const requiredSnapshots = new Set<string>();

    for (const event of events) {
      const type = this.resolveEffectType(event.effect.key);

      if (!type || type.collab !== 'shared') return;
      if (type.collabReplay !== event.replay) return;
      if (event.replay === 'latest') {
        requiredSnapshots.add(event.effect.key);
      }
    }

    let captured: PreparedYjsSharedEffects;

    try {
      captured = this.prepare(this.captureSnapshotEffects());
    } catch {
      return;
    }

    const snapshotsByKey = new Map<string, SerializedEditorEffect>();

    for (const effect of captured) {
      const type = this.resolveEffectType(effect.key);

      if (type?.collabReplay !== 'latest') return;
      snapshotsByKey.set(effect.key, effect);
    }
    if ([...requiredSnapshots].some((key) => !snapshotsByKey.has(key))) {
      return;
    }

    const checkpoint = Object.freeze({
      effects: Object.freeze([...snapshotsByKey.values()]),
      format: SHARED_EFFECT_CHECKPOINT_FORMAT,
      id: createCheckpointId(through),
      through,
    }) satisfies YjsSharedEffectCheckpoint;
    const deleteCount = this.effects.length;

    this.doc.transact(() => {
      this.checkpointStore.set(CHECKPOINT_KEY, checkpoint);
      this.effects.delete(0, deleteCount);
    }, this.compactionOrigin);
    this.refreshCheckpoint();
    this.markCheckpointConsumed(checkpoint);
    this.pendingCheckpoint = undefined;
    this.publishAcknowledgement();
  }

  private isAcknowledgedByEveryRecipient(
    events: readonly YjsSharedEffectEvent[]
  ): boolean {
    for (const event of events) {
      if (event.replay !== 'live') continue;

      for (const peerId of event.recipients) {
        if (this.isPeerRetired(peerId)) continue;

        const acknowledgement = readSharedEffectAck(
          this.acknowledgements.get(peerId)
        );

        if (!acknowledgement) return false;
        if (
          event.sequence > (acknowledgement.through[event.source] ?? 0) &&
          !acknowledgement.consumed.includes(event.id)
        ) {
          return false;
        }
      }
    }

    return true;
  }

  private hasContiguousEventSequences(
    events: readonly YjsSharedEffectEvent[]
  ): boolean {
    const checkpointThrough =
      readSharedEffectCheckpoint(this.checkpointStore.get(CHECKPOINT_KEY))
        ?.through ?? {};
    const nextBySource = new Map<string, number>();

    for (const event of events) {
      const next =
        nextBySource.get(event.source) ??
        (checkpointThrough[event.source] ?? 0) + 1;

      if (event.sequence !== next) return false;

      nextBySource.set(event.source, next + 1);
    }

    return true;
  }

  private pruneRemovedPendingEvents(): void {
    const present = new Set<string>();

    for (const input of this.effects.toArray()) {
      const event = readSharedEffectEvent(input);

      if (event) present.add(event.id);
    }
    for (const eventId of this.pendingEvents.keys()) {
      if (!present.has(eventId)) {
        this.pendingEvents.delete(eventId);
      }
    }
    this.trimPendingOrder();
  }

  private trimPendingOrder(): void {
    while (
      this.pendingHead < this.pendingOrder.length &&
      !this.pendingEvents.has(this.pendingOrder[this.pendingHead])
    ) {
      this.pendingHead += 1;
    }
    if (
      this.pendingHead > 1024 &&
      this.pendingHead * 2 > this.pendingOrder.length
    ) {
      this.pendingOrder = this.pendingOrder.slice(this.pendingHead);
      this.pendingHead = 0;
    }
  }
}
