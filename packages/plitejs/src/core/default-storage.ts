import { jsonEqual } from './change/json';
import type { FormerPlace } from './change/lineage';
import { acceptsPropertyValue } from './editor-schema';
import {
  type CompiledEditorSchema,
  type CompiledSchemaProperty,
  type CompiledSchemaTargetContext,
  getCompiledPropertyCandidates,
  resolveCompiledSchemaProperty,
  toCompiledNodeContext,
  unwrittenAs,
} from './schema-compiler';

type StoredNode = Readonly<Record<string, unknown>>;

const placementOf = (node: StoredNode) =>
  typeof node.text === 'string' ? 'text' : 'element';

export const getPropertyDefault = (property: CompiledSchemaProperty) =>
  Object.hasOwn(property.descriptor, 'default')
    ? property.descriptor.default
    : undefined;

/**
 * What an element's `key` reads where `context` places it: the stored value,
 * or else the default that place gives.
 */
export const readsAt = (
  schema: CompiledEditorSchema,
  props: StoredNode,
  key: string,
  context: CompiledSchemaTargetContext
) => {
  if (props[key] !== undefined) return props[key];
  const property = resolveCompiledSchemaProperty(
    schema,
    'element',
    key,
    context
  );

  return property ? getPropertyDefault(property) : undefined;
};

export const isLeftOutDefault = (
  schema: CompiledEditorSchema,
  node: StoredNode,
  key: string,
  value: unknown
) =>
  getCompiledPropertyCandidates(schema, placementOf(node), key).some(
    ({ descriptor }) => unwrittenAs(descriptor, value) === 'left-out'
  );

export const withoutUnheldDefaults = <P extends StoredNode>(
  schema: CompiledEditorSchema | null,
  marks: P,
  contextOf: () => CompiledSchemaTargetContext
): P => {
  if (!schema) return marks;

  let context: CompiledSchemaTargetContext | undefined;
  let landed: Record<string, unknown> | null = null;

  for (const [key, value] of Object.entries(marks)) {
    if (!isLeftOutDefault(schema, { text: '' }, key, value)) continue;
    context ??= contextOf();
    const property = resolveCompiledSchemaProperty(
      schema,
      'text',
      key,
      context
    );

    if (property && acceptsPropertyValue(property.descriptor, value)) continue;
    landed ??= { ...marks };
    delete landed[key];
  }

  return (landed as P | null) ?? marks;
};

export const isSplitOutput = (
  schema: CompiledEditorSchema | null,
  node: StoredNode,
  key: string
) =>
  node[key] === undefined ||
  (schema !== null &&
    getCompiledPropertyCandidates(schema, placementOf(node), key).some(
      ({ descriptor }) => unwrittenAs(descriptor, node[key]) === 'filled'
    ));

export const elementSplitOutput =
  (schema: CompiledEditorSchema | null) => (key: string, value: unknown) =>
    isSplitOutput(schema, { [key]: value }, key);

/**
 * Whether `node` may drop `key` where it stands now, because it carried the
 * value from `place`: the node there held the same value, and that value was
 * the key's left-out default there. An unknown place never carries.
 *
 * @internal
 */
export const carriesDefault = (
  schema: CompiledEditorSchema,
  place: FormerPlace | null,
  node: StoredNode,
  key: string
) => {
  if (!place) return false;

  const { document } = place;
  const entry = document.nodeStartingAt(place.at);

  if (entry?.from !== place.at) return false;

  const former = document.node(entry.path);

  if (!Object.hasOwn(former, key) || !jsonEqual(former[key], node[key])) {
    return false;
  }

  const ancestors: StoredNode[] = [];

  for (let depth = entry.path.length - 1; depth > 0; depth -= 1) {
    ancestors.push(document.node(entry.path.slice(0, depth)));
  }

  const property = resolveCompiledSchemaProperty(
    schema,
    placementOf(former),
    key,
    toCompiledNodeContext(former, ancestors, place.root)
  );

  return (
    property !== null &&
    unwrittenAs(property.descriptor, former[key]) === 'left-out'
  );
};
