/**
 * Gets the default block type at a given match.
 * @param match Content match.
 * @returns Default block type or null.
 *
 * https://github.com/ProseMirror/prosemirror-commands/blob/master/src/commands.ts#L297
 */
export function defaultBlockAt(match) {
  for (let i = 0; i < match.edgeCount; i++) {
    const { type } = match.edge(i);
    if (type.isTextblock && !type.hasRequiredAttrs()) return type;
  }
  return null;
}
