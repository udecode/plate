import { type TPath, createZustandStore } from '@udecode/plate-common';

export const captionGlobalStore = createZustandStore('caption')({
  /** When defined, focus end of caption textarea with the same path. */
  focusEndCaptionPath: null as TPath | null,

  /** When defined, focus start of caption textarea with the same path. */
  focusStartCaptionPath: null as TPath | null,
  showCaptionId: null as null | string,
}).extendSelectors((state) => ({
  isShow: (elementId: string) => state.showCaptionId === elementId,
}));

export const captionActions = captionGlobalStore.set;

export const captionSelectors = captionGlobalStore.get;

export const useCaptionSelectors = () => captionGlobalStore.use;
