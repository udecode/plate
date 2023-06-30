import { Value } from '@udecode/plate-common';

import { Upload } from '../upload/types';

/**
 * This is a local type that describes any Slate node we could possibly
 * run across but specifying some properties that we are interested in checking.
 * We don't put this in a `types.ts` file because it really only has use in
 * this one method.
 */
type MaybeUploadNode = {
  url?: unknown;
  children?: MaybeUploadNode[];
  [key: string]: unknown;
};

/**
 * Returns `true` only if the `url` passed in looks like it's not a real URL
 * but rather a reference to be used to do a lookup in our uploads store.
 */
export const isStoreRef = (url: string) => url.startsWith('#');

/**
 * Recursive part of `normalizeOrigins` function with correct types.
 */
const _getSaveValue = (
  nodes: MaybeUploadNode[],
  uploads: Record<string, Upload>
): MaybeUploadNode[] => {
  const nextNodes: MaybeUploadNode[] = [];
  for (const node of nodes) {
    if (
      'url' in node &&
      /**
       * If the `node` has an `id` then we either
       *
       * - leave it alone and add it (it's already normalized)
       * - if found in lookup, replace the url and add it
       * - if not found in lookup, skip it
       */ typeof node.url === 'string'
    ) {
      /**
       * If the `url` isn't a reference to a store then leave it as it is.
       */
      if (isStoreRef(node.url)) {
        /**
         * If the `url` is a key to the `uploads` lookup Record, then
         * we do a lookup.
         *
         * If it returns a value for the `origin` and the `status` is
         * `complete`, then we swap out the `id` with the `url`.
         *
         * If it's not found, we skip over it because we don't want it in our
         * normalized value.
         */
        const origin: Upload | undefined = uploads[node.url];
        if (origin && origin.status === 'success') {
          nextNodes.push({ ...node, url: origin.url });
        }
      } else {
        nextNodes.push(node);
      }
      continue;
    }
    /**
     * If there wasn't an `id` but there is `children`, then we iterate
     * over the children to normalize them.
     *
     * For clarity, if there is both an `id` and `children`, the
     * `children` won't be iterated over which is by design and a small
     * performance optimization.
     */
    if (node.children) {
      nextNodes.push({
        ...node,
        children: _getSaveValue(node.children, uploads),
      });
      continue;
    }
    /**
     * If there has been no prior processing of `id` or `children` then
     * we simply add the node.
     */
    nextNodes.push(node);
  }
  return nextNodes;
};

/**
 * Takes an array of `nodes` and a lookup for `origins` and normalizes the
 * `nodes` such that:
 *
 * - Any node with an `id` that is a `url` is left alone
 * - Any node with an `id` that is a `key` for lookup in `origins` is
 *   converted to a `url` if the origin file has been successfully uploaded
 * - If the origin file has not been uploaded or is in an error state, then
 *   we remove that element.
 *
 * We do some typecasting here to help the Descendant values pass through.
 * We are confident this is okay because we only augment the `id` and
 * we only depend on the knowledge that `children`, if present, is an Array
 * of nodes.
 */
export const getSaveValue = <V extends Value>(
  nodes: V,
  uploads: Record<string, Upload>
): V => _getSaveValue(nodes as MaybeUploadNode[], uploads) as V;
