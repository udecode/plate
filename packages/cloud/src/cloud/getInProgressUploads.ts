import { Descendant } from 'slate';

import { Upload, UploadProgress } from '../upload/types';
import { isStoreRef } from './getSaveValue';

type MaybeUploadNode = {
  url?: unknown;
  children?: MaybeUploadNode[];
  [key: string]: unknown;
};

/**
 * Recursive part of `normalizeOrigins` function with correct types.
 */
const _getInProgressUploads = (
  nodes: MaybeUploadNode[],
  uploads: Record<string, Upload>,
  progressUploads: UploadProgress[]
): UploadProgress[] => {
  for (const node of nodes) {
    if (
      'url' in node &&
      /**
       * If the `node` has a `url` then we either
       *
       * - leave it alone and add it (it's already an actual URL)
       * - if found in the store lookup, replace the store ref with a URL
       * - if not found in lookup, skip it
       */ typeof node.url === 'string'
    ) {
      /**
       * If the `url` is a ref (i.e. starts with a `#`)
       */
      if (isStoreRef(node.url)) {
        /**
         * If the `url` is a reference to the `uploads` lookup Record, then
         * we do a lookup.
         *
         * If found returns a value for the `upload` and the `status` is
         * `complete`, then we swap out the reference with an actual `url`.
         *
         * If it's not found, we skip over it because we don't want it in our
         * normalized value.
         */
        const origin: Upload | undefined = uploads[node.url];
        if (origin && origin.status === 'progress') {
          progressUploads.push(origin);
        }
      }
      continue;
    }
    /**
     * If there wasn't a `url` but there is `children`, then we iterate
     * over the children to normalize them.
     *
     * For clarity, if there is both a `url` and `children`, the
     * `children` won't be iterated over which is by design and a
     * performance optimization.
     */
    if (node.children) {
      _getInProgressUploads(node.children, uploads, progressUploads);
      continue;
    }
  }
  return progressUploads;
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
export const getInProgressUploads = (
  nodes: Descendant[],
  origins: Record<string, Upload>
): UploadProgress[] => {
  const progressUploads: UploadProgress[] = [];
  return _getInProgressUploads(
    nodes as MaybeUploadNode[],
    origins,
    progressUploads
  );
};
