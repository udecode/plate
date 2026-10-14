const EDITING = '~edit:';

/**
 * The change an Editing write records under. Its claims read as accepted
 * everywhere, so the only ones stored past their commit are a join or split
 * whose landing waits on another pending change, and a deletion that empties
 * the line a pending join merges into. No one proposes, lists or decides it.
 */
export const editingChangeOf = (author: string) => `${EDITING}${author}`;

export const isEditingChange = (change: string) => change.startsWith(EDITING);
