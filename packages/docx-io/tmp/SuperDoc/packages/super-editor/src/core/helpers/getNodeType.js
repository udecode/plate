/**
 * Get node type from schema if it's a string or return directly.
 * @param nameOrType Name or type of the node.
 * @param schema Schema.
 * @returns Node type or null.
 */
export function getNodeType(nameOrType, schema) {
  if (typeof nameOrType === 'string') {
    if (!schema.nodes[nameOrType]) {
      throw Error(`There is no node type named '${nameOrType}' in schema.`);
    }

    return schema.nodes[nameOrType];
  }

  return nameOrType;
}
