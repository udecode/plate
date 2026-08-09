import type { Value } from '../interfaces/editor';
import type { NodeIn, NodeProps } from '../interfaces/node';
import type { SchemaPropertyHandle } from '../interfaces/schema';
import type { NodeSetNodesOptions } from '../interfaces/transforms/node';

const isPropertyHandle = (value: unknown): value is SchemaPropertyHandle =>
  typeof value === 'object' &&
  value !== null &&
  'kind' in value &&
  value.kind === 'schema-property';

const getExactPropertyKey = (
  property: string | SchemaPropertyHandle,
  resolve?: (
    property: SchemaPropertyHandle
  ) => SchemaPropertyHandle['key'] | undefined
): string => {
  const key =
    typeof property === 'string'
      ? property
      : (resolve?.(property) ?? property.key);

  if (typeof key !== 'string') {
    throw new TypeError(
      'Prefix schema-property handles cannot address one node property'
    );
  }

  return key;
};

export const getNodeSetOptions = (
  args: readonly unknown[]
): NodeSetNodesOptions | undefined =>
  (typeof args[0] === 'string' || isPropertyHandle(args[0])
    ? args[2]
    : args[1]) as NodeSetNodesOptions | undefined;

export const normalizeNodeSetInput = <V extends Value>(
  args: readonly unknown[],
  resolve?: (
    property: SchemaPropertyHandle
  ) => SchemaPropertyHandle['key'] | undefined
): Readonly<{
  options: NodeSetNodesOptions<NodeIn<V>> | undefined;
  props: Partial<NodeProps<NodeIn<V>>>;
}> => {
  if (typeof args[0] === 'string' || isPropertyHandle(args[0])) {
    return {
      options: args[2] as NodeSetNodesOptions<NodeIn<V>> | undefined,
      props: { [getExactPropertyKey(args[0], resolve)]: args[1] } as Partial<
        NodeProps<NodeIn<V>>
      >,
    };
  }

  return {
    options: args[1] as NodeSetNodesOptions<NodeIn<V>> | undefined,
    props: args[0] as Partial<NodeProps<NodeIn<V>>>,
  };
};

export const normalizeNodeUnsetInput = (
  property: string | readonly string[] | SchemaPropertyHandle,
  resolve?: (
    property: SchemaPropertyHandle
  ) => SchemaPropertyHandle['key'] | undefined
): string | readonly string[] =>
  isPropertyHandle(property)
    ? getExactPropertyKey(property, resolve)
    : property;
