import type {
  EditorEffect,
  EditorEffectType,
  EditorUpdateAnnotation,
} from '../interfaces/editor';
import { cloneFrozen } from './clone';

type DefineEffectBaseOptions<TValue> = Readonly<{
  codec?: EditorEffectType<TValue>['codec'];
  history?: EditorEffectType<TValue>['history'];
  invert?: (value: TValue) => TValue;
  key: string;
  map?: EditorEffectType<TValue>['map'];
}>;

export type DefineEffectOptions<TValue> = DefineEffectBaseOptions<TValue> &
  (
    | Readonly<{
        collab?: 'local';
        collabReplay?: never;
        collabSnapshot?: never;
        collabTransport?: never;
      }>
    | Readonly<{
        collab: 'shared';
        collabReplay: 'live';
        collabSnapshot?: never;
        collabTransport?: EditorEffectType<TValue>['collabTransport'];
      }>
    | Readonly<{
        collab: 'shared';
        collabReplay: 'latest';
        collabSnapshot: NonNullable<EditorEffectType<TValue>['collabSnapshot']>;
        collabTransport?: EditorEffectType<TValue>['collabTransport'];
      }>
  );

export const defineEffect = <TValue = null>(
  options: DefineEffectOptions<TValue>
): EditorEffectType<TValue> => {
  const { key } = options;

  if (!key) throw new Error('Editor effect key cannot be empty.');
  if (options.collab === 'shared' && !options.codec) {
    throw new Error(
      `Shared editor effect "${key}" requires a persistence codec.`
    );
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

  return Object.freeze({
    ...(options.codec ? { codec: options.codec } : {}),
    collab: options.collab ?? 'local',
    collabReplay: options.collabReplay ?? 'live',
    ...(options.collabSnapshot
      ? { collabSnapshot: options.collabSnapshot }
      : {}),
    ...(options.collabTransport
      ? { collabTransport: Object.freeze({ ...options.collabTransport }) }
      : {}),
    history: options.history ?? 'push',
    invert: options.invert ?? ((value) => value),
    key,
    map: options.map ?? ((value) => value),
  });
};

export const createEditorEffect = <TValue>(
  type: EditorEffectType<TValue>,
  value: TValue
): EditorEffect<TValue> =>
  Object.freeze({
    type,
    value: cloneFrozen(value),
  });

export const mapEffect = <TValue>(
  effect: EditorEffect<TValue>,
  changes: Parameters<EditorEffectType<TValue>['map']>[1]
): EditorEffect<TValue> | undefined => {
  const value = effect.type.map(effect.value, changes);

  return value === undefined
    ? undefined
    : createEditorEffect(effect.type, value);
};

export const invertEffect = <TValue>(
  effect: EditorEffect<TValue>
): EditorEffect<TValue> =>
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
