import { type Descendant, ElementApi } from '../../../core';
import type { SerializeMdContext } from '../types';

/**
 * Pass `node` to an encoder while recording which of its properties it reads.
 * Reading a property is how an encoder claims it; spreading `...rest` into tag
 * attributes claims every property.
 */
export const trackPropertyReads = <T extends object>(
  node: T,
  read: Set<string>
): T =>
  new Proxy(node, {
    get: (target, key, receiver) => {
      if (typeof key === 'string') read.add(key);

      return Reflect.get(target, key, receiver);
    },
    getOwnPropertyDescriptor: (target, key) => {
      if (typeof key === 'string') read.add(key);

      return Reflect.getOwnPropertyDescriptor(target, key);
    },
    has: (target, key) => {
      if (typeof key === 'string') read.add(key);

      return Reflect.has(target, key);
    },
  });

/**
 * Report persisted content properties that the encoder did not claim.
 * Markdown cannot carry them; omission warns instead of failing the export.
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
