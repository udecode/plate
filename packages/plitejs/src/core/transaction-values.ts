import type {
  EditorEffect,
  EditorEffectHistoryReplayResult,
  EditorEffectType,
  EditorUpdateAnnotation,
  Editor,
  StateFieldHistoryPolicy,
} from '../interfaces/editor';
import type { EditorJsonValue } from '../interfaces/json';
import { cloneFrozen } from './clone';
import { normalizeEditorValuePersistence } from './value-codec';

type DefineEffectBaseOptions<
  TValue,
  TEncoded extends EditorJsonValue,
> = Readonly<{
  invert?: (value: TValue) => TValue;
  key: string;
  map?: EditorEffectType<TValue, TEncoded>['map'];
  persist?: EditorEffectType<TValue, TEncoded>['persist'];
}>;

type DefineEffectSessionHistory<TValue> = Readonly<{
  replay: (
    editor: Editor,
    value: TValue
  ) =>
    | EditorEffectHistoryReplayResult<TValue>
    | Promise<EditorEffectHistoryReplayResult<TValue>>;
}>;

type DefineLocalEffectOptions<
  TValue,
  TEncoded extends EditorJsonValue,
> = DefineEffectBaseOptions<TValue, TEncoded> &
  Readonly<{
    collab?: 'local';
    collabReplay?: never;
    collabSnapshot?: never;
    collabTransport?: never;
    history?: DefineEffectSessionHistory<TValue> | StateFieldHistoryPolicy;
  }>;

type DefineSharedLiveEffectOptions<
  TValue,
  TEncoded extends EditorJsonValue,
> = DefineEffectBaseOptions<TValue, TEncoded> &
  Readonly<{
    persist: NonNullable<EditorEffectType<TValue, TEncoded>['persist']>;
    collab: 'shared';
    collabReplay: 'live';
    collabSnapshot?: never;
    collabTransport?: EditorEffectType<TValue, TEncoded>['collabTransport'];
    history?: StateFieldHistoryPolicy;
  }>;

type DefineSharedLatestEffectOptions<
  TValue,
  TEncoded extends EditorJsonValue,
> = DefineEffectBaseOptions<TValue, TEncoded> &
  Readonly<{
    persist: NonNullable<EditorEffectType<TValue, TEncoded>['persist']>;
    collab: 'shared';
    collabReplay: 'latest';
    collabSnapshot: NonNullable<
      EditorEffectType<TValue, TEncoded>['collabSnapshot']
    >;
    collabTransport?: EditorEffectType<TValue, TEncoded>['collabTransport'];
    history?: StateFieldHistoryPolicy;
  }>;

export type DefineEffectOptions<
  TValue,
  TEncoded extends EditorJsonValue = EditorJsonValue,
> =
  | DefineLocalEffectOptions<TValue, TEncoded>
  | DefineSharedLatestEffectOptions<TValue, TEncoded>
  | DefineSharedLiveEffectOptions<TValue, TEncoded>;

export const defineEffect = <
  TValue = null,
  TEncoded extends EditorJsonValue = EditorJsonValue,
>(
  options: DefineEffectOptions<TValue, TEncoded>
): EditorEffectType<TValue, TEncoded> => {
  const { key } = options;
  const history = options.history ?? 'push';
  const sessionHistory =
    typeof history === 'object' &&
    history !== null &&
    !Array.isArray(history) &&
    Object.keys(history).length === 1 &&
    Object.hasOwn(history, 'replay') &&
    typeof history.replay === 'function';

  if (!key) throw new Error('Editor effect key cannot be empty.');
  if (history !== 'push' && history !== 'skip' && !sessionHistory) {
    throw new Error(`Editor effect "${key}" has an invalid history policy.`);
  }
  if (options.collab === 'shared' && !options.persist) {
    throw new Error(`Shared editor effect "${key}" requires persistence.`);
  }
  if (options.collab === 'shared' && !options.collabReplay) {
    throw new Error(
      `Shared editor effect "${key}" must declare collabReplay: "latest" or "live".`
    );
  }
  if (
    options.collab === 'shared' &&
    options.collabReplay === 'latest' &&
    !options.collabSnapshot
  ) {
    throw new Error(
      `Shared latest editor effect "${key}" requires collabSnapshot.`
    );
  }
  if (options.collabReplay !== 'latest' && options.collabSnapshot) {
    throw new Error(
      `Editor effect "${key}" can only define collabSnapshot with collabReplay: "latest".`
    );
  }
  if (options.collabTransport && options.collab !== 'shared') {
    throw new Error(
      `Editor effect "${key}" cannot define a collaboration transport unless collab is "shared".`
    );
  }
  const base = {
    invert: options.invert ?? ((value) => value),
    key,
    map: options.map ?? ((value) => value),
  };

  if (options.collab !== 'shared') {
    const persistence = options.persist
      ? normalizeEditorValuePersistence(options.persist)
      : undefined;

    return Object.freeze({
      ...base,
      collab: 'local',
      collabReplay: 'live',
      history: sessionHistory
        ? Object.freeze({ replay: history.replay })
        : history,
      ...(persistence ? { persist: persistence } : {}),
    });
  }

  const persistence = normalizeEditorValuePersistence(options.persist);

  if (typeof history === 'object') {
    throw new Error(
      `Session history effect "${key}" cannot be shared through collaboration.`
    );
  }

  const shared = {
    ...base,
    collab: 'shared' as const,
    persist: persistence,
    ...(options.collabTransport
      ? { collabTransport: Object.freeze({ ...options.collabTransport }) }
      : {}),
    history,
  };

  if (options.collabReplay === 'latest') {
    return Object.freeze({
      ...shared,
      collabReplay: 'latest',
      collabSnapshot: options.collabSnapshot,
    });
  }

  return Object.freeze({
    ...shared,
    collabReplay: 'live',
  });
};

export const createEditorEffect = <TValue, TEncoded extends EditorJsonValue>(
  type: EditorEffectType<TValue, TEncoded>,
  value: TValue
): EditorEffect<TValue, TEncoded> =>
  Object.freeze({
    type,
    value: cloneFrozen(value),
  });

export const mapEffect = <TValue, TEncoded extends EditorJsonValue>(
  effect: EditorEffect<TValue, TEncoded>,
  changes: Parameters<EditorEffectType<TValue, TEncoded>['map']>[1]
): EditorEffect<TValue, TEncoded> | undefined => {
  const value = effect.type.map(effect.value, changes);

  return value === undefined
    ? undefined
    : createEditorEffect(effect.type, value);
};

export const invertEffect = <TValue, TEncoded extends EditorJsonValue>(
  effect: EditorEffect<TValue, TEncoded>
): EditorEffect<TValue, TEncoded> =>
  createEditorEffect(effect.type, effect.type.invert(effect.value));

export type DefineUpdateAnnotationOptions<TValue> = Readonly<{
  combine?: (previous: TValue, next: TValue) => TValue;
  key: string;
}>;

export const defineUpdateAnnotation = <TValue>(
  options: DefineUpdateAnnotationOptions<TValue>
): EditorUpdateAnnotation<TValue> => {
  if (!options.key) throw new Error('Editor annotation key cannot be empty.');

  return Object.freeze({
    combine: options.combine ?? ((_previous, next) => next),
    key: options.key,
  });
};
