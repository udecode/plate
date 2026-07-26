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
    isOpen?: (editorId: string) => boolean;
  },
  {},
  FloatingLinkApi
>;

/** Enables support for hyperlinks. */
export const LinkPlugin = toPlatePlugin<LinkConfig, BaseLinkConfig>(
  BaseLinkPlugin,
  {
    options: {
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
}>(({ editor, getOptions, setOption, setOptions, type }) => {
  const hide = () => {
    setOptions({
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
    setOptions({
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

    setOption('url', link.url);
    setOption('newTab', link.target === '_blank');

    if (text === link.url) text = '';

    setOption('text', text);
    setOption('isEditing', true);

    return true;
  };
  const triggerInsert = ({ focused }: FloatingLinkTriggerOptions = {}) => {
    if (getOptions().mode || !focused) return;
    if (editor.read.selection.isAcrossBlocks()) return;

    const selection = editor.read.selection();

    if (!selection) return;
    if (editor.read.nodes.some({ at: selection, match: { type } })) return;

    setOption('text', editor.read.text.string());
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
        setOptions({
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
        } = getOptions();
        const url = transformInput
          ? (transformInput(inputUrl) ?? '')
          : inputUrl;

        if (
          !forceSubmit &&
          !editor.plugin(BaseLinkPlugin).api.validateUrl(url)
        ) {
          return;
        }

        hide();
        editor.update.link.upsert({
          skipValidation: true,
          target: newTab ? '_blank' : undefined,
          text,
          url,
        });
        setTimeout(() => editor.api.dom.focus(), 0);

        return true;
      },
      trigger: (options) =>
        getOptions().mode === 'edit' ? triggerEdit() : triggerInsert(options),
      triggerEdit,
      triggerInsert,
    },
    selectors: {
      isOpen: (editorId) => getOptions().openEditorId === editorId,
    },
  };
});
