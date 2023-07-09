import { TPath, createStore } from '@udecode/plate-common';

export const captionGlobalStore = createStore('caption')({
  /**
   * When defined, focus end of caption textarea with the same path.
   */
  focusEndCaptionPath: null as TPath | null,

  /**
   * When defined, focus start of caption textarea with the same path.
   */
  focusStartCaptionPath: null as TPath | null,
});
