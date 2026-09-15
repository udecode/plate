import { applyPropertyModifications } from '../core/change/root-change';
import type { JsonRecord } from '../core/change/tokens';
import {
  canonicalJsonKey,
  type PropertyModificationJson,
} from '../core/change/transform';
import { canonicalizeCompiledExclusiveTextProperties } from '../core/editor-schema';
import {
  resolveCompiledSchemaProperty,
  type CompiledEditorSchema,
  type CompiledSchemaTargetContext,
} from '../core/schema-compiler';
import type { AuthoredSpan } from './positions';
import { readRecord } from './record-tree';
import {
  authoredPropertyWrites,
  authoredPropertyKeys,
  isAuthoredPropertyWriteVisible,
  observesAuthoredOperation,
  type AuthoredEditIdentity,
  type AuthoredState,
  type AuthoredPropertyWrite,
} from './state';

type Writers = Readonly<Record<string, string>>;
const prefix = (key: string) => `${JSON.stringify(key)}:`;
const scalar = (key: string) => `${prefix(key)}scalar`;
const member = (key: string, value: unknown) =>
  `${prefix(key)}set:${canonicalJsonKey(value)}`;

export const projectAuthoredProperties = (input: {
  state: AuthoredState;
  span: AuthoredSpan;
  modifications: readonly PropertyModificationJson[];
  isVisible: (operation: AuthoredEditIdentity) => boolean;
  current: Readonly<JsonRecord>;
  schema?: CompiledEditorSchema | null;
  textContext?: CompiledSchemaTargetContext;
  writes?: readonly AuthoredPropertyWrite[];
}) => {
  const keys = new Set(input.modifications.map((entry) => entry.key));
  const retainedBase = input.writes?.[0]?.target.retained;
  const base =
    retainedBase?.kind === 'properties'
      ? retainedBase.properties
      : input.current;
  const { schema, textContext } = input;
  if (schema && textContext) {
    const candidates = new Map(
      [
        ...new Set([
          ...keys,
          ...Object.keys(input.current),
          ...(input.writes
            ? input.writes.flatMap((write) =>
                write.modifications.map((entry) => entry.key)
              )
            : authoredPropertyKeys(
                input.state,
                input.span.origin,
                input.span.offset
              )),
        ]),
      ].map((key) => [
        key,
        resolveCompiledSchemaProperty(schema, 'text', key, textContext)?.id,
      ])
    );
    for (const key of keys) {
      const id = candidates.get(key);
      if (!id) continue;
      const conflicts = schema.properties.conflictsByPropertyId.get(id);
      if (!conflicts?.size) continue;
      for (const [candidate, propertyId] of candidates) {
        if (propertyId && conflicts.has(propertyId)) keys.add(candidate);
      }
    }
  }
  const projected: JsonRecord = {};
  const writers = { ...input.span.properties };
  const latest = new Map<string, AuthoredEditIdentity>();
  for (const key of keys) {
    let value: Readonly<JsonRecord> | undefined;
    let propertyWriters: Writers = {};
    for (const write of input.writes
      ? input.writes.filter((entry) =>
          entry.modifications.some((modification) => modification.key === key)
        )
      : authoredPropertyWrites(
          input.state,
          input.span.origin,
          input.span.offset,
          key
        )) {
      if (value === undefined) {
        const { retained } = write.target;
        if (retained?.kind !== 'properties') {
          throw new Error('Missing authored property origin.');
        }
        value = Object.hasOwn(retained.properties, key)
          ? { [key]: retained.properties[key] }
          : {};
        propertyWriters =
          (
            retained.spans?.find(
              (span) =>
                span.origin === input.span.origin &&
                span.offset <= input.span.offset &&
                input.span.offset < span.offset + span.length
            ) ?? write.target.removed[0]
          )?.properties ?? {};
      }
      if (
        !isAuthoredPropertyWriteVisible(
          input.state,
          write.operation,
          input.isVisible
        )
      ) {
        continue;
      }
      const selected = write.modifications.filter((entry) => entry.key === key);
      value = applyPropertyModifications(value, selected);
      latest.set(key, write.operation);
      propertyWriters = writeAuthoredProperties(
        propertyWriters,
        selected,
        write.operation.changeId
      );
    }
    if (value === undefined) {
      value = base;
      propertyWriters = input.span.properties;
    }
    if (Object.hasOwn(value, key)) projected[key] = value[key];
    for (const writer of Object.keys(writers)) {
      if (writer.startsWith(prefix(key))) delete writers[writer];
    }
    for (const [writer, identity] of Object.entries(propertyWriters)) {
      if (writer.startsWith(prefix(key))) writers[writer] = identity;
    }
  }
  if (schema && textContext) {
    const properties = new Map(
      Object.keys(projected).map((key) => [
        key,
        resolveCompiledSchemaProperty(schema, 'text', key, textContext)?.id,
      ])
    );
    const superseded = new Set<string>();
    for (const [key, id] of properties) {
      const earlier = latest.get(key);
      if (!id || !earlier) continue;
      const conflicts = schema.properties.conflictsByPropertyId.get(id);
      if (!conflicts?.size) continue;
      for (const [other, otherId] of properties) {
        const later = latest.get(other);
        if (
          otherId &&
          conflicts.has(otherId) &&
          later &&
          later.id !== earlier.id &&
          observesAuthoredOperation(later, earlier)
        ) {
          superseded.add(key);
        }
      }
    }
    for (const key of superseded) delete projected[key];
  }
  const canonical =
    schema && textContext
      ? canonicalizeCompiledExclusiveTextProperties(
          schema,
          projected,
          textContext
        )
      : projected;
  const modifications: PropertyModificationJson[] = [...keys].map((key) =>
    Object.hasOwn(canonical, key)
      ? { type: 'set', key, value: canonical[key] }
      : { type: 'unset', key }
  );
  return { modifications, writers };
};

const writeKeys = (writers: Writers, operation: PropertyModificationJson) =>
  operation.type === 'add' || operation.type === 'remove'
    ? operation.values.map((value) => member(operation.key, value))
    : [
        ...new Set([
          scalar(operation.key),
          ...Object.keys(writers).filter((key) =>
            key.startsWith(prefix(operation.key))
          ),
        ]),
      ];

export const authoredPropertyDependencies = (
  writers: Writers,
  operations: readonly PropertyModificationJson[]
) =>
  new Set(
    operations
      .flatMap((operation) => [
        writers[scalar(operation.key)],
        ...writeKeys(writers, operation).map((key) => writers[key]),
      ])
      .filter((writer): writer is string => !!writer)
  );

export const writeAuthoredProperties = (
  writers: Writers,
  operations: readonly PropertyModificationJson[],
  identity: string
): Writers => {
  const result = { ...writers };
  for (const operation of operations) {
    if (operation.type === 'add' || operation.type === 'remove') {
      for (const key of writeKeys(result, operation)) result[key] = identity;
    } else {
      for (const key of writeKeys(result, operation)) delete result[key];
      result[scalar(operation.key)] = identity;
    }
  }
  return result;
};

export const restoreAuthoredProperties = (
  writers: Writers,
  original: Writers,
  operations: readonly PropertyModificationJson[]
): Writers => {
  const result = { ...writers };
  for (const operation of operations) {
    for (const key of new Set([
      ...writeKeys(writers, operation),
      ...writeKeys(original, operation),
    ])) {
      if (original[key]) result[key] = original[key];
      else delete result[key];
    }
  }
  return result;
};

export const authoredPropertyConflicts = (
  writers: Writers,
  original: Writers,
  operations: readonly PropertyModificationJson[],
  identity: string
) =>
  new Set(
    operations
      .flatMap((operation) => [
        scalar(operation.key),
        ...writeKeys(writers, operation),
      ])
      .filter(
        (key) =>
          writers[key] &&
          writers[key] !== identity &&
          writers[key] !== original[key]
      )
      .map((key) => writers[key])
  );

export const authoredCausalPropertyConflicts = (input: {
  state: AuthoredState;
  proposal: AuthoredEditIdentity;
  current: Writers;
  original: Writers;
  modifications: readonly PropertyModificationJson[];
  writes: Iterable<AuthoredPropertyWrite>;
  isVisible: (operation: AuthoredEditIdentity) => boolean;
  schema?: CompiledEditorSchema | null;
  textContext?: CompiledSchemaTargetContext;
}) => {
  const conflicts = authoredPropertyConflicts(
    input.current,
    input.original,
    input.modifications,
    input.proposal.changeId
  );
  const exclusive = new Set<string>();
  const { schema, textContext } = input;
  if (schema && textContext) {
    for (const modification of input.modifications) {
      const property = resolveCompiledSchemaProperty(
        schema,
        'text',
        modification.key,
        textContext
      );
      if (property) {
        for (const id of schema.properties.conflictsByPropertyId.get(
          property.id
        ) ?? []) {
          exclusive.add(id);
        }
      }
    }
  }
  const superseded = new Set<string>();
  for (const write of input.writes) {
    if (
      (conflicts.has(write.operation.changeId) ||
        (schema &&
          textContext &&
          exclusive.size > 0 &&
          write.modifications.some((modification) => {
            const property = resolveCompiledSchemaProperty(
              schema,
              'text',
              modification.key,
              textContext
            );
            return (
              property &&
              exclusive.has(property.id) &&
              Object.entries(input.current).some(
                ([key, identity]) =>
                  key.startsWith(prefix(modification.key)) &&
                  identity === write.operation.changeId
              )
            );
          }))) &&
      readRecord(input.state.changes, write.operation.changeId)?.status ===
        'accepted' &&
      observesAuthoredOperation(write.operation, input.proposal) &&
      isAuthoredPropertyWriteVisible(
        input.state,
        write.operation,
        input.isVisible
      )
    ) {
      superseded.add(write.operation.changeId);
    }
  }
  return superseded;
};

export const matchingAuthoredProperties = (
  writers: Writers,
  operations: readonly PropertyModificationJson[],
  expected: Writers
): readonly PropertyModificationJson[] =>
  operations.flatMap((operation): PropertyModificationJson[] => {
    if (writers[scalar(operation.key)] !== expected[scalar(operation.key)]) {
      return [];
    }
    if (operation.type === 'add' || operation.type === 'remove') {
      const values = operation.values.filter(
        (value) =>
          writers[member(operation.key, value)] ===
          expected[member(operation.key, value)]
      );
      return values.length ? [{ ...operation, values }] : [];
    }
    return writers[scalar(operation.key)] === expected[scalar(operation.key)]
      ? [operation]
      : [];
  });
