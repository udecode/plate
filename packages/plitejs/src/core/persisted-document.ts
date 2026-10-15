import type {
  EditorDocumentValue,
  EditorStateField,
} from '../interfaces/editor';
import { getValueRecords, showValueRecords } from './record-store';
import { resolveStateFieldInitial } from './state-fields';
import { snapshotEditorJsonValue } from './value-codec';

/** Decode, complete and eagerly encode all installed persistent fields. @internal */
export const completePersistedDocumentFields = (
  document: EditorDocumentValue,
  fields: ReadonlyArray<EditorStateField<any>>
): EditorDocumentValue => {
  const installed = new Map<string, EditorStateField<any>>();

  for (const field of fields) {
    const known = installed.get(field.key);
    if (known && known !== field) {
      throw new Error(
        `State field "${field.key}" conflicts with another descriptor identity.`
      );
    }
    installed.set(field.key, field);
  }

  const decoded: Record<string, unknown> = {};
  for (const [key, input] of Object.entries(document.meta ?? {})) {
    const field = installed.get(key);

    if (!field) {
      decoded[key] = snapshotEditorJsonValue(input, `Unknown field ${key}`);
      continue;
    }
    if (!field.persist) {
      throw new Error(
        `State field "${key}" cannot load persisted metadata without persistence.`
      );
    }
    decoded[key] = field.deserialize(input);
  }

  for (const field of fields) {
    if (!field.persist || Object.hasOwn(decoded, field.key)) continue;
    const initial = resolveStateFieldInitial(field);

    if (initial !== undefined) decoded[field.key] = initial;
  }

  const meta = Object.fromEntries(
    Object.entries(decoded).map(([key, input]) => {
      const field = installed.get(key);

      return [
        key,
        snapshotEditorJsonValue(
          field ? field.serialize(input) : input,
          `Encoded field ${key}`
        ),
      ];
    })
  );
  const { meta: _meta, records: _records, ...content } = document;

  return snapshotEditorJsonValue(
    showValueRecords(
      Object.keys(meta).length ? { ...content, meta } : { ...content },
      getValueRecords(document)
    ),
    'Completed persisted document'
  );
};
