import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { TEditor, Value } from '../editor/TEditor';

import { type ENodeMatchOptions, getQueryOptions } from '../../utils/match';

export type UnwrapNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.unwrapNodes>[1]>,
  ENodeMatchOptions<V>
>;

/**
 * Unwrap the nodes at a location from a parent node, splitting the parent if
 * necessary to ensure that only the content in the range is unwrapped.
 */
export const unwrapNodes = <V extends Value>(
  editor: TEditor<V>,
  options?: UnwrapNodesOptions<V>
) => {
  Transforms.unwrapNodes(editor as any, getQueryOptions(editor, options));
};
