import { acceptsPropertyValue } from '../../core/editor-schema';
import {
  type CompiledEditorSchema,
  getCompiledPropertyCandidates,
  resolveCompiledSchemaProperty,
  toCompiledTargetContext,
  tracksPlaces,
} from '../../core/schema-compiler';
import { countCoreWork } from '../../core/work';
import { AUTHORED_MARKS_KEY } from './marks';

export const STRUCTURE: ReadonlySet<string> = new Set([
  'children',
  'text',
  'type',
  AUTHORED_MARKS_KEY,
]);

/** Where a node stands: the types of its parent and the ancestors above. */
export type Place = Readonly<{
  /** The ancestors above the parent, nearest first. */
  outerTypes: readonly string[];
  /** Null at a root. */
  parentType: string | null;
  root: string;
}>;

/** Null when `type` names no declared element. */
export const elementContextAt = (
  schema: CompiledEditorSchema,
  type: unknown,
  { outerTypes, parentType, root }: Place
) => {
  const outer = outerTypes.map((outerType) => ({ type: outerType }));

  return typeof type === 'string' && schema.elements.byType.has(type)
    ? toCompiledTargetContext(type, {
        ancestors: parentType ? [{ type: parentType }, ...outer] : outer,
        root,
      })
    : null;
};

export const heldProps = <P extends Readonly<Record<string, unknown>>>(
  schema: CompiledEditorSchema,
  props: P,
  place: Place & Readonly<{ text: boolean }>
): P => {
  countCoreWork('placeChecks');
  const context = place.text
    ? toCompiledTargetContext(place.parentType ?? '', {
        ancestors: place.outerTypes.map((type) => ({ type })),
        root: place.root,
      })
    : elementContextAt(schema, props.type, place);

  if (!context) return props;

  const placement = place.text ? 'text' : 'element';
  let held: Record<string, unknown> | null = null;

  for (const [key, value] of Object.entries(props)) {
    if (
      STRUCTURE.has(key) ||
      getCompiledPropertyCandidates(schema, placement, key).length === 0
    ) {
      continue;
    }
    const property = resolveCompiledSchemaProperty(
      schema,
      placement,
      key,
      context
    );

    if (property && acceptsPropertyValue(property.descriptor, value)) continue;
    held ??= { ...props };
    delete held[key];
  }

  return (held as P | null) ?? props;
};

/**
 * `node` with every value it or a descendant cannot hold where it stands
 * dropped, as a decision that lands it there drops them.
 */
export const heldNode = <N extends Readonly<Record<string, unknown>>>(
  schema: CompiledEditorSchema,
  node: N,
  place: Place
): N => (tracksPlaces(schema) ? heldTree(schema, node, place) : node);

const heldTree = <N extends Readonly<Record<string, unknown>>>(
  schema: CompiledEditorSchema,
  node: N,
  place: Place
): N => {
  const held = heldProps(schema, node, {
    ...place,
    text: typeof node.text === 'string',
  });
  const { children } = node;

  if (!Array.isArray(children)) return held;

  const inner: Place = {
    outerTypes: place.parentType
      ? [place.parentType, ...place.outerTypes]
      : place.outerTypes,
    parentType: String(node.type),
    root: place.root,
  };
  let changed = false;
  const next = children.map((child: Readonly<Record<string, unknown>>) => {
    const placed = heldTree(schema, child, inner);

    changed ||= placed !== child;

    return placed;
  });

  return changed ? { ...held, children: next } : held;
};
