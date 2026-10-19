import type { DocumentMigrationTarget } from './documentMigrations';

export type NodeContext = Readonly<{
  ancestors: readonly string[];
  root: string | null;
}>;

export const createPropertyOwnership = (target: DocumentMigrationTarget) => {
  const currentProperty = (
    type: string,
    key: string,
    context: NodeContext,
    placement: 'element' | 'text'
  ) =>
    target.schema.property({
      ancestors: context.ancestors,
      key,
      placement,
      root: context.root,
      type,
    });

  return {
    declares: (
      declared: ReadonlySet<string>,
      type: string,
      key: string,
      context: NodeContext
    ) => {
      const property = currentProperty(type, key, context, 'element');

      return property !== null && declared.has(property.id);
    },
    ownsProperty: (type: string, key: string, context: NodeContext) =>
      currentProperty(type, key, context, 'element') !== null,
    ownsTextProperty: (
      parentType: string,
      key: string,
      parentContext: NodeContext
    ) => currentProperty(parentType, key, parentContext, 'text') !== null,
  };
};
