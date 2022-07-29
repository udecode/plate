import { CSSProperties } from 'react';
import {
  createAtomStore,
  createPlateElementComponent,
  createStore,
  SCOPE_ELEMENT,
  TPath,
} from '@udecode/plate-core';
import { Resizable } from '../resizable/Resizable';
import { TMediaElement } from './types';

export const { resizableStore, useResizableStore } = createAtomStore(
  {
    width: 0 as CSSProperties['width'],
  },
  { name: 'resizable', scope: SCOPE_ELEMENT }
);

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

export const MediaRoot = createPlateElementComponent<TMediaElement>();

export const Media = {
  Root: MediaRoot,
  Resizable,
};
