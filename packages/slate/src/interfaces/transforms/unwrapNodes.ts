import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { TEditor } from '../editor/TEditor';

import { type ENodeMatchOptions, getQueryOptions } from '../../utils/match';

export type UnwrapNodesOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<Parameters<typeof Transforms.unwrapNodes>[1]>,
  ENodeMatchOptions<E>
>;

/**
 * Unwrap the nodes at a location from a parent node, splitting the parent if
 * necessary to ensure that only the content in the range is unwrapped.
 */
export const unwrapNodes = <E extends TEditor>(
  editor: E,
  options?: UnwrapNodesOptions<E>
) => {
  Transforms.unwrapNodes(editor as any, getQueryOptions(editor, options));
};
