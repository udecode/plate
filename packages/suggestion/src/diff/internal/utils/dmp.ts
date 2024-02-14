import { DiffMatchPatch } from '../diff-match-patch-ts';

export const dmp = new DiffMatchPatch();
dmp.Diff_Timeout = 0.2; // computing a diff won't block longer than about 0.2s
