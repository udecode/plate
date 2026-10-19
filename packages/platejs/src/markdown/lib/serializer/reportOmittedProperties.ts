import { type Descendant, ElementApi } from '../../../core';
import type { SerializeMdContext } from '../types';

/**
 * Report persisted content properties that the encoder did not claim.
 * Markdown cannot carry them; omission warns instead of failing the export.
 * A value equal to its schema default reads back unchanged, so it needs no
 * claim.
 */
export const reportOmittedProperties = (
  node: Descendant,
  claimed: ReadonlySet<string>,
  options: SerializeMdContext,
  owner: string
) => {
  if (!ElementApi.isElement(node)) return;

  for (const [key, value] of Object.entries(node)) {
    if (
      key === 'type' ||
      key === 'children' ||
      claimed.has(key) ||
      value === undefined
    ) {
      continue;
    }
    const property = options.state.schema.property({
      key,
      placement: 'element',
      type: node.type,
    });

    if (!property || property.role === 'metadata') continue;
    const descriptor = property.value as Readonly<{ default?: unknown }>;

    if (
      'default' in descriptor &&
      JSON.stringify(descriptor.default) === JSON.stringify(value)
    ) {
      continue;
    }
    options.report({
      code: 'markdown-property-omitted',
      key,
      message: `Markdown cannot represent "${key}" on "${node.type}"; it was omitted.`,
      model: options.modelLocation(node),
      owner,
      phase: 'serialize',
      reason: 'unsupported',
      severity: 'warning',
    });
  }
};
