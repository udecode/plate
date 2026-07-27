import type { ExtendConfig } from '@platejs/core';
import { toPlatePlugin } from '@platejs/core/react';
import type { TLinkElement } from '@platejs/utils';

import { type BaseLinkConfig, BaseLinkPlugin } from '../lib';

export type FloatingLinkMode = '' | 'edit' | 'insert';

type FloatingLinkTriggerOptions = {
  focused?: boolean;
};

type FloatingLinkApi = {
  decodeUrl: (url: string) => string;
  encodeUrl: (url: string) => string;
  hide: () => void;
  reset: () => void;
  show: (mode: FloatingLinkMode, editorId: string) => void;
  submit: () => boolean | void;
  trigger: (options?: FloatingLinkTriggerOptions) => boolean | void;
  triggerEdit: () => boolean | void;
  triggerInsert: (options?: FloatingLinkTriggerOptions) => boolean | void;
};

export type LinkConfig = ExtendConfig<
  BaseLinkConfig,
  {
    isEditing: boolean;
    mode: FloatingLinkMode;
    mouseDown: boolean;
    newTab: boolean;
    openEditorId: string | null;
    text: string;
    updated: boolean;
    url: string;
  },
  {},
  {},
  {
    isOpen?: (
      state: Readonly<{ openEditorId: string | null }>,
      editorId: string
    ) => boolean;
  },
  {},
  FloatingLinkApi
>;

/** Enables support for hyperlinks. */
export const LinkPlugin = toPlatePlugin<LinkConfig, BaseLinkConfig>(
  BaseLinkPlugin,
  {
    initialState: {
      isEditing: false,
      mode: '',
      mouseDown: false,
      newTab: false,
      openEditorId: null,
      text: '',
      updated: false,
      url: '',
    },
  }
).extend<{
  api: FloatingLinkApi;
  selectors: LinkConfig['selectors'];
}>(({ api, editor, store, type, update }) => {
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
  const triggerEdit = () => {
    const selection = editor.read.selection();

    if (!selection) return;

    const entry = editor.read.nodes.above<TLinkElement>({
      at: selection,
      match: { type },
    });

    if (!entry) return;

    const [link, path] = entry;
    let text = editor.read.text.string(path);

    store.set({ url: link.url });
    store.set({ newTab: link.target === '_blank' });

    if (text === link.url) text = '';

    store.set({ text });
    store.set({ isEditing: true });

    return true;
  };
  const triggerInsert = ({ focused }: FloatingLinkTriggerOptions = {}) => {
    if (store.get().mode || !focused) return;
    if (editor.read.selection.isAcrossBlocks()) return;

    const selection = editor.read.selection();

    if (!selection) return;
    if (editor.read.nodes.some({ at: selection, match: { type } })) return;

    store.set({ text: editor.read.text.string() });
    show('insert', editor.id);

    return true;
  };

  return {
    api: {
      decodeUrl: (url) => {
        try {
          return decodeURI(url);
        } catch (error) {
          if (error instanceof URIError) return url;

          throw error;
        }
      },
      encodeUrl: (url) => {
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
      submit: () => {
        if (!editor.read.selection()) return;

        const {
          forceSubmit,
          newTab,
          text,
          transformInput,
          url: inputUrl,
        } = store.get();
        const url = transformInput
          ? (transformInput(inputUrl) ?? '')
          : inputUrl;

        if (!forceSubmit && !api.validateUrl(url)) {
          return;
        }

        hide();
        update.upsert({
          skipValidation: true,
          target: newTab ? '_blank' : undefined,
          text,
          url,
        });
        setTimeout(() => editor.api.dom.focus(), 0);

        return true;
      },
      trigger: (options) =>
        store.get().mode === 'edit' ? triggerEdit() : triggerInsert(options),
      triggerEdit,
      triggerInsert,
    },
    selectors: {
      isOpen: (state, editorId) => state.openEditorId === editorId,
    },
  };
});
