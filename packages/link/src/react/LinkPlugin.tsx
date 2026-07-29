import type { InferConfig } from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';

import { BaseLinkPlugin } from '../lib';

export type FloatingLinkMode = '' | 'edit' | 'insert';

export type LinkPluginState = {
  isEditing: boolean;
  mode: FloatingLinkMode;
  mouseDown: boolean;
  newTab: boolean;
  openEditorId: string | null;
  text: string;
  updated: boolean;
  url: string;
};

const initialState: LinkPluginState = {
  isEditing: false,
  mode: '',
  mouseDown: false,
  newTab: false,
  openEditorId: null,
  text: '',
  updated: false,
  url: '',
};

/** Enables support for hyperlinks. */
export const LinkPlugin = toPlatePlugin(BaseLinkPlugin, {
  initialState,
}).extend(({ store }) => {
  const hide = () => {
    store.set({
      isEditing: false,
      mode: '',
      mouseDown: false,
      newTab: false,
      openEditorId: null,
      text: '',
      updated: false,
      url: '',
    });
  };
  const show = (mode: FloatingLinkMode, editorId: string) => {
    store.set({
      isEditing: false,
      mode,
      openEditorId: editorId,
    });
  };
  return {
    api: {
      decodeUrl: (url: string) => {
        try {
          return decodeURI(url);
        } catch (error) {
          if (error instanceof URIError) return url;

          throw error;
        }
      },
      encodeUrl: (url: string) => {
        try {
          return url !== decodeURIComponent(url) ? url : encodeURI(url);
        } catch (error) {
          if (error instanceof URIError) return url;

          throw error;
        }
      },
      hide,
      reset: () => {
        store.set({
          isEditing: false,
          mode: '',
          mouseDown: false,
          newTab: false,
          text: '',
          updated: false,
          url: '',
        });
      },
      show,
    },
    selectors: {
      isOpen: (state, editorId: string) => state.openEditorId === editorId,
    },
  };
});

export type LinkConfig = InferConfig<typeof LinkPlugin>;
