/**
 * Search Utilities for DOCX Tracked Changes
 *
 * This module provides utilities for searching text within a Slate/Plate editor.
 * It's used by applyDocxTracking to locate tracking tokens in the editor after
 * deserialization from HTML.
 *
 * Key features:
 * - Case-insensitive search
 * - Cross-node text search (finds text spanning multiple nodes)
 * - Start/end token pair search for ranges
 * - Void element handling
 */

// ============================================================================
// Types
// ============================================================================

/** Path type (array of indices) */
export type Path = number[];

/** Point in the document */
export type Point = {
  path: Path;
  offset: number;
};

/** Range in the document */
export type TRange = {
  anchor: Point;
  focus: Point;
};

/** Descendant node (element or text) */
export type Descendant = {
  children?: Descendant[];
  text?: string;
  type?: string;
  [key: string]: unknown;
};

/** Element node with children */
export interface TElement extends Descendant {
  children: Descendant[];
}

/** Text node */
export interface TText extends Descendant {
  text: string;
}

/** Node entry tuple */
export type NodeEntry<T = Descendant> = [T, Path];

/** Match function for filtering nodes */
export type MatchFn = (node: Descendant, path: Path) => boolean;

/** Editor interface for search operations */
export type SearchEditor = {
  /** Get nodes matching criteria */
  api: {
    nodes: <T extends Descendant>(options: {
      at: Path | TRange | null;
      match?: MatchFn;
    }) => Iterable<NodeEntry<T>>;
    /** Check if node is void */
    isVoid?: (node: Descendant) => boolean;
  };
  /** Editor children (root nodes) */
  children: Descendant[];
};

/** Options for search operations */
export type SearchOptions = {
  /** Starting point for search */
  from?: Point;
  /** Match function to filter which nodes to search in */
  match?: MatchFn;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a node is an element (has children array).
 */
export function isElement(node: Descendant): node is TElement {
  return Array.isArray((node as TElement).children);
}

/**
 * Check if a node is a text node (has text string).
 */
export function isText(node: Descendant): node is TText {
  return typeof (node as TText).text === 'string';
}

/**
 * Get the string content of a node and all its descendants.
 */
export function nodeString(node: Descendant): string {
  if (isText(node)) {
    return node.text;
  }
  if (isElement(node)) {
    return node.children.map(nodeString).join('');
  }

  return '';
}

/**
 * Traverse all text nodes in a tree, calling callback for each.
 * Returns true if callback returned true (early exit).
 */
export function traverseTextNodes(
  nodes: Descendant[],
  callback: (node: Descendant, path: Path) => boolean | void,
  basePath: Path = []
): boolean {
  for (const [index, childNode] of nodes.entries()) {
    const childPath = [...basePath, index];

    // If the node is an element and has children, traverse them
    if (isElement(childNode)) {
      if (traverseTextNodes(childNode.children, callback, childPath)) {
        return true;
      }

      continue;
    }
    // Execute the callback for each leaf node
    if (callback(childNode, childPath)) {
      return true;
    }
  }

  return false;
}

/**
 * Default match function: match top-level block nodes.
 */
function defaultMatch(_node: Descendant, path: Path): boolean {
  return path.length === 1;
}

/**
 * Simple nodes iterator for editor children.
 */
function* iterateNodes<T extends Descendant>(
  editor: SearchEditor,
  options: { at: Path | TRange | null; match?: MatchFn }
): Iterable<NodeEntry<T>> {
  const match = options.match ?? defaultMatch;

  function* traverse(
    nodes: Descendant[],
    basePath: Path
  ): Iterable<NodeEntry<T>> {
    for (const [index, node] of nodes.entries()) {
      const path = [...basePath, index];

      if (match(node, path)) {
        yield [node as T, path];
      }

      if (isElement(node)) {
        yield* traverse(node.children, path);
      }
    }
  }

  yield* traverse(editor.children, []);
}

// ============================================================================
// Search Functions
// ============================================================================

/**
 * Search for a string (or start/end token pair) in the editor.
 *
 * @param editor - The editor to search in
 * @param search - String to find, or [startToken, endToken] pair
 * @param options - Search options
 * @returns The range where the text was found, or null
 *
 * @example
 * ```ts
 * // Find a simple string
 * const range = searchRange(editor, 'hello world');
 *
 * // Find a range between two tokens
 * const tokenRange = searchRange(editor, [
 *   '[[DOCX_INS_START:...]]',
 *   '[[DOCX_INS_END:...]]'
 * ]);
 * ```
 */
export function searchRange(
  editor: SearchEditor,
  search: string | [string, string],
  options: SearchOptions = {}
): TRange | null {
  const { match } = options;

  // Validate search input
  if (Array.isArray(search)) {
    if (search[0].length === 0 || search[1].length === 0) {
      return null;
    }
  } else if (search.length === 0) {
    return null;
  }

  const [startSearch, endSearch] = Array.isArray(search)
    ? search.map((s) => s.toLowerCase())
    : [search.toLowerCase(), ''];

  // Get nodes to search through
  const entries = Array.from(
    editor.api?.nodes
      ? editor.api.nodes<TElement>({ at: [], match: match ?? defaultMatch })
      : iterateNodes<TElement>(editor, { at: [], match: match ?? defaultMatch })
  );

  for (const [node, path] of entries) {
    if (!isElement(node)) continue;

    const combinedText = nodeString(node).toLowerCase();
    let searchIndex = combinedText.indexOf(startSearch);

    while (searchIndex !== -1) {
      let globalOffset = 0;
      let anchorOffset: number | undefined;
      let focusOffset: number | undefined;
      let startPath: Path | undefined;
      let endPath: Path | undefined;

      traverseTextNodes(
        node.children,
        (childNode, childPath) => {
          // Skip void elements
          if (editor.api?.isVoid?.(childNode)) return;

          const textLength = isText(childNode) ? childNode.text.length : 0;
          const newGlobalOffset = globalOffset + textLength;

          // Find start of search
          if (startPath === undefined && newGlobalOffset > searchIndex) {
            startPath = childPath;
            anchorOffset = searchIndex - globalOffset;
          }

          // Find end of search
          if (
            startPath !== undefined &&
            newGlobalOffset >= searchIndex + startSearch.length
          ) {
            // For single string search, end is at startSearch end
            // For pair search, find where endSearch ends
            if (endSearch === '') {
              endPath = childPath;
              focusOffset = searchIndex + startSearch.length - globalOffset;

              return true; // Found complete range
            }
            const endSearchIndex = combinedText.indexOf(
              endSearch,
              searchIndex + startSearch.length
            );

            if (endSearchIndex !== -1) {
              // Need to find the node containing the end of endSearch
              const endPosition = endSearchIndex + endSearch.length;

              if (newGlobalOffset >= endPosition) {
                endPath = childPath;
                focusOffset = endPosition - globalOffset;

                return true; // Found complete range
              }
            }
          }

          globalOffset = newGlobalOffset;
        },
        path
      );

      if (
        startPath &&
        endPath &&
        anchorOffset !== undefined &&
        focusOffset !== undefined
      ) {
        return {
          anchor: { path: startPath, offset: anchorOffset },
          focus: { path: endPath, offset: focusOffset },
        };
      }

      searchIndex = combinedText.indexOf(startSearch, searchIndex + 1);
    }
  }

  return null;
}

/**
 * Search for all occurrences of a string (or start/end token pair) in the editor.
 *
 * @param editor - The editor to search in
 * @param search - String to find, or [startToken, endToken] pair
 * @param options - Search options
 * @returns Array of ranges where the text was found
 *
 * @example
 * ```ts
 * // Find all occurrences of a string
 * const ranges = searchRanges(editor, 'hello');
 *
 * // Find all ranges between token pairs
 * const tokenRanges = searchRanges(editor, [
 *   '[[DOCX_INS_START:',
 *   ']]'
 * ]);
 * ```
 */
export function searchRanges(
  editor: SearchEditor,
  search: string | [string, string],
  options: SearchOptions = {}
): TRange[] {
  const { match } = options;
  const ranges: TRange[] = [];

  // Validate search input
  if (Array.isArray(search)) {
    if (search[0].length === 0 || search[1].length === 0) {
      return ranges;
    }
  } else if (search.length === 0) {
    return ranges;
  }

  const [startSearch, endSearch] = Array.isArray(search)
    ? search.map((s) => s.toLowerCase())
    : [search.toLowerCase(), ''];

  // Get nodes to search through
  const entries = Array.from(
    editor.api?.nodes
      ? editor.api.nodes<TElement>({ at: [], match: match ?? defaultMatch })
      : iterateNodes<TElement>(editor, { at: [], match: match ?? defaultMatch })
  );

  for (const [node, path] of entries) {
    if (!isElement(node)) continue;

    const combinedText = nodeString(node).toLowerCase();
    let searchIndex = combinedText.indexOf(startSearch);

    while (searchIndex !== -1) {
      let globalOffset = 0;
      let anchorOffset: number | undefined;
      let focusOffset: number | undefined;
      let startPath: Path | undefined;
      let endPath: Path | undefined;

      traverseTextNodes(
        node.children,
        (childNode, childPath) => {
          // Skip void elements
          if (editor.api?.isVoid?.(childNode)) return;

          const textLength = isText(childNode) ? childNode.text.length : 0;
          const newGlobalOffset = globalOffset + textLength;

          // Find start of search
          if (startPath === undefined && newGlobalOffset > searchIndex) {
            startPath = childPath;
            anchorOffset = searchIndex - globalOffset;
          }

          // Find end of search
          if (
            startPath !== undefined &&
            newGlobalOffset >= searchIndex + startSearch.length
          ) {
            if (endSearch === '') {
              endPath = childPath;
              focusOffset = searchIndex + startSearch.length - globalOffset;

              return true;
            }
            const endSearchIndex = combinedText.indexOf(
              endSearch,
              searchIndex + startSearch.length
            );

            if (endSearchIndex !== -1) {
              const endPosition = endSearchIndex + endSearch.length;

              if (newGlobalOffset >= endPosition) {
                endPath = childPath;
                focusOffset = endPosition - globalOffset;

                return true;
              }
            }
          }

          globalOffset = newGlobalOffset;
        },
        path
      );

      if (
        startPath &&
        endPath &&
        anchorOffset !== undefined &&
        focusOffset !== undefined
      ) {
        ranges.push({
          anchor: { path: startPath, offset: anchorOffset },
          focus: { path: endPath, offset: focusOffset },
        });
      }

      searchIndex = combinedText.indexOf(startSearch, searchIndex + 1);
    }
  }

  return ranges;
}

/**
 * Create a searchRange function bound to an editor.
 * This is a convenience wrapper for use with applyDocxTracking.
 *
 * @param editor - The editor to create the search function for
 * @returns A search function that takes just the search string
 *
 * @example
 * ```ts
 * const mySearchRange = createSearchRangeFn(editor);
 *
 * applyTrackedChangeSuggestions({
 *   editor,
 *   changes,
 *   searchRange: mySearchRange,
 *   // ...
 * });
 * ```
 */
export function createSearchRangeFn(
  editor: SearchEditor
): (search: string | [string, string]) => TRange | null {
  return (search) => searchRange(editor, search);
}
