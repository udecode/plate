/**
 * Get mark type from schema if it's a string or return directly.
 * @param nameOrType Name or type of the mark.
 * @param schema Schema.
 * @returns Mark type or null.
 */
export function getMarkType(nameOrType, schema) {
  if (typeof nameOrType === 'string') {
    if (!schema.marks[nameOrType]) {
      throw Error(`There is no mark type named '${nameOrType}' in schema.`);
    }

    return schema.marks[nameOrType];
  }

  return nameOrType;
}
