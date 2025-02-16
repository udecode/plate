import type { Editor } from '../interfaces/editor/editor-type';
import type { NodeOf, TNode } from '../interfaces/node';

import { type Path, TextApi } from '../interfaces/index';
import { getAt } from './getAt';

export type Predicate<T extends TNode> = PredicateFn<T> | PredicateObj;

type PredicateFn<T extends TNode> = (obj: T, path: Path) => boolean;

type PredicateObj = Record<string, any[] | any>;

function castArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * Match the object with a predicate object or function. If predicate is:
 *
 * - Object: every predicate key/value should be in obj.
 * - Function: it should return true.
 */
export const match = <T extends TNode>(
  obj: T,
  path: Path,
  predicate?: Predicate<T>
): boolean => {
  if (!predicate) return true;
  if (typeof predicate === 'object') {
    return Object.entries(predicate).every(([key, value]) => {
      const values = castArray<any>(value);

      return values.includes((obj as any)[key]);
    });
  }

  return predicate(obj, path);
};

export const getMatch = <E extends Editor>(
  editor: E,
  { id, block, empty, match: matchObjOrFn, text }: any = {}
) => {
  let hasMatch = false;
  let matchFn: PredicateFn<NodeOf<E>> = () => true;

  // If text option is true/false, match only text/non-text nodes
  if (text !== undefined) {
    hasMatch = true;
    matchFn = combineMatch(matchFn, (n) => TextApi.isText(n) === text);
  }
  // If empty option is true/false, match only empty/non-empty nodes
  if (empty !== undefined) {
    hasMatch = true;
    matchFn = combineMatch(matchFn, (n) => {
      return TextApi.isText(n)
        ? n.text.length > 0 === !empty
        : editor.api.isEmpty(n) === empty;
    });
  }
  if (block !== undefined) {
    hasMatch = true;
    matchFn = combineMatch(matchFn, (n) => editor.api.isBlock(n) === block);
  }
  if (id !== undefined) {
    hasMatch = true;
    matchFn = combineMatch(matchFn, (n) => {
      return (id === true && !!n.id) || n.id === id;
    });
  }
  // Handle object predicate matching first
  if (typeof matchObjOrFn === 'object') {
    hasMatch = true;
    matchFn = combineMatch(matchFn, (n, p) => match(n, p, matchObjOrFn));
  } else if (typeof matchObjOrFn === 'function') {
    hasMatch = true;
    matchFn = combineMatch(matchFn, matchObjOrFn);
  }

  return hasMatch ? matchFn : undefined;
};

/**
 * Extended query options for slate queries:
 *
 * - `match` can be an object predicate where one of the values should include the
 *   node value. Example: { type: ['1', '2'] } will match the nodes having one
 *   of these 2 types.
 */
export const getQueryOptions = (
  editor: Editor,
  { id, empty, match, text, ...options }: any = {}
) => {
  const { at, block } = options;

  return {
    ...options,
    at: getAt(editor, at),
    match: getMatch(editor, { id, block, empty, match, text }),
  };
};

export const combineMatch = <T extends TNode>(
  match1: PredicateFn<T>,
  match2?: PredicateFn<T>
): PredicateFn<T> => {
  return (node: T, path: Path) => {
    return match1(node, path) && (!match2 || match2(node, path));
  };
};

/** Combine two match predicates into one. */
export const combineMatchOptions = <E extends Editor>(
  editor: E,
  match1?: PredicateFn<NodeOf<E>>,
  options?: any
): PredicateFn<NodeOf<E>> => {
  return (node: NodeOf<E>, path: Path) => {
    const match2 = getMatch(editor, options);

    return (!match1 || match1(node, path)) && (!match2 || match2(node, path));
  };
};
