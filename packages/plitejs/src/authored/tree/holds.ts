import { acceptsPropertyValue } from '../../core/editor-schema';
import {
  type CompiledEditorSchema,
  getCompiledPropertyCandidates,
  resolveCompiledSchemaProperty,
  toCompiledTargetContext,
} from '../../core/schema-compiler';
import { AUTHORED_MARKS_KEY } from './marks';

const STRUCTURE = new Set(['children', 'text', 'type', AUTHORED_MARKS_KEY]);

export const heldProps = <P extends Readonly<Record<string, unknown>>>(
  schema: CompiledEditorSchema,
  props: P,
  {
    outerTypes,
    parentType,
    root,
    text,
  }: Readonly<{
    outerTypes: readonly string[];
    parentType: string | null;
    root: string;
    text: boolean;
  }>
): P => {
  const outer = outerTypes.map((type) => ({ type }));
  const declaredType =
    typeof props.type === 'string' && schema.elements.byType.has(props.type)
      ? props.type
      : null;
  const context = text
    ? toCompiledTargetContext(parentType ?? '', { ancestors: outer, root })
    : declaredType
      ? toCompiledTargetContext(declaredType, {
          ancestors: parentType ? [{ type: parentType }, ...outer] : outer,
          root,
        })
      : null;

  if (!context) return props;

  const placement = text ? 'text' : 'element';
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
