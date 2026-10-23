import { acceptsPropertyValue } from '../../core/editor-schema';
import {
  adoptVerdicts,
  judgedBy,
  type Verdicts,
} from '../../core/property-validity';
import {
  type CompiledEditorSchema,
  type CompiledSchemaContentProgram,
  getCompiledPropertyCandidates,
  matchesCompiledSchemaTarget,
  resolveCompiledSchemaProperty,
  toCompiledTargetContext,
  tracksPlaces,
} from '../../core/schema-compiler';
import { countCoreWork } from '../../core/work';
import type {
  PropertyValueDescriptor,
  SchemaTarget,
} from '../../interfaces/schema';
import { cutsOf } from './cuts';
import type { FormatTag } from './layers';
import { AUTHORED_MARKS_KEY, readMembers } from './marks';

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

const placeFree = (target: SchemaTarget | null): boolean => {
  if (!target) return true;

  switch (target.kind) {
    case 'parent':
    case 'root': {
      return false;
    }
    case 'not': {
      return placeFree(target.target);
    }
    case 'and':
    case 'or': {
      return target.targets.every(placeFree);
    }
    default: {
      return true;
    }
  }
};

const EVERY_ELEMENT_KEYS = new WeakMap<
  CompiledEditorSchema,
  ReadonlySet<string>
>();

/**
 * Metadata keys whose target holds on every element type at every place, such
 * as Plate's block id, so no retype or move can drop their values.
 */
export const everyElementKeysOf = (schema: CompiledEditorSchema) => {
  let keys = EVERY_ELEMENT_KEYS.get(schema);

  if (!keys) {
    const types = [...schema.elements.byType.keys()];

    keys = new Set(
      [...schema.properties.byId.values()].flatMap((property) =>
        property.placement === 'element' &&
        property.role === 'metadata' &&
        typeof property.key === 'string' &&
        placeFree(property.target) &&
        types.every((type) =>
          matchesCompiledSchemaTarget(schema, property.target, {
            root: null,
            type,
          })
        )
          ? [property.key]
          : []
      )
    );
    EVERY_ELEMENT_KEYS.set(schema, keys);
  }

  return keys;
};

const hasValidator = (descriptor: PropertyValueDescriptor): boolean =>
  !!descriptor.validate ||
  (descriptor.kind === 'set' &&
    hasValidator(
      (
        descriptor as PropertyValueDescriptor & {
          item: PropertyValueDescriptor;
        }
      ).item
    ));

const VALIDATES = new WeakMap<CompiledEditorSchema, boolean>();

const validates = (schema: CompiledEditorSchema) => {
  let found = VALIDATES.get(schema);

  if (found === undefined) {
    found = [...schema.properties.byId.values()].some((property) =>
      hasValidator(property.descriptor)
    );
    VALIDATES.set(schema, found);
  }

  return found;
};

const tagValues = (tag: FormatTag): unknown[] => [
  ...(tag.write.kind === 'set' ? [tag.write.value] : []),
  ...(tag.before === undefined ? [] : [tag.before]),
  ...(tag.base?.kind === 'set' ? [tag.base.value] : []),
  ...(tag.over ?? []).flatMap((step) =>
    step.flatMap(({ write }) => (write.kind === 'set' ? [write.value] : []))
  ),
];

// Keyed by the compiled schema, so a schema compiled again with new validators
// judges its values again.
const COMPLETION_VERDICTS = new WeakMap<CompiledEditorSchema, Verdicts>();

const completionValueVerdicts = (schema: CompiledEditorSchema) => {
  let verdicts = COMPLETION_VERDICTS.get(schema);

  if (verdicts) return verdicts;

  const seen = new Set<CompiledSchemaContentProgram>();
  const visit = (program: CompiledSchemaContentProgram | undefined) => {
    if (!program || seen.has(program)) return;
    seen.add(program);

    const plans = [
      ...(program.defaultPlan?.kind === 'element' ? [program.defaultPlan] : []),
      ...(program.prefix ?? []),
    ];

    for (const plan of plans) {
      const allowed = schema.properties.elementAllowedByType.get(plan.type);

      for (const [key, value] of Object.entries(plan.properties ?? {})) {
        for (const property of getCompiledPropertyCandidates(
          schema,
          'element',
          key
        )) {
          if (allowed?.has(property.id) && hasValidator(property.descriptor)) {
            acceptsPropertyValue(property.descriptor, value);
          }
        }
      }
    }
    visit(program.remainder);
  };

  verdicts = judgedBy(() => {
    for (const { descriptor } of schema.properties.byId.values()) {
      if (descriptor.default !== undefined && hasValidator(descriptor)) {
        acceptsPropertyValue(descriptor, descriptor.default);
      }
    }
    visit(schema.primaryRoot.content);
    for (const root of schema.roots.values()) visit(root.content);
    for (const program of schema.elements.contentPrograms.values()) {
      visit(program);
    }
  });
  COMPLETION_VERDICTS.set(schema, verdicts);

  return verdicts;
};

/**
 * Records a verdict for every stored value of a validated key, those format
 * tags and cuts keep included, then adds the schema's verdicts for the values
 * completion can write, so resolution and the checks after it read verdicts
 * and call no validator.
 */
export const coverStoredValues = (
  schema: CompiledEditorSchema,
  nodes: readonly unknown[]
) => {
  if (!validates(schema)) return;

  const check = (
    placement: 'element' | 'text',
    key: string,
    value: unknown
  ) => {
    for (const property of getCompiledPropertyCandidates(
      schema,
      placement,
      key
    )) {
      if (hasValidator(property.descriptor)) {
        acceptsPropertyValue(property.descriptor, value);
      }
    }
  };
  const visit = (node: unknown) => {
    if (typeof node !== 'object' || node === null) return;

    const record = node as Readonly<Record<string, unknown>>;
    const placement = typeof record.text === 'string' ? 'text' : 'element';

    for (const [key, value] of Object.entries(record)) {
      if (!STRUCTURE.has(key)) check(placement, key, value);
    }
    for (const member of readMembers(record)) {
      if (member.kind === 'format') {
        for (const value of tagValues(member)) {
          check(placement, member.key, value);
        }
      }
    }
    for (const cut of cutsOf(record)) {
      for (const [key, value] of Object.entries(cut.kept ?? {})) {
        check('element', key, value);
      }
    }
    if (Array.isArray(record.children)) record.children.forEach(visit);
  };

  nodes.forEach(visit);
  adoptVerdicts(completionValueVerdicts(schema));
};
