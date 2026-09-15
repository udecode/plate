import { defineEffect } from '../core/transaction-values';
import { defineValueCodec } from '../core/value-codec';
import {
  decodeAuthoredViewSelection,
  type AuthoredViewSelection,
} from './selection';
import { decodeAuthoredEdit, type AuthoredEdit } from './state';

type AuthoredHistory = Readonly<{
  id: string;
  retained: readonly AuthoredEdit[];
  inverseSelection?: AuthoredViewSelection;
  selection?: AuthoredViewSelection;
}>;

export const authoredHistoryEffect = defineEffect<AuthoredHistory>({
  key: 'authored.history',
  history: 'skip',
  codec: defineValueCodec<AuthoredHistory>({
    version: 1,
    decode(value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error('Invalid authored history operation.');
      }
      const data = value as Record<string, unknown>;
      if (
        Object.keys(data).some(
          (key) =>
            key !== 'id' &&
            key !== 'retained' &&
            key !== 'selection' &&
            key !== 'inverseSelection'
        ) ||
        typeof data.id !== 'string' ||
        !data.id ||
        data.id.includes('\u0000') ||
        !Array.isArray(data.retained)
      ) {
        throw new Error('Invalid authored history operation.');
      }
      return {
        id: data.id,
        retained: data.retained.map(decodeAuthoredEdit),
        ...(Object.hasOwn(data, 'inverseSelection')
          ? {
              inverseSelection: decodeAuthoredViewSelection(
                data.inverseSelection
              ),
            }
          : {}),
        ...(Object.hasOwn(data, 'selection')
          ? { selection: decodeAuthoredViewSelection(data.selection) }
          : {}),
      };
    },
    encode: (value) => value,
  }),
});
