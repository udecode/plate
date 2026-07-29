import type {
  EditorStateField,
  StateFieldDescriptor,
  StateFieldTransition,
} from '../interfaces/editor';
import { cloneFrozen } from './clone';
import { defineEffect } from './transaction-values';
import {
  decodeVersionedValue,
  defineValueCodec,
  encodeVersionedValue,
} from './value-codec';

/**
 * Creates an editor-scoped state field from a keyed descriptor.
 *
 * State fields register when their extension is installed and are read through
 * the editor state API.
 */
export const defineStateField = <TValue>(
  descriptor: StateFieldDescriptor<TValue>
): EditorStateField<TValue> => {
  if (!descriptor.key) throw new Error('State field key cannot be empty.');

  const normalizedDescriptor = Object.freeze({
    ...descriptor,
    compare: descriptor.compare ?? Object.is,
    ...(descriptor.persist
      ? { persist: defineValueCodec(descriptor.persist) }
      : {}),
    ...(descriptor.initial !== undefined &&
    typeof descriptor.initial !== 'function'
      ? { initial: cloneFrozen(descriptor.initial) }
      : {}),
  });

  if (
    normalizedDescriptor.collab === 'shared' &&
    !normalizedDescriptor.persist
  ) {
    throw new Error(
      `Shared state field "${normalizedDescriptor.key}" requires a persistence codec.`
    );
  }
  const transitionCodec = normalizedDescriptor.persist
    ? defineValueCodec<StateFieldTransition<TValue>>({
        decode(value) {
          if (
            typeof value !== 'object' ||
            value === null ||
            !Object.hasOwn(value, 'previousValue') ||
            !Object.hasOwn(value, 'value')
          ) {
            throw new Error(
              `Invalid state field "${descriptor.key}" transition.`
            );
          }

          return Object.freeze({
            previousValue: normalizedDescriptor.persist!.decode(
              (value as Record<string, unknown>).previousValue
            ),
            value: normalizedDescriptor.persist!.decode(
              (value as Record<string, unknown>).value
            ),
          });
        },
        encode: ({ previousValue, value }) => ({
          previousValue: normalizedDescriptor.persist!.encode(previousValue),
          value: normalizedDescriptor.persist!.encode(value),
        }),
        version: normalizedDescriptor.persist.version,
      })
    : undefined;
  const effectOptions = {
    ...(transitionCodec ? { codec: transitionCodec } : {}),
    history: normalizedDescriptor.history,
    key: `state:${normalizedDescriptor.key}`,
  };
  let field!: EditorStateField<TValue>;
  const effect =
    normalizedDescriptor.collab === 'shared'
      ? defineEffect<StateFieldTransition<TValue>>({
          ...effectOptions,
          collab: 'shared',
          collabReplay: 'latest',
          collabSnapshot: (state) => {
            const value = state.getField(field);

            return { previousValue: value, value };
          },
          invert: ({ previousValue, value }) => ({
            previousValue: value,
            value: previousValue,
          }),
        })
      : defineEffect<StateFieldTransition<TValue>>({
          ...effectOptions,
          collab: 'local',
          invert: ({ previousValue, value }) => ({
            previousValue: value,
            value: previousValue,
          }),
        });
  const definition = {
    ...normalizedDescriptor,
    deserialize(value) {
      if (!normalizedDescriptor.persist) {
        throw new Error(
          `State field "${normalizedDescriptor.key}" does not define a persistence codec.`
        );
      }

      return decodeVersionedValue(
        normalizedDescriptor.persist,
        value,
        `state field "${normalizedDescriptor.key}"`
      );
    },
    effectTypes: Object.freeze([effect]),
    effect,
    stateFields: [] as readonly EditorStateField<TValue>[],
    name: `state-field:${normalizedDescriptor.key}`,
    reduce(value, nextEffect) {
      if (nextEffect.type === effect) return nextEffect.value.value;

      return normalizedDescriptor.reduce?.(value, nextEffect) ?? value;
    },
    serialize(value) {
      if (!normalizedDescriptor.persist) {
        throw new Error(
          `State field "${normalizedDescriptor.key}" does not define a persistence codec.`
        );
      }

      return encodeVersionedValue(
        normalizedDescriptor.persist,
        value,
        `state field "${normalizedDescriptor.key}"`
      );
    },
  } satisfies EditorStateField<TValue>;

  field = definition;
  definition.stateFields = Object.freeze([field]);

  return Object.freeze(field);
};
