/**
 * This Apache-2.0 licensed file has been modified by Udecode and other
 * contributors. See /packages/diff/LICENSE for more information.
 */

import { DiffMatchPatch } from '../diff-match-patch-ts';

export const dmp = new DiffMatchPatch();

dmp.Diff_Timeout = 0.2; // computing a diff won't block longer than about 0.2s
